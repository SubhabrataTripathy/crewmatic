import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';
import { logAudit } from '../services/audit.js';

const router = Router();

// GET /api/budget/:company_id
router.get('/:company_id', (req, res) => {
  const db = getDb();
  const budget = db.prepare('SELECT * FROM budgets WHERE company_id = ?').get(req.params.company_id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  res.json(budget);
});

// PUT /api/budget/:company_id
router.put('/:company_id', (req, res) => {
  const db = getDb();
  const { total_limit, alert_threshold, period } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (total_limit !== undefined) { sets.push('total_limit = ?'); vals.push(total_limit); }
  if (alert_threshold !== undefined) { sets.push('alert_threshold = ?'); vals.push(alert_threshold); }
  if (period !== undefined) { sets.push('period = ?'); vals.push(period); }
  sets.push("updated_at = datetime('now')");
  vals.push(req.params.company_id);

  db.prepare(`UPDATE budgets SET ${sets.join(', ')} WHERE company_id = ?`).run(...vals);
  const budget = db.prepare('SELECT * FROM budgets WHERE company_id = ?').get(req.params.company_id);
  broadcast({ type: 'budget:updated', data: budget });
  res.json(budget);
});

// GET /api/budget/:company_id/costs — Cost entries
router.get('/:company_id/costs', (req, res) => {
  const db = getDb();
  const costs = db.prepare(`
    SELECT ce.*, a.name as agent_name, a.type as agent_type
    FROM cost_entries ce
    LEFT JOIN agents a ON ce.agent_id = a.id
    WHERE ce.company_id = ?
    ORDER BY ce.created_at DESC
    LIMIT 100
  `).all(req.params.company_id);
  res.json(costs);
});

// GET /api/budget/:company_id/summary — Aggregated cost data
router.get('/:company_id/summary', (req, res) => {
  const db = getDb();

  const byAgent = db.prepare(`
    SELECT a.name, a.type, SUM(ce.amount) as total_cost, COUNT(ce.id) as entry_count
    FROM cost_entries ce
    JOIN agents a ON ce.agent_id = a.id
    WHERE ce.company_id = ?
    GROUP BY ce.agent_id
    ORDER BY total_cost DESC
  `).all(req.params.company_id);

  const byDay = db.prepare(`
    SELECT DATE(created_at) as day, SUM(amount) as total
    FROM cost_entries
    WHERE company_id = ?
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 14
  `).all(req.params.company_id);

  const budget = db.prepare('SELECT * FROM budgets WHERE company_id = ?').get(req.params.company_id);

  res.json({ by_agent: byAgent, by_day: byDay.reverse(), budget });
});

// POST /api/budget/:company_id/costs — Add cost entry
router.post('/:company_id/costs', (req, res) => {
  const db = getDb();
  const { agent_id, amount, provider = '', tokens_used = 0, description = '' } = req.body;
  
  const id = uuid();
  db.prepare(`
    INSERT INTO cost_entries (id, company_id, agent_id, amount, provider, tokens_used, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.company_id, agent_id, amount, provider, tokens_used, description);

  // Update budget spent
  db.prepare(`UPDATE budgets SET spent = spent + ?, updated_at = datetime('now') WHERE company_id = ?`).run(amount, req.params.company_id);
  
  // Update agent total cost
  db.prepare(`UPDATE agents SET total_cost = total_cost + ? WHERE id = ?`).run(amount, agent_id);

  // Check budget threshold
  const budget = db.prepare('SELECT * FROM budgets WHERE company_id = ?').get(req.params.company_id) as any;
  if (budget && (budget.spent / budget.total_limit * 100) >= budget.alert_threshold) {
    const agent = db.prepare('SELECT name FROM agents WHERE id = ?').get(agent_id) as any;
    logAudit(req.params.company_id, agent_id, agent?.name || '', 'Budget warning',
      `Monthly spend at ${Math.round(budget.spent / budget.total_limit * 100)}% ($${budget.spent.toFixed(2)} / $${budget.total_limit.toFixed(2)})`, 'warning');
    broadcast({ type: 'budget:alert', data: budget });
  }

  broadcast({ type: 'cost:added', data: { company_id: req.params.company_id, amount } });
  res.status(201).json({ id, amount });
});

export default router;
