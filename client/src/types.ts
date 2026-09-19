export type SkillCategory = 'acquired' | 'adjacent' | 'critical_gap';
export type WeekStatus = 'pending' | 'in_progress' | 'completed' | 'struggling';
export type ResourceType = 'documentation' | 'video' | 'project' | 'exercise' | 'article';

export interface Profile {
  id: string;
  target_role: string;
  hours_per_week: number;
  preferred_learning_style: string;
}

export interface UserSkill {
  id: string;
  skill_name: string;
  category: SkillCategory;
  proficiency_rating: number;
  verified_via: string;
}

export interface MilestoneTask {
  id: string;
  week_id: string;
  task_title: string;
  resource_url?: string;
  resource_type: ResourceType;
  is_completed: boolean;
}

export interface RoadmapWeek {
  id: string;
  roadmap_id: string;
  week_number: number;
  title: string;
  learning_objective: string;
  status: WeekStatus;
  is_remedial?: boolean;
  tasks: MilestoneTask[];
}

export interface MilestoneProject {
  id: string;
  roadmap_id: string;
  week_number: number;
  title: string;
  description: string;
  requirements: string[];
  suggested_tech_stack: string[];
}

export interface FullRoadmapData {
  roadmap: {
    id: string;
    user_id: string;
    target_role: string;
    total_weeks: number;
    status: string;
  };
  profile: Profile;
  skills: UserSkill[];
  weeks: RoadmapWeek[];
  projects: MilestoneProject[];
  progress: {
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
    hours_invested: number;
    remaining_critical_gaps: number;
  };
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  gemini: {
    configured: boolean;
    rateLimit: string;
    model: string;
  };
  supabase: {
    configured: boolean;
    url: string;
  };
}
