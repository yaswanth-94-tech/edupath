export type SkillCategory = 'acquired' | 'adjacent' | 'critical_gap';
export type RoadmapStatus = 'active' | 'completed' | 'paused';
export type WeekStatus = 'pending' | 'in_progress' | 'completed' | 'struggling';
export type ResourceType = 'documentation' | 'video' | 'project' | 'exercise' | 'article';

export interface Profile {
  id: string;
  target_role: string;
  hours_per_week: number;
  preferred_learning_style: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  category: SkillCategory;
  proficiency_rating: number; // 0.0 to 1.0
  verified_via: string;
  created_at?: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  target_role: string;
  total_weeks: number;
  status: RoadmapStatus;
  created_at?: string;
  updated_at?: string;
}

export interface MilestoneTask {
  id: string;
  week_id: string;
  task_title: string;
  resource_url?: string;
  resource_type: ResourceType;
  is_completed: boolean;
  created_at?: string;
}

export interface RoadmapWeek {
  id: string;
  roadmap_id: string;
  week_number: number;
  title: string;
  learning_objective: string;
  status: WeekStatus;
  is_remedial?: boolean;
  created_at?: string;
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
  created_at?: string;
}

export interface FullRoadmapData {
  roadmap: Roadmap;
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

// Gemini Structured Output Schema Types
export interface GeminiTaskPlan {
  task_title: string;
  resource_type: ResourceType;
  resource_query: string;
  resource_url?: string;
}

export interface GeminiWeekPlan {
  week_number: number;
  title: string;
  learning_objective: string;
  tasks: GeminiTaskPlan[];
}

export interface GeminiProjectPlan {
  week_number: number;
  title: string;
  description: string;
  requirements: string[];
  suggested_tech_stack: string[];
}

export interface GeminiGapAnalysisResponse {
  acquired_skills: string[];
  skill_gaps: {
    skill: string;
    priority: 'critical' | 'high' | 'medium';
    category?: SkillCategory;
  }[];
  weekly_plan: GeminiWeekPlan[];
  portfolio_projects?: GeminiProjectPlan[];
}

export interface RemedialAdaptationResponse {
  struggling_week_number: number;
  explanation: string;
  remedial_tasks: GeminiTaskPlan[];
  adjusted_subsequent_weeks: {
    week_number: number;
    adjusted_title: string;
    learning_objective: string;
  }[];
}
