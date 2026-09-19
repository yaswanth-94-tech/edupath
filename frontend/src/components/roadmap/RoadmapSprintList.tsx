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
import { RoadmapWeek, MilestoneTask, ResourceType } from '@/types';
import { cn } from '@/lib/utils';

interface RoadmapSprintListProps {
  weeks: RoadmapWeek[];
  roadmapId: string;
  targetRole: string;
  onToggleTask: (taskId: string, currentStatus: boolean) => Promise<void>;
  onReportStruggle: (week: RoadmapWeek, notes: string) => Promise<void>;
  isAdapting: boolean;
}

export const RoadmapSprintList: React.FC<RoadmapSprintListProps> = ({
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

  const [strugglingWeekId, setStrugglingWeekId] = useState<string | null>(null);
  const [struggleNotes, setStruggleNotes] = useState('');

  const toggleExpand = (weekId: string) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'documentation':
        return <BookOpen className="w-3.5 h-3.5 text-sky-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'exercise':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'project':
        return <FolderKanban className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const handleTaskClick = async (task: MilestoneTask, week: RoadmapWeek) => {
    const nextStatus = !task.is_completed;
    await onToggleTask(task.id, task.is_completed);

    if (nextStatus) {
      const remainingTasks = week.tasks.filter(t => t.id !== task.id && !t.is_completed);
      if (remainingTasks.length === 0) {
        confetti({
          particleCount: 75,
          spread: 60,
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
    <div className="space-y-3">
      {weeks.map((week) => {
        const isExpanded = expandedWeeks[week.id] ?? true;
        const completedCount = week.tasks.filter(t => t.is_completed).length;
        const totalCount = week.tasks.length;
        const isAllCompleted = totalCount > 0 && completedCount === totalCount;

        return (
          <div
            key={week.id}
            className={cn(
              "linear-card rounded-lg overflow-hidden transition-all duration-200",
              week.is_remedial && "border-amber-500/40",
              week.status === 'in_progress' && "border-indigo-500/50"
            )}
          >
            {/* Week Header */}
            <div
              onClick={() => toggleExpand(week.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/20 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs",
                  isAllCompleted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : week.status === 'in_progress'
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                )}>
                  W{week.week_number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {week.title}
                    </h3>
                    {week.is_remedial && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Remedial Sprint Added
                      </span>
                    )}
                    {isAllCompleted && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                    {week.learning_objective}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-zinc-300">
                    {completedCount}/{totalCount}
                  </div>
                  <div className="text-[10px] text-zinc-500">Tasks</div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </div>
            </div>

            {/* Task Checklist */}
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-zinc-800/60 mt-1">
                <div className="space-y-2 mt-3">
                  {week.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-md border text-xs transition-colors",
                        task.is_completed 
                          ? "bg-zinc-900/40 border-zinc-800/60" 
                          : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700/80"
                      )}
                    >
                      <button
                        onClick={() => handleTaskClick(task, week)}
                        className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                      >
                        {task.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-600 hover:text-zinc-400 flex-shrink-0" />
                        )}
                        <span className={cn(
                          task.is_completed ? "line-through text-zinc-500" : "text-zinc-200"
                        )}>
                          {task.task_title}
                        </span>
                      </button>

                      {task.resource_url && (
                        <a
                          href={task.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 text-[11px] text-zinc-300 transition-colors flex-shrink-0 ml-3"
                          title="Open learning resource"
                        >
                          {getResourceIcon(task.resource_type)}
                          <span className="capitalize">{task.resource_type}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Adaptive Recalculation Button */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                    Encountering blockers or syntax issues?
                  </span>

                  {strugglingWeekId === week.id ? (
                    <div className="flex items-center gap-2 w-full mt-2">
                      <input
                        type="text"
                        placeholder="Optional: What specific concept or error is blocking you?"
                        value={struggleNotes}
                        onChange={(e) => setStruggleNotes(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => submitStruggle(week)}
                        disabled={isAdapting}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isAdapting ? 'Adapting...' : 'Inject Remedial Plan'}</span>
                      </button>
                      <button
                        onClick={() => setStrugglingWeekId(null)}
                        className="px-2.5 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setStrugglingWeekId(week.id)}
                      disabled={isAdapting}
                      className="px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <AlertOctagon className="w-3 h-3" />
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
  );
};
