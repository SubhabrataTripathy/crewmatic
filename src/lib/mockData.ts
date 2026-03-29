import type { Company, Agent, Task, Budget, AuditEntry, SpendData, AgentCostData } from './types';

export const companies: Company[] = [
  {
    id: 'comp-1',
    name: 'NexusForge AI',
    description: 'Autonomous SaaS development company',
    type: 'SaaS Startup',
    createdAt: '2026-03-01',
    agentCount: 6,
    taskCount: 47,
    monthlySpend: 342.50,
  },
  {
    id: 'comp-2',
    name: 'ContentPilot',
    description: 'AI-powered content marketing agency',
    type: 'Content Agency',
    createdAt: '2026-03-10',
    agentCount: 4,
    taskCount: 23,
    monthlySpend: 128.75,
  },
];

export const agents: Agent[] = [
  {
    id: 'agent-1', companyId: 'comp-1', name: 'Atlas', type: 'claude', role: 'Lead Engineer',
    status: 'busy', currentTask: 'Implementing API rate limiter middleware',
    tasksCompleted: 134, totalCost: 89.40, uptime: '99.2%', lastHeartbeat: '2s ago', avatar: 'A',
  },
  {
    id: 'agent-2', companyId: 'comp-1', name: 'Nova', type: 'openclaw', role: 'Full-Stack Dev',
    status: 'online', currentTask: 'Building user onboarding flow',
    tasksCompleted: 98, totalCost: 67.20, uptime: '97.8%', lastHeartbeat: '5s ago', avatar: 'N',
  },
  {
    id: 'agent-3', companyId: 'comp-1', name: 'Cipher', type: 'codex', role: 'Security Auditor',
    status: 'idle', currentTask: null,
    tasksCompleted: 45, totalCost: 32.10, uptime: '95.1%', lastHeartbeat: '12s ago', avatar: 'C',
  },
  {
    id: 'agent-4', companyId: 'comp-1', name: 'Pixel', type: 'claude', role: 'UI/UX Designer',
    status: 'busy', currentTask: 'Redesigning dashboard components',
    tasksCompleted: 76, totalCost: 54.80, uptime: '98.5%', lastHeartbeat: '3s ago', avatar: 'P',
  },
  {
    id: 'agent-5', companyId: 'comp-1', name: 'Sage', type: 'custom', role: 'QA Lead',
    status: 'online', currentTask: 'Running E2E test suite',
    tasksCompleted: 112, totalCost: 41.50, uptime: '96.3%', lastHeartbeat: '8s ago', avatar: 'S',
  },
  {
    id: 'agent-6', companyId: 'comp-1', name: 'Vanguard', type: 'openclaw', role: 'DevOps',
    status: 'error', currentTask: null,
    tasksCompleted: 67, totalCost: 57.50, uptime: '92.1%', lastHeartbeat: '45s ago', avatar: 'V',
  },
];

export const tasks: Task[] = [
  { id: 't-1', companyId: 'comp-1', agentId: null, title: 'Set up CI/CD pipeline for staging', description: '', status: 'backlog', priority: 'high', createdAt: '2026-03-28', completedAt: null },
  { id: 't-2', companyId: 'comp-1', agentId: null, title: 'Write API documentation', description: '', status: 'backlog', priority: 'medium', createdAt: '2026-03-28', completedAt: null },
  { id: 't-3', companyId: 'comp-1', agentId: null, title: 'Add dark mode toggle', description: '', status: 'backlog', priority: 'low', createdAt: '2026-03-27', completedAt: null },
  { id: 't-4', companyId: 'comp-1', agentId: 'agent-1', agentName: 'Atlas', agentType: 'claude', title: 'Implement API rate limiter', description: '', status: 'in_progress', priority: 'high', createdAt: '2026-03-27', completedAt: null },
  { id: 't-5', companyId: 'comp-1', agentId: 'agent-2', agentName: 'Nova', agentType: 'openclaw', title: 'Build user onboarding flow', description: '', status: 'in_progress', priority: 'high', createdAt: '2026-03-26', completedAt: null },
  { id: 't-6', companyId: 'comp-1', agentId: 'agent-4', agentName: 'Pixel', agentType: 'claude', title: 'Redesign dashboard layout', description: '', status: 'in_progress', priority: 'medium', createdAt: '2026-03-26', completedAt: null },
  { id: 't-7', companyId: 'comp-1', agentId: 'agent-5', agentName: 'Sage', agentType: 'custom', title: 'Run E2E test suite', description: '', status: 'assigned', priority: 'medium', createdAt: '2026-03-28', completedAt: null },
  { id: 't-8', companyId: 'comp-1', agentId: 'agent-3', agentName: 'Cipher', agentType: 'codex', title: 'Security audit: auth module', description: '', status: 'review', priority: 'high', createdAt: '2026-03-25', completedAt: null },
  { id: 't-9', companyId: 'comp-1', agentId: 'agent-1', agentName: 'Atlas', agentType: 'claude', title: 'Optimize database queries', description: '', status: 'done', priority: 'medium', createdAt: '2026-03-24', completedAt: '2026-03-26' },
  { id: 't-10', companyId: 'comp-1', agentId: 'agent-2', agentName: 'Nova', agentType: 'openclaw', title: 'Fix login page redirect', description: '', status: 'done', priority: 'high', createdAt: '2026-03-23', completedAt: '2026-03-24' },
  { id: 't-11', companyId: 'comp-1', agentId: 'agent-4', agentName: 'Pixel', agentType: 'claude', title: 'Create component library', description: '', status: 'done', priority: 'medium', createdAt: '2026-03-22', completedAt: '2026-03-25' },
  { id: 't-12', companyId: 'comp-1', agentId: 'agent-5', agentName: 'Sage', agentType: 'custom', title: 'Load testing report', description: '', status: 'done', priority: 'low', createdAt: '2026-03-21', completedAt: '2026-03-23' },
];

