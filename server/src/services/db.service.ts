import { supabase, isSupabaseConfigured } from '../config/supabase';
import { 
  Profile, 
  UserSkill, 
  Roadmap, 
  RoadmapWeek, 
  MilestoneTask, 
  MilestoneProject, 
  FullRoadmapData,
  GeminiGapAnalysisResponse,
  RemedialAdaptationResponse
} from '../types';
import crypto from 'crypto';

// In-Memory store for reliable local demo and fallback when offline
class InMemoryStore {
  profiles = new Map<string, Profile>();
  skills = new Map<string, UserSkill[]>();
  roadmaps = new Map<string, Roadmap>();
  weeks = new Map<string, RoadmapWeek[]>();
  tasks = new Map<string, MilestoneTask[]>();
  projects = new Map<string, MilestoneProject[]>();
}

const memoryStore = new InMemoryStore();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeUserId(id?: string): string {
  if (!id) return crypto.randomUUID();
  if (UUID_REGEX.test(id)) return id;
  // Deterministic valid UUID based on md5 hash
  const hash = crypto.createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function logSupabaseError(table: string, err: any) {
  console.error(`[DbService] Supabase query failed on table "${table}":`, {
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    code: err?.code
  });
}

export class DbService {
  /**
   * Upsert or create user profile in Cloud Supabase (profiles table)
   */
  public static async saveProfile(profileData: {
    id?: string;
    target_role: string;
    hours_per_week: number;
    preferred_learning_style: string;
  }): Promise<Profile> {
    const userId = normalizeUserId(profileData.id);
    const profile: Profile = {
      id: userId,
      target_role: profileData.target_role,
      hours_per_week: profileData.hours_per_week,
      preferred_learning_style: profileData.preferred_learning_style,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(profile)
          .select()
          .single();

        if (error) {
          logSupabaseError('profiles', error);
          throw error;
        }
        return data as Profile;
      } catch (err: any) {
        logSupabaseError('profiles', err);
        console.warn('[DbService] Falling back to memory store for profile.');
      }
    }

    memoryStore.profiles.set(userId, profile);
    return profile;
  }

  /**
   * Save extracted skills and generated roadmap from Gemini analysis
   */
  public static async saveAnalysisResults(params: {
    userId: string;
    targetRole: string;
    hoursPerWeek: number;
    analysis: GeminiGapAnalysisResponse;
  }): Promise<FullRoadmapData> {
    const userId = normalizeUserId(params.userId);
    const { targetRole, analysis } = params;
    const roadmapId = crypto.randomUUID();

    // 1. Process Skills
    const userSkills: UserSkill[] = [];

    // Acquired skills
    for (const skill of analysis.acquired_skills) {
      userSkills.push({
        id: crypto.randomUUID(),
        user_id: userId,
        skill_name: skill,
        category: 'acquired',
        proficiency_rating: 0.8,
        verified_via: 'resume',
        created_at: new Date().toISOString()
      });
    }

    // Skill gaps
    for (const gap of analysis.skill_gaps) {
      const category = gap.priority === 'critical' ? 'critical_gap' : 'adjacent';
      userSkills.push({
        id: crypto.randomUUID(),
        user_id: userId,
        skill_name: gap.skill,
        category,
        proficiency_rating: gap.priority === 'critical' ? 0.2 : 0.4,
        verified_via: 'resume',
        created_at: new Date().toISOString()
      });
    }

    // 2. Process Roadmap
    const roadmap: Roadmap = {
      id: roadmapId,
      user_id: userId,
      target_role: targetRole,
      total_weeks: analysis.weekly_plan.length,
      status: 'active',
      created_at: new Date().toISOString()
    };

    // 3. Process Weeks and Tasks
    const weeks: RoadmapWeek[] = [];
    const allTasks: MilestoneTask[] = [];

    for (const [index, weekPlan] of analysis.weekly_plan.entries()) {
      const weekId = crypto.randomUUID();
      const weekTasks: MilestoneTask[] = [];

      for (const taskPlan of weekPlan.tasks) {
        const task: MilestoneTask = {
          id: crypto.randomUUID(),
          week_id: weekId,
          task_title: taskPlan.task_title,
          resource_url: taskPlan.resource_url,
          resource_type: taskPlan.resource_type,
          is_completed: false,
          created_at: new Date().toISOString()
        };
        weekTasks.push(task);
        allTasks.push(task);
      }

      weeks.push({
        id: weekId,
        roadmap_id: roadmapId,
        week_number: weekPlan.week_number,
        title: weekPlan.title,
        learning_objective: weekPlan.learning_objective,
        status: index === 0 ? 'in_progress' : 'pending',
        is_remedial: false,
        created_at: new Date().toISOString(),
        tasks: weekTasks
      });
    }

    // 4. Process Projects
    const projects: MilestoneProject[] = [];
    if (analysis.portfolio_projects) {
      for (const proj of analysis.portfolio_projects) {
        projects.push({
          id: crypto.randomUUID(),
          roadmap_id: roadmapId,
          week_number: proj.week_number,
          title: proj.title,
          description: proj.description,
          requirements: proj.requirements,
          suggested_tech_stack: proj.suggested_tech_stack,
          created_at: new Date().toISOString()
        });
      }
    }

    // Persist to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        // 1. ALWAYS guarantee profile exists in profiles table to satisfy foreign key constraint
        const { error: profErr } = await supabase.from('profiles').upsert({
          id: userId,
          target_role: targetRole,
          hours_per_week: params.hoursPerWeek || 10,
          preferred_learning_style: 'mixed',
          updated_at: new Date().toISOString()
        });
        if (profErr) logSupabaseError('profiles', profErr);

        // 2. Insert user skills
        if (userSkills.length > 0) {
          const { error: skillsErr } = await supabase.from('user_skills').insert(userSkills);
          if (skillsErr) logSupabaseError('user_skills', skillsErr);
        }

        // 3. Insert roadmap
        const { error: roadmapErr } = await supabase.from('roadmaps').insert(roadmap);
        if (roadmapErr) {
          logSupabaseError('roadmaps', roadmapErr);
        } else {
          // 4. Insert weeks only if parent roadmap exists
          const weekRows = weeks.map(({ tasks, ...w }) => w);
          const { error: weeksErr } = await supabase.from('roadmap_weeks').insert(weekRows);
          if (weeksErr) {
            logSupabaseError('roadmap_weeks', weeksErr);
          } else {
            // 5. Insert tasks only if parent weeks exist
            if (allTasks.length > 0) {
              const { error: tasksErr } = await supabase.from('milestone_tasks').insert(allTasks);
              if (tasksErr) logSupabaseError('milestone_tasks', tasksErr);
            }
          }

          if (projects.length > 0) {
            const { error: projErr } = await supabase.from('milestone_projects').insert(projects);
            if (projErr) logSupabaseError('milestone_projects', projErr);
          }
        }
      } catch (err: any) {
        console.warn('[DbService] Supabase insert exception:', err);
      }
    }


    // Always update memory store as cache
    memoryStore.skills.set(userId, userSkills);
    memoryStore.roadmaps.set(roadmapId, roadmap);
    memoryStore.weeks.set(roadmapId, weeks);
    memoryStore.tasks.set(roadmapId, allTasks);
    memoryStore.projects.set(roadmapId, projects);

    const profile = memoryStore.profiles.get(userId) || {
      id: userId,
      target_role: targetRole,
      hours_per_week: 10,
      preferred_learning_style: 'mixed'
    };

    return this.buildRoadmapData(roadmap, profile, userSkills, weeks, projects);
  }

  /**
   * Retrieves full roadmap data for a user
   */
  public static async getFullRoadmap(userId: string): Promise<FullRoadmapData | null> {
    // Check Supabase if configured and user ID is a valid UUID
    if (isSupabaseConfigured && supabase && UUID_REGEX.test(userId)) {
      try {
        const { data: roadmapData, error: roadmapError } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (roadmapError) {
          logSupabaseError('roadmaps', roadmapError);
        }

        if (roadmapData) {
          const [skillsRes, weeksRes, profileRes, projectsRes] = await Promise.all([
            supabase.from('user_skills').select('*').eq('user_id', userId),
            supabase.from('roadmap_weeks').select('*').eq('roadmap_id', roadmapData.id).order('week_number', { ascending: true }),
            supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
            supabase.from('milestone_projects').select('*').eq('roadmap_id', roadmapData.id)
          ]);

          if (skillsRes.error) logSupabaseError('user_skills', skillsRes.error);
          if (weeksRes.error) logSupabaseError('roadmap_weeks', weeksRes.error);
          if (profileRes.error) logSupabaseError('profiles', profileRes.error);
          if (projectsRes.error) logSupabaseError('milestone_projects', projectsRes.error);

          const weekIds = (weeksRes.data || []).map((w: any) => w.id);
          const { data: tasksData, error: tasksError } = await supabase
            .from('milestone_tasks')
            .select('*')
            .in('week_id', weekIds);

          if (tasksError) logSupabaseError('milestone_tasks', tasksError);

          const weeksWithTasks: RoadmapWeek[] = (weeksRes.data || []).map((w: any) => ({
            ...w,
            tasks: (tasksData || []).filter((t: any) => t.week_id === w.id)
          }));

          return this.buildRoadmapData(
            roadmapData,
            profileRes.data || { id: userId, target_role: roadmapData.target_role, hours_per_week: 10, preferred_learning_style: 'mixed' },
            skillsRes.data || [],
            weeksWithTasks,
            projectsRes.data || []
          );
        }
      } catch (err: any) {
        console.warn('[DbService] Error reading from Supabase:', err);
      }
    }

    // Check memory store
    for (const [rId, roadmap] of memoryStore.roadmaps.entries()) {
      if (roadmap.user_id === userId) {
        const profile = memoryStore.profiles.get(userId) || {
          id: userId,
          target_role: roadmap.target_role,
          hours_per_week: 10,
          preferred_learning_style: 'mixed'
        };
        const skills = memoryStore.skills.get(userId) || [];
        const weeks = memoryStore.weeks.get(rId) || [];
        const projects = memoryStore.projects.get(rId) || [];

        return this.buildRoadmapData(roadmap, profile, skills, weeks, projects);
      }
    }

    return null;
  }

  /**
   * Toggle task completion status
   */
  public static async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('milestone_tasks')
          .update({ is_completed: isCompleted })
          .eq('id', taskId);

        if (error) logSupabaseError('milestone_tasks', error);
      } catch (err: any) {
        console.warn('[DbService] Supabase task update error:', err);
      }
    }

    // Update in memory store
    for (const [rId, tasks] of memoryStore.tasks.entries()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.is_completed = isCompleted;
        const weeks = memoryStore.weeks.get(rId) || [];
        for (const week of weeks) {
          const wTask = week.tasks.find(t => t.id === taskId);
          if (wTask) wTask.is_completed = isCompleted;
        }
        return true;
      }
    }

    return true;
  }

  /**
   * Injects remedial sub-tasks and updates roadmap when struggling
   */
  public static async applyStruggleAdaptation(
    roadmapId: string,
    weekId: string,
    adaptation: RemedialAdaptationResponse
  ): Promise<boolean> {
    const remedialTasks: MilestoneTask[] = adaptation.remedial_tasks.map(t => ({
      id: crypto.randomUUID(),
      week_id: weekId,
      task_title: t.task_title,
      resource_url: t.resource_url,
      resource_type: t.resource_type,
      is_completed: false,
      created_at: new Date().toISOString()
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: weekErr } = await supabase
          .from('roadmap_weeks')
          .update({ status: 'struggling', is_remedial: true })
          .eq('id', weekId);
        if (weekErr) logSupabaseError('roadmap_weeks', weekErr);

        const { error: tasksErr } = await supabase
          .from('milestone_tasks')
          .insert(remedialTasks);
        if (tasksErr) logSupabaseError('milestone_tasks', tasksErr);
      } catch (err: any) {
        console.warn('[DbService] Supabase struggle update error:', err);
      }
    }

    // Update memory store
    const weeks = memoryStore.weeks.get(roadmapId);
    if (weeks) {
      const targetWeek = weeks.find(w => w.id === weekId);
      if (targetWeek) {
        targetWeek.status = 'struggling';
        targetWeek.is_remedial = true;
        targetWeek.tasks.unshift(...remedialTasks);
      }
    }

    const tasks = memoryStore.tasks.get(roadmapId);
    if (tasks) {
      tasks.push(...remedialTasks);
    }

    return true;
  }

  private static buildRoadmapData(
    roadmap: Roadmap,
    profile: Profile,
    skills: UserSkill[],
    weeks: RoadmapWeek[],
    projects: MilestoneProject[]
  ): FullRoadmapData {
    let totalTasks = 0;
    let completedTasks = 0;

    for (const week of weeks) {
      totalTasks += week.tasks.length;
      completedTasks += week.tasks.filter(t => t.is_completed).length;
    }

    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const criticalGapsCount = skills.filter(s => s.category === 'critical_gap').length;

    return {
      roadmap,
      profile,
      skills,
      weeks,
      projects,
      progress: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_percentage: completionPercentage,
        hours_invested: Math.round(completedTasks * 2.5),
        remaining_critical_gaps: criticalGapsCount
      }
    };
  }
}
