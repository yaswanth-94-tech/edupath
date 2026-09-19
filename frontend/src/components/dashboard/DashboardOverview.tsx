import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { 
  CheckSquare, 
  Clock, 
  Zap, 
  Target, 
  ArrowRight, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Circle,
  FolderGit2,
  Calendar,
  Layers
} from 'lucide-react';
import { FullRoadmapData, RoadmapWeek, MilestoneTask } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface DashboardOverviewProps {
  data: FullRoadmapData;
  onNavigateToRoadmap: () => void;
  onNavigateToSkills: () => void;
  onToggleTask: (taskId: string, currentStatus: boolean) => Promise<void>;
  onOpenCopilot: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  onNavigateToRoadmap,
  onNavigateToSkills,
  onToggleTask,
  onOpenCopilot
}) => {
  const { roadmap, profile, skills, weeks, progress, projects } = data;

  const acquiredCount = skills.filter(s => s.category === 'acquired').length;
  const adjacentCount = skills.filter(s => s.category === 'adjacent').length;
  const criticalCount = skills.filter(s => s.category === 'critical_gap').length;

  // Chart data for skill breakdown
  const skillChartData = [
    { name: 'Acquired', count: acquiredCount, fill: '#10B981' },
    { name: 'Adjacent', count: adjacentCount, fill: '#F59E0B' },
    { name: 'Critical Gap', count: criticalCount, fill: '#F43F5E' }
  ];

  // Find currently active sprint and upcoming milestones
  const activeWeek = weeks.find(w => w.status === 'in_progress' || w.status === 'struggling') || weeks[0];
  const upcomingWeeks = weeks.filter(w => w.week_number > (activeWeek?.week_number || 1)).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Greeting Banner with Liquid Glass */}
      <div className="p-6 rounded-2xl glass border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 font-mono">
              Student Command Center
            </span>
            <span className="text-zinc-600">•</span>
            <Badge variant="cyan" className="font-mono text-[10px]">
              {profile.hours_per_week} hrs/wk pace
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Path to {roadmap.target_role}
          </h1>
          <p className="text-xs text-zinc-300">
            {progress.completed_tasks} of {progress.total_tasks} milestone tasks verified across {weeks.length} adaptive sprint modules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button variant="primary" size="sm" onClick={onOpenCopilot} className="shadow-lg shadow-brand-500/25">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Ask AI Copilot</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards in Liquid Glass with Motion & Tilt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Progress */}
        <Card variant="glass" tilt={true} spotlight={true} className="p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Overall Progress</span>
            <CheckSquare className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <AnimatedNumber value={progress.completion_percentage} suffix="%" duration={1.2} />
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${progress.completion_percentage}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400">
            {progress.completed_tasks} of {progress.total_tasks} milestones completed
          </div>
        </Card>

        {/* Card 2: Hours Invested */}
        <Card variant="glass" tilt={true} spotlight={true} className="p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Hours Invested</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <AnimatedNumber value={progress.hours_invested} prefix="~" suffix="h" duration={1.1} />
          </div>
          <div className="text-[11px] text-zinc-400 pt-3">
            Verified practical drill time
          </div>
        </Card>

        {/* Card 3: Current Milestone */}
        <Card variant="glass" tilt={true} spotlight={true} className="p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Current Sprint</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            Week {activeWeek ? activeWeek.week_number : 1}
          </div>
          <div className="text-[11px] text-amber-300 font-medium truncate pt-3">
            {activeWeek ? activeWeek.title : 'Fundamentals'}
          </div>
        </Card>

        {/* Card 4: Critical Gaps */}
        <Card variant="glass" tilt={true} spotlight={true} className="p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Critical Gaps</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            <AnimatedNumber value={progress.remaining_critical_gaps} duration={0.9} />
          </div>
          <div className="text-[11px] text-rose-300 font-medium pt-3">
            High-priority tech to bridge
          </div>
        </Card>
      </div>

      {/* Middle Section: Active Sprint Focus & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Sprint Focus Card */}
        {activeWeek && (
          <div className="lg:col-span-2 glass p-5 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center font-mono font-bold text-xs text-brand-300">
                  W{activeWeek.week_number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">This Week's Focus</h3>
                    {activeWeek.is_remedial && (
                      <Badge variant="amber" className="text-[10px]">Adapted by AI</Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{activeWeek.title}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={onNavigateToRoadmap}>
                <span>All Sprints</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              <span className="font-semibold text-zinc-400">Objective:</span> {activeWeek.learning_objective}
            </p>

            {/* Tasks checklist with direct interactive toggles */}
            <div className="space-y-2 pt-1">
              {activeWeek.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-xs transition-all"
                >
                  <button
                    onClick={() => onToggleTask(task.id, task.is_completed)}
                    className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-500 hover:text-white flex-shrink-0" />
                    )}
                    <span className={task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                      {task.task_title}
                    </span>
                  </button>

                  {task.resource_url && (
                    <a
                      href={task.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-zinc-400 hover:text-white flex items-center gap-1 ml-2 flex-shrink-0 transition-colors"
                    >
                      <span className="capitalize">{task.resource_type}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right: Skill Gap Distribution Recharts Card */}
        <div className="glass p-5 space-y-3 flex flex-col justify-between rounded-2xl">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Skill Gap Taxonomy
              </h3>
              <button 
                onClick={onNavigateToSkills}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium cursor-pointer"
              >
                Full Matrix →
              </button>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121826', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '11px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {skillChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[10px] text-zinc-400">Acquired</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">{acquiredCount}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-[10px] text-zinc-400">Adjacent</div>
              <div className="text-sm font-bold text-amber-400 font-mono">{adjacentCount}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[10px] text-zinc-400">Critical</div>
              <div className="text-sm font-bold text-rose-400 font-mono">{criticalCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones List */}
      {upcomingWeeks.length > 0 && (
        <div className="glass p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Upcoming Sprint Milestones
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Next 2 Sprints</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingWeeks.map((week) => (
              <div key={week.id} className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-brand-300 font-semibold">Week {week.week_number}</span>
                  <Badge variant="zinc" className="text-[9px]">Queued</Badge>
                </div>
                <div className="text-xs font-semibold text-white truncate">{week.title}</div>
                <div className="text-[11px] text-zinc-400 line-clamp-1">{week.learning_objective}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
