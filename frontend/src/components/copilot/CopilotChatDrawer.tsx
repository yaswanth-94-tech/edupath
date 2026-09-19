import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, X, Sparkles, Copy, Check, Terminal, Lightbulb } from 'lucide-react';
import { RoadmapWeek } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface CopilotChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeWeek?: RoadmapWeek;
  targetRole: string;
  strugglePoints: string[];
  onSendMessage: (msg: string) => Promise<string>;
}

export const CopilotChatDrawer: React.FC<CopilotChatDrawerProps> = ({
  isOpen,
  onClose,
  activeWeek,
  targetRole,
  strugglePoints,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **EduPath Copilot**, anchored to your active goal: **${targetRole}**.\n\nAsk me architectural questions, technical syntax, debugging tips, or project implementation guidance for your current sprint.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const reply = await onSendMessage(text.trim());
      
      // Simulate rapid streaming text effect
      const botMsgId = `bot_${Date.now()}`;
      const botMsg: Message = {
        id: botMsgId,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Unable to fetch response from Gemini copilot.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    `Explain this sprint's key concept with a code snippet`,
    `What are top 3 interview pitfalls for this topic?`,
    `Help me debug my project deliverable`
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 w-full sm:w-[460px] h-screen glass !rounded-none !border-y-0 !border-r-0 !border-l border-white/15 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-16 border-b border-white/10 px-5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>EduPath Copilot</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-mono">
                      gemini-2.5-flash
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>Active Sprint Context Injected</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Context Anchor */}
            {activeWeek && (
              <div className="p-3.5 bg-brand-500/[0.08] border-b border-brand-500/20 text-xs">
                <div className="flex items-center justify-between text-brand-300 font-bold mb-1">
                  <span className="truncate">Week {activeWeek.week_number}: {activeWeek.title}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400">Active</span>
                </div>
                <div className="text-zinc-300 text-[11px] truncate leading-relaxed">
                  {activeWeek.learning_objective}
                </div>
                {strugglePoints.length > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span className="truncate">Active struggle context: {strugglePoints.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Messages Feed */}
            <div 
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col gap-1.5 max-w-[92%] ${
                    msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-sm'
                        : 'glass border-white/15 text-zinc-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-invert prose-xs max-w-none space-y-2">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeString = String(children).replace(/\n$/, '');
                              const snippetId = `${msg.id}_${codeString.slice(0, 8)}`;

                              if (!inline) {
                                return (
                                  <div className="my-2 rounded-xl border border-white/10 bg-[#080B11] overflow-hidden not-prose">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/5 font-mono text-[11px] text-zinc-400">
                                      <span className="flex items-center gap-1.5 text-zinc-300">
                                        <Terminal className="w-3 h-3 text-cyan-400" />
                                        {match ? match[1] : 'code'}
                                      </span>
                                      <button
                                        onClick={() => handleCopy(codeString, snippetId)}
                                        className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                      >
                                        {copiedIndex === snippetId ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span className="text-[10px] text-emerald-400">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span className="text-[10px]">Copy</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="p-3 overflow-x-auto text-zinc-200 font-mono text-xs leading-relaxed">
                                      <code>{codeString}</code>
                                    </pre>
                                  </div>
                                );
                              }
                              return (
                                <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-cyan-300 font-mono text-[11px]" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono px-1">
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl glass border-white/10 text-xs text-zinc-300 mr-auto"
                >
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" />
                  </div>
                  <span>Synthesizing answer with Gemini 2.5 Flash...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 border-t border-white/10 bg-white/[0.02] flex gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] text-zinc-300 hover:text-white whitespace-nowrap flex-shrink-0 transition-all cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3.5 border-t border-white/10 bg-white/[0.02] flex gap-2">
              <input
                type="text"
                placeholder="Ask technical question about active sprint..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#080B11]/80 border border-white/15 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer shadow-md shadow-brand-500/25"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
