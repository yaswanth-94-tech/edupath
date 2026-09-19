import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, Zap, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback demo auth when keys are absent
        setTimeout(() => {
          setLoading(false);
          onSuccess({ id: 'demo_user', email });
        }, 500);
        return;
      }

      if (isSignUp) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data.session) {
          onSuccess(data.user);
        } else if (data.user && !data.session) {
          // Email confirmation is enabled in Supabase project
          setInfoMessage('Account created! Please check your email to confirm your account or sign in.');
        } else {
          onSuccess(data.user);
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data.user) {
          onSuccess(data.user);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleDemoBypass = () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div data-lenis-prevent="true" className="w-full max-w-sm rounded-2xl glass p-6 shadow-2xl space-y-5 border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img 
              src="/edupath-logo.png" 
              alt="EduPath Logo" 
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-brand-500/20 border border-white/10 bg-[#0c1424]"
            />
            <div>
              <h3 className="font-bold text-sm text-white">EduPath Studio</h3>
              <p className="text-[11px] text-zinc-400">
                {isSignUp ? 'Create your student account' : 'Sign in to your learning workspace'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isSignUp 
                ? 'bg-white/15 text-white shadow-sm font-semibold' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isSignUp 
                ? 'bg-brand-600 text-white shadow-sm font-semibold' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Callout */}
        {infoMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}


        {/* Traditional Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!error}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1.5">
              Password {isSignUp && <span className="text-zinc-500 font-normal">(min 6 characters)</span>}
            </label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={!!error}
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-2" 
            loading={loading}
          >
            {isSignUp ? 'Create EduPath Account' : 'Sign In to Workspace'}
          </Button>
        </form>

        {/* Fast-Track Demo Student Bypass */}
        <div className="pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Enter as Demo Student</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
