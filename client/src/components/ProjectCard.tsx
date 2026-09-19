import React from 'react';
import { Layers, Terminal, CheckCircle2, Code } from 'lucide-react';
import { MilestoneProject } from '../types';

interface ProjectCardProps {
  projects: MilestoneProject[];
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Layers size={22} color="#8b5cf6" />
          <span>Applied Portfolio Projects</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Real-world, portfolio-caliber project specifications generated every 2–3 weeks of learning.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 20
      }}>
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: '2px solid #8b5cf6'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge badge-purple">
                  Week {proj.week_number} Milestone Project
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Production Grade
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: 10, color: '#ffffff' }}>
                {proj.title}
              </h3>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
                {proj.description}
              </p>

              {/* Functional Requirements */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  marginBottom: 8
                }}>
                  Functional Specifications:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {proj.requirements.map((req, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.84rem' }}>
                      <CheckCircle2 size={15} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: '#e2e8f0' }}>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Tech Stack */}
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 8
              }}>
                Suggested Tech Stack:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proj.suggested_tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 9px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: '#cbd5e1'
                    }}
                  >
                    <Code size={11} color="#8b5cf6" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
