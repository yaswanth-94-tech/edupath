import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Target, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { FullRoadmapData } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ReportsViewProps {
  data: FullRoadmapData;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ data }) => {
  const { roadmap, profile, skills, weeks, progress } = data;

  // Trajectory data over weeks
  let cumulative = 0;
  const trajectoryData = weeks.map((w, i) => {
    const done = w.tasks.filter(t => t.is_completed).length;
    cumulative += done;
    return {
      week: `Week ${w.week_number}`,
      completed: cumulative,
      target: Math.round(((i + 1) / weeks.length) * progress.total_tasks)
    };
  });

  // Hours per week
  const hoursData = weeks.map(w => ({
    week: `W${w.week_number}`,
    plannedHours: profile.hours_per_week,
    actualHours: Math.round(w.tasks.filter(t => t.is_completed).length * 2.5)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Learning Velocity & Trajectory Reports</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Progress metrics and velocity projections calibrated to your {profile.hours_per_week}h/week pace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" className="font-mono text-[10px]">
            Target: {profile.hours_per_week}h/week
          </Badge>
        </div>
      </div>

      {/* Trajectory & Hours Charts in Liquid Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trajectory */}
        <div className="glass p-5 space-y-3 rounded-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold text-white">Cumulative Milestone Trajectory</h3>
              <p className="text-[11px] text-zinc-400">Actual completion vs Planned Target</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progress.completion_percentage}% Finished
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrajectory" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121826', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#6366F1" strokeWidth={2.5} fill="url(#colorTrajectory)" name="Completed Tasks" />
                <Area type="monotone" dataKey="target" stroke="#94A3B8" strokeDasharray="3 3" strokeWidth={1.5} fill="transparent" name="Planned Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hours per week */}
        <div className="glass p-5 space-y-3 rounded-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold text-white">Logged Study Hours Per Sprint</h3>
              <p className="text-[11px] text-zinc-400">Practical drill time logged</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              ~{progress.hours_invested} Total Hours
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121826', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="actualHours" fill="#22D3EE" radius={[6, 6, 0, 0]} name="Logged Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Competency Mastery Breakdown */}
      <div className="glass p-6 space-y-4 rounded-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Competency Taxonomy & Readiness
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
              <span>Acquired Proficiencies</span>
              <span className="font-mono text-base">{skills.filter(s => s.category === 'acquired').length}</span>
            </div>
            <p className="text-[11px] text-zinc-300">Demonstrated competencies verified from portfolio and coursework.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span>Adjacent Reinforcements</span>
              <span className="font-mono text-base">{skills.filter(s => s.category === 'adjacent').length}</span>
            </div>
            <p className="text-[11px] text-zinc-300">Related frameworks targeted for deepening and practical synthesis.</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
            <div className="text-xs font-bold text-rose-300 flex items-center justify-between">
              <span>Critical Gaps</span>
              <span className="font-mono text-base">{skills.filter(s => s.category === 'critical_gap').length}</span>
            </div>
            <p className="text-[11px] text-zinc-300">Essential prerequisites required to clear senior hiring benchmarks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
