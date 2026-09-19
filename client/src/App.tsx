import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyticsBanner } from './components/AnalyticsBanner';
import { SkillGapMatrix } from './components/SkillGapMatrix';
import { RoadmapView } from './components/RoadmapView';
import { ProjectCard } from './components/ProjectCard';
import { CopilotDrawer } from './components/CopilotDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { api } from './api';
import { FullRoadmapData, SystemHealth, RoadmapWeek } from './types';
import { Sparkles, Compass, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [userId] = useState(() => {
    let stored = localStorage.getItem('edupath_user_id');
    if (!stored) {
      stored = `user_${Date.now()}`;
      localStorage.setItem('edupath_user_id', stored);
    }
    return stored;
  });

  const [roadmapData, setRoadmapData] = useState<FullRoadmapData | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const healthData = await api.getHealth();
        setHealth(healthData);

        // Check if there is an existing roadmap for this user
        try {
          const data = await api.getRoadmap(userId);
          if (data) {
            setRoadmapData(data);
          }
        } catch (err) {
          // If no existing roadmap, generate default initial showcase roadmap
          await handleInitialBootstrap();
        }
      } catch (err) {
        console.warn('Backend connecting...', err);
        // Fallback initial bootstrap
        await handleInitialBootstrap();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [userId]);

  const handleInitialBootstrap = async () => {
    try {
      setIsGenerating(true);
      const sampleText = await api.getSampleResume('frontend');
      const initialData = await api.analyzeResume({
        userId,
        targetRole: 'Full Stack React & Node Engineer',
        hoursPerWeek: 12,
        preferredStyle: 'mixed',
        resumeText: sampleText
      });
      setRoadmapData(initialData);
    } catch (err: any) {
      console.error('Initial bootstrap error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOnboardingSubmit = async (params: {
    targetRole: string;
    hoursPerWeek: number;
    preferredStyle: string;
    resumeText?: string;
    resumeFile?: File;
  }) => {
    setIsGenerating(true);
    try {
      const data = await api.analyzeResume({
        userId,
        targetRole: params.targetRole,
        hoursPerWeek: params.hoursPerWeek,
        preferredStyle: params.preferredStyle,
        resumeText: params.resumeText,
        resumeFile: params.resumeFile
      });
      setRoadmapData(data);
      setIsOnboardingOpen(false);
      showToast(`✨ Generated customized roadmap for "${params.targetRole}"!`);
    } catch (err: any) {
      showToast(`⚠️ Error: ${err.message}`);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!roadmapData) return;
    const nextStatus = !currentStatus;

    // Optimistic UI update
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
          status: allDone ? 'completed' as const : week.status
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
      console.error('Failed to sync task status with backend:', err);
    }
  };

  const handleReportStruggle = async (week: RoadmapWeek, notes: string) => {
    if (!roadmapData) return;
    setIsAdapting(true);
    showToast(`🤖 Gemini Flash recalculating remedial drills for Week ${week.week_number}...`);

    try {
      const res = await api.reportStruggle({
        roadmapId: roadmapData.roadmap.id,
        weekId: week.id,
        targetRole: roadmapData.roadmap.target_role,
        strugglingWeek: week,
        struggleNotes: notes
      });

      // Reload fresh adapted roadmap from DB
      const refreshed = await api.getRoadmap(userId);
      setRoadmapData(refreshed);
      showToast(`🎯 Injected targeted remedial tasks into Week ${week.week_number}!`);
    } catch (err: any) {
      showToast(`⚠️ Struggle adaptation error: ${err.message}`);
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
  };

  const activeWeekForCopilot = roadmapData?.weeks.find(w => w.status === 'in_progress' || w.status === 'struggling') || roadmapData?.weeks[0];
  const activeStruggles = roadmapData?.weeks.filter(w => w.status === 'struggling').map(w => w.title) || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        targetRole={roadmapData?.roadmap.target_role}
        health={health}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
        isCopilotOpen={isCopilotOpen}
      />

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: 1380, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {loading || isGenerating ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              border: '3px solid rgba(139, 92, 246, 0.2)',
              borderTopColor: '#8b5cf6',
              animation: 'spin 1s linear infinite',
              marginBottom: 20
            }} />
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: 8 }}>
              {isGenerating ? 'AI Skill Gap Engine Active...' : 'Loading EduPath Workspace...'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 450 }}>
              {isGenerating 
                ? 'Parsing resume text, calculating priority gaps with Gemini Flash, and structuring weekly sprints.' 
                : 'Connecting to database and verifying runtime configuration.'}
            </p>
          </div>
        ) : roadmapData ? (
          <>
            {/* Progress Analytics Banner */}
            <AnalyticsBanner
              progress={roadmapData.progress}
              targetRole={roadmapData.roadmap.target_role}
              hoursPerWeek={roadmapData.profile.hours_per_week}
            />

            {/* Extracted Skills & Gap Matrix */}
            <SkillGapMatrix skills={roadmapData.skills} />

            {/* Weekly Sprints Roadmap with Adaptive Struggle Engine */}
            <RoadmapView
              weeks={roadmapData.weeks}
              roadmapId={roadmapData.roadmap.id}
              targetRole={roadmapData.roadmap.target_role}
              onToggleTask={handleToggleTask}
              onReportStruggle={handleReportStruggle}
              isAdapting={isAdapting}
            />

            {/* Applied Portfolio Projects */}
            <ProjectCard projects={roadmapData.projects} />
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 16,
            border: '1px dashed var(--border-subtle)'
          }}>
            <Compass size={48} color="#8b5cf6" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: 8 }}>
              No Active Roadmap Found
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
              Set up your target role and upload your resume to generate your adaptive learning path.
            </p>
            <button onClick={() => setIsOnboardingOpen(true)} className="btn-primary">
              <Sparkles size={16} />
              <span>Get Started Now</span>
            </button>
          </div>
        )}
      </main>

      {/* Learning Copilot Sidebar */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeWeek={activeWeekForCopilot}
        targetRole={roadmapData?.roadmap.target_role || 'Software Engineer'}
        strugglePoints={activeStruggles}
        onSendMessage={handleSendCopilotMessage}
      />

      {/* Onboarding / Analysis Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSubmit={handleOnboardingSubmit}
        isLoading={isGenerating}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1e2338',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
          padding: '12px 24px',
          borderRadius: 999,
          color: '#ffffff',
          fontSize: '0.88rem',
          fontWeight: 500,
          zIndex: 100,
          animation: 'fadeIn 0.25s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        EduPath MVP • Node.js (Express/TypeScript) + Supabase Cloud (Postgres/RLS/Storage) + Google AI Studio (Gemini Flash)
      </footer>
    </div>
  );
};
