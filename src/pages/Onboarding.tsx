import { useState } from 'react';
import { Zap, Users, KanbanSquare, Wallet, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  if (step === 0) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container animate-in">
          <div className="onboarding-logo">
            <Zap size={36} />
          </div>
          <h1 className="onboarding-title">Welcome to Crewmatic</h1>
          <p className="onboarding-subtitle">
            Open-source orchestration for zero-human companies.
            <br />Hire AI employees, set goals, and let your business run itself.
          </p>

          <div className="onboarding-features">
            <div className="onboarding-feature">
              <h4><Users size={14} /> AI Workforce</h4>
              <p>Hire Claude, OpenClaw, Codex, or bring your own agents</p>
            </div>
            <div className="onboarding-feature">
              <h4><KanbanSquare size={14} /> Task Manager</h4>
              <p>Assign goals and track progress from a single dashboard</p>
            </div>
            <div className="onboarding-feature">
              <h4><Wallet size={14} /> Budget Control</h4>
              <p>Monitor costs, enforce spending limits, get alerts</p>
            </div>
            <div className="onboarding-feature">
              <h4><Shield size={14} /> Governance</h4>
              <p>Audit trails, approval flows, and human oversight</p>
            </div>
          </div>

          <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px' }} onClick={() => setStep(1)}>
            <Sparkles size={18} /> Create Your First Company <ArrowRight size={16} />
          </button>

          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '20px' }}>
            MIT Licensed · Open Source · Self-Hosted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container animate-in" style={{ maxWidth: '480px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Sparkles size={28} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Name Your Company</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
          You can always create more companies later
        </p>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Company Name</label>
            <input className="input" placeholder="e.g., NexusForge AI" defaultValue="NexusForge AI" style={{ fontSize: '15px', padding: '12px 16px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Description</label>
            <input className="input" placeholder="What does your AI company do?" defaultValue="Autonomous SaaS development company" />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Company Type</label>
            <select className="select" defaultValue="saas">
              <option value="saas">SaaS Startup</option>
              <option value="agency">Agency</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="content">Content Company</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '12px', fontSize: '15px', justifyContent: 'center' }} onClick={onComplete}>
          Launch Company <ArrowRight size={16} />
        </button>

        <button style={{
          background: 'none', border: 'none', color: 'var(--text-tertiary)',
          fontSize: '13px', cursor: 'pointer', marginTop: '12px', fontFamily: 'var(--font-sans)',
        }} onClick={onComplete}>
          Skip — use demo data
        </button>
      </div>
    </div>
  );
}
