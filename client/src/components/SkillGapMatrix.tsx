import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import { UserSkill } from '../types';

interface SkillGapMatrixProps {
  skills: UserSkill[];
}

export const SkillGapMatrix: React.FC<SkillGapMatrixProps> = ({ skills }) => {
  const [filter, setFilter] = useState('');

  const acquired = skills.filter(s => s.category === 'acquired' && s.skill_name.toLowerCase().includes(filter.toLowerCase()));
  const adjacent = skills.filter(s => s.category === 'adjacent' && s.skill_name.toLowerCase().includes(filter.toLowerCase()));
  const critical = skills.filter(s => s.category === 'critical_gap' && s.skill_name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Skill Extraction & Gap Matrix</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              ({skills.length} competencies mapped)
            </span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Extracted from your resume and benchmarked against industry role expectations.
          </p>
        </div>

        {/* Filter input */}
        <div style={{
          position: 'relative',
          width: 240
        }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search skills..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* 3 Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20
      }}>
        {/* Acquired Skills */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 12,
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#34d399" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#34d399' }}>
                Acquired Skills
              </span>
            </div>
            <span className="badge badge-acquired">{acquired.length} Verified</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {acquired.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills match search filter</span>
            ) : (
              acquired.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '0.85rem',
                    color: '#e2e8f0'
                  }}
                >
                  <span>{s.skill_name}</span>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#34d399',
                    boxShadow: '0 0 6px #34d399'
                  }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Adjacent Skills */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 12,
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#fbbf24" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24' }}>
                Adjacent Skills
              </span>
            </div>
            <span className="badge badge-adjacent">{adjacent.length} To Reinforce</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {adjacent.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills match search filter</span>
            ) : (
              adjacent.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '0.85rem',
                    color: '#e2e8f0'
                  }}
                >
                  <span>{s.skill_name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24' }}>partial</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Gaps */}
        <div style={{
          background: 'rgba(244, 63, 94, 0.04)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          borderRadius: 12,
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <XCircle size={18} color="#fb7185" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fb7185' }}>
                Critical Gaps
              </span>
            </div>
            <span className="badge badge-critical">{critical.length} Must Learn</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {critical.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills match search filter</span>
            ) : (
              critical.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    fontSize: '0.85rem',
                    color: '#e2e8f0'
                  }}
                >
                  <span>{s.skill_name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#fb7185', fontWeight: 600 }}>PRIORITY</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
