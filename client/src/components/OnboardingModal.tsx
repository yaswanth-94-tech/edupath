import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Clock, 
  BookOpen, 
  Check, 
  X, 
  AlertCircle,
  FileCode2,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

interface OnboardingModalProps {
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

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
        setError('Please drop a valid PDF file.');
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
      if (role.includes('data') || role.includes('ai')) {
        setTargetRole('AI & Machine Learning Engineer');
      } else {
        setTargetRole('Full Stack Next.js Engineer');
      }
    } catch (err: any) {
      setError('Could not load sample resume');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (resumeMode === 'upload' && !selectedFile) {
      setError('Please select a PDF resume to upload or switch to text paste.');
      return;
    }

    if (resumeMode === 'paste' && (!resumeText || resumeText.trim().length < 30)) {
      setError('Please provide your resume text or click "Load Sample Resume".');
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
      setError(err.message || 'Analysis failed. Please try again.');
    }
  };

  const roleSuggestions = [
    'Full Stack Developer',
    'AI & Machine Learning Engineer',
    'Cloud & DevOps Engineer',
    'Mobile React Native Engineer'
  ];

  const learningStyles = [
    { id: 'projects', label: 'Hands-on Projects', desc: 'Code first with applied project sprints' },
    { id: 'docs', label: 'Official Documentation', desc: 'Read canonical specifications and deep dives' },
    { id: 'videos', label: 'Curated Video Courses', desc: 'Visual walkthroughs & high-yield lectures' },
    { id: 'mixed', label: 'Balanced Blend', desc: 'Optimal mix of docs, projects, and exercises' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '20px'
    }}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          border: '1px solid var(--border-glow)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff' }}>
                Profile Setup & Skill Extraction
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Target your dream role and let Gemini Flash build your adaptive roadmap.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Target Role */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
              Target Job Role:
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                marginBottom: 10
              }}
            />

            {/* Quick role suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {roleSuggestions.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setTargetRole(role)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: targetRole === role ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${targetRole === role ? '#8b5cf6' : 'var(--border-subtle)'}`,
                    color: targetRole === role ? '#c4b5fd' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Available Study Hours */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                Weekly Available Study Time:
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6' }}>
                {hoursPerWeek} Hours / Week
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
              disabled={isLoading}
              style={{
                width: '100%',
                accentColor: '#8b5cf6',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>5 hrs (Part-time)</span>
              <span>15 hrs (Moderate)</span>
              <span>30 hrs (Bootcamp sprint)</span>
            </div>
          </div>

          {/* Learning Style Preference */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>
              Preferred Learning Medium:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {learningStyles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setPreferredStyle(style.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: preferredStyle === style.id ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${preferredStyle === style.id ? '#8b5cf6' : 'var(--border-subtle)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: preferredStyle === style.id ? '#c4b5fd' : '#e2e8f0' }}>
                    {style.label}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {style.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Source Options */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                Resume / Current Skills:
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => loadSample('frontend')}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    cursor: 'pointer'
                  }}
                >
                  Sample React Resume
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('python')}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    cursor: 'pointer'
                  }}
                >
                  Sample Python Resume
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                onClick={() => setResumeMode('paste')}
                className={resumeMode === 'paste' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <FileText size={14} />
                <span>Paste Text</span>
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('upload')}
                className={resumeMode === 'upload' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <UploadCloud size={14} />
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
                style={{
                  border: `2px dashed ${dragActive ? '#8b5cf6' : 'var(--border-subtle)'}`,
                  borderRadius: 10,
                  padding: '30px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud size={32} color="#8b5cf6" style={{ margin: '0 auto 8px' }} />
                {selectedFile ? (
                  <div>
                    <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                      Selected: {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for lean extraction
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 500 }}>
                      Drop your resume PDF here or click to browse
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Parsed locally with pdf-parse before transmission
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume sections, work history, projects, and current skill set here..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            )}
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ minWidth: 200 }}
            >
              <Sparkles size={16} />
              <span>{isLoading ? 'Extracting Gaps...' : 'Generate AI Learning Path'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
