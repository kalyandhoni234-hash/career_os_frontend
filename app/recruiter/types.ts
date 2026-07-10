export interface RecruiterProfile {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  title: string;
  phone: string | null;
  linkedin: string | null;
  department: string | null;
  company: {
    id: number;
    name: string;
    website: string | null;
    logo_url: string | null;
    industry: string | null;
    description: string | null;
    company_size: string | null;
  } | null;
}

export interface RecruiterDashboard {
  total_candidates: number;
  active_jobs: number;
  saved_candidates: number;
  total_jobs: number;
  pending_invites: number;
  total_invites: number;
  total_views: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  type: string;
  description: string;
  timestamp: string | null;
}

export interface CandidatePreview {
  user_id: number;
  saved_id?: number;
  pipeline_name?: string;
  pipeline_color?: string;
  email: string;
  full_name: string;
  title?: string;
  skills: string[];
  ats_score: number | null;
  projects_count: number;
  certifications_count: number;
  location: string | null;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
  education: string | null;
  degree: string | null;
  graduation_year: number | null;
  experience: string | null;
  has_resume: boolean;
  created_at: string | null;
}

export interface CandidateSearchResult {
  candidates: CandidatePreview[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CandidateDetail {
  user_id: number;
  email: string;
  created_at: string | null;
  education: string | null;
  degree: string | null;
  graduation_year: number | null;
  country: string | null;
  preferred_roles: string[] | null;
  skills: string[] | null;
  experience: string | null;
  languages: string[] | null;
  interests: string[] | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  resume: ResumeData | null;
  has_resume: boolean;
  ats_score: number | null;
  career_score: CareerScoreData | null;
}

export interface ResumeData {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  title: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  experience: ResumeEntry[] | null;
  education: EducationEntry[] | null;
  projects: ProjectEntry[] | null;
  skills: string[] | null;
  certificates: CertificateEntry[] | null;
  achievements: string[] | null;
  languages: string[] | null;
  target_job_description: string | null;
  tone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ResumeEntry {
  role: string;
  company: string;
  location?: string;
  start?: string;
  end?: string;
  current?: boolean;
  description?: string;
  technologies?: string[];
}

export interface EducationEntry {
  degree: string;
  field?: string;
  school: string;
  location?: string;
  start?: string;
  end?: string;
  gpa?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
}

export interface CertificateEntry {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface CareerScoreData {
  overall: number;
  resume: number;
  projects: number;
  skill_coverage: number;
  breakdown: Record<string, unknown> | null;
}

export interface MatchResult {
  match_score: number;
  strengths: string[];
  gaps: string[];
  reason: string;
}

export interface JobPostItem {
  id: number;
  title: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  skills_required: string[] | null;
  status: string;
  is_remote: boolean;
  candidate_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface JobPostDetail {
  id: number;
  title: string;
  description: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  experience_required: string | null;
  experience_max: string | null;
  employment_type: string | null;
  skills_required: string[] | null;
  benefits: string[] | null;
  application_deadline: string | null;
  status: string;
  is_remote: boolean;
  candidate_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Pipeline {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  candidate_count: number;
  created_at: string | null;
}

export interface CompanyData {
  id: number;
  name: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  industry: string | null;
  headquarters: string | null;
  company_size: string | null;
  founded_year: number | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  culture_description: string | null;
  benefits_description: string | null;
}

export interface RecruiterAnalytics {
  total_candidates_viewed: number;
  invites_sent: number;
  invites_accepted: number;
  invites_pending: number;
  invites_rejected: number;
  interview_rate: number;
  acceptance_rate: number;
  total_students: number;
  average_ats_score: number;
  top_colleges: { name: string; count: number }[];
  top_skills: { name: string; count: number }[];
}

export interface CandidateCompareItem {
  user_id: number;
  full_name: string;
  skills: string[];
  ats_score: number | null;
  career_score: number | null;
  education: string | null;
  degree: string | null;
  projects_count: number;
  certifications_count: number;
  location: string | null;
  has_resume: boolean;
}

export interface Invite {
  id: number;
  candidate_id: number;
  candidate_name: string;
  job_post_id: number | null;
  job_title: string | null;
  message: string | null;
  interview_type: string | null;
  scheduled_date: string | null;
  duration_minutes: number | null;
  location: string | null;
  status: string;
  created_at: string | null;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string | null;
}
