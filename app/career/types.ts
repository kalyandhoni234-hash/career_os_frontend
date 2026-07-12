export interface CareerProfileData {
  target_role?: string;
  target_company?: string;
  target_location?: string;
  target_salary?: string;
  career_level?: string;
  years_experience?: number;
  career_goal_type?: string;
}

export interface AtsMemoryData {
  overall_score?: number;
  keyword_match?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  action_verb_score?: number;
  strong_verbs?: string[];
  weak_verbs?: string[];
}

export interface ApplicationMemoryData {
  total_applications?: number;
  by_status?: Record<string, number>;
  interview_count?: number;
  offer_count?: number;
  active_applications?: number;
}

export interface SkillMemoryData {
  resume_skills?: string[];
  skill_graph?: Record<string, { proficiency: number; count: number }>;
  learning_progress?: Record<string, number>;
  total_skills?: number;
}

export interface LearningEntry {
  skill: string;
  proficiency: number;
  category: string | null;
}

export interface GoalMemoryData {
  active_goals?: { id: number; title: string; target_role: string | null; target_company: string | null; progress: number; priority: number }[];
  completed_goals?: number;
  total_goals?: number;
}

export interface RoadmapSummary {
  id: number;
  title: string;
  category: string | null;
  progress: number;
  estimated_weeks: number;
  status: string;
}

export interface TimelineEvent {
  type?: string;
  event_type?: string;
  title: string;
  description?: string;
  date?: string;
  event_date?: string;
  importance?: number;
  metadata?: Record<string, unknown>;
}

export interface ScoreHistoryEntry {
  overall_score: number;
  date: string | null;
  breakdown?: Record<string, number>;
}

export interface RecommendationData {
  id?: number;
  type?: string;
  rec_type?: string;
  title: string;
  description?: string;
  priority: number;
  impact_score: number;
  category?: string;
  action_link?: string;
}

export interface CareerScoreResult {
  overall_score: number;
  breakdown: {
    resume_score: number;
    ats_score: number;
    projects_score: number;
    applications_score: number;
    learning_score: number;
    interview_score: number;
    skill_coverage: number;
    roadmap_bonus: number;
  };
  snapshot_id: number;
  timestamp: string | null;
}

export interface ActionPlanItem {
  id: number;
  title: string;
  description: string;
  priority: number;
  impact_score: number;
  category: string;
  action_link: string;
  rec_type: string;
  stars: string;
}

export interface SkillGraphData {
  [category: string]: {
    proficiency: number;
    skill_count: number;
    skills?: string[];
  };
}

export interface SkillGapAnalysis {
  target_role: string;
  role_description?: string;
  estimated_months?: number;
  current_skills: string[];
  learning_skills: Record<string, number>;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  coverage: number;
  coverage_by_tier?: {
    core: number;
    intermediate: number;
    advanced: number;
  };
  gaps: SkillGap[];
  graph: Record<string, number>;
  roadmap?: SkillRoadmap;
}

export interface SkillGap {
  skill: string;
  priority: number;
  tier?: string;
  reason?: string;
  estimated_ats_gain: number;
  recommended_project: string;
  learning_time_weeks?: number;
  resources?: string[];
  unlocks?: string[];
}

export interface SkillRoadmap {
  phases: LearningPhase[];
  total_months_estimated: number;
}

export interface LearningPhase {
  phase: number;
  title: string;
  description: string;
  months_estimated: number;
  skills: SkillGap[];
}



export interface RoadmapData {
  id: number;
  title: string;
  description: string | null;
  target_role: string | null;
  category: string | null;
  estimated_weeks: number;
  progress: number;
  status: string;
  created_at: string | null;
  completed_nodes: number;
  total_nodes: number;
  nodes: RoadmapNodeData[];
}

export interface RoadmapNodeData {
  id: number;
  title: string;
  description: string | null;
  resource_url: string | null;
  resource_type: string;
  order: number;
  week: number;
  status: string;
  skill_tags: string[];
  completed_at: string | null;
}

export interface CareerPathSummary {
  title: string;
  description: string;
  estimated_months: number;
  total_lessons: number;
  phase_count: number;
}

export interface LessonData {
  id: string;
  title: string;
  difficulty: string;
  estimated_minutes: number;
  prerequisites: string[];
  skills_gained: string[];
  resources: { title: string; url: string; type: string }[];
  practice_labs: { title: string; url: string; platform: string }[];
  projects: { title: string; description: string }[];
  quiz: { question: string; options: string[]; correct_index: number; explanation: string }[];
  status?: string;
  progress_score?: number | null;
  progress_notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface ModuleData {
  id: string;
  title: string;
  order: number;
  lessons: LessonData[];
  progress: number;
}

export interface PhaseData {
  id: string;
  title: string;
  order: number;
  modules: ModuleData[];
  progress: number;
}

export interface DashboardRoadmap {
  id: number;
  title: string;
  target_role: string | null;
  progress: number;
  streak: number;
  weekly_hours: number;
  status: string;
  current_phase_title: string | null;
  current_module_title: string | null;
  current_lesson: LessonData | null;
  totals: { total: number; completed: number; in_progress: number; not_started: number };
  days_active: number;
  estimated_days_remaining: number;
  days_remaining: number;
  started_at: string | null;
  last_activity_at: string | null;
}

export interface FullRoadmap {
  id: number;
  title: string;
  description: string;
  target_role: string;
  category: string;
  estimated_weeks: number;
  progress: number;
  status: string;
  streak: number;
  weekly_hours: number;
  created_at: string | null;
  started_at: string | null;
  last_activity_at: string | null;
  phases: PhaseData[];
  current_phase_title: string | null;
  current_module_title: string | null;
  current_lesson: LessonData | null;
  totals: { total: number; completed: number; in_progress: number; not_started: number };
}

export interface CareerGoalData {
  id: number;
  title: string;
  description?: string | null;
  target_role?: string | null;
  target_company?: string | null;
  target_date?: string | null;
  status: string;
  priority?: number;
  progress: number;
  category?: string;
  created_at?: string | null;
  impact?: string;
}

export interface CareerDashboardData {
  career_score: CareerScoreResult;
  career_memory: {
    user_profile: {
      current_role: string;
      years_of_experience: number;
      top_skills: string[];
      target_role: string;
    };
    job_search_stats: {
      total_applied: number;
      total_interviews: number;
      total_offers: number;
      active_applications: number;
    };
    learning_stats: {
      skills_learning: number;
      completed_nodes: number;
    };
  };
  recent_roadmaps: { id: number; title: string; progress: number; estimated_weeks: number; category: string | null }[];
  action_center: ActionPlanItem[];
  skill_graph: SkillGraphData;
  recent_timeline: TimelineEvent[];
  goals: CareerGoalData[];
  recommendations: RecommendationData[];
}


