import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';
import { logAudit } from '../services/audit.js';

const router = Router();

// GET /api/tasks?company_id=xxx&status=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { company_id, status, agent_id } = req.query;
  let query = `
    SELECT t.*, a.name as agent_name, a.type as agent_type 
    FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (company_id) { query += ' AND t.company_id = ?'; params.push(company_id); }
  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (agent_id) { query += ' AND t.agent_id = ?'; params.push(agent_id); }
  query += ' ORDER BY t.created_at DESC';
  
  res.json(db.prepare(query).all(...params));
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const task = db.prepare(`
    SELECT t.*, a.name as agent_name, a.type as agent_type 
    FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id WHERE t.id = ?
  `).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const { company_id, title, description = '', priority = 'medium', agent_id = null, parent_task_id = null } = req.body;
  if (!company_id || !title) return res.status(400).json({ error: 'company_id and title are required' });

  const status = agent_id ? 'assigned' : 'backlog';
  db.prepare(`
    INSERT INTO tasks (id, company_id, agent_id, title, description, status, priority, parent_task_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, company_id, agent_id, title, description, status, priority, parent_task_id);

  if (agent_id) {
    const agent = db.prepare('SELECT name FROM agents WHERE id = ?').get(agent_id) as any;
    logAudit(company_id, agent_id, agent?.name || '', 'Task assigned', `Assigned to "${title}"`, 'info');
  }

  const task = db.prepare(`
    SELECT t.*, a.name as agent_name, a.type as agent_type 
    FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id WHERE t.id = ?
  `).get(id);
  broadcast({ type: 'task:created', data: task });
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, description, status, priority, agent_id, result } = req.body;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const sets: string[] = [];
  const vals: any[] = [];
  if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
  if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
  if (priority !== undefined) { sets.push('priority = ?'); vals.push(priority); }
  if (result !== undefined) { sets.push('result = ?'); vals.push(result); }
  if (agent_id !== undefined) { sets.push('agent_id = ?'); vals.push(agent_id); }
  
  if (status !== undefined) {
    sets.push('status = ?');
    vals.push(status);
    if (status === 'done' && existing.status !== 'done') {
      sets.push("completed_at = datetime('now')");
      // Update agent stats
      if (existing.agent_id) {
        db.prepare(`UPDATE agents SET tasks_completed = tasks_completed + 1, current_task_id = NULL WHERE id = ?`).run(existing.agent_id);
        const agent = db.prepare('SELECT name FROM agents WHERE id = ?').get(existing.agent_id) as any;
        logAudit(existing.company_id, existing.agent_id, agent?.name || '', 'Task completed', `Finished "${existing.title}"`, 'success');
      }
    }
    if (status === 'in_progress' && existing.agent_id) {
      db.prepare(`UPDATE agents SET current_task_id = ?, status = 'busy' WHERE id = ?`).run(req.params.id, existing.agent_id);
    }
  }

  sets.push("updated_at = datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

  const task = db.prepare(`
    SELECT t.*, a.name as agent_name, a.type as agent_type 
    FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id WHERE t.id = ?
  `).get(req.params.id);
  broadcast({ type: 'task:updated', data: task });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  broadcast({ type: 'task:deleted', data: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
