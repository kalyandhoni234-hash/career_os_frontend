export interface CareerMemory {
  profile: Record<string, unknown>;
  career_profile: CareerProfileData;
  resume: Record<string, unknown>;
  ats: AtsMemoryData;
  applications: ApplicationMemoryData;
  skills: SkillMemoryData;
  learning: LearningEntry[];
  goals: GoalMemoryData;
  roadmaps: RoadmapSummary[];
  timeline: TimelineEvent[];
  recent_coach: { content: string; timestamp: string | null }[];
  score_history: ScoreHistoryEntry[];
  recommendations: RecommendationData[];
  built_at: string;
}

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

export interface AiProfile {
  name: string;
  current_level: string;
  target_role: string;
  target_company: string;
  career_goal_type: string;
  ats_score: number;
  keyword_match: number;
  strong_skills: string[];
  weak_skills: string[];
  resume_summary_present: boolean;
  total_experience_entries: number;
  total_projects: number;
  applications_total: number;
  interview_count: number;
  offer_count: number;
  active_goals: number;
  roadmap_count: number;
  top_recommendation: string | null;
  missing_ats_skills: string[];
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
  current_skills: string[];
  learning_skills: Record<string, number>;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  coverage: number;
  gaps: SkillGap[];
  graph: Record<string, number>;
}

export interface SkillGap {
  skill: string;
  priority: number;
  estimated_ats_gain: number;
  recommended_project: string;
}

export interface ProjectRecommendation {
  skill: string;
  project: string;
  estimated_ats_gain: number;
  priority: number;
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

export interface WeeklyReportData {
  id: number;
  week_start: string | null;
  week_end: string | null;
  score_before: number;
  score_after: number;
  score_change: number;
  metrics: Record<string, number>;
  achievements: string[];
  recommendations: { title: string; impact: number; category: string }[];
  summary: string;
  created_at: string | null;
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

export interface CareerTimelineData {
  events: TimelineEvent[];
  total_events: number;
  years_active: string[];
}
