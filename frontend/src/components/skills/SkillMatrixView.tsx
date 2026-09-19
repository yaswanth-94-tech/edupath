import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Search, Crosshair } from 'lucide-react';
import { UserSkill } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface SkillMatrixViewProps {
  skills: UserSkill[];
}

export const SkillMatrixView: React.FC<SkillMatrixViewProps> = ({ skills }) => {
  const [search, setSearch] = useState('');

  const acquired = skills.filter(s => s.category === 'acquired' && s.skill_name.toLowerCase().includes(search.toLowerCase()));
  const adjacent = skills.filter(s => s.category === 'adjacent' && s.skill_name.toLowerCase().includes(search.toLowerCase()));
  const critical = skills.filter(s => s.category === 'critical_gap' && s.skill_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Crosshair className="w-4 h-4 text-brand-400" />
            <span>Skill Extraction & Gap Matrix</span>
            <Badge variant="cyan" className="font-mono text-[10px]">
              {skills.length} Mapped
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Benchmarked from your resume against industry role standards with Gemini 2.5 Flash.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search competencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* 3 Categories Grid with Liquid Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Acquired Skills */}
        <div className="glass p-5 rounded-2xl border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Acquired Competencies</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {acquired.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {acquired.length === 0 ? (
                <span className="text-xs text-zinc-500 italic p-2">No skills matching filter</span>
              ) : (
                acquired.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-zinc-200 hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>{s.skill_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-4 mt-4 border-t border-white/5">
            Verified in resume experience & projects
          </div>
        </div>

        {/* Adjacent Skills */}
        <div className="glass p-5 rounded-2xl border-amber-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Adjacent Skills</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {adjacent.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {adjacent.length === 0 ? (
                <span className="text-xs text-zinc-500 italic p-2">No skills matching filter</span>
              ) : (
                adjacent.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-zinc-200 hover:border-amber-500/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    <span>{s.skill_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-4 mt-4 border-t border-white/5">
            Partial understanding — targeted for sprint drill
          </div>
        </div>

        {/* Critical Gaps */}
        <div className="glass p-5 rounded-2xl border-rose-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Critical Gaps</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {critical.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {critical.length === 0 ? (
                <span className="text-xs text-zinc-500 italic p-2">No skills matching filter</span>
              ) : (
                critical.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 hover:border-rose-500/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                    <span>{s.skill_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-4 mt-4 border-t border-white/5">
            Prerequisites required for hiring benchmark
          </div>
        </div>
      </div>
    </div>
  );
};
