import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET /api/goals?company_id=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { company_id } = req.query;
  let query = 'SELECT * FROM goals';
  const params: any[] = [];
  if (company_id) { query += ' WHERE company_id = ?'; params.push(company_id); }
  query += ' ORDER BY created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// POST /api/goals
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const { company_id, title, description = '', due_date = null } = req.body;
  db.prepare(`INSERT INTO goals (id, company_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)`).run(id, company_id, title, description, due_date);
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  broadcast({ type: 'goal:created', data: goal });
  res.status(201).json(goal);
});

// PUT /api/goals/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, description, status, progress } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
  if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
  if (status !== undefined) { sets.push('status = ?'); vals.push(status); }
  if (progress !== undefined) { sets.push('progress = ?'); vals.push(progress); }
  sets.push("updated_at = datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE goals SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  broadcast({ type: 'goal:updated', data: goal });
  res.json(goal);
});

// DELETE /api/goals/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
