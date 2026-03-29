import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET /api/companies
router.get('/', (_req, res) => {
  const db = getDb();
  const companies = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM agents WHERE company_id = c.id) as agent_count,
      (SELECT COUNT(*) FROM tasks WHERE company_id = c.id) as task_count,
      COALESCE((SELECT spent FROM budgets WHERE company_id = c.id), 0) as monthly_spend
    FROM companies c ORDER BY c.created_at DESC
  `).all();
  res.json(companies);
});

// GET /api/companies/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const company = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM agents WHERE company_id = c.id) as agent_count,
      (SELECT COUNT(*) FROM tasks WHERE company_id = c.id) as task_count,
      COALESCE((SELECT spent FROM budgets WHERE company_id = c.id), 0) as monthly_spend
    FROM companies c WHERE c.id = ?
  `).get(req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
});

// POST /api/companies
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const { name, description = '', type = 'Custom' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  db.prepare(`INSERT INTO companies (id, name, description, type) VALUES (?, ?, ?, ?)`).run(id, name, description, type);
  db.prepare(`INSERT INTO budgets (id, company_id) VALUES (?, ?)`).run(uuid(), id);
  
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  broadcast({ type: 'company:created', data: company });
  res.status(201).json(company);
});

// PUT /api/companies/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, description, type, status } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
  if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
  if (type !== undefined) { sets.push('type = ?'); vals.push(type); }
  if (status !== undefined) { sets.push('status = ?'); vals.push(status); }
  sets.push("updated_at = datetime('now')");
  vals.push(req.params.id);
  
  db.prepare(`UPDATE companies SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
  broadcast({ type: 'company:updated', data: company });
  res.json(company);
});

// DELETE /api/companies/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
  broadcast({ type: 'company:deleted', data: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
