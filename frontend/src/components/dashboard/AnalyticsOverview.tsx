import React from 'react';
import { Target, Clock, CheckSquare, Zap, ArrowUpRight } from 'lucide-react';

interface AnalyticsOverviewProps {
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

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  progress,
  targetRole,
  hoursPerWeek
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Completion Rate */}
      <div className="linear-card p-4 rounded-lg">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span>Roadmap Completion</span>
          <CheckSquare className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-zinc-100 mb-2">
          {progress.completion_percentage}%
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress.completion_percentage}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 mt-2">
          {progress.completed_tasks} of {progress.total_tasks} milestones completed
        </div>
      </div>

      {/* 2. Hours Invested */}
      <div className="linear-card p-4 rounded-lg">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span>Time Invested</span>
          <Clock className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-zinc-100 mb-2">
          ~{progress.hours_invested} hrs
        </div>
        <div className="text-[11px] text-zinc-500">
          Based on verified task practice logs
        </div>
      </div>

      {/* 3. Study Velocity */}
      <div className="linear-card p-4 rounded-lg">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span>Weekly Commitment</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-zinc-100 mb-2">
          {hoursPerWeek} hrs/wk
        </div>
        <div className="text-[11px] text-emerald-400/90 font-medium">
          Adaptive sprint pacing active
        </div>
      </div>

      {/* 4. Critical Gaps */}
      <div className="linear-card p-4 rounded-lg">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
          <span>Critical Gaps</span>
          <Target className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold text-zinc-100 mb-2">
          {progress.remaining_critical_gaps}
        </div>
        <div className="text-[11px] text-rose-400/90 font-medium">
          High-priority technologies to bridge
        </div>
      </div>
    </div>
  );
};
