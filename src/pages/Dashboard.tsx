import {
  Users, KanbanSquare, DollarSign, TrendingUp,
  Activity, CheckCircle2, Target
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppStore } from '../stores/appStore';

const statusToColor: Record<string, string> = {
  info: 'var(--accent-blue)',
  success: 'var(--accent-emerald)',
  warning: 'var(--accent-amber)',
  error: 'var(--accent-rose)',
};

const avatarBg: Record<string, string> = {
  claude: 'linear-gradient(135deg, #d97706, #ea580c)',
  openclaw: 'linear-gradient(135deg, #059669, #10b981)',
  codex: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  custom: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
};

export default function Dashboard() {
  const { agents, tasks, budget, budgetSummary, auditLog, goals } = useAppStore();

  const activeAgents = agents.filter(a => a.status === 'online' || a.status === 'busy').length;
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const budgetSpent = budget?.spent || 0;
  const budgetLimit = budget?.total_limit || 500;
  const budgetPercent = Math.round((budgetSpent / budgetLimit) * 100);

  const spendByDay = budgetSummary?.by_day?.map((d: any) => ({
    day: d.day?.split('-').slice(1).join('/'),
    amount: d.total,
  })) || [];

  const costByAgent = budgetSummary?.by_agent?.map((a: any) => ({
    name: a.name,
    cost: a.total_cost,
  })) || [];

  return (
    <div>
      {/* Metrics */}
      <div className="dashboard-grid animate-in">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon blue"><Users size={20} /></div>
            {activeAgents > 0 && <span className="metric-change positive">↑ {activeAgents}</span>}
          </div>
          <div className="metric-value">{activeAgents}<span style={{ fontSize: '16px', color: 'var(--text-tertiary)' }}>/{agents.length}</span></div>
          <div className="metric-label">Active Agents</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon amber"><KanbanSquare size={20} /></div>
          </div>
          <div className="metric-value">{tasksInProgress}</div>
          <div className="metric-label">Tasks In Progress</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon emerald"><CheckCircle2 size={20} /></div>
          </div>
          <div className="metric-value">{completedTasks}</div>
          <div className="metric-label">Completed Tasks</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-header">
            <div className="metric-icon rose"><DollarSign size={20} /></div>
          </div>
          <div className="metric-value">${budgetSpent.toFixed(0)}<span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>/${budgetLimit}</span></div>
          <div className="metric-label">Monthly Spend ({budgetPercent}%)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-row animate-in animate-in-delay-1">
        <div className="glass-card chart-container">
          <div className="chart-header">
            <div>
              <div className="chart-title">Spend Trend</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Recent days</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: 600 }}>
              <TrendingUp size={14} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendByDay}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: '#1a2444', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Spend']} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#spendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card chart-container">
          <div className="chart-header">
            <div>
              <div className="chart-title">Cost by Agent</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>This period</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costByAgent} layout="vertical">
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={{ background: '#1a2444', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Cost']} />
              <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals + Agent Status + Activity */}
      <div className="dashboard-row-3 animate-in animate-in-delay-2">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="section-header">
            <span className="section-title">Agent Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.map((agent) => (
              <div key={agent.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0,
                  background: avatarBg[agent.type] || avatarBg.custom,
                }}>
                  {agent.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{agent.role}</div>
                </div>
                <span className={`status-badge ${agent.status}`}>{agent.status}</span>
              </div>
            ))}
            {agents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No agents hired yet
              </div>
            )}
          </div>

          {/* Goals section */}
          {goals.length > 0 && (
            <>
              <div className="section-header" style={{ marginTop: '20px' }}>
                <span className="section-title"><Target size={16} style={{ marginRight: '6px', display: 'inline' }} />Goals</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {goals.map((goal: any) => (
                  <div key={goal.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{goal.title}</span>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{goal.progress}%</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: 'var(--accent-blue)', width: `${goal.progress}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="section-header">
            <span className="section-title">
              <Activity size={16} style={{ marginRight: '6px', display: 'inline' }} />
              Live Activity
            </span>
          </div>
          <div className="activity-feed">
            {auditLog.slice(0, 8).map((entry: any) => (
              <div className="activity-item" key={entry.id}>
                <div className="activity-dot" style={{ background: statusToColor[entry.type] || 'var(--accent-blue)' }} />
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{entry.agent_name}</strong> — {entry.action}
                    <br /><span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{entry.details}</span>
                  </div>
                  <div className="activity-time">{new Date(entry.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {auditLog.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No activity yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
