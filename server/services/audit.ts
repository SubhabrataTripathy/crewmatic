import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';

export function logAudit(
  companyId: string,
  agentId: string | null,
  agentName: string,
  action: string,
  details: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO audit_log (id, company_id, agent_id, agent_name, action, details, type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, companyId, agentId, agentName, action, details, type);
  
  const entry = db.prepare('SELECT * FROM audit_log WHERE id = ?').get(id);
  broadcast({ type: 'audit:new', data: entry });
  return entry;
}
