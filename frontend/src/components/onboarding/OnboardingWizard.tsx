import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Clock, 
  BookOpen, 
  Check, 
  X, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface OnboardingWizardProps {
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

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [preferredStyle, setPreferredStyle] = useState('mixed');
  const [resumeMode, setResumeMode] = useState<'upload' | 'paste'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  if (!isOpen) return null;

  const roleOptions = [
    {
      id: 'Java Developer',
      title: 'Java Backend Developer',
      tags: ['Java 21', 'Spring Boot 3', 'Microservices', 'PostgreSQL'],
      desc: 'Build enterprise-grade distributed systems, REST APIs, and microservices with Spring.'
    },
    {
      id: 'Full Stack Engineer',
      title: 'Full Stack Engineer',
      tags: ['React 19', 'Next.js', 'Node.js', 'PostgreSQL'],
      desc: 'Architect end-to-end web apps with type-safe APIs, microservices, and reactive UIs.'
    },
    {
      id: 'AI & Machine Learning Engineer',
      title: 'AI & Machine Learning Engineer',
      tags: ['Python', 'Gemini 2.5', 'pgvector', 'PyTorch'],
      desc: 'Build semantic search engines, LLM agents, and automated inference pipelines.'
    },
    {
      id: 'Cloud & DevOps Engineer',
      title: 'Cloud & DevOps Engineer',
      tags: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      desc: 'Manage container infrastructure, automated deployment pipelines, and telemetry.'
    },
    {
      id: 'Frontend Specialist (React/Next.js)',
      title: 'Frontend Specialist',
      tags: ['TypeScript', 'Tailwind', 'Motion', 'State Stores'],
      desc: 'Craft high-fidelity, accessible, animated web apps and client design systems.'
    }
  ];

  const styleOptions = [
    {
      id: 'mixed',
      label: 'Balanced (Projects & Concepts)',
      desc: 'Harmonious blend of architectural docs, code exercises, and video primers.'
    },
    {
      id: 'project_based',
      label: 'Project-First Builder',
      desc: 'Learn by implementing milestone repositories and practical deliverables.'
    },
    {
      id: 'theoretical',
      label: 'Deep Documentation & RFCs',
      desc: 'Spec-heavy learning with deep reads, technical whitepapers, and syntax nuance.'
    },
    {
      id: 'video_first',
      label: 'Visual & Video Guided',
      desc: 'Visual mental models, diagrams, and video walkthroughs before writing code.'
    }
  ];

  const handleNext = async () => {
    setError(null);
    if (step === 1 && !targetRole.trim()) {
      setError('Please select or specify a target role.');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    if (step === 4) {
      if (resumeMode === 'paste' && !resumeText.trim()) {
        setError('Please paste your resume text or switch to upload.');
        return;
      }
      if (resumeMode === 'upload' && !selectedFile) {
        setError('Please upload a PDF or text resume, or choose paste.');
        return;
      }

      try {
        await onSubmit({
          targetRole,
          hoursPerWeek,
          preferredStyle,
          resumeText: resumeMode === 'paste' ? resumeText : undefined,
          resumeFile: resumeMode === 'upload' && selectedFile ? selectedFile : undefined
        });
      } catch (err: any) {
        setError(err.message || 'Analysis failed. Please retry.');
      }
    }
  };

  const loadSample = async (type: 'frontend' | 'python') => {
    try {
      setError(null);
      const text = await api.getSampleResume(type === 'frontend' ? 'frontend' : 'fullstack');
      setResumeText(text);
      setResumeMode('paste');
    } catch {
      setResumeText(
        `John Doe - Full Stack Developer\nExperience: Built React and Node.js applications. Created REST APIs with Express and PostgreSQL.\nSkills: JavaScript, TypeScript, React, HTML/CSS, Git, SQL.`
      );
      setResumeMode('paste');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div data-lenis-prevent="true" className="w-full max-w-xl rounded-2xl glass p-6 shadow-2xl space-y-5 border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img 
              src="/edupath-logo.png" 
              alt="EduPath Logo" 
              className="w-8 h-8 rounded-xl object-contain shadow-md shadow-brand-500/20 border border-white/10 bg-[#0c1424]"
            />
            <div>
              <h2 className="font-bold text-sm text-white">Create Learning Path</h2>
              <p className="text-[11px] text-zinc-400">Step {step} of 4 — Personalized career curriculum</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-brand-500 to-cyan-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Step Content */}
        <div className="min-h-[260px]">
          {/* Step 1: Target Role */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-white">What is your dream job target?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Select a primary career track or enter a custom title.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {roleOptions.map((role) => {
                  const isSelected = targetRole === role.title;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setTargetRole(role.title)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 select-none ${
                        isSelected 
                          ? 'bg-brand-500/15 border-brand-500 shadow-md shadow-brand-500/20' 
                          : 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{role.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{role.desc}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {role.tags.map((t, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-300 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Or enter custom role (e.g., Senior iOS & Swift Engineer)..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#080B11] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: Weekly Hours Slider */}
          {step === 2 && (
            <div className="space-y-6 pt-2">
              <div>
                <h3 className="text-sm font-semibold text-white">How many hours can you commit each week?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">EduPath sizes sprints and milestone pacing to fit your available bandwidth.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-4">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">{hoursPerWeek}</span>
                  <span className="text-sm text-zinc-400 font-medium">hrs / week</span>
                </div>

                <div className="px-4">
                  <input
                    type="range"
                    min={4}
                    max={35}
                    step={1}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-2">
                    <span>4 hrs (Casual)</span>
                    <span>15 hrs (Recommended)</span>
                    <span>35 hrs (Intensive)</span>
                  </div>
                </div>

                <div className="text-xs text-brand-300 font-medium pt-1">
                  {hoursPerWeek < 8 ? 'Steady, self-paced progress over ~10 weeks.' :
                   hoursPerWeek < 20 ? 'Optimal velocity: 1 milestone deliverable every 7 days.' :
                   'Accelerated bootcamp pace: intensive multi-project track.'}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Learning Style */}
          {step === 3 && (
            <div className="space-y-3 pt-1">
              <div>
                <h3 className="text-sm font-semibold text-white">Select your preferred learning style</h3>
                <p className="text-zinc-400 text-xs mt-0.5">We bias curriculum resources toward your preferred intake medium.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {styleOptions.map((opt) => {
                  const isSelected = preferredStyle === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setPreferredStyle(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 select-none ${
                        isSelected 
                          ? 'bg-brand-500/15 border-brand-500 shadow-md shadow-brand-500/20' 
                          : 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Resume Intake with react-dropzone */}
          {step === 4 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Provide your background resume</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">Drop a PDF or paste text to extract verified skills.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadSample('frontend')}
                    className="text-[10px] text-brand-300 hover:underline cursor-pointer"
                  >
                    Sample React
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    type="button"
                    onClick={() => loadSample('python')}
                    className="text-[10px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    Sample Python
                  </button>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResumeMode('upload')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    resumeMode === 'upload' 
                      ? 'bg-brand-500/15 border-brand-500/40 text-white font-semibold' 
                      : 'bg-white/[0.04] border-white/10 text-zinc-400'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResumeMode('paste')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    resumeMode === 'paste' 
                      ? 'bg-brand-500/15 border-brand-500/40 text-white font-semibold' 
                      : 'bg-white/[0.04] border-white/10 text-zinc-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Text</span>
                </button>
              </div>

              {resumeMode === 'upload' ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-cyan-400 bg-cyan-500/10' 
                      : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                      <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-400"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-white font-medium">
                        {isDragActive ? 'Drop your resume PDF here...' : 'Drag & drop your resume PDF here, or click to browse'}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">Supports standard PDF or TXT up to 10MB</div>
                    </>
                  )}
                </div>
              ) : (
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume sections, work experience, projects, or skill lists..."
                  className="w-full p-3.5 rounded-2xl bg-[#080B11] border border-white/10 text-white placeholder-zinc-500 outline-none focus:border-brand-500 transition-colors resize-y font-sans text-xs leading-relaxed"
                />
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} disabled={isLoading}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button variant="primary" size="sm" onClick={handleNext} loading={isLoading}>
            <span>{step === 4 ? 'Launch Gap Analysis' : 'Next Step'}</span>
            {step < 4 && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