export const budget: Budget = {
  id: 'b-1', companyId: 'comp-1', totalLimit: 500, spent: 342.50, period: 'monthly', alertThreshold: 80,
};

export const auditLog: AuditEntry[] = [
  { id: 'a-1', companyId: 'comp-1', agentId: 'agent-1', agentName: 'Atlas', action: 'Task completed', details: 'Finished "Optimize database queries" — 23 files changed', timestamp: '2 min ago', type: 'success' },
  { id: 'a-2', companyId: 'comp-1', agentId: 'agent-6', agentName: 'Vanguard', action: 'Heartbeat missed', details: 'Agent failed to respond within timeout window (30s)', timestamp: '5 min ago', type: 'error' },
  { id: 'a-3', companyId: 'comp-1', agentId: 'agent-4', agentName: 'Pixel', action: 'Task started', details: 'Started working on "Redesign dashboard layout"', timestamp: '12 min ago', type: 'info' },
  { id: 'a-4', companyId: 'comp-1', agentId: 'agent-5', agentName: 'Sage', action: 'Tests passed', details: 'E2E suite: 147/147 passed | 0 failed | 0 skipped', timestamp: '18 min ago', type: 'success' },
  { id: 'a-5', companyId: 'comp-1', agentId: 'agent-2', agentName: 'Nova', action: 'Budget warning', details: 'Monthly spend reached 68% of budget ($342.50 / $500.00)', timestamp: '25 min ago', type: 'warning' },
  { id: 'a-6', companyId: 'comp-1', agentId: 'agent-3', agentName: 'Cipher', action: 'Audit complete', details: 'Security review of auth module — 2 medium issues found', timestamp: '32 min ago', type: 'warning' },
  { id: 'a-7', companyId: 'comp-1', agentId: 'agent-1', agentName: 'Atlas', action: 'PR merged', details: 'Merged #142: "Add rate limiting to API endpoints"', timestamp: '45 min ago', type: 'success' },
  { id: 'a-8', companyId: 'comp-1', agentId: 'agent-2', agentName: 'Nova', action: 'Task assigned', details: 'Assigned to "Build user onboarding flow"', timestamp: '1h ago', type: 'info' },
  { id: 'a-9', companyId: 'comp-1', agentId: 'agent-4', agentName: 'Pixel', action: 'Design approved', details: 'Design spec approved for dashboard v2', timestamp: '1.5h ago', type: 'success' },
  { id: 'a-10', companyId: 'comp-1', agentId: 'agent-6', agentName: 'Vanguard', action: 'Deploy failed', details: 'Staging deployment failed — container health check timeout', timestamp: '2h ago', type: 'error' },
];

export const spendHistory: SpendData[] = [
  { day: 'Mar 22', amount: 8.50 },
  { day: 'Mar 23', amount: 12.30 },
  { day: 'Mar 24', amount: 15.80 },
  { day: 'Mar 25', amount: 9.20 },
  { day: 'Mar 26', amount: 18.40 },
  { day: 'Mar 27', amount: 22.10 },
  { day: 'Mar 28', amount: 14.60 },
  { day: 'Mar 29', amount: 11.90 },
];

export const agentCosts: AgentCostData[] = [
  { name: 'Atlas', cost: 89.40, color: '#f59e0b' },
  { name: 'Nova', cost: 67.20, color: '#10b981' },
  { name: 'Vanguard', cost: 57.50, color: '#10b981' },
  { name: 'Pixel', cost: 54.80, color: '#f59e0b' },
  { name: 'Sage', cost: 41.50, color: '#8b5cf6' },
  { name: 'Cipher', cost: 32.10, color: '#3b82f6' },
];
