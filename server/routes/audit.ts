import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/audit?company_id=xxx&type=xxx&limit=50
router.get('/', (req, res) => {
  const db = getDb();
  const { company_id, type, limit = '50' } = req.query;
  let query = `SELECT * FROM audit_log WHERE 1=1`;
  const params: any[] = [];
  if (company_id) { query += ' AND company_id = ?'; params.push(company_id); }
  if (type && type !== 'all') { query += ' AND type = ?'; params.push(type); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit as string));

  res.json(db.prepare(query).all(...params));
});

export default router;
