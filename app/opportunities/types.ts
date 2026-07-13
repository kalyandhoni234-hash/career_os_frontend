export interface Opportunity {
  id: number;
  title: string;
  company_name: string;
  company_logo: string | null;
  company_url: string | null;
  location: string | null;
  remote_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  salary_period: string;
  employment_type: string;
  experience_required: number | null;
  experience_max: number | null;
  tech_stack: string[];
  posted_at: string | null;
  created_at: string | null;
  description?: string | null;
  requirements?: string[];
  responsibilities?: string[];
  expires_at?: string | null;
  provider: string;
  url: string | null;
  company_profile?: CompanyProfile;
}

export interface CompanyProfile {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  headquarters: string | null;
  company_size: string | null;
  founded_year: number | null;
  tech_stack: string[];
  interview_difficulty: string | null;
  glassdoor_rating: number | null;
  indeed_rating: number | null;
  active_jobs_count?: number;
  products?: string[];
  hiring_trends?: string;
  recent_news?: string[];
  engineering_culture?: string;
  application_tips?: string;
  expected_salary?: string;
  interview_process?: string[];
  linkedin_url?: string | null;
}

export interface MatchScore {
  id: number;
  opportunity_id: number;
  overall_score: number;
  ats_match: number;
  resume_match: number;
  skill_match: number;
  experience_match: number;
  project_match: number;
  goal_match: number;
  location_match: number;
  salary_match: number;
  explanation: Record<string, string>;
  created_at: string | null;
}

export interface SkillGap {
  id: number;
  opportunity_id: number;
  missing_skills: string[];
  current_skills: string[];
  required_skills: string[];
  ats_gain_estimates: Record<string, number>;
  coverage_pct: number;
  priority: string;
}

export interface SalaryEstimate {
  salary_min: number;
  salary_max: number;
  market_avg: number;
  currency: string;
  location_diff: number;
  experience_diff: number;
  skill_premium: Record<string, number>;
  confidence: number;
  source: string;
}

export interface SavedOpportunity {
  saved_id: number;
  list_type: string;
  tags: string[];
  notes: string | null;
  applied_at: string | null;
  application_status: string | null;
  created_at: string | null;
  match_score?: {
    overall_score: number;
    ats_match: number;
    skill_match: number;
    experience_match: number;
  };
  opportunity: {
    id: number;
    title: string;
    company_name: string;
    company_logo: string | null;
    location: string | null;
    remote_type: string | null;
    salary_min: number | null;
    salary_max: number | null;
    currency: string;
    employment_type: string;
    tech_stack: string[];
  };
}

export interface ApplicationHealth {
  opportunity_id: number;
  health_score: number;
  summary: string;
  factors?: Record<string, { score: number; weight: number; reasons: string[] }>;
  top_improvements?: string[];
}

export interface AgentAction {
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  category: string;
  estimated_time_minutes: number;
  impact: string;
  deadline: string;
  reason: string;
  opportunity_id?: number;
}

export interface InterviewPack {
  id: number;
  opportunity_id: number;
  likely_questions: InterviewQuestion[];
  coding_topics: TopicItem[];
  behavioral_questions: BehavioralQuestion[];
  system_design_topics: TopicItem[];
  company_questions: CompanyQuestion[];
  preparation_checklist: string[];
  learning_resources: ResourceItem[];
  created_at: string | null;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  preparation_tip: string;
}

export interface TopicItem {
  topic: string;
  importance: number;
  description: string;
}

export interface BehavioralQuestion {
  question: string;
  framework: string;
  key_points: string[];
}

export interface CompanyQuestion {
  question: string;
  context: string;
}

export interface ResourceItem {
  topic: string;
  resource_type: string;
  description: string;
}

export interface ApplicationReadiness {
  verdict: "ready" | "ready_with_caveats" | "almost_ready" | "not_ready";
  message: string;
  checks: ReadinessCheck[];
  overall_score: number;
}

export interface ReadinessCheck {
  check: string;
  status: "pass" | "warn" | "fail" | "info";
  message: string;
}

export interface ResumeOptimization {
  version_id: number;
  optimized_summary: string;
  added_keywords: string[];
  skill_additions: string[];
  suggested_experience_rewrites: {
    index: number;
    bullets: string[];
  }[];
  ats_improvement_estimate: number;
  company_name: string;
  role: string;
}

export interface CoverLetter {
  subject: string;
  body: string;
  salutation: string;
  closing: string;
}

export interface CardMatchData {
  overall_score: number;
  ats_match?: number;
  skill_match?: number;
  experience_match?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  ats_gain_estimates?: Record<string, number>;
  explanation?: Record<string, string>;
}

export interface SmartFilterConfig {
  minMatchScore: number;
  atsReady: boolean;
  interviewReady: boolean;
}

export interface SearchFilters {
  q: string;
  location: string;
  remote_type: string;
  employment_type: string;
  salary_min: string;
  salary_max: string;
  experience_min: string;
  experience_max: string;
  company: string;
  tech_stack: string;
  sort_by: string;
  sort_order: string;
}

export interface OpportunitySearchResult {
  opportunities: Opportunity[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface MarketTrends {
  [trend_type: string]: {
    title: string;
    value: string;
    growth_pct: number;
    period: string | null;
    category: string | null;
  }[];
}

export interface CompanySearchResult {
  companies: {
    id: number;
    name: string;
    logo_url: string | null;
    website: string | null;
    industry: string | null;
    headquarters: string | null;
    company_size: string | null;
    linkedin_url: string | null;
  }[];
  total: number;
  page: number;
  per_page: number;
}
