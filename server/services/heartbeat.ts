import { getDb } from '../db.js';
import { broadcast } from '../websocket.js';
import { logAudit } from './audit.js';

const HEARTBEAT_TIMEOUT_MS = 60_000; // 60 seconds
let heartbeatInterval: NodeJS.Timeout | null = null;

export function startHeartbeatMonitor() {
  if (heartbeatInterval) return;
  
  heartbeatInterval = setInterval(() => {
    const db = getDb();
    const now = Date.now();
    
    const agents = db.prepare(`
      SELECT id, company_id, name, status, last_heartbeat 
      FROM agents 
      WHERE status IN ('online', 'busy') AND last_heartbeat IS NOT NULL
    `).all() as any[];

    for (const agent of agents) {
      const lastBeat = new Date(agent.last_heartbeat + 'Z').getTime();
      const elapsed = now - lastBeat;
      
      if (elapsed > HEARTBEAT_TIMEOUT_MS && agent.status !== 'error') {
        db.prepare(`UPDATE agents SET status = 'error', updated_at = datetime('now') WHERE id = ?`).run(agent.id);
        logAudit(agent.company_id, agent.id, agent.name, 'Heartbeat missed',
          `Agent failed to respond within ${HEARTBEAT_TIMEOUT_MS / 1000}s timeout`, 'error');
        broadcast({ type: 'agent:error', data: { id: agent.id, name: agent.name, reason: 'heartbeat_timeout' } });
      }
    }
  }, 15_000); // Check every 15 seconds

  console.log('💓 Heartbeat monitor started (checking every 15s)');
}

export function stopHeartbeatMonitor() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
