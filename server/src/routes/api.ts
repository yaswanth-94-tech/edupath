import { Router, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { isGeminiConfigured } from '../config/gemini';
import { isSupabaseConfigured, supabase, STORAGE_BUCKET } from '../config/supabase';
import { ResumeService } from '../services/resume.service';
import { GeminiService } from '../services/gemini.service';
import { DbService } from '../services/db.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

export const apiRouter = Router();

// Apply auth middleware to parse Bearer token across all routes
apiRouter.use(authMiddleware);

/**
 * Health check & stack status endpoint
 */
apiRouter.get('/health', async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gemini: {
      configured: isGeminiConfigured,
      rateLimit: '10 RPM max (Bottleneck throttled)',
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest'
    },
    supabase: {
      configured: isSupabaseConfigured,
      url: process.env.SUPABASE_URL ? 'Connected to Cloud Supabase' : 'In-Memory Fallback',
      storageBucket: STORAGE_BUCKET
    },
    auth: {
      isAuthenticated: Boolean(req.user),
      userId: req.user?.id || null,
      email: req.user?.email || null
    }
  });
});

/**
 * Get sample resume for one-click demo
 */
apiRouter.get('/sample-resume', (req: AuthenticatedRequest, res: Response) => {
  const role = (req.query.role as string) || 'frontend';
  const sample = ResumeService.getSampleResume(role);
  res.json({ resume: sample });
});

/**
 * Save user profile preferences
 */
apiRouter.post('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { target_role, hours_per_week, preferred_learning_style } = req.body;
    const userId = req.user?.id || req.body.id || req.userId;
    
    if (!target_role) {
      return res.status(400).json({ error: 'target_role is required' });
    }

    const profile = await DbService.saveProfile({
      id: userId,
      target_role,
      hours_per_week: hours_per_week ? parseInt(hours_per_week, 10) : 10,
      preferred_learning_style: preferred_learning_style || 'mixed'
    });

    res.json({ profile });
  } catch (err: any) {
    console.error('[API] /profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Analyze resume (PDF file upload or pasted text) and generate personalized roadmap
 * - Uploads resume to Supabase Storage at `${user.id}/${filename}`
 * - Creates profile row in `profiles` at end of onboarding (Rule 5)
 * - Runs Gemini 2.5 Flash gap analysis
 * - Persists roadmap to Supabase Postgres
 */
apiRouter.post('/analyze-resume', upload.single('resumeFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    let rawResumeText = body.resumeText || '';
    const userId = req.user?.id || body.userId || crypto.randomUUID();

    // 1. Handle PDF upload & Storage archival
    if (req.file) {
      // If Supabase Storage is configured, archive file at `${userId}/${filename}`
      if (isSupabaseConfigured && supabase) {
        try {
          const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storagePath = `${userId}/${Date.now()}_${safeName}`;
          
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, req.file.buffer, {
              contentType: req.file.mimetype || 'application/pdf',
              upsert: true
            });

          if (uploadError) {
            console.warn('[API] Storage upload warning:', uploadError.message);
          } else {
            console.log(`✅ Resume archived to Supabase Storage: ${STORAGE_BUCKET}/${storagePath}`);
          }
        } catch (storageErr) {
          console.warn('[API] Could not archive to Supabase Storage:', storageErr);
        }
      }

      // Parse PDF buffer
      try {
        rawResumeText = await ResumeService.extractAndSanitizePdf(req.file.buffer);
      } catch (pdfErr: any) {
        return res.status(400).json({ error: `Could not parse PDF resume: ${pdfErr.message}` });
      }
    } else if (body.storagePath && isSupabaseConfigured && supabase) {
      // Download from storage if client already uploaded it
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(body.storagePath);
        
        if (!downloadError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          rawResumeText = await ResumeService.extractAndSanitizePdf(Buffer.from(arrayBuffer));
        }
      } catch (dlErr) {
        console.warn('[API] Could not download resume from Storage:', dlErr);
      }
    }

    if (!rawResumeText || rawResumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide either a PDF resume upload or resume text.' });
    }

    const targetRole = body.targetRole || 'Full Stack Engineer';
    const hoursPerWeek = body.hoursPerWeek ? parseInt(body.hoursPerWeek, 10) : 10;
    const preferredStyle = body.preferredStyle || 'mixed';

    // 2. Sanitize text for lean token transmission
    const sanitizedResume = ResumeService.sanitizeText(rawResumeText);

    // 3. Create profile row at the END of onboarding (Rule 5)
    await DbService.saveProfile({
      id: userId,
      target_role: targetRole,
      hours_per_week: hoursPerWeek,
      preferred_learning_style: preferredStyle
    });

    // 4. Run Gemini 2.5 Flash structured gap analysis
    const analysis = await GeminiService.analyzeSkillGaps({
      targetRole,
      hoursPerWeek,
      preferredStyle,
      sanitizedResume
    });

    // 5. Save analysis results, roadmap, weeks, tasks to DB
    const roadmapData = await DbService.saveAnalysisResults({
      userId,
      targetRole,
      hoursPerWeek,
      analysis
    });

    res.json(roadmapData);
  } catch (err: any) {
    console.error('[API] /analyze-resume error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Fetch full roadmap data for a user
 */
apiRouter.get('/roadmap/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    let targetUserId = req.params.userId;
    if (targetUserId === 'me' && req.user?.id) {
      targetUserId = req.user.id;
    }

    const data = await DbService.getFullRoadmap(targetUserId);

    if (!data) {
      return res.status(404).json({ error: 'Roadmap not found for this user' });
    }

    res.json(data);
  } catch (err: any) {
    console.error('[API] /roadmap/:userId error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Toggle task completion
 */
apiRouter.patch('/tasks/:taskId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const isCompleted = req.body.is_completed !== undefined ? req.body.is_completed : req.body.isCompleted;

    const success = await DbService.toggleTaskCompletion(taskId, Boolean(isCompleted));
    res.json({ success, taskId, is_completed: Boolean(isCompleted) });
  } catch (err: any) {
    console.error('[API] /tasks/:taskId error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Dynamic Adaptive Feedback Loop: User flags struggle on a week
 */
apiRouter.post('/roadmap/struggle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roadmapId, weekId, targetRole, strugglingWeek, struggleNotes } = req.body;

    if (!roadmapId || !weekId || !strugglingWeek) {
      return res.status(400).json({ error: 'roadmapId, weekId, and strugglingWeek are required' });
    }

    // 1. Generate remedial adaptation with Gemini 2.5 Flash
    const adaptation = await GeminiService.recalculateStruggleMilestone({
      targetRole: targetRole || 'Software Engineer',
      strugglingWeek,
      struggleNotes
    });

    // 2. Apply remedial tasks and update status in database
    await DbService.applyStruggleAdaptation(roadmapId, weekId, adaptation);

    res.json({
      success: true,
      adaptation
    });
  } catch (err: any) {
    console.error('[API] /roadmap/struggle error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Context-Aware Copilot Q&A powered by Gemini 2.5 Flash
 */
apiRouter.post('/copilot/chat', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, targetRole, activeWeek, strugglePoints, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await GeminiService.copilotChat({
      message,
      targetRole: targetRole || 'Software Engineer',
      activeWeek: activeWeek || {
        week_number: 1,
        title: 'Core Fundamentals',
        learning_objective: 'Master foundational syntax and concepts'
      },
      strugglePoints: strugglePoints || [],
      history
    });

    res.json({ reply });
  } catch (err: any) {
    console.error('[API] /copilot/chat error:', err);
    res.status(500).json({ error: err.message });
  }
});
