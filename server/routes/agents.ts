import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';
import { logAudit } from '../services/audit.js';

const router = Router();

// GET /api/agents?company_id=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { company_id } = req.query;
  let agents;
  if (company_id) {
    agents = db.prepare(`
      SELECT a.*, t.title as current_task_title 
      FROM agents a LEFT JOIN tasks t ON a.current_task_id = t.id 
      WHERE a.company_id = ? ORDER BY a.created_at
    `).all(company_id);
  } else {
    agents = db.prepare(`
      SELECT a.*, t.title as current_task_title 
      FROM agents a LEFT JOIN tasks t ON a.current_task_id = t.id 
      ORDER BY a.created_at
    `).all();
  }
  res.json(agents);
});

// GET /api/agents/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const agent = db.prepare(`
    SELECT a.*, t.title as current_task_title, c.name as company_name
    FROM agents a 
    LEFT JOIN tasks t ON a.current_task_id = t.id 
    LEFT JOIN companies c ON a.company_id = c.id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// POST /api/agents — "Hire" a new agent
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const { company_id, name, type = 'custom', role = 'Developer', config = '{}', api_key_ref = '' } = req.body;
  if (!company_id || !name) return res.status(400).json({ error: 'company_id and name are required' });

  db.prepare(`
    INSERT INTO agents (id, company_id, name, type, role, status, config, api_key_ref, last_heartbeat)
    VALUES (?, ?, ?, ?, ?, 'online', ?, ?, datetime('now'))
  `).run(id, company_id, name, type, role, config, api_key_ref);

  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
  logAudit(company_id, id, name, 'Agent hired', `${name} (${type}) hired as ${role}`, 'success');
  broadcast({ type: 'agent:hired', data: agent });
  res.status(201).json(agent);
});

// PUT /api/agents/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, role, status, config, current_task_id } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
  if (role !== undefined) { sets.push('role = ?'); vals.push(role); }
  if (status !== undefined) { sets.push('status = ?'); vals.push(status); }
  if (config !== undefined) { sets.push('config = ?'); vals.push(config); }
  if (current_task_id !== undefined) { sets.push('current_task_id = ?'); vals.push(current_task_id); }
  sets.push("updated_at = datetime('now')");
  vals.push(req.params.id);

  db.prepare(`UPDATE agents SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id) as any;
  
  if (status) {
    logAudit(agent.company_id, agent.id, agent.name, 'Status changed', `Status changed to ${status}`, 'info');
  }
  broadcast({ type: 'agent:updated', data: agent });
  res.json(agent);
});

// POST /api/agents/:id/heartbeat
router.post('/:id/heartbeat', (req, res) => {
  const db = getDb();
  db.prepare(`UPDATE agents SET last_heartbeat = datetime('now'), status = CASE WHEN status = 'error' THEN 'online' ELSE status END WHERE id = ?`).run(req.params.id);
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id);
  broadcast({ type: 'agent:heartbeat', data: { id: req.params.id, timestamp: new Date().toISOString() } });
  res.json(agent);
});

// DELETE /api/agents/:id — "Fire" an agent
router.delete('/:id', (req, res) => {
  const db = getDb();
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id) as any;
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  db.prepare('UPDATE tasks SET agent_id = NULL, status = \'backlog\' WHERE agent_id = ? AND status != \'done\'').run(req.params.id);
  db.prepare('DELETE FROM agents WHERE id = ?').run(req.params.id);
  
  logAudit(agent.company_id, agent.id, agent.name, 'Agent fired', `${agent.name} was removed from the company`, 'warning');
  broadcast({ type: 'agent:fired', data: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
