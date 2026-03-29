import { v4 as uuid } from 'uuid';
import { getDb } from './db.js';

export function seed() {
  const db = getDb();
  
  const existing = db.prepare('SELECT COUNT(*) as count FROM companies').get() as any;
  if (existing.count > 0) return;

  console.log('🌱 Seeding database with demo data...');

  // ── Companies ──
  const comp1 = uuid();
  const comp2 = uuid();

  db.prepare(`INSERT INTO companies (id, name, description, type) VALUES (?, ?, ?, ?)`).run(
    comp1, 'NexusForge AI', 'Autonomous SaaS development company building the next generation of AI-powered tools', 'SaaS Startup'
  );
  db.prepare(`INSERT INTO companies (id, name, description, type) VALUES (?, ?, ?, ?)`).run(
    comp2, 'ContentPilot', 'AI-powered content marketing agency producing SEO articles, social media, and video scripts', 'Content Agency'
  );

  // ── Agents for Company 1 ──
  const agents = [
    { id: uuid(), name: 'Atlas',    type: 'claude',   role: 'Lead Engineer',   status: 'busy' },
    { id: uuid(), name: 'Nova',     type: 'openclaw', role: 'Full-Stack Dev',  status: 'online' },
    { id: uuid(), name: 'Cipher',   type: 'codex',    role: 'Security Auditor',status: 'idle' },
    { id: uuid(), name: 'Pixel',    type: 'claude',   role: 'UI/UX Designer',  status: 'busy' },
    { id: uuid(), name: 'Sage',     type: 'custom',   role: 'QA Lead',         status: 'online' },
    { id: uuid(), name: 'Vanguard', type: 'openclaw', role: 'DevOps Engineer', status: 'error' },
  ];

  const insertAgent = db.prepare(
    `INSERT INTO agents (id, company_id, name, type, role, status, tasks_completed, total_cost, uptime_percent, last_heartbeat) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  );

  const agentData = [
    { ...agents[0], tasks: 134, cost: 89.40, uptime: 99.2 },
    { ...agents[1], tasks: 98,  cost: 67.20, uptime: 97.8 },
    { ...agents[2], tasks: 45,  cost: 32.10, uptime: 95.1 },
    { ...agents[3], tasks: 76,  cost: 54.80, uptime: 98.5 },
    { ...agents[4], tasks: 112, cost: 41.50, uptime: 96.3 },
    { ...agents[5], tasks: 67,  cost: 57.50, uptime: 92.1 },
  ];

  for (const a of agentData) {
    insertAgent.run(a.id, comp1, a.name, a.type, a.role, a.status, a.tasks, a.cost, a.uptime);
  }

  // ── Tasks ──
  const insertTask = db.prepare(
    `INSERT INTO tasks (id, company_id, agent_id, title, description, status, priority, created_at, completed_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?), ?)`
  );

  const taskData = [
    { title: 'Set up CI/CD pipeline for staging',              agent: null,      status: 'backlog',      priority: 'high',   days: '-2 days', done: null },
    { title: 'Write API documentation',                        agent: null,      status: 'backlog',      priority: 'medium', days: '-2 days', done: null },
    { title: 'Add dark mode toggle',                           agent: null,      status: 'backlog',      priority: 'low',    days: '-3 days', done: null },
    { title: 'Implement API rate limiter middleware',           agent: agents[0], status: 'in_progress',  priority: 'high',   days: '-3 days', done: null },
    { title: 'Build user onboarding flow',                     agent: agents[1], status: 'in_progress',  priority: 'high',   days: '-4 days', done: null },
    { title: 'Redesign dashboard layout',                      agent: agents[3], status: 'in_progress',  priority: 'medium', days: '-4 days', done: null },
    { title: 'Run E2E test suite',                             agent: agents[4], status: 'assigned',     priority: 'medium', days: '-2 days', done: null },
    { title: 'Security audit: authentication module',          agent: agents[2], status: 'review',       priority: 'high',   days: '-5 days', done: null },
    { title: 'Optimize database queries for user dashboard',   agent: agents[0], status: 'done',         priority: 'medium', days: '-6 days', done: "datetime('now', '-1 days')" },
    { title: 'Fix login page redirect loop',                   agent: agents[1], status: 'done',         priority: 'high',   days: '-7 days', done: "datetime('now', '-3 days')" },
    { title: 'Create reusable component library',              agent: agents[3], status: 'done',         priority: 'medium', days: '-8 days', done: "datetime('now', '-4 days')" },
    { title: 'Load testing report — 10k concurrent users',     agent: agents[4], status: 'done',         priority: 'low',    days: '-9 days', done: "datetime('now', '-6 days')" },
  ];

  for (const t of taskData) {
    const agentId = t.agent?.id ?? null;
    insertTask.run(uuid(), comp1, agentId, t.title, '', t.status, t.priority, t.days, t.done ? null : null);
  }

  // Set current_task_id for busy agents
  const busyTasks = db.prepare(
    `SELECT id, agent_id FROM tasks WHERE company_id = ? AND status = 'in_progress' AND agent_id IS NOT NULL`
  ).all(comp1) as any[];
  
  for (const bt of busyTasks) {
    db.prepare(`UPDATE agents SET current_task_id = ? WHERE id = ?`).run(bt.id, bt.agent_id);
  }

  // ── Budget ──
  db.prepare(`INSERT INTO budgets (id, company_id, total_limit, spent, period, alert_threshold) VALUES (?, ?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 500, 342.50, 'monthly', 80
  );
  db.prepare(`INSERT INTO budgets (id, company_id, total_limit, spent, period, alert_threshold) VALUES (?, ?, ?, ?, ?, ?)`).run(
    uuid(), comp2, 200, 128.75, 'monthly', 80
  );

  // ── Cost Entries ──
  const insertCost = db.prepare(
    `INSERT INTO cost_entries (id, company_id, agent_id, amount, provider, tokens_used, description, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );

  const costData = [
    { agent: agents[0], amount: 12.30, provider: 'anthropic', tokens: 245000, desc: 'API rate limiter implementation', days: '-1 days' },
    { agent: agents[1], amount: 8.50,  provider: 'openclaw',  tokens: 180000, desc: 'Onboarding flow development', days: '-1 days' },
    { agent: agents[3], amount: 15.80, provider: 'anthropic', tokens: 310000, desc: 'Dashboard redesign', days: '-2 days' },
    { agent: agents[4], amount: 5.20,  provider: 'custom',    tokens: 95000,  desc: 'E2E test execution', days: '-2 days' },
    { agent: agents[0], amount: 22.10, provider: 'anthropic', tokens: 440000, desc: 'Database optimization sprint', days: '-3 days' },
    { agent: agents[5], amount: 18.40, provider: 'openclaw',  tokens: 370000, desc: 'CI/CD pipeline work', days: '-3 days' },
    { agent: agents[2], amount: 9.20,  provider: 'openai',    tokens: 200000, desc: 'Security audit scanning', days: '-4 days' },
    { agent: agents[0], amount: 14.60, provider: 'anthropic', tokens: 290000, desc: 'Code review & refactoring', days: '-5 days' },
  ];

  for (const c of costData) {
    insertCost.run(uuid(), comp1, c.agent.id, c.amount, c.provider, c.tokens, c.desc, c.days);
  }

  // ── Audit Log ──
  const insertAudit = db.prepare(
    `INSERT INTO audit_log (id, company_id, agent_id, agent_name, action, details, type, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
  );

  const auditData = [
    { agent: agents[0], action: 'Task completed',    details: 'Finished "Optimize database queries" — 23 files changed, all tests passing', type: 'success', mins: '-2 minutes' },
    { agent: agents[5], action: 'Heartbeat missed',   details: 'Agent failed to respond within 30s timeout window. Last known status: deploying to staging', type: 'error', mins: '-5 minutes' },
    { agent: agents[3], action: 'Task started',       details: 'Started working on "Redesign dashboard layout" — estimated 4 hours', type: 'info', mins: '-12 minutes' },
    { agent: agents[4], action: 'Tests passed',        details: 'E2E suite: 147/147 passed | 0 failed | 0 skipped | 23.4s runtime', type: 'success', mins: '-18 minutes' },
    { agent: agents[1], action: 'Budget warning',      details: 'Monthly spend reached 68% of budget ($342.50 / $500.00)', type: 'warning', mins: '-25 minutes' },
    { agent: agents[2], action: 'Security audit done', details: 'Auth module review complete — 2 medium issues found, 0 critical', type: 'warning', mins: '-32 minutes' },
    { agent: agents[0], action: 'PR merged',           details: 'Merged PR #142: "Add rate limiting to API endpoints" — 4 files, +312/-28', type: 'success', mins: '-45 minutes' },
    { agent: agents[1], action: 'Task assigned',       details: 'Auto-assigned to "Build user onboarding flow" by orchestrator', type: 'info', mins: '-60 minutes' },
    { agent: agents[3], action: 'Design approved',     details: 'Dashboard v2 design spec approved by governance policy', type: 'success', mins: '-90 minutes' },
    { agent: agents[5], action: 'Deploy failed',       details: 'Staging deployment failed — container health check timeout after 120s', type: 'error', mins: '-120 minutes' },
  ];

  for (const a of auditData) {
    insertAudit.run(uuid(), comp1, a.agent.id, a.agent.name, a.action, a.details, a.type, a.mins);
  }

  // ── Goals ──
  db.prepare(`INSERT INTO goals (id, company_id, title, description, status, progress) VALUES (?, ?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 'Launch MVP by April 15', 'Ship the minimum viable product with auth, dashboard, and billing', 'active', 65
  );
  db.prepare(`INSERT INTO goals (id, company_id, title, description, status, progress) VALUES (?, ?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 'Achieve 99.5% uptime', 'Ensure all services maintain high availability', 'active', 92
  );
  db.prepare(`INSERT INTO goals (id, company_id, title, description, status, progress) VALUES (?, ?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 'Reduce API latency to <200ms', 'Optimize database queries and add caching layer', 'active', 40
  );

  // ── Policies ──
  db.prepare(`INSERT INTO policies (id, company_id, name, rule_type, config) VALUES (?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 'Budget Alert', 'budget_threshold', JSON.stringify({ threshold: 80, action: 'notify' })
  );
  db.prepare(`INSERT INTO policies (id, company_id, name, rule_type, config) VALUES (?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 'Human Approval for Deploys', 'approval_required', JSON.stringify({ actions: ['deploy'], approver: 'human' })
  );
  db.prepare(`INSERT INTO policies (id, company_id, name, rule_type, config) VALUES (?, ?, ?, ?, ?)`).run(
    uuid(), comp1, 'Max Spend per Agent', 'agent_budget', JSON.stringify({ max_daily: 50, max_monthly: 200 })
  );

  console.log('✅ Database seeded with demo data');
}
