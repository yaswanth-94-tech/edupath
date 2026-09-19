import React from 'react';
import { Target, Clock, CheckSquare, Zap } from 'lucide-react';

interface AnalyticsBannerProps {
  progress: {
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
    hours_invested: number;
    remaining_critical_gaps: number;
  };
  targetRole: string;
  hoursPerWeek: number;
}

export const AnalyticsBanner: React.FC<AnalyticsBannerProps> = ({
  progress,
  targetRole,
  hoursPerWeek
}) => {
  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        alignItems: 'center'
      }}>
        {/* Overall Completion Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            position: 'relative',
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="36"
                cy="36"
                r="30"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r="30"
                stroke="url(#progressGrad)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={188.4}
                strokeDashoffset={188.4 - (188.4 * progress.completion_percentage) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              position: 'absolute',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#ffffff'
            }}>
              {progress.completion_percentage}%
            </span>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Roadmap Progress
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {progress.completed_tasks} / {progress.total_tasks} Tasks
            </div>
          </div>
        </div>

        {/* Hours Invested */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 12,
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={22} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Time Invested</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              ~{progress.hours_invested} Hours
            </div>
          </div>
        </div>

        {/* Study Velocity */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 12,
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={22} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Weekly Pace</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              {hoursPerWeek} hrs/week
            </div>
          </div>
        </div>

        {/* Critical Gaps Remaining */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 12,
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'rgba(244, 63, 94, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={22} color="#fb7185" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Critical Gaps Remaining</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              {progress.remaining_critical_gaps} Skills
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
