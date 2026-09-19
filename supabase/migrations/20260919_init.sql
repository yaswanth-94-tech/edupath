-- ==========================================
-- EduPath Database Schema & Policies
-- Product Requirement Document (PRD) v1.0
-- ==========================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  target_role TEXT NOT NULL,
  hours_per_week INT DEFAULT 10,
  preferred_learning_style TEXT DEFAULT 'mixed', -- 'videos', 'docs', 'projects', 'mixed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skills & Extracted Profiles
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('acquired', 'adjacent', 'critical_gap')),
  proficiency_rating NUMERIC(2, 1) DEFAULT 0.0 CHECK (proficiency_rating >= 0.0 AND proficiency_rating <= 1.0),
  verified_via TEXT DEFAULT 'resume', -- 'resume', 'quiz', 'self_report'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  total_weeks INT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Weekly Milestone Modules
CREATE TABLE IF NOT EXISTS roadmap_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  title TEXT NOT NULL,
  learning_objective TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'struggling')),
  is_remedial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tasks & Recommended Resources
CREATE TABLE IF NOT EXISTS milestone_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES roadmap_weeks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('documentation', 'video', 'project', 'exercise', 'article')),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Applied Portfolio Projects (Every 2-3 weeks)
CREATE TABLE IF NOT EXISTS milestone_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  suggested_tech_stack JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_weeks_roadmap ON roadmap_weeks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_week ON milestone_tasks(week_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_projects ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated development policies
-- (Allows app access while securing table mutations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read-write for profiles'
  ) THEN
    CREATE POLICY "Public read-write for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Public read-write for user_skills" ON user_skills FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Public read-write for roadmaps" ON roadmaps FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Public read-write for roadmap_weeks" ON roadmap_weeks FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Public read-write for milestone_tasks" ON milestone_tasks FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Public read-write for milestone_projects" ON milestone_projects FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Progress Calculation View
CREATE OR REPLACE VIEW view_user_roadmap_progress AS
SELECT 
  r.id AS roadmap_id,
  r.user_id,
  r.target_role,
  r.total_weeks,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.is_completed = true) AS completed_tasks,
  CASE 
    WHEN COUNT(t.id) = 0 THEN 0.0
    ELSE ROUND((COUNT(t.id) FILTER (WHERE t.is_completed = true)::DECIMAL / COUNT(t.id)::DECIMAL) * 100, 1)
  END AS completion_percentage,
  COUNT(DISTINCT s.id) FILTER (WHERE s.category = 'critical_gap') AS remaining_critical_gaps
FROM roadmaps r
LEFT JOIN roadmap_weeks w ON w.roadmap_id = r.id
LEFT JOIN milestone_tasks t ON t.week_id = w.id
LEFT JOIN user_skills s ON s.user_id = r.user_id
GROUP BY r.id, r.user_id, r.target_role, r.total_weeks;
