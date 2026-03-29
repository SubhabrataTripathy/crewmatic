import { useState, useEffect, useCallback } from 'react';
import { Shield, Bell, Database, Palette, Key, RotateCcw, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

function Toggle({ active, onClick, disabled }: { active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div
      className={`toggle ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    />
  );
}

type ToastType = 'success' | 'error' | null;

export default function SettingsPage() {
  const currentCompany = useAppStore((s) => s.currentCompany);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // API key inputs (separate state so they don't clash with masked values)
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettings = useCallback(async () => {
    if (!currentCompany) return;
    setLoading(true);
    try {
      const data = await api.settings.get(currentCompany.id);
      setSettings(data);
      setOriginalSettings(data);
      setHasChanges(false);
      // Don't overwrite API key inputs with raw keys (they come masked from server for display)
      setAnthropicKey('');
      setOpenaiKey('');
    } catch (e) {
      console.error('Failed to load settings:', e);
      showToast('error', 'Failed to load settings');
    }
    setLoading(false);
  }, [currentCompany]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(next) !== JSON.stringify(originalSettings));
      return next;
    });
  };

  const toggleSetting = (key: string) => {
    const current = settings[key] === 'true';
    updateSetting(key, String(!current));
  };

  const handleSave = async () => {
    if (!currentCompany) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = { ...settings };
      // Include API keys only if user entered new ones
      if (anthropicKey) payload.anthropic_api_key = anthropicKey;
      if (openaiKey) payload.openai_api_key = openaiKey;

      const updated = await api.settings.update(currentCompany.id, payload);
      setSettings(updated);
      setOriginalSettings(updated);
      setHasChanges(false);
      setAnthropicKey('');
      setOpenaiKey('');
      showToast('success', 'Settings saved successfully!');
    } catch (e) {
      console.error('Failed to save settings:', e);
      showToast('error', 'Failed to save settings');
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!currentCompany) return;
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
    setSaving(true);
    try {
      const defaults = await api.settings.reset(currentCompany.id);
      setSettings(defaults);
      setOriginalSettings(defaults);
      setHasChanges(false);
      setAnthropicKey('');
      setOpenaiKey('');
      showToast('success', 'Settings reset to defaults');
    } catch (e) {
      console.error('Failed to reset settings:', e);
      showToast('error', 'Failed to reset settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px', color: 'var(--text-secondary)' }}>
        <Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        Loading settings...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', position: 'relative' }}>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 9999,
            animation: 'slideIn 0.3s ease',
            background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: toast.type === 'success' ? '#10b981' : '#ef4444',
            backdropFilter: 'blur(12px)',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
      )}

      <div className="page-header animate-in">
        <div>
          <h2>Settings</h2>
          <p>Configure Crewmatic for {currentCompany?.name || 'your company'}</p>
        </div>
        {hasChanges && (
          <span style={{ fontSize: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            Unsaved changes
          </span>
        )}
      </div>

      <div className="animate-in animate-in-delay-1">
        {/* Appearance */}
        <div className="settings-section">
          <h3><Palette size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Appearance</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Dark Mode</div>
              <div className="setting-desc">Use dark theme across the application</div>
            </div>
            <Toggle active={settings.dark_mode === 'true'} onClick={() => toggleSetting('dark_mode')} disabled={saving} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">System Tray</div>
              <div className="setting-desc">Keep Crewmatic running in the background</div>
            </div>
            <Toggle active={settings.system_tray === 'true'} onClick={() => toggleSetting('system_tray')} disabled={saving} />
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h3><Bell size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Notifications</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Desktop Notifications</div>
              <div className="setting-desc">Show alerts for agent events and task updates</div>
            </div>
            <Toggle active={settings.notifications === 'true'} onClick={() => toggleSetting('notifications')} disabled={saving} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Budget Alerts</div>
              <div className="setting-desc">Notify when spend exceeds threshold</div>
            </div>
            <Toggle active={settings.budget_alerts === 'true'} onClick={() => toggleSetting('budget_alerts')} disabled={saving} />
          </div>
        </div>

        {/* Governance */}
        <div className="settings-section">
          <h3><Shield size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Governance</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Auto-assign Tasks</div>
              <div className="setting-desc">Automatically assign tasks to available agents</div>
            </div>
            <Toggle active={settings.auto_assign === 'true'} onClick={() => toggleSetting('auto_assign')} disabled={saving} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Audit Logging</div>
              <div className="setting-desc">Record all agent actions for compliance</div>
            </div>
            <Toggle active={settings.audit_logging === 'true'} onClick={() => toggleSetting('audit_logging')} disabled={saving} />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">Cost Tracking</div>
              <div className="setting-desc">Track token usage and API costs per agent</div>
            </div>
            <Toggle active={settings.cost_tracking === 'true'} onClick={() => toggleSetting('cost_tracking')} disabled={saving} />
          </div>
        </div>

        {/* Agent Configuration */}
        <div className="settings-section">
          <h3><Database size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />Agent Configuration</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Heartbeat Interval</div>
              <div className="setting-desc">How often agents check in (seconds)</div>
            </div>
            <select
              className="select"
              style={{ width: '120px' }}
              value={settings.heartbeat_interval || '30'}
              disabled={saving}
              onChange={(e) => updateSetting('heartbeat_interval', e.target.value)}
            >
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
              <option value="300">5min</option>
            </select>
          </div>
        </div>

        {/* API Keys */}
        <div className="settings-section">
          <h3><Key size={16} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />API Keys</h3>
          <div className="setting-row">
            <div>
              <div className="setting-label">Anthropic API Key</div>
              <div className="setting-desc">
                For Claude Code agents
                {settings.anthropic_api_key && settings.anthropic_api_key !== '' && !anthropicKey && (
                  <span style={{ marginLeft: '8px', color: '#10b981', fontSize: '11px' }}>✓ configured</span>
                )}
              </div>
            </div>
            <input
              className="input"
              type="password"
              placeholder={settings.anthropic_api_key ? '••••••••' : 'sk-ant-...'}
              style={{ width: '240px' }}
              value={anthropicKey}
              disabled={saving}
              onChange={(e) => {
                setAnthropicKey(e.target.value);
                setHasChanges(true);
              }}
            />
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">OpenAI API Key</div>
              <div className="setting-desc">
                For Codex agents
                {settings.openai_api_key && settings.openai_api_key !== '' && !openaiKey && (
                  <span style={{ marginLeft: '8px', color: '#10b981', fontSize: '11px' }}>✓ configured</span>
                )}
              </div>
            </div>
            <input
              className="input"
              type="password"
              placeholder={settings.openai_api_key ? '••••••••' : 'sk-...'}
              style={{ width: '240px' }}
              value={openaiKey}
              disabled={saving}
              onChange={(e) => {
                setOpenaiKey(e.target.value);
                setHasChanges(true);
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{ opacity: saving || !hasChanges ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {saving ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Settings
              </>
            )}
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
