import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Crosshair, 
  FolderGit2, 
  PlusCircle, 
  Sparkles, 
  ChevronsLeft, 
  ChevronsRight,
  Bot,
  TrendingUp,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActiveTab = 'dashboard' | 'roadmap' | 'skills' | 'projects' | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  targetRole?: string;
  onOpenOnboarding: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  targetRole,
  onOpenOnboarding,
  onToggleCopilot,
  isCopilotOpen,
  onOpenCommandPalette
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'roadmap' as ActiveTab, label: 'Roadmap Sprints', icon: Map },
    { id: 'skills' as ActiveTab, label: 'Skill Gap Matrix', icon: Crosshair },
    { id: 'projects' as ActiveTab, label: 'Portfolio Projects', icon: FolderGit2 },
    { id: 'reports' as ActiveTab, label: 'Analytics & Reports', icon: TrendingUp }
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 248 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-screen border-r border-white/10 bg-[#0B0F1A]/95 backdrop-blur-xl z-30 select-none flex-shrink-0"
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src="/edupath-logo.png" 
            alt="EduPath Logo" 
            className="w-8 h-8 rounded-lg object-contain flex-shrink-0 shadow-md shadow-brand-500/20 border border-white/10 bg-[#0c1424]"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span className="font-bold text-sm tracking-tight text-white">
                EduPath
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                AI Agent
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Target Role Pill */}
      {!isCollapsed && targetRole && (
        <div className="px-3 pt-3">
          <div className="px-3 py-2 rounded-xl bg-surface-2/60 border border-white/5">
            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Goal Track
            </div>
            <div className="text-xs font-semibold text-zinc-100 truncate mt-0.5" title={targetRole}>
              {targetRole}
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <div 
        data-lenis-prevent="true"
        className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto no-scrollbar"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors relative cursor-pointer",
                isActive 
                  ? "text-white font-semibold" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Sliding active-pill indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-brand-500/15 border border-brand-500/40 shadow-sm shadow-brand-500/20 pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              <Icon className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10", 
                isActive ? "text-brand-400" : "text-zinc-400 group-hover:text-zinc-200"
              )} />
              {!isCollapsed && <span className="truncate relative z-10">{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] relative z-10" />
              )}
            </button>
          );
        })}

        {/* Quick Command Trigger */}
        {!isCollapsed && onOpenCommandPalette && (
          <div className="pt-2 px-1">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-1 border border-white/5 text-[11px] text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Command className="w-3 h-3 text-zinc-500" />
                Quick Search
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Learning Copilot Toggle */}
        <div className="pt-2 border-t border-white/5 mt-3">
          <button
            onClick={onToggleCopilot}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              isCopilotOpen 
                ? "bg-gradient-to-r from-brand-600/20 to-cyan-500/20 text-brand-300 border border-brand-500/40 shadow-sm" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent"
            )}
            title={isCollapsed ? "AI Learning Copilot" : undefined}
          >
            <Bot className={cn("w-4 h-4 flex-shrink-0", isCopilotOpen ? "text-cyan-400" : "text-zinc-400")} />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>AI Copilot</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Live
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-2.5 border-t border-white/10 space-y-1 bg-surface-1/40">
        <button
          onClick={onOpenOnboarding}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white bg-surface-2 hover:bg-surface-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "New Analysis" : undefined}
        >
          <PlusCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
          {!isCollapsed && <span>New Analysis</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="w-4 h-4 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
