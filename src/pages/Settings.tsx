import { useState } from 'react';
import { Shield, Bell, Database, Palette, Globe, Key } from 'lucide-react';

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return <div className={`toggle ${active ? 'active' : ''}`} onClick={onClick} />;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    systemTray: true,
    notifications: true,
    autoAssign: true,
    budgetAlerts: true,
    auditLogging: true,
    darkMode: true,
    costTracking: true,
    heartbeatInterval: '30',
  });

  const toggle = (key: keyof typeof settings) => () => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <div className="page-header animate-in">
        <div>
          <h2>Settings</h2>
          <p>Configure Crewmatic preferences</p>
        </div>
      </div>

      <div className="animate-in animate-in-delay-1">
        <div className="settings-section">
          <h3><Palette size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Appearance</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Dark Mode</div>
              <div className="setting-desc">Use dark theme across the application</div>
            </div>
            <Toggle active={settings.darkMode as boolean} onClick={toggle('darkMode')} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">System Tray</div>
              <div className="setting-desc">Keep Crewmatic running in the background</div>
            </div>
            <Toggle active={settings.systemTray as boolean} onClick={toggle('systemTray')} />
          </div>
        </div>

        <div className="settings-section">
          <h3><Bell size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Notifications</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Desktop Notifications</div>
              <div className="setting-desc">Show alerts for agent events and task updates</div>
            </div>
            <Toggle active={settings.notifications as boolean} onClick={toggle('notifications')} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Budget Alerts</div>
              <div className="setting-desc">Notify when spend exceeds threshold</div>
            </div>
            <Toggle active={settings.budgetAlerts as boolean} onClick={toggle('budgetAlerts')} />
          </div>
        </div>

        <div className="settings-section">
          <h3><Shield size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Governance</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Auto-assign Tasks</div>
              <div className="setting-desc">Automatically assign tasks to available agents</div>
            </div>
            <Toggle active={settings.autoAssign as boolean} onClick={toggle('autoAssign')} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Audit Logging</div>
              <div className="setting-desc">Record all agent actions for compliance</div>
            </div>
            <Toggle active={settings.auditLogging as boolean} onClick={toggle('auditLogging')} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Cost Tracking</div>
              <div className="setting-desc">Track token usage and API costs per agent</div>
            </div>
            <Toggle active={settings.costTracking as boolean} onClick={toggle('costTracking')} />
          </div>
        </div>

        <div className="settings-section">
          <h3><Database size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Agent Configuration</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Heartbeat Interval</div>
              <div className="setting-desc">How often agents check in (seconds)</div>
            </div>
            <select className="select" style={{ width: '120px' }} value={settings.heartbeatInterval} onChange={(e) => setSettings(s => ({ ...s, heartbeatInterval: e.target.value }))}>
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
              <option value="300">5min</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3><Key size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />API Keys</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Anthropic API Key</div>
              <div className="setting-desc">For Claude Code agents</div>
            </div>
            <input className="input" type="password" placeholder="sk-ant-..." style={{ width: '240px' }} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">OpenAI API Key</div>
              <div className="setting-desc">For Codex agents</div>
            </div>
            <input className="input" type="password" placeholder="sk-..." style={{ width: '240px' }} />
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary">Save Settings</button>
          <button className="btn btn-ghost">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}
