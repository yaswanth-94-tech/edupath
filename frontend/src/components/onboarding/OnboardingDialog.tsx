import React, { useState, useRef } from 'react';
import { Sparkles, UploadCloud, FileText, AlertCircle, X } from 'lucide-react';
import { api } from '@/lib/api';

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    targetRole: string;
    hoursPerWeek: number;
    preferredStyle: string;
    resumeText?: string;
    resumeFile?: File;
  }) => Promise<void>;
  isLoading: boolean;
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [preferredStyle, setPreferredStyle] = useState('mixed');
  const [resumeMode, setResumeMode] = useState<'upload' | 'paste'>('paste');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setResumeMode('upload');
      } else {
        setError('Please upload a PDF file.');
      }
    }
  };

  const loadSample = async (role: string) => {
    try {
      setError(null);
      const text = await api.getSampleResume(role);
      setResumeText(text);
      setResumeMode('paste');
      setSelectedFile(null);
      if (role.includes('data') || role.includes('python')) {
        setTargetRole('AI & Machine Learning Engineer');
      } else {
        setTargetRole('Full Stack React & Node Engineer');
      }
    } catch (err: any) {
      setError('Could not load sample resume');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (resumeMode === 'upload' && !selectedFile) {
      setError('Please select a PDF resume or switch to paste mode.');
      return;
    }

    if (resumeMode === 'paste' && (!resumeText || resumeText.trim().length < 20)) {
      setError('Please enter your resume text or click "Load Sample Resume".');
      return;
    }

    try {
      await onSubmit({
        targetRole,
        hoursPerWeek,
        preferredStyle,
        resumeFile: resumeMode === 'upload' && selectedFile ? selectedFile : undefined,
        resumeText: resumeMode === 'paste' ? resumeText : undefined
      });
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    }
  };

  const roleSuggestions = [
    'Full Stack Developer',
    'AI & Machine Learning Engineer',
    'Cloud & DevOps Engineer',
    'Frontend React Specialist'
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="linear-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-xl border border-zinc-700/80 shadow-2xl bg-[#0c0e17]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <img 
              src="/edupath-logo.png" 
              alt="EduPath Logo" 
              className="w-8 h-8 rounded-lg object-contain border border-white/10 bg-[#0c1424]"
            />
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Setup Learning Path</h2>
              <p className="text-xs text-zinc-400">Target role and skill evaluation with Gemini Flash</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isLoading} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Target Role */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">Target Job Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {roleSuggestions.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                    targetRole === r 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Commitment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-zinc-300">Weekly Study Commitment</label>
              <span className="font-semibold text-indigo-400">{hoursPerWeek} hrs/week</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
              disabled={isLoading}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>5 hrs (Part-time)</span>
              <span>15 hrs (Standard)</span>
              <span>30 hrs (Bootcamp)</span>
            </div>
          </div>

          {/* Resume Upload / Paste */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-medium text-zinc-300">Resume / Background</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => loadSample('frontend')}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Load Sample React
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() => loadSample('python')}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Load Sample Python
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setResumeMode('paste')}
                className={`flex-1 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1.5 ${
                  resumeMode === 'paste' 
                    ? 'bg-zinc-800 border-zinc-700 text-white' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('upload')}
                className={`flex-1 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1.5 ${
                  resumeMode === 'upload' 
                    ? 'bg-zinc-800 border-zinc-700 text-white' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </button>
            </div>

            {resumeMode === 'upload' ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                  }}
                />
                <UploadCloud className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                {selectedFile ? (
                  <div className="text-xs text-emerald-400 font-medium">{selectedFile.name}</div>
                ) : (
                  <div className="text-xs text-zinc-400">Drag & drop your PDF resume here, or browse</div>
                )}
              </div>
            ) : (
              <textarea
                rows={5}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume sections, skills, work history, or notable projects..."
                disabled={isLoading}
                className="w-full p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500 transition-colors resize-y"
              />
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Analyzing Gaps...' : 'Generate Roadmap'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
