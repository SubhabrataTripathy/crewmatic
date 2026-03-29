import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuid } from 'uuid';
import { broadcast } from '../websocket.js';

const router = Router();

// Ensure settings table exists
function ensureSettingsTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(company_id, key)
    )
  `);
}

// Default settings
const DEFAULTS: Record<string, string> = {
  dark_mode: 'true',
  system_tray: 'true',
  notifications: 'true',
  budget_alerts: 'true',
  auto_assign: 'true',
  audit_logging: 'true',
  cost_tracking: 'true',
  heartbeat_interval: '30',
  anthropic_api_key: '',
  openai_api_key: '',
};

// GET /api/settings/:company_id — get all settings for a company
router.get('/:company_id', (req, res) => {
  ensureSettingsTable();
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings WHERE company_id = ?').all(req.params.company_id) as any[];
  
  // Merge defaults with saved settings
  const settings = { ...DEFAULTS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  
  // Mask API keys for security
  const response = { ...settings };
  if (response.anthropic_api_key) {
    response.anthropic_api_key_masked = response.anthropic_api_key.slice(0, 8) + '...' + response.anthropic_api_key.slice(-4);
  }
  if (response.openai_api_key) {
    response.openai_api_key_masked = response.openai_api_key.slice(0, 7) + '...' + response.openai_api_key.slice(-4);
  }
  
  res.json(settings);
});

// PUT /api/settings/:company_id — update settings for a company
router.put('/:company_id', (req, res) => {
  ensureSettingsTable();
  const db = getDb();
  const companyId = req.params.company_id;
  const updates = req.body;
  
  const upsert = db.prepare(`
    INSERT INTO settings (id, company_id, key, value, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(company_id, key) DO UPDATE SET value = ?, updated_at = datetime('now')
  `);
  
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(updates)) {
      // Skip unknown keys
      if (!(key in DEFAULTS)) continue;
      const id = uuid();
      upsert.run(id, companyId, key, String(value), String(value));
    }
  });
  
  transaction();
  
  // Fetch updated settings
  const rows = db.prepare('SELECT key, value FROM settings WHERE company_id = ?').all(companyId) as any[];
  const settings = { ...DEFAULTS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  
  broadcast({ type: 'settings:updated', data: settings });
  res.json(settings);
});

// PUT /api/settings/:company_id/reset — reset to defaults
router.put('/:company_id/reset', (req, res) => {
  ensureSettingsTable();
  const db = getDb();
  db.prepare('DELETE FROM settings WHERE company_id = ?').run(req.params.company_id);
  
  broadcast({ type: 'settings:updated', data: DEFAULTS });
  res.json(DEFAULTS);
});

export default router;
