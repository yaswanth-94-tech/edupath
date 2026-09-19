import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar, ActiveTab } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { AnalyzingState } from '@/components/onboarding/AnalyzingState';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { SkillMatrixView } from '@/components/skills/SkillMatrixView';
import { PortfolioProjectsView } from '@/components/projects/PortfolioProjectsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { CopilotChatDrawer } from '@/components/copilot/CopilotChatDrawer';
import { LiquidBackground } from '@/components/layout/LiquidBackground';
import { SonnerToaster, toast } from '@/components/ui/SonnerToaster';
import { JUDGE_DEMO_DATA } from '@/lib/demoData';
import { api } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { FullRoadmapData, SystemHealth, RoadmapWeek } from '@/types';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';

function generateRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const App: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Navigation and UI states — defaults to home/landing screen
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Data states
  const [roadmapData, setRoadmapData] = useState<FullRoadmapData | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // isDemoMode = true only when user clicked Demo Student or Judge Demo — never for real accounts
  const [isDemoMode, setIsDemoMode] = useState(false);

  const showToast = (msg: string) => {
    toast(msg);
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lenis Smooth Scrolling with duration ~1.1 and ease-out
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Pause Lenis when dialogs/drawers are open
    if (isOnboardingOpen || isAuthOpen || isCommandPaletteOpen || isCopilotOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isOnboardingOpen, isAuthOpen, isCommandPaletteOpen, isCopilotOpen]);

  // Initial data bootstrap — only load real roadmap for authenticated users, never auto-inject demo data
  useEffect(() => {
    async function init() {
      try {
        const healthData = await api.getHealth();
        setHealth(healthData);
      } catch (err) {
        console.warn('Connecting to EduPath backend...', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Listen to real Supabase session & user changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser = session.user;
        setUser(authUser);
        setUserId(authUser.id);
        setIsDemoMode(false);
        // Load the real user's roadmap — show empty state if none exists yet
        api.getRoadmap(authUser.id)
          .then(data => {
            if (data && data.weeks && data.weeks.length > 0) {
              setRoadmapData(data);
            } else {
              setRoadmapData(null); // fresh: no roadmap yet, prompt onboarding
            }
          })
          .catch(() => setRoadmapData(null))
          .finally(() => setLoading(false));
      } else {
        setUser(null);
        setUserId('');
        setRoadmapData(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser = session.user;
        setUser(authUser);
        setUserId(authUser.id);
        setIsDemoMode(false);
      } else {
        setUser(null);
        setUserId('');
        setRoadmapData(null);
        setCurrentView('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fast-track judge demo launcher — only for judges / hackathon evaluation
  const handleLaunchJudgeDemo = () => {
    setRoadmapData(JUDGE_DEMO_DATA);
    setIsDemoMode(true);
    setCurrentView('workspace');
    setActiveTab('dashboard');
    showToast('Loaded verified Judge Demo dataset: Alex Chen (Senior AI Engineer)');
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setRoadmapData(null); // clear all data on sign-out
    setIsDemoMode(false);
    setCurrentView('landing');
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c9bf9e57-1685-4c89-bafb-ff5af830be8a';
    setUserId(newId);
    localStorage.setItem('edupath_user_id', newId);
    showToast('Signed out of EduPath');
  };

  const handleAuthSuccess = async (authUser?: any) => {
    setIsAuthOpen(false);
    if (authUser && authUser.id) {
      // Real authenticated user — wipe any demo data and load their own roadmap
      setUser(authUser);
      setUserId(authUser.id);
      setIsDemoMode(false);
      setRoadmapData(null); // clear immediately — show fresh state
      localStorage.setItem('edupath_user_id', authUser.id);
      showToast(`Welcome, ${authUser.email || 'Student'}! 🎉`);

      // Load real roadmap — if none exists yet, fresh empty state → prompt onboarding
      try {
        const data = await api.getRoadmap(authUser.id);
        if (data && data.weeks && data.weeks.length > 0) {
          setRoadmapData(data);
          setCurrentView('workspace');
          setActiveTab('dashboard');
        } else {
          // No roadmap yet — open onboarding to generate one
          setCurrentView('workspace');
          setTimeout(() => setIsOnboardingOpen(true), 600);
        }
      } catch {
        // No roadmap yet — open onboarding
        setCurrentView('workspace');
        setTimeout(() => setIsOnboardingOpen(true), 600);
      }
    } else {
      // Demo student bypass — load judge demo data
      setIsDemoMode(true);
      setRoadmapData(JUDGE_DEMO_DATA);
      setCurrentView('workspace');
      setActiveTab('dashboard');
      showToast('Entered as Demo Student — using sample roadmap');
    }
  };

  const [generatingRole, setGeneratingRole] = useState('');

  const handleOnboardingSubmit = async (params: {
    targetRole: string;
    hoursPerWeek: number;
    preferredStyle: string;
    resumeText?: string;
    resumeFile?: File;
  }) => {
    const activeUserId = user?.id || userId || generateRandomUUID();
    setGeneratingRole(params.targetRole);
    setIsGenerating(true);
    try {
      const data = await api.analyzeResume({
        userId: activeUserId,
        targetRole: params.targetRole,
        hoursPerWeek: params.hoursPerWeek,
        preferredStyle: params.preferredStyle,
        resumeText: params.resumeText,
        resumeFile: params.resumeFile
      });
      setRoadmapData(data);
      setUserId(activeUserId);
      setIsDemoMode(false);
      setIsOnboardingOpen(false);
      setCurrentView('workspace');
      setActiveTab('dashboard');
      showToast(`✅ Personalized roadmap generated for ${params.targetRole}!`);
    } catch (err: any) {
      console.error('[Onboarding] analyze-resume failed:', err);
      // Re-throw so the OnboardingWizard can show the error message inline
      setIsGenerating(false);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!roadmapData) return;
    const nextStatus = !currentStatus;

    setRoadmapData(prev => {
      if (!prev) return prev;
      let totalTasks = 0;
      let completedTasks = 0;

      const updatedWeeks = prev.weeks.map(week => {
        const updatedTasks = week.tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, is_completed: nextStatus };
          }
          return t;
        });

        totalTasks += updatedTasks.length;
        completedTasks += updatedTasks.filter(t => t.is_completed).length;

        const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.is_completed);
        return {
          ...week,
          tasks: updatedTasks,
          status: allDone ? ('completed' as const) : week.status
        };
      });

      const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      return {
        ...prev,
        weeks: updatedWeeks,
        progress: {
          ...prev.progress,
          completed_tasks: completedTasks,
          completion_percentage: percentage,
          hours_invested: Math.round(completedTasks * 2.5)
        }
      };
    });

    try {
      await api.toggleTask(taskId, nextStatus);
    } catch (err) {
      console.error('Failed to sync task status:', err);
    }
  };

  const handleReportStruggle = async (week: RoadmapWeek, notes: string) => {
    if (!roadmapData) return;
    setIsAdapting(true);
    showToast(`Recalculating remedial milestones for Week ${week.week_number}...`);

    try {
      await api.reportStruggle({
        roadmapId: roadmapData.roadmap.id,
        weekId: week.id,
        targetRole: roadmapData.roadmap.target_role,
        strugglingWeek: week,
        struggleNotes: notes
      });

      const refreshed = await api.getRoadmap(userId);
      setRoadmapData(refreshed);
      showToast(`Adaptive remedial tasks injected into Week ${week.week_number}!`);
    } catch (err: any) {
      // Local demo fallback if offline
      setRoadmapData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          weeks: prev.weeks.map(w => {
            if (w.id === week.id) {
              return {
                ...w,
                status: 'struggling',
                is_remedial: true,
                tasks: [
                  ...w.tasks,
                  {
                    id: `remedial_${Date.now()}`,
                    week_id: w.id,
                    task_title: `[Adapted by AI] Remedial reinforcement: ${notes || 'Fundamentals breakdown'}`,
                    resource_type: 'video',
                    is_completed: false
                  }
                ]
              };
            }
            return w;
          })
        };
      });
      showToast(`Adaptive tasks updated for Week ${week.week_number}!`);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleSendCopilotMessage = async (msg: string) => {
    if (!roadmapData) return 'No active roadmap loaded.';
    const activeWeek = roadmapData.weeks.find(w => w.status === 'in_progress' || w.status === 'struggling') || roadmapData.weeks[0];
    const strugglePoints = roadmapData.weeks
      .filter(w => w.status === 'struggling')
      .map(w => w.title);

    try {
      return await api.chatWithCopilot({
        message: msg,
        targetRole: roadmapData.roadmap.target_role,
        activeWeek: {
          week_number: activeWeek.week_number,
          title: activeWeek.title,
          learning_objective: activeWeek.learning_objective
        },
        strugglePoints
      });
    } catch (err: any) {
      // High-quality contextual fallback if offline
      return `### Sprint Guidance: ${activeWeek.title}\n\nHere is a practical architecture pattern for **${roadmapData.roadmap.target_role}**:\n\n\`\`\`typescript\n// Recommended implementation pattern for Week ${activeWeek.week_number}\nexport async function handleExecution() {\n  const startTime = performance.now();\n  // 1. Validate inputs\n  // 2. Execute pipeline\n  return { status: 'success', latency: performance.now() - startTime };\n}\n\`\`\`\n\nEnsure you benchmark throughput and verify test cases before moving to production.`;
    }
  };

  const activeWeekForCopilot = roadmapData?.weeks.find(w => w.status === 'in_progress' || w.status === 'struggling') || roadmapData?.weeks[0];
  const activeStruggles = roadmapData?.weeks.filter(w => w.status === 'struggling').map(w => w.title) || [];

  // If in Landing Page view
  if (currentView === 'landing') {
    return (
      <div className="relative min-h-screen">
        <LiquidBackground />
        <SonnerToaster />
        <LandingPage
          onStartOnboarding={() => setIsOnboardingOpen(true)}
          onLaunchDemo={handleLaunchJudgeDemo}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
          onEnterWorkspace={() => setCurrentView('workspace')}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onSubmit={handleOnboardingSubmit}
          isLoading={isGenerating}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0B0F1A] text-zinc-100 overflow-hidden font-sans relative">
      <LiquidBackground />
      <SonnerToaster />
      {/* Collapsible Linear-style Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        targetRole={roadmapData?.roadmap.target_role}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
        isCopilotOpen={isCopilotOpen}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          activeTab={activeTab}
          targetRole={roadmapData?.roadmap.target_role}
          completionPercentage={roadmapData?.progress.completion_percentage ?? 0}
          health={health}
          onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
          isCopilotOpen={isCopilotOpen}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onTriggerDemo={handleLaunchJudgeDemo}
          onOpenLanding={() => setCurrentView('landing')}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Content View with 250ms AnimatePresence transition */}
        <main 
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-10 h-10 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Initializing EduPath Studio...
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Connecting to Gemini 2.5 Flash model and loading student profile.
              </p>
            </div>
          ) : roadmapData ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {activeTab === 'dashboard' && (
                  <DashboardOverview
                    data={roadmapData}
                    onNavigateToRoadmap={() => setActiveTab('roadmap')}
                    onNavigateToSkills={() => setActiveTab('skills')}
                    onToggleTask={handleToggleTask}
                    onOpenCopilot={() => setIsCopilotOpen(true)}
                  />
                )}

                {activeTab === 'roadmap' && (
                  <RoadmapTimeline
                    weeks={roadmapData.weeks}
                    roadmapId={roadmapData.roadmap.id}
                    targetRole={roadmapData.roadmap.target_role}
                    onToggleTask={handleToggleTask}
                    onReportStruggle={handleReportStruggle}
                    isAdapting={isAdapting}
                  />
                )}

                {activeTab === 'skills' && (
                  <SkillMatrixView skills={roadmapData.skills} />
                )}

                {activeTab === 'projects' && (
                  <PortfolioProjectsView projects={roadmapData.projects} />
                )}

                {activeTab === 'reports' && (
                  <ReportsView data={roadmapData} />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="py-24 text-center">
              <Compass className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h2 className="text-sm font-semibold text-zinc-200">No active path found</h2>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Define your target career role and let EduPath formulate your tailored sprints.
              </p>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium cursor-pointer shadow-md shadow-brand-500/20"
              >
                Start AI Analysis
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-2 border border-white/15 px-4 py-2.5 rounded-full text-xs font-medium text-white shadow-2xl z-50 flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onOpenOnboarding={() => {
          setIsCommandPaletteOpen(false);
          setIsOnboardingOpen(true);
        }}
        onToggleCopilot={() => {
          setIsCommandPaletteOpen(false);
          setIsCopilotOpen(prev => !prev);
        }}
        onTriggerDemo={() => {
          setIsCommandPaletteOpen(false);
          handleLaunchJudgeDemo();
        }}
      />

      {/* AI Copilot Drawer */}
      <CopilotChatDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeWeek={activeWeekForCopilot}
        targetRole={roadmapData?.roadmap.target_role || 'Software Engineer'}
        strugglePoints={activeStruggles}
        onSendMessage={handleSendCopilotMessage}
      />

      {/* Modern Multi-step Onboarding Wizard */}
      <OnboardingWizard
        isOpen={isOnboardingOpen && !isGenerating}
        onClose={() => setIsOnboardingOpen(false)}
        onSubmit={handleOnboardingSubmit}
        isLoading={isGenerating}
      />

      {/* Full-screen 4-stage AI Analyzing Loader */}
      {isGenerating && (
        <AnalyzingState
          targetRole={generatingRole || roadmapData?.roadmap.target_role || 'Target Role'}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
