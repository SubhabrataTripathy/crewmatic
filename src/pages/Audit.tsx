import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const typeIcon: Record<string, string> = { info: '🔵', success: '🟢', warning: '🟡', error: '🔴' };

export default function Audit() {
  const { auditLog, fetchAudit } = useAppStore();
  const [filter, setFilter] = useState('all');

  const handleFilter = (type: string) => {
    setFilter(type);
    fetchAudit(type);
  };

  const filtered = filter === 'all' ? auditLog : auditLog.filter((e: any) => e.type === filter);

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h2>Audit Trail</h2>
          <p>Complete activity log — {auditLog.length} entries</p>
        </div>
        <button className="btn btn-ghost"><Download size={14} /> Export</button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }} className="animate-in animate-in-delay-1">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" placeholder="Search audit log..." style={{ paddingLeft: '36px' }} />
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {['all', 'info', 'success', 'warning', 'error'].map((t) => (
            <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => handleFilter(t)}>
              {t === 'all' ? 'All' : typeIcon[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card animate-in animate-in-delay-2" style={{ overflow: 'hidden' }}>
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Agent</th>
              <th>Action</th>
              <th>Details</th>
              <th style={{ width: '140px' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry: any) => (
              <tr key={entry.id}>
                <td style={{ textAlign: 'center' }}>{typeIcon[entry.type] || '🔵'}</td>
                <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.agent_name}</span></td>
                <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{entry.action}</span></td>
                <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.details}</td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(entry.created_at).toLocaleString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
