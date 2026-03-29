import { useAppStore } from '../stores/appStore';

const avatarBg: Record<string, string> = {
  claude: 'linear-gradient(135deg, #d97706, #ea580c)',
  openclaw: 'linear-gradient(135deg, #059669, #10b981)',
  codex: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  custom: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
};

export default function OrgChart() {
  const { agents } = useAppStore();
  const lead = agents.find((a: any) => a.role?.toLowerCase().includes('lead'));
  const team = agents.filter((a: any) => a.id !== lead?.id);

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h2>Organization Chart</h2>
          <p>Company hierarchy and reporting structure</p>
        </div>
      </div>

      <div className="glass-card animate-in animate-in-delay-1" style={{ padding: '40px 20px', overflow: 'auto' }}>
        <div className="org-tree">
          <div className="org-level">
            <div className="org-node glass-card glow-blue" style={{ border: '2px solid var(--accent-blue)' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 auto 12px',
              }}>👑</div>
              <div className="org-name">You (CEO)</div>
              <div className="org-role">Human Overseer</div>
              <span className="status-badge online" style={{ marginTop: '8px' }}>online</span>
            </div>
          </div>

          <div className="org-connector" />

          {lead && (
            <>
              <div className="org-level">
                <div className="org-node glass-card">
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, color: 'white', margin: '0 auto 10px',
                    background: avatarBg[lead.type] || avatarBg.custom,
                  }}>{lead.name[0]}</div>
                  <div className="org-name">{lead.name}</div>
                  <div className="org-role">{lead.role}</div>
                  <span className={`status-badge ${lead.status}`} style={{ marginTop: '8px' }}>{lead.status}</span>
                </div>
              </div>
              <div className="org-connector" />
            </>
          )}

          <div className="org-level">
            {team.map((agent: any) => (
              <div key={agent.id} className="org-node glass-card clickable">
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, color: 'white', margin: '0 auto 10px',
                  background: avatarBg[agent.type] || avatarBg.custom,
                }}>{agent.name[0]}</div>
                <div className="org-name">{agent.name}</div>
                <div className="org-role">{agent.role}</div>
                <span className={`status-badge ${agent.status}`} style={{ marginTop: '8px' }}>{agent.status}</span>
                {agent.current_task_title && (
                  <div style={{
                    fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px',
                    padding: '4px 8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
                    maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{agent.current_task_title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
