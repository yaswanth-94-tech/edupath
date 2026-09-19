import React, { useState } from 'react';
import { Bot, CheckCircle, AlertCircle, Sparkles, User, Play, Search, LogOut, LogIn } from 'lucide-react';
import { SystemHealth } from '@/types';
import { ActiveTab } from './Sidebar';

interface TopNavbarProps {
  activeTab: ActiveTab;
  targetRole?: string;
  completionPercentage: number;
  health: SystemHealth | null;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenOnboarding: () => void;
  onOpenAuth?: () => void;
  onOpenCommandPalette?: () => void;
  onTriggerDemo?: () => void;
  onOpenLanding?: () => void;
  user?: any;
  onSignOut?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  targetRole,
  completionPercentage,
  health,
  onToggleCopilot,
  isCopilotOpen,
  onOpenOnboarding,
  onOpenAuth,
  onOpenCommandPalette,
  onTriggerDemo,
  onOpenLanding,
  user,
  onSignOut
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview Command Center';
      case 'roadmap':
        return 'Weekly Roadmap Sprints';
      case 'skills':
        return 'Skill Extraction & Gap Matrix';
      case 'projects':
        return 'Applied Portfolio Projects';
      case 'reports':
        return 'Analytics & Trajectory Reports';
      default:
        return 'Command Center';
    }
  };

  const userEmail = user?.email || '';
  const userInitials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'ST';

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-20 glass !rounded-none !border-x-0 !border-t-0 !border-b border-white/10">
      {/* Left: View breadcrumbs + Quick search trigger */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 text-xs">
          <img 
            src="/edupath-logo.png" 
            alt="EduPath Logo" 
            className="w-5 h-5 rounded-md object-contain border border-white/10 bg-[#0c1424]"
          />
          {onOpenLanding ? (
            <button 
              onClick={onOpenLanding}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              EduPath
            </button>
          ) : (
            <span className="text-zinc-400 font-medium">EduPath</span>
          )}
          <span className="text-zinc-600">/</span>
          <span className="font-semibold text-white">{getTabTitle()}</span>
        </div>

        {/* Search / Command trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Search commands, skills, or sprints...</span>
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-zinc-400">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Status badges, demo button, avatar */}
      <div className="flex items-center gap-3">
        {/* Judge Fast-Track Button */}
        {onTriggerDemo && (
          <button
            onClick={onTriggerDemo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-medium text-amber-300 transition-all cursor-pointer shadow-sm"
            title="Preload rich verified demo dataset instantly for hackathon judging"
          >
            <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Judge Demo Mode</span>
          </button>
        )}

        {/* Progress Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          <span>Curriculum:</span>
          <span className="font-semibold text-white">{completionPercentage}%</span>
        </div>

        {/* Gemini Engine Badge */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium"
          style={{
            background: health?.gemini.configured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            borderColor: health?.gemini.configured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
            color: health?.gemini.configured ? '#34d399' : '#fbbf24'
          }}
          title={health?.gemini.configured ? 'Google AI Studio gemini-2.5-flash connected' : 'Local Demo fallback active'}
        >
          {health?.gemini.configured ? (
            <CheckCircle className="w-3 h-3 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
          <span className="font-mono text-[10px]">
            {health?.gemini.configured ? 'gemini-2.5-flash' : 'demo-mock'}
          </span>
        </div>

        {/* Copilot Toggle */}
        <button
          onClick={onToggleCopilot}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        {/* Auth / Profile Area */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white/[0.06] border border-white/15 shadow-sm">
              <span className="text-[11px] text-zinc-300 max-w-[130px] truncate hidden md:inline font-mono">
                {userEmail || 'Student'}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                {userInitials}
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-all cursor-pointer shadow-sm hover:border-rose-500/50"
                title="Log out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
