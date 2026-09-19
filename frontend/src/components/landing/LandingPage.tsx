import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Target, 
  Layers, 
  Bot, 
  Cpu, 
  Play,
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Magnetic } from '@/components/ui/Magnetic';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onLaunchDemo: () => void;
  onOpenAuth: () => void;
  user?: any;
  onEnterWorkspace?: () => void;
  onSignOut?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onLaunchDemo,
  onOpenAuth,
  user,
  onEnterWorkspace,
  onSignOut
}) => {
  const headlineWords = [
    "Your", "personal", "AI", "career", "coach", "—", "from", "skill", "gap", "to", "job-ready"
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Sticky Liquid Glass Navbar */}
      <header className="sticky top-0 z-40 px-6 py-3.5 glass !rounded-none !border-x-0 !border-t-0 !border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/edupath-logo.png" 
              alt="EduPath Logo" 
              className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-brand-500/20 border border-white/10 bg-[#0c1424]"
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                EduPath
              </span>
              <Badge variant="cyan" className="hidden sm:inline-flex text-[10px] font-mono">
                AI Agent
              </Badge>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-300 font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#demo-preview" className="hover:text-white transition-colors">Live Roadmap Preview</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="struggle" size="sm" onClick={onLaunchDemo} className="hidden sm:inline-flex font-mono text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Judge Demo</span>
            </Button>

            <Magnetic distance={60} strength={0.3}>
              <Button variant="ghost" size="sm" onClick={onStartOnboarding} className="hidden sm:inline-flex text-zinc-300 hover:text-white">
                <span>Explore Sprints</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Magnetic>

            {user ? (
              <div className="flex items-center gap-2">
                {onEnterWorkspace && (
                  <Button variant="primary" size="sm" onClick={onEnterWorkspace} className="shadow-md shadow-brand-500/20 font-semibold text-xs">
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
                {onSignOut && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onSignOut} 
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium"
                    title="Log out of EduPath"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    <span>Log Out</span>
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onOpenAuth}
                className="shadow-md shadow-brand-500/20 font-semibold text-xs px-3.5"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <div className="relative w-full overflow-hidden">
        {/* Local Hero Background Image with Blue Tint and Dark Gradient Overlays */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1920px] h-[780px] pointer-events-none overflow-hidden z-0 select-none"
          aria-hidden="true"
        >
          <img 
            src="/assets/hero-bg.jpg" 
            alt="EduPath Abstract AI Waves"
            width="1920"
            height="780"
            className="w-full h-full object-cover object-center opacity-35 scale-105"
            style={{
              filter: 'hue-rotate(185deg) saturate(135%) brightness(0.65)'
            }}
          />
          {/* Deep dark gradient overlay keeping all text legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A]/70 via-[#0B132B]/80 to-[#0B0F1A]" />
          {/* Edge vignette fade */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0F1A_80%)]" />
        </div>

        {/* Hero Content */}
        <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass mb-6 border-white/15 text-xs text-zinc-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-cyan-300">Gemini 2.5 Flash Engine</span>
            <span className="text-zinc-500">|</span>
            <span>Autonomous AI Agent</span>
          </motion.div>

          {/* Staggered Word Reveal Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 gradient-hero flex flex-wrap justify-center gap-x-3 gap-y-1">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.04,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className={word === "career" || word === "coach" ? "text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Upload your resume, target any modern tech job, and let EduPath formulate an adaptive weekly curriculum with portfolio-grade projects. When you struggle, your sprints automatically recalibrate.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Magnetic distance={90} strength={0.35}>
              <Button variant="primary" size="lg" onClick={onStartOnboarding} className="w-full sm:w-auto shadow-xl shadow-brand-500/25">
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Analyze Resume & Build Path</span>
              </Button>
            </Magnetic>

            <Button variant="glass" size="lg" onClick={onLaunchDemo} className="w-full sm:w-auto">
              <Play className="w-4 h-4 mr-2 text-amber-400 fill-amber-400" />
              <span>See Demo (1-Click Evaluation)</span>
            </Button>
          </motion.div>

          {/* Liquid Glass Interactive Mockup Preview with Floating Parallax */}
          <motion.div 
            id="demo-preview"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-4xl rounded-2xl glass p-3 sm:p-5 shadow-2xl border-white/20"
          >
            {/* Mockup Window Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400">edupath.ai / workspace / sprint-overview</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  Alex Chen (Demo)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Week 2 Active
                </span>
              </div>
            </div>

            {/* Inner Mockup UI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <Card variant="glass" tilt={true} spotlight={true} className="p-4">
                <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  Target Role
                </div>
                <div className="text-sm font-bold text-white mb-2">
                  Senior Full-Stack AI Engineer
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    <AnimatedNumber value={9} duration={1} /> Competencies Extracted
                  </span>
                </div>
              </Card>

              <Card variant="glass" tilt={true} spotlight={true} className="p-4">
                <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  Curriculum Progress
                </div>
                <div className="text-2xl font-bold text-white mb-2 font-mono">
                  <AnimatedNumber value={31} suffix="%" duration={1.3} />
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "31%" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" 
                  />
                </div>
              </Card>

              <Card variant="glass" tilt={true} spotlight={true} className="p-4 border-amber-500/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">
                    Adaptive Engine
                  </div>
                  <Badge variant="amber" className="text-[9px]">Adapted by AI</Badge>
                </div>
                <div className="text-xs font-semibold text-white mb-1">
                  Vector Embeddings & RAG
                </div>
                <div className="text-[11px] text-zinc-400">
                  2 remedial reinforcement micro-tasks injected into Week 3
                </div>
              </Card>
            </div>
          </motion.div>
        </section>
      </div>

      {/* How It Works (3 Steps) with Scroll Reveal */}
      <motion.section 
        id="how-it-works" 
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 px-6 max-w-5xl mx-auto relative z-10"
      >
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            3-Step Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            From Raw Resume to Hired Engineer
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 font-mono font-bold text-sm">
              01
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              Resume Ingestion
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload your PDF or drop in markdown. EduPath parses projects, coursework, and technical skills with zero hallucinated fluff.
            </p>
          </Card>

          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 font-mono font-bold text-sm">
              02
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              Skill Gap Taxonomy
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gemini benchmarks your profile against industry expectations, segmenting skills into Acquired, Adjacent, and Critical Gaps.
            </p>
          </Card>

          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 font-mono font-bold text-sm">
              03
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              Adaptive Execution
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Follow weekly structured sprints with code milestones. Report struggles anytime to trigger automatic remedial curriculum recalculations.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* Feature Grid with Scroll Reveal */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="py-16 px-6 max-w-5xl mx-auto relative z-10"
      >
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            Engine Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Serious Technical Mastery
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Deterministic Gap Extraction</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Benchmarked strictly against hiring rubrics for Full Stack, AI, Systems, and DevOps roles with zero vague generalities.
            </p>
          </Card>

          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Applied Portfolio Projects</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every 2–3 weeks, construct production-grade capstones (RAG pipelines, microservices, auth systems) ready for your GitHub portfolio.
            </p>
          </Card>

          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Dynamic Struggle Adaptation</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hit a roadblock on async concurrency or vector mathematics? EduPath automatically splices visual primers and practice exercises.
            </p>
          </Card>

          <Card variant="glass" interactive={true} tilt={true} spotlight={true} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Sprint-Aware AI Copilot</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Contextually anchored to your active week's objectives. Ask for code snippets, debug errors, or review architectural trade-offs with 1-click code copying.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-white/10 py-12 px-6 glass !rounded-none !border-x-0 !border-b-0 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2.5">
              <img 
                src="/edupath-logo.png" 
                alt="EduPath Logo" 
                className="w-8 h-8 rounded-lg object-contain border border-white/10 bg-[#0c1424]"
              />
              <span className="font-bold text-sm text-white">EduPath</span>
            </div>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="text-xs text-zinc-400">
              Made by <span className="font-semibold text-zinc-200">Yaswanth</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <button onClick={onLaunchDemo} className="hover:text-white transition-colors cursor-pointer">
              Launch Judge Demo
            </button>
            <span>•</span>
            <button onClick={onStartOnboarding} className="hover:text-white transition-colors cursor-pointer">
              Start Analysis
            </button>
            <span>•</span>
            <button onClick={onOpenAuth} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
