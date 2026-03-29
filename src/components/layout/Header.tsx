import { Bell, Search, Moon } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="header-title">{title}</div>
          {subtitle && <div className="header-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="header-right">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', 
            color: 'var(--text-tertiary)' 
          }} />
          <input
            className="input"
            placeholder="Search agents, tasks..."
            style={{ 
              paddingLeft: '34px', width: '240px', height: '36px',
              background: 'var(--bg-tertiary)', fontSize: '12px'
            }}
          />
        </div>
        <button className="btn-icon">
          <Moon size={16} />
        </button>
        <button className="btn-icon" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent-rose)', border: '2px solid var(--bg-secondary)'
          }} />
        </button>
        <div style={{
          width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: 'white', cursor: 'pointer'
        }}>
          S
        </div>
      </div>
    </header>
  );
}
