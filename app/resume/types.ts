export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
  technologies: string[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  gpa: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url: string;
  github: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface ResumeData {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  title: string;
  website: string;
  linkedin: string;
  github: string;
  portfolio: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  certificates: Certificate[];
  achievements: string[];
  languages: Language[];
  publications: string[];
  tone: string;
  target_job_description: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface VersionInfo {
  id: number;
  version_name: string;
  target_role?: string;
  source?: string;
  ats_score?: number | null;
  notes?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface RecentActivityItem {
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AtsResult {
  overall_score: number | null;
  keyword_match: number;
  matched: string[];
  missing: string[];
  total_keywords: number;
  category_scores: Record<string, number>;
  action_verb_score: number;
  strong_verbs: string[];
  weak_verbs: string[];
  skills_density: number;
}

export interface SectionInfo {
  key: string;
  label: string;
  icon: string;
}

export const RESUME_SECTIONS: SectionInfo[] = [
  { key: "personal", label: "Personal", icon: "User" },
  { key: "summary", label: "Summary", icon: "FileText" },
  { key: "education", label: "Education", icon: "GraduationCap" },
  { key: "experience", label: "Experience", icon: "Briefcase" },
  { key: "projects", label: "Projects", icon: "Code2" },
  { key: "skills", label: "Skills", icon: "Wand2" },
  { key: "certificates", label: "Certificates", icon: "Award" },
  { key: "achievements", label: "Achievements", icon: "Trophy" },
  { key: "languages", label: "Languages", icon: "Globe" },
  { key: "publications", label: "Publications", icon: "BookOpen" },
];

export const TONES = [
  { value: "professional", label: "Professional" },
  { value: "student", label: "Student" },
  { value: "startup", label: "Startup" },
  { value: "faang", label: "FAANG" },
];

export type AiOperation =
  | "generate"
  | "improve"
  | "rewrite-summary"
  | "improve-bullets"
  | "optimize-ats"
  | "quantify"
  | "skills"
  | "tailor"
  | "cover-letter"
  | "ats-score"
  | "tailor-version";

export type AiErrorType =
  | "api-key-missing"
  | "invalid-api-key"
  | "rate-limited"
  | "network-error"
  | "ai-unavailable"
  | "validation-error"
  | "server-error"
  | "parse-error"
  | "unknown";

export const AI_ERROR_MESSAGES: Record<AiErrorType, { message: string; retryable: boolean }> = {
  "api-key-missing": { message: "AI service is not configured. Contact your administrator to set up an API key.", retryable: false },
  "invalid-api-key": { message: "The AI API key is invalid. Contact your administrator.", retryable: false },
  "rate-limited": { message: "AI rate limit exceeded. Please wait a moment and try again.", retryable: true },
  "network-error": { message: "Network error. Check your internet connection and try again.", retryable: true },
  "ai-unavailable": { message: "AI service is temporarily unavailable. Please try again later.", retryable: true },
  "validation-error": { message: "Invalid request. Please check your input and try again.", retryable: false },
  "server-error": { message: "Something went wrong on our end. Please try again.", retryable: true },
  "parse-error": { message: "Received an unexpected response. Please try again.", retryable: true },
  "unknown": { message: "Something went wrong. Please try again.", retryable: true },
};

export const AI_OPERATION_LABELS: Record<AiOperation, string> = {
  generate: "Resume Generation",
  improve: "Resume Improvement",
  "rewrite-summary": "Summary Rewrite",
  "improve-bullets": "Bullet Improvement",
  "optimize-ats": "ATS Optimization",
  quantify: "Quantification",
  skills: "AI Skill Suggestion",
  tailor: "Job Tailoring",
  "cover-letter": "Cover Letter Generation",
  "ats-score": "ATS Scoring",
  "tailor-version": "Version Tailoring",
};
