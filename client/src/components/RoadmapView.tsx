import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  BookOpen, 
  Video, 
  Code2, 
  FolderKanban, 
  HelpCircle, 
  AlertOctagon, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoadmapWeek, MilestoneTask, ResourceType } from '../types';

interface RoadmapViewProps {
  weeks: RoadmapWeek[];
  roadmapId: string;
  targetRole: string;
  onToggleTask: (taskId: string, currentStatus: boolean) => Promise<void>;
  onReportStruggle: (week: RoadmapWeek, notes: string) => Promise<void>;
  isAdapting: boolean;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  weeks,
  roadmapId,
  targetRole,
  onToggleTask,
  onReportStruggle,
  isAdapting
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>(() => {
    // Expand first week and any struggling week by default
    const initial: Record<string, boolean> = {};
    weeks.forEach((w, i) => {
      initial[w.id] = i === 0 || w.status === 'struggling' || w.status === 'in_progress';
    });
    return initial;
  });

  const [strugglingWeekId, setStrugglingWeekId] = useState<string | null>(null);
  const [struggleNotes, setStruggleNotes] = useState('');

  const toggleExpand = (weekId: string) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'documentation':
        return <BookOpen size={14} color="#38bdf8" />;
      case 'video':
        return <Video size={14} color="#f43f5e" />;
      case 'exercise':
        return <Code2 size={14} color="#34d399" />;
      case 'project':
        return <FolderKanban size={14} color="#fbbf24" />;
      default:
        return <HelpCircle size={14} color="#a78bfa" />;
    }
  };

  const handleTaskClick = async (task: MilestoneTask, week: RoadmapWeek) => {
    const nextStatus = !task.is_completed;
    await onToggleTask(task.id, task.is_completed);

    // If completing the last incomplete task in this week, trigger celebratory confetti!
    if (nextStatus) {
      const remainingTasks = week.tasks.filter(t => t.id !== task.id && !t.is_completed);
      if (remainingTasks.length === 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const submitStruggle = async (week: RoadmapWeek) => {
    await onReportStruggle(week, struggleNotes);
    setStrugglingWeekId(null);
    setStruggleNotes('');
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Weekly Learning Sprints</span>
            <span className="badge badge-purple">{weeks.length} Weeks Formulated</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sequential, progressive modules with curated resources and automated remedial adaptation.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {weeks.map((week) => {
          const isExpanded = expandedWeeks[week.id] ?? true;
          const completedCount = week.tasks.filter(t => t.is_completed).length;
          const totalCount = week.tasks.length;
          const isAllCompleted = totalCount > 0 && completedCount === totalCount;

          return (
            <div
              key={week.id}
              className={`glass-card ${week.status === 'in_progress' ? 'active-pulse' : ''}`}
              style={{
                borderLeft: week.is_remedial 
                  ? '4px solid #f59e0b' 
                  : isAllCompleted 
                  ? '4px solid #10b981' 
                  : week.status === 'in_progress'
                  ? '4px solid #8b5cf6'
                  : '1px solid var(--border-subtle)'
              }}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(week.id)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: isAllCompleted 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : week.status === 'in_progress'
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: isAllCompleted ? '#34d399' : '#c4b5fd'
                  }}>
                    W{week.week_number}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                        {week.title}
                      </h3>
                      {week.is_remedial && (
                        <span className="badge badge-adjacent" style={{ fontSize: '0.65rem' }}>
                          Adaptive Remedial Added
                        </span>
                      )}
                      {isAllCompleted && (
                        <span className="badge badge-acquired" style={{ fontSize: '0.65rem' }}>
                          Completed
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {week.learning_objective}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                      {completedCount}/{totalCount}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Tasks Finished
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Card Body / Tasks */}
              {isExpanded && (
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {week.tasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 10,
                          background: task.is_completed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                          border: task.is_completed ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--border-subtle)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          onClick={() => handleTaskClick(task, week)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          {task.is_completed ? (
                            <CheckCircle2 size={20} color="#34d399" />
                          ) : (
                            <Circle size={20} color="var(--text-muted)" />
                          )}
                          <span style={{
                            fontSize: '0.9rem',
                            color: task.is_completed ? 'var(--text-muted)' : '#e2e8f0',
                            textDecoration: task.is_completed ? 'line-through' : 'none'
                          }}>
                            {task.task_title}
                          </span>
                        </div>

                        {/* Resource link */}
                        {task.resource_url && (
                          <a
                            href={task.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                          >
                            {getResourceIcon(task.resource_type)}
                            <span style={{ textTransform: 'capitalize' }}>{task.resource_type}</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Adaptive Recalculation Trigger */}
                  <div style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertOctagon size={15} color="#fbbf24" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Encountering obstacles or complex concepts in this sprint?
                      </span>
                    </div>

                    {strugglingWeekId === week.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 8 }}>
                        <input
                          type="text"
                          placeholder="Optional: What specific concept or error is blocking you?"
                          value={struggleNotes}
                          onChange={(e) => setStruggleNotes(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 6,
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            color: '#ffffff',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          onClick={() => submitStruggle(week)}
                          disabled={isAdapting}
                          className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        >
                          <Sparkles size={14} />
                          <span>{isAdapting ? 'Adapting...' : 'Inject Remedial Plan'}</span>
                        </button>
                        <button
                          onClick={() => setStrugglingWeekId(null)}
                          className="btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setStrugglingWeekId(week.id)}
                        className="btn-struggle"
                        disabled={isAdapting}
                      >
                        <AlertOctagon size={14} />
                        <span>I'm struggling with this sprint</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
