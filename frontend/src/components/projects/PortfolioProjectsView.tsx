import React from 'react';
import { Layers, CheckCircle2, Code2, Sparkles, FolderGit2, Terminal } from 'lucide-react';
import { MilestoneProject } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface PortfolioProjectsViewProps {
  projects: MilestoneProject[];
}

export const PortfolioProjectsView: React.FC<PortfolioProjectsViewProps> = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="p-12 text-center glass rounded-2xl border-white/10">
        <FolderGit2 className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">No Capstone Projects Generated</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Complete the onboarding intake to formulate portfolio-grade project deliverables.
        </p>
      </div>
    );
  }

  const getDifficulty = (weekNumber: number) => {
    if (weekNumber <= 2) return { label: 'Foundational Capstone', variant: 'cyan' as const };
    if (weekNumber <= 4) return { label: 'Advanced Architecture', variant: 'indigo' as const };
    return { label: 'Production Enterprise', variant: 'amber' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-brand-400" />
            <span>Applied Portfolio Projects</span>
            <Badge variant="indigo">{projects.length} Milestones</Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Production-grade, portfolio-caliber project deliverables sequenced every 2–3 weeks of practical learning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const diff = getDifficulty(proj.week_number);
          return (
            <div
              key={proj.id}
              className="glass p-6 rounded-2xl flex flex-col justify-between border-white/15 space-y-4 hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold">
                    Week {proj.week_number} Milestone
                  </span>
                  <Badge variant={diff.variant} dot>{diff.label}</Badge>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {proj.title}
                </h3>

                <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                  {proj.description}
                </p>

                {/* Requirements List */}
                <div className="mb-4 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Key Architecture Specifications:
                  </div>
                  <div className="space-y-1.5">
                    {proj.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div className="pt-3 border-t border-white/10">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-brand-400" />
                  <span>Recommended Stack:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.suggested_tech_stack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-mono text-zinc-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
