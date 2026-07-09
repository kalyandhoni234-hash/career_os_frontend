export type AgentType =
  | "job_discovery"
  | "resume_optimization"
  | "ats_intelligence"
  | "opportunity_ranking"
  | "company_intelligence"
  | "salary_intelligence"
  | "learning"
  | "project_recommendation"
  | "interview_preparation"
  | "networking"
  | "notification"
  | "weekly_report"
  | "career_strategy";

export type AgentStatus = "idle" | "running" | "error" | "paused";

export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface CareerAgent {
  id: number;
  agent_type: AgentType;
  status: AgentStatus;
  last_run_at: string | null;
  next_run_at: string | null;
  total_runs: number;
  total_errors: number;
  config: Record<string, unknown>;
  pending_tasks: number;
  running_tasks: number;
  created_at: string | null;
}

export interface AgentTask {
  id: number;
  agent_id: number;
  task_type: string;
  status: TaskStatus;
  priority: number;
  progress: number;
  error_message: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
}

export interface AgentDashboardData {
  agents: CareerAgent[];
  recent_tasks: AgentTask[];
  running_count: number;
  error_count: number;
  completed_today: number;
}

export const AGENT_LABELS: Record<AgentType, string> = {
  job_discovery: "Job Discovery",
  resume_optimization: "Resume Optimization",
  ats_intelligence: "ATS Intelligence",
  opportunity_ranking: "Opportunity Ranking",
  company_intelligence: "Company Intelligence",
  salary_intelligence: "Salary Intelligence",
  learning: "Learning",
  project_recommendation: "Project Recommendation",
  interview_preparation: "Interview Preparation",
  networking: "Networking",
  notification: "Notification",
  weekly_report: "Weekly Report",
  career_strategy: "Career Strategy",
};

// ── Briefing Dashboard Types ──

export interface AgentBriefing {
  greeting: { name: string; hour: number };
  hero_stats: {
    jobs_scanned: number;
    jobs_scanned_this_week: number;
    excellent_matches: number;
    resume_improvements: number;
    interview_packs_prepared: number;
    saved_opportunities: number;
    career_score: { current: number; change: number };
    interview_probability: { current: number; change: number };
  };
  daily_brief: {
    highlights: BriefHighlight[];
    date: string;
  };
  recommendations: AgentRecommendation[];
  agent_activities: AgentActivity[];
  timeline: TimelineEvent[];
  career_health: {
    career_score: number;
    resume_score: number;
    ats_score: number;
    interview_readiness: number;
    project_strength: number;
    application_activity: number;
    learning_progress: number;
  };
  ai_memory: {
    career_goal: string;
    preferred_location: string;
    target_companies: string[];
    preferred_stack: string[];
    preferred_roles: string[];
    preferred_locations: string[];
    resume_version: string;
    has_resume: boolean;
  };
  opportunity_feed: {
    id: number;
    title: string;
    company: string;
    logo: string | null;
    match: number;
    ats_match: number;
    skill_match: number;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
  }[];
  career_forecast: {
    current_score: number;
    after_docker: number;
    after_resume_update: number;
    after_skill_fill: number;
    estimated_interview_probability: { current: number; predicted: number };
  };
  weekly_progress: {
    applications: { current: number; last_week: number };
    resume_updates: { current: number; last_week: number };
    skills_learned: { current: number; last_week: number };
    interviews: { current: number; last_week: number };
    career_score_growth: { current: number; last_week: number };
    ats_growth: { current: number; last_week: number };
  };
  built_at: string;
}

export interface BriefHighlight {
  type: "opportunity" | "insight" | "resume" | "deadline";
  title?: string;
  match?: number;
  url?: string;
  company?: string;
  role?: string;
  text?: string;
}

export interface AgentRecommendation {
  id: number;
  action: string;
  description: string;
  priority: number;
  impact_score: number;
  category: string;
  why: string;
  evidence: string;
  impact: string;
  confidence: number;
}

export interface AgentActivity {
  agent_type: AgentType;
  label: string;
  status: string;
  action: string | null;
  progress: number;
  last_run: string | null;
  next_run: string | null;
  total_runs: number;
  total_errors: number;
  pending_tasks: number;
}

export interface TimelineEvent {
  time: string;
  icon: string;
  text: string;
  category: string;
}

export const AGENT_ICONS: Record<AgentType, string> = {
  job_discovery: "Search",
  resume_optimization: "FileText",
  ats_intelligence: "Target",
  opportunity_ranking: "BarChart3",
  company_intelligence: "Building2",
  salary_intelligence: "IndianRupee",
  learning: "GraduationCap",
  project_recommendation: "Lightbulb",
  interview_preparation: "MessageSquare",
  networking: "Users",
  notification: "Bell",
  weekly_report: "FileStack",
  career_strategy: "BrainCircuit",
};
