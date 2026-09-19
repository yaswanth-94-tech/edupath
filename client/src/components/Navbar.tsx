import React from 'react';
import { Sparkles, Bot, PlusCircle, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  targetRole?: string;
  health: SystemHealth | null;
  onOpenOnboarding: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  targetRole,
  health,
  onOpenOnboarding,
  onToggleCopilot,
  isCopilotOpen
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'rgba(10, 11, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '14px 24px'
    }}>
      <div style={{
        maxWidth: 1380,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.45)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                EduPath
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#c4b5fd',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                AI Agent MVP
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Adaptive Skill Gap & Personalized Learning Path
            </p>
          </div>
        </div>

        {/* Target Role & Stack Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {targetRole && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Target:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{targetRole}</span>
            </div>
          )}

          {/* Gemini Status Indicator */}
          <div 
            title={health?.gemini.configured ? 'Google AI Studio Gemini Connected' : 'Demo Fallback active (Add GEMINI_API_KEY to server/.env)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 500,
              background: health?.gemini.configured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: health?.gemini.configured ? '#34d399' : '#fbbf24',
              border: `1px solid ${health?.gemini.configured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
            }}
          >
            {health?.gemini.configured ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            <span>Gemini: {health?.gemini.configured ? 'Live Flash' : 'Demo Mode'}</span>
          </div>

          {/* Actions */}
          <button
            onClick={onOpenOnboarding}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusCircle size={16} />
            <span>New Analysis</span>
          </button>

          <button
            onClick={onToggleCopilot}
            className="btn-primary"
            style={{
              background: isCopilotOpen 
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
            }}
          >
            <Bot size={18} />
            <span>Learning Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
