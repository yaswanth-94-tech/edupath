import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle, CheckCircle, Code, HelpCircle } from 'lucide-react';
import { RoadmapWeek } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeWeek?: RoadmapWeek;
  targetRole: string;
  strugglePoints: string[];
  onSendMessage: (msg: string) => Promise<string>;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
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
      content: `Hello! I am your EduPath Learning Copilot. I'm anchored directly to your active goal: **${targetRole}**. Ask me questions about syntax, debugging, or project architecture!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

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
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Unable to fetch response from Copilot.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    `Explain the key concept of ${activeWeek ? activeWeek.title : 'this week'} simply`,
    `Give me a minimal code example for this sprint`,
    `What are the most common beginner pitfalls with this topic?`
  ];

  return (
    <aside
      aria-label="EduPath Learning Copilot Sidebar"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'min(440px, 92vw)',
        height: '100vh',
        backgroundColor: '#0e111a',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
              Learning Copilot
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
              Context-Aware Prompt Envelope
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Active Context Anchor Card */}
      {activeWeek && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(139, 92, 246, 0.06)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
          fontSize: '0.78rem'
        }}>
          <div style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: 2 }}>
            Active Sprint: Week {activeWeek.week_number} • {activeWeek.title}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
            {activeWeek.learning_objective}
          </div>
          {strugglePoints.length > 0 && (
            <div style={{ marginTop: 6, color: '#fbbf24', fontSize: '0.72rem' }}>
              ⚠️ Struggle context active: {strugglePoints.slice(0, 2).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: '0.85rem',
                lineHeight: 1.5,
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                border: msg.role === 'user' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid var(--border-subtle)',
                boxShadow: msg.role === 'user' ? '0 2px 10px rgba(124, 58, 237, 0.3)' : 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {msg.content}
            </div>
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Sparkles size={14} color="#8b5cf6" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Consulting sprint knowledge base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        gap: 6,
        overflowX: 'auto'
      }}>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {prompt.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 8,
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <input
          type="text"
          placeholder="Ask a technical question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '10px 14px' }}
        >
          <Send size={16} />
        </button>
      </div>
    </aside>
  );
};
