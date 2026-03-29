import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, KanbanSquare, Network,
  Wallet, ScrollText, Settings, Plus, ChevronDown,
  Zap, Building2
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Users, label: 'Agents', badgeKey: 'agents' },
  { to: '/tasks', icon: KanbanSquare, label: 'Tasks', badgeKey: 'tasks' },
  { to: '/org', icon: Network, label: 'Org Chart' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/audit', icon: ScrollText, label: 'Audit Trail' },
];

export default function Sidebar() {
  const { currentCompany, companies, agents, tasks, setCurrentCompany } = useAppStore();
  const location = useLocation();

  const getBadge = (key?: string) => {
    if (key === 'agents') return agents.length > 0 ? String(agents.length) : undefined;
    if (key === 'tasks') return tasks.length > 0 ? String(tasks.length) : undefined;
    return undefined;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo"><Zap size={20} /></div>
        <div className="sidebar-brand">
          <h1>Crewmatic</h1>
          <span>AI Company OS</span>
        </div>
      </div>

      <div className="company-selector">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="company-name">{currentCompany?.name || 'No Company'}</div>
            <div className="company-type">{currentCompany?.type || 'Select a company'}</div>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>

      {companies.length > 1 && (
        <div style={{ padding: '0 10px', marginBottom: '4px' }}>
          {companies.filter(c => c.id !== currentCompany?.id).map((c: any) => (
            <button key={c.id} className="nav-item" onClick={() => setCurrentCompany(c)}
              style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <Building2 size={14} /> {c.name}
            </button>
          ))}
        </div>
      )}

      <nav className="sidebar-nav">
        <span className="nav-section-label">Command Center</span>
        {navItems.map((item) => {
          const badge = getBadge(item.badgeKey);
          return (
            <NavLink key={item.to} to={item.to}
              className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          );
        })}

        <span className="nav-section-label" style={{ marginTop: '12px' }}>Quick Actions</span>
        <NavLink to="/agents" className="nav-item" style={{ color: 'var(--accent-blue)' }}>
          <Plus size={18} /> <span>Hire Agent</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={18} /> <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
