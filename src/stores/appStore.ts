import { create } from 'zustand';
import { api } from '../lib/api';
import { ws } from '../lib/ws';

interface AppState {
  // Company
  companies: any[];
  currentCompany: any | null;
  loadingCompanies: boolean;

  // Agents
  agents: any[];
  loadingAgents: boolean;

  // Tasks
  tasks: any[];
  loadingTasks: boolean;

  // Budget
  budget: any | null;
  budgetSummary: any | null;

  // Audit
  auditLog: any[];
  loadingAudit: boolean;

  // Goals
  goals: any[];

  // Connection
  connected: boolean;

  // Actions
  fetchCompanies: () => Promise<void>;
  setCurrentCompany: (company: any) => void;
  createCompany: (data: { name: string; description?: string; type?: string }) => Promise<any>;

  fetchAgents: () => Promise<void>;
  hireAgent: (data: { name: string; type: string; role: string }) => Promise<any>;
  fireAgent: (id: string) => Promise<void>;
  updateAgent: (id: string, data: any) => Promise<void>;

  fetchTasks: () => Promise<void>;
  createTask: (data: { title: string; priority?: string; agent_id?: string }) => Promise<any>;
  updateTask: (id: string, data: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  fetchBudget: () => Promise<void>;
  fetchBudgetSummary: () => Promise<void>;

  fetchAudit: (type?: string) => Promise<void>;

  fetchGoals: () => Promise<void>;
  createGoal: (data: { title: string; description?: string }) => Promise<any>;

  initWebSocket: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  companies: [],
  currentCompany: null,
  loadingCompanies: true,
  agents: [],
  loadingAgents: true,
  tasks: [],
  loadingTasks: true,
  budget: null,
  budgetSummary: null,
  auditLog: [],
  loadingAudit: true,
  goals: [],
  connected: false,

  fetchCompanies: async () => {
    set({ loadingCompanies: true });
    try {
      const companies = await api.companies.list();
      const current = get().currentCompany;
      set({
        companies,
        currentCompany: current || companies[0] || null,
        loadingCompanies: false,
      });
    } catch (e) {
      set({ loadingCompanies: false });
      console.error('Failed to fetch companies:', e);
    }
  },

  setCurrentCompany: (company) => {
    set({ currentCompany: company });
    // Reload data for new company
    get().fetchAgents();
    get().fetchTasks();
    get().fetchBudget();
    get().fetchBudgetSummary();
    get().fetchAudit();
    get().fetchGoals();
  },

  createCompany: async (data) => {
    const company = await api.companies.create(data);
    set((s) => ({ companies: [company, ...s.companies] }));
    return company;
  },

  fetchAgents: async () => {
    const cc = get().currentCompany;
    if (!cc) return;
    set({ loadingAgents: true });
    try {
      const agents = await api.agents.list(cc.id);
      set({ agents, loadingAgents: false });
    } catch { set({ loadingAgents: false }); }
  },

  hireAgent: async (data) => {
    const cc = get().currentCompany;
    if (!cc) throw new Error('No company selected');
    const agent = await api.agents.hire({ ...data, company_id: cc.id });
    set((s) => ({ agents: [...s.agents, agent] }));
    return agent;
  },

  fireAgent: async (id) => {
    await api.agents.fire(id);
    set((s) => ({ agents: s.agents.filter((a) => a.id !== id) }));
  },

  updateAgent: async (id, data) => {
    const updated = await api.agents.update(id, data);
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, ...updated } : a)) }));
  },

  fetchTasks: async () => {
    const cc = get().currentCompany;
    if (!cc) return;
    set({ loadingTasks: true });
    try {
      const tasks = await api.tasks.list(cc.id);
      set({ tasks, loadingTasks: false });
    } catch { set({ loadingTasks: false }); }
  },

  createTask: async (data) => {
    const cc = get().currentCompany;
    if (!cc) throw new Error('No company selected');
    const task = await api.tasks.create({ ...data, company_id: cc.id });
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  updateTask: async (id, data) => {
    const updated = await api.tasks.update(id, data);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  deleteTask: async (id) => {
    await api.tasks.delete(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  fetchBudget: async () => {
    const cc = get().currentCompany;
    if (!cc) return;
    try {
      const budget = await api.budget.get(cc.id);
      set({ budget });
    } catch { /* no budget */ }
  },

  fetchBudgetSummary: async () => {
    const cc = get().currentCompany;
    if (!cc) return;
    try {
      const summary = await api.budget.summary(cc.id);
      set({ budgetSummary: summary });
    } catch { /* no summary */ }
  },

  fetchAudit: async (type?: string) => {
    const cc = get().currentCompany;
    if (!cc) return;
    set({ loadingAudit: true });
    try {
      const log = await api.audit.list(cc.id, type);
      set({ auditLog: log, loadingAudit: false });
    } catch { set({ loadingAudit: false }); }
  },

  fetchGoals: async () => {
    const cc = get().currentCompany;
    if (!cc) return;
    try {
      const goals = await api.goals.list(cc.id);
      set({ goals });
    } catch { /* no goals */ }
  },

  createGoal: async (data) => {
    const cc = get().currentCompany;
    if (!cc) throw new Error('No company selected');
    const goal = await api.goals.create({ ...data, company_id: cc.id });
    set((s) => ({ goals: [goal, ...s.goals] }));
    return goal;
  },

  initWebSocket: () => {
    ws.connect();
    set({ connected: true });

    // Agent events
    ws.on('agent:hired', () => get().fetchAgents());
    ws.on('agent:fired', () => get().fetchAgents());
    ws.on('agent:updated', () => get().fetchAgents());
    ws.on('agent:heartbeat', () => get().fetchAgents());
    ws.on('agent:error', () => get().fetchAgents());

    // Task events
    ws.on('task:created', () => get().fetchTasks());
    ws.on('task:updated', () => get().fetchTasks());
    ws.on('task:deleted', () => get().fetchTasks());

    // Budget events
    ws.on('budget:updated', () => { get().fetchBudget(); get().fetchBudgetSummary(); });
    ws.on('cost:added', () => { get().fetchBudget(); get().fetchBudgetSummary(); });

    // Audit events
    ws.on('audit:new', (entry) => {
      set((s) => ({ auditLog: [entry, ...s.auditLog].slice(0, 50) }));
    });

    // Goal events
    ws.on('goal:created', () => get().fetchGoals());
    ws.on('goal:updated', () => get().fetchGoals());
  },
}));
