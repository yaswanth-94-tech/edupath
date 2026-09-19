import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Cpu, Sparkles, FileText, Target, Map, Loader2 } from 'lucide-react';

interface AnalyzingStateProps {
  targetRole?: string;
}

export const AnalyzingState: React.FC<AnalyzingStateProps> = ({ targetRole }) => {
  const steps = [
    { title: 'Reading resume...', desc: 'Extracting candidate work experience, credentials & coursework', icon: FileText },
    { title: 'Extracting skills...', desc: 'Cataloging verified technical proficiencies & framework competencies', icon: Cpu },
    { title: `Mapping gaps for ${targetRole || 'Target Role'}...`, desc: 'Comparing against industry benchmarks with Gemini 2.5 Flash', icon: Target },
    { title: 'Building your roadmap...', desc: 'Formulating sequenced weekly sprints and portfolio deliverables', icon: Map }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1300);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl border-white/20 text-center space-y-6">
        {/* Animated Brain / Engine Orb */}
        <div className="relative mx-auto w-16 h-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-brand-500/20 blur-xl animate-pulse" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white mb-1">
            EduPath AI Engine Running
          </h3>
          <p className="text-xs text-zinc-400">
            Personalizing roadmap with Google AI Studio Gemini 2.5 Flash
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
            initial={{ width: '15%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Staged Steps */}
        <div className="w-full space-y-2.5 text-left">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3.5 ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-200' 
                    : isCurrent 
                    ? 'bg-brand-500/15 border-brand-500/50 shadow-md shadow-brand-500/15' 
                    : 'bg-white/[0.02] border-white/5 opacity-40 text-zinc-500'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDone 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : isCurrent 
                    ? 'bg-brand-500/20 text-brand-300' 
                    : 'bg-white/[0.05] text-zinc-500'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold truncate ${
                    isCurrent ? 'text-white' : isDone ? 'text-zinc-200' : 'text-zinc-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
