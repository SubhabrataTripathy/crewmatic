export type AgentType = 'claude' | 'openclaw' | 'codex' | 'custom';
export type AgentStatus = 'online' | 'busy' | 'idle' | 'error' | 'offline';
export type TaskStatus = 'backlog' | 'assigned' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

export interface Company {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  agentCount: number;
  taskCount: number;
  monthlySpend: number;
}

export interface Agent {
  id: string;
  companyId: string;
  name: string;
  type: AgentType;
  role: string;
  status: AgentStatus;
  currentTask: string | null;
  tasksCompleted: number;
  totalCost: number;
  uptime: string;
  lastHeartbeat: string;
  avatar: string;
}

export interface Task {
  id: string;
  companyId: string;
  agentId: string | null;
  agentName?: string;
  agentType?: AgentType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt: string | null;
}

export interface Budget {
  id: string;
  companyId: string;
  totalLimit: number;
  spent: number;
  period: BudgetPeriod;
  alertThreshold: number;
}

export interface CostEntry {
  id: string;
  agentId: string;
  agentName: string;
  taskId: string;
  amount: number;
  provider: string;
  tokensUsed: number;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  companyId: string;
  agentId: string;
  agentName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface SpendData {
  day: string;
  amount: number;
}

export interface AgentCostData {
  name: string;
  cost: number;
  color: string;
}
