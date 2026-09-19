import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  LayoutDashboard, 
  Map, 
  Crosshair, 
  FolderGit2, 
  PlusCircle, 
  Bot, 
  Zap, 
  TrendingUp
} from 'lucide-react';
import { ActiveTab } from '../layout/Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenOnboarding: () => void;
  onToggleCopilot: () => void;
  onTriggerDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenOnboarding,
  onToggleCopilot,
  onTriggerDemo
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl glass p-1 shadow-2xl border-white/20">
        <Command label="EduPath Quick Commands" className="w-full flex flex-col">
          <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search actions, skills, or sprints... (↑↓ to navigate)"
              className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
            />
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.08] text-zinc-400 border border-white/10">
              ESC
            </kbd>
          </div>

          <Command.List data-lenis-prevent="true" className="max-h-72 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="p-4 text-center text-xs text-zinc-500">
              No matching actions found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <Command.Item
                onSelect={() => { onSelectTab('dashboard'); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-brand-400" />
                  <span>Overview Command Center</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Overview</span>
              </Command.Item>

              <Command.Item
                onSelect={() => { onSelectTab('roadmap'); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Map className="w-4 h-4 text-brand-400" />
                  <span>Weekly Roadmap Sprints</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Sprints</span>
              </Command.Item>

              <Command.Item
                onSelect={() => { onSelectTab('skills'); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <span>Skill Gap Matrix</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Skills</span>
              </Command.Item>

              <Command.Item
                onSelect={() => { onSelectTab('projects'); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  <span>Applied Portfolio Projects</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Projects</span>
              </Command.Item>

              <Command.Item
                onSelect={() => { onSelectTab('reports'); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Analytics & Reports</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Analytics</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Instant Actions" className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <Command.Item
                onSelect={() => { onToggleCopilot(); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Open AI Learning Copilot</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Copilot</span>
              </Command.Item>

              <Command.Item
                onSelect={() => { onTriggerDemo(); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Launch Judge Demo Mode (Alex Chen)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80">Instant</span>
              </Command.Item>

              <Command.Item
                onSelect={() => { onOpenOnboarding(); onClose(); }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-brand-400" />
                  <span>Start New Resume Analysis</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Analysis</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
