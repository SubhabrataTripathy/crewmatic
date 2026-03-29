import { DollarSign, TrendingDown, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { useAppStore } from '../stores/appStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

export default function Budget() {
  const { budget, budgetSummary } = useAppStore();
  const spent = budget?.spent || 0;
  const limit = budget?.total_limit || 500;
  const percent = Math.round((spent / limit) * 100);
  const remaining = limit - spent;
  const circumference = 2 * Math.PI * 65;
  const dashOffset = circumference - (percent / 100) * circumference;
  const ringClass = percent > 90 ? 'danger' : percent > 70 ? 'warning' : '';

  const byAgent = budgetSummary?.by_agent?.map((a: any, i: number) => ({
    name: a.name, cost: a.total_cost, color: COLORS[i % COLORS.length]
  })) || [];

  const byDay = budgetSummary?.by_day?.map((d: any) => ({
    day: d.day?.split('-').slice(1).join('/'), amount: d.total
  })) || [];

  const todaySpend = byDay.length > 0 ? byDay[byDay.length - 1]?.amount || 0 : 0;
  const avgDaily = byDay.length > 0 ? byDay.reduce((s: number, d: any) => s + (d.amount || 0), 0) / byDay.length : 0;

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h2>Budget Center</h2>
          <p>Monitor costs and enforce spending limits</p>
        </div>
        <button className="btn btn-ghost"><AlertTriangle size={14} /> Set Alerts</button>
      </div>

      <div className="dashboard-grid animate-in animate-in-delay-1">
        <div className="glass-card metric-card">
          <div className="metric-header"><div className="metric-icon blue"><DollarSign size={20} /></div></div>
          <div className="metric-value">${spent.toFixed(0)}</div>
          <div className="metric-label">Total Spent</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-header"><div className="metric-icon emerald"><DollarSign size={20} /></div></div>
          <div className="metric-value">${remaining.toFixed(0)}</div>
          <div className="metric-label">Remaining</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-header"><div className="metric-icon amber"><TrendingDown size={20} /></div></div>
          <div className="metric-value">${todaySpend.toFixed(2)}</div>
          <div className="metric-label">Latest Day Spend</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-header"><div className="metric-icon violet"><ArrowUpRight size={20} /></div></div>
          <div className="metric-value">${avgDaily.toFixed(2)}</div>
          <div className="metric-label">Avg Daily Spend</div>
        </div>
      </div>

      <div className="dashboard-row animate-in animate-in-delay-2">
        <div className="glass-card budget-gauge">
          <div className="chart-header" style={{ width: '100%' }}>
            <div className="chart-title">Monthly Budget</div>
            <span style={{
              fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)',
              background: percent > 80 ? 'var(--accent-rose-dim)' : 'var(--accent-emerald-dim)',
              color: percent > 80 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
            }}>{percent}% used</span>
          </div>
          <div className="budget-ring" style={{ margin: '20px auto' }}>
            <svg viewBox="0 0 140 140">
              <circle className="ring-bg" cx="70" cy="70" r="65" />
              <circle className={`ring-fill ${ringClass}`} cx="70" cy="70" r="65" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
            </svg>
            <div className="budget-center">
              <div className="budget-amount">${spent.toFixed(0)}</div>
              <div className="budget-label">of ${limit}</div>
            </div>
          </div>
        </div>

        <div className="glass-card chart-container">
          <div className="chart-header"><div className="chart-title">Cost by Agent</div></div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byAgent} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="cost">
                {byAgent.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2444', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${Number(v).toFixed(2)}`, 'Cost']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
            {byAgent.map((a: any, i: number) => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                <span style={{ color: 'var(--text-secondary)' }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card chart-container animate-in animate-in-delay-3">
        <div className="chart-header"><div className="chart-title">Daily Spend Trend</div></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={byDay}>
            <defs>
              <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#1a2444', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${Number(v).toFixed(2)}`, 'Spend']} />
            <Area type="monotone" dataKey="amount" stroke="#10b981" fill="url(#budgetGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
