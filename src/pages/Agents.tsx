import { useState } from 'react';
import { Plus, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const avatarBg: Record<string, string> = {
  claude: 'linear-gradient(135deg, #d97706, #ea580c)',
  openclaw: 'linear-gradient(135deg, #059669, #10b981)',
  codex: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  custom: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
};

export default function Agents() {
  const { agents, hireAgent, fireAgent } = useAppStore();
  const [showHire, setShowHire] = useState(false);
  const [hireName, setHireName] = useState('');
  const [hireType, setHireType] = useState('claude');
  const [hireRole, setHireRole] = useState('Developer');

  const handleHire = async () => {
    if (!hireName.trim()) return;
    await hireAgent({ name: hireName, type: hireType, role: hireRole });
    setHireName('');
    setShowHire(false);
  };

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h2>AI Agents</h2>
          <p>Manage your workforce of {agents.length} AI employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowHire(true)}>
          <Plus size={16} /> Hire Agent
        </button>
      </div>

      {/* Hire Modal */}
      {showHire && (
        <div className="glass-card animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Hire New Agent</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Agent Name</label>
              <input className="input" placeholder="e.g., Atlas" value={hireName} onChange={e => setHireName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Type</label>
              <select className="select" value={hireType} onChange={e => setHireType(e.target.value)}>
                <option value="claude">Claude</option>
                <option value="openclaw">OpenClaw</option>
                <option value="codex">Codex</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Role</label>
              <input className="input" placeholder="e.g., Developer" value={hireRole} onChange={e => setHireRole(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleHire}>Hire</button>
            <button className="btn btn-ghost" onClick={() => setShowHire(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Status counts */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }} className="animate-in animate-in-delay-1">
        {[
          { label: 'Online', count: agents.filter((a: any) => a.status === 'online').length, color: 'var(--accent-emerald)' },
          { label: 'Busy', count: agents.filter((a: any) => a.status === 'busy').length, color: 'var(--accent-amber)' },
          { label: 'Idle', count: agents.filter((a: any) => a.status === 'idle').length, color: 'var(--text-tertiary)' },
          { label: 'Error', count: agents.filter((a: any) => a.status === 'error').length, color: 'var(--accent-rose)' },
        ].map((s) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)', fontSize: '13px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
            <span style={{ fontWeight: 600 }}>{s.count}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="agents-grid animate-in animate-in-delay-2">
        {agents.map((agent: any) => (
          <div key={agent.id} className="glass-card agent-card clickable glow-blue">
            <div className="agent-header">
              <div className="agent-info">
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, color: 'white', flexShrink: 0,
                  background: avatarBg[agent.type] || avatarBg.custom,
                }}>
                  {agent.name[0]}
                </div>
                <div>
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-role">{agent.role} · {agent.type}</div>
                </div>
              </div>
              <span className={`status-badge ${agent.status}`}>{agent.status}</span>
            </div>

            {agent.current_task_title && (
              <div className="agent-task">{agent.current_task_title}</div>
            )}

            <div className="agent-stats">
              <span><CheckCircle2 size={12} /> {agent.tasks_completed} tasks</span>
              <span><DollarSign size={12} /> ${(agent.total_cost || 0).toFixed(2)}</span>
              <span><Clock size={12} /> {(agent.uptime_percent || 0).toFixed(1)}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                ♥ {agent.last_heartbeat ? new Date(agent.last_heartbeat).toLocaleTimeString() : 'never'}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }}>Logs</button>
                <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent-rose)' }}
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Fire ${agent.name}?`)) fireAgent(agent.id); }}>
                  Fire
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Hire card */}
        <div className="glass-card clickable" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '200px', gap: '12px', border: '2px dashed var(--border-default)',
          background: 'transparent', cursor: 'pointer',
        }} onClick={() => setShowHire(true)}>
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-blue)',
          }}>
            <Plus size={24} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hire New Agent</span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Claude · OpenClaw · Codex · Custom</span>
        </div>
      </div>
    </div>
  );
}
