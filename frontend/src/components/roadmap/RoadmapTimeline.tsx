import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  ChevronUp,
  X,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoadmapWeek, MilestoneTask, ResourceType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface RoadmapTimelineProps {
  weeks: RoadmapWeek[];
  roadmapId: string;
  targetRole: string;
  onToggleTask: (taskId: string, currentStatus: boolean) => Promise<void>;
  onReportStruggle: (week: RoadmapWeek, notes: string) => Promise<void>;
  isAdapting: boolean;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  weeks,
  roadmapId,
  targetRole,
  onToggleTask,
  onReportStruggle,
  isAdapting
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    weeks.forEach((w, i) => {
      initial[w.id] = i === 0 || w.status === 'struggling' || w.status === 'in_progress';
    });
    return initial;
  });

  const [strugglingModalWeek, setStrugglingModalWeek] = useState<RoadmapWeek | null>(null);
  const [struggleNotes, setStruggleNotes] = useState('');

  const toggleExpand = (weekId: string) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'documentation':
        return <BookOpen className="w-3.5 h-3.5 text-cyan-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'exercise':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'project':
        return <FolderKanban className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  const handleTaskClick = async (task: MilestoneTask, week: RoadmapWeek) => {
    const nextStatus = !task.is_completed;
    await onToggleTask(task.id, task.is_completed);

    if (nextStatus) {
      const remainingTasks = week.tasks.filter(t => t.id !== task.id && !t.is_completed);
      if (remainingTasks.length === 0) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#6366F1', '#8B5CF6', '#22D3EE', '#10B981']
        });
      }
    }
  };

  const confirmStruggleSubmission = async () => {
    if (!strugglingModalWeek) return;
    await onReportStruggle(strugglingModalWeek, struggleNotes);
    setStrugglingModalWeek(null);
    setStruggleNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <span>Weekly Sprint Progression</span>
            <Badge variant="indigo">{weeks.length} Adaptive Sprints</Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Progressive curriculum tailored to {targetRole} with real-time remedial adaptation.
          </p>
        </div>
      </div>

      {/* Stepped Timeline Container */}
      <div className="relative pl-6 sm:pl-10 space-y-6">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[19px] sm:left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-500 via-zinc-700 to-zinc-800" />

        {weeks.map((week) => {
          const isExpanded = expandedWeeks[week.id] ?? true;
          const completedCount = week.tasks.filter(t => t.is_completed).length;
          const totalCount = week.tasks.length;
          const isAllCompleted = totalCount > 0 && completedCount === totalCount;

          return (
            <div key={week.id} className="relative">
              {/* Stepped Node Icon with Spring Pop */}
              <motion.div 
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                className={`absolute -left-6 sm:-left-10 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs z-10 border shadow-lg ${
                  isAllCompleted
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500 shadow-emerald-500/20'
                    : week.is_remedial
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500 shadow-amber-500/20 animate-pulse'
                    : week.status === 'in_progress'
                    ? 'bg-brand-600 text-white border-brand-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                    : 'bg-[#121826] text-zinc-500 border-white/15'
                }`}
              >
                {isAllCompleted ? '✓' : `W${week.week_number}`}
              </motion.div>

              {/* Sprint Card using Liquid Glass */}
              <div
                className={`glass spotlight-card rounded-2xl overflow-hidden transition-all duration-200 ${
                  week.is_remedial
                    ? '!border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : week.status === 'in_progress'
                    ? '!border-brand-500/40 shadow-xl'
                    : 'border-white/10'
                }`}
              >
                {/* Sprint Header */}
                <div 
                  onClick={() => toggleExpand(week.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors select-none"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-brand-400">
                        Week {week.week_number}
                      </span>
                      {week.is_remedial && (
                        <Badge variant="amber" className="text-[10px]">Adapted by AI</Badge>
                      )}
                      {isAllCompleted && (
                        <Badge variant="emerald" className="text-[10px]">Completed</Badge>
                      )}
                      {week.status === 'in_progress' && (
                        <Badge variant="cyan" className="text-[10px]">Active Sprint</Badge>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {week.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {week.learning_objective}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-mono font-medium text-white">
                        {completedCount}/{totalCount}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        tasks done
                      </div>
                    </div>

                    <button 
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Toggle sprint expansion"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Tasks & Resources Body */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
                    {/* Task List */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Milestone Deliverables
                      </div>

                      {week.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                            task.is_completed
                              ? 'bg-white/[0.02] border-white/5'
                              : 'bg-white/[0.05] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <button
                            onClick={() => handleTaskClick(task, week)}
                            className="flex items-center gap-3 text-left flex-1 cursor-pointer group"
                          >
                            <motion.div
                              whileTap={{ scale: 0.85 }}
                              className="flex-shrink-0"
                            >
                              {task.is_completed ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </motion.div>
                              ) : (
                                <Circle className="w-4 h-4 text-zinc-500 group-hover:text-cyan-300 transition-colors" />
                              )}
                            </motion.div>
                            <span className={task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'}>
                              {task.task_title}
                            </span>
                          </button>

                          {task.resource_url && (
                            <a
                              href={task.resource_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors flex-shrink-0 ml-3 font-mono"
                            >
                              {getResourceIcon(task.resource_type)}
                              <span className="capitalize">{task.resource_type}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-400" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Struggle Engine Bar */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                        Stuck on this concept? AI can inject tailored remedial drills.
                      </span>

                      <Button
                        variant="struggle"
                        size="sm"
                        onClick={() => setStrugglingModalWeek(week)}
                        disabled={isAdapting}
                      >
                        <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                        <span>I'm struggling with this sprint</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Friendly Struggle Confirmation Dialog Modal with Liquid Glass */}
      {strugglingModalWeek && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass p-6 shadow-2xl space-y-4 border-amber-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/20">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Adapt Week {strugglingModalWeek.week_number} Curriculum
                  </h3>
                  <p className="text-[11px] text-zinc-400">Targeted remedial reinforcement</p>
                </div>
              </div>
              <button 
                onClick={() => setStrugglingModalWeek(null)} 
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Encountering friction with <span className="font-semibold text-white">{strugglingModalWeek.title}</span>? That's completely expected when mastering senior technical concepts. EduPath will calibrate your sprint by injecting 2 targeted drills.
            </p>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1.5">
                What specific concept or error is blocking you? (Optional)
              </label>
              <textarea
                rows={3}
                value={struggleNotes}
                onChange={(e) => setStruggleNotes(e.target.value)}
                placeholder="e.g. Having trouble debugging asynchronous database connection pools..."
                className="w-full p-3 rounded-xl bg-[#080B11] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setStrugglingModalWeek(null)}>
                Cancel
              </Button>
              <Button variant="struggle" size="sm" onClick={confirmStruggleSubmission} loading={isAdapting}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>Inject Remedial Drills</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
