export interface BasicInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string | null;
  gender: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  profile_picture: string;
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  branch: string;
  specialization: string;
  graduation_year: number | null;
  current_semester: number | null;
  cgpa: number | null;
  relevant_coursework: string[];
  achievements: string;
  order: number;
}

export interface CareerInfo {
  current_status: string;
  company: string;
  position: string;
  experience_years: number;
  employment_type: string;
  career_stage: string;
  stage_meta: Record<string, unknown>;
  experience_level: string;
  weekly_hours: number;
  career_goal: string;
}

export interface DreamCareer {
  dream_role: string;
  dream_company: string;
  preferred_industry: string;
  preferred_country: string;
  work_preference: string;
  salary_goal: string;
  target_joining_year: number | null;
}

export interface Skill {
  id?: number;
  name: string;
  experience_level: string;
  years_of_experience: number;
  confidence_rating: number;
}

export interface Interest {
  id?: number;
  name: string;
  is_custom: boolean;
}

export interface Language {
  id?: number;
  language: string;
  proficiency: string;
}

export interface SocialLink {
  id?: number;
  platform: string;
  url: string;
}

export interface ResumeFile {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  uploaded_at: string | null;
}

export interface Preferences {
  job_alerts: boolean;
  weekly_ai_review: boolean;
  email_notifications: boolean;
  public_profile: boolean;
  resume_visibility: string;
  theme_preference: string;
}

export interface CareerGoalSnapshot {
  id: number;
  title: string;
  target_role: string;
  target_company: string;
  progress: number;
  status: string;
  priority: number;
}

export interface WizardData {
  basic_info: BasicInfo;
  education: Education[];
  career_info: CareerInfo;
  dream_career: DreamCareer;
  skills: Skill[];
  interests: Interest[];
  languages: Language[];
  social_links: SocialLink[];
  resume_files: ResumeFile[];
  preferences: Preferences;
  completion_pct: number;
}

export interface ProfileDashboard extends WizardData {
  goals: CareerGoalSnapshot[];
}

export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  event_type: string;
  category: string;
  event_date: string | null;
  importance: number;
  status: string;
  tags: string[];
  related_goal_id: number | null;
  attachment_url: string | null;
  visibility: string;
  is_favorite: boolean;
  is_pinned: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export interface TimelineEventFormData {
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  importance: number;
  status: string;
  tags: string[];
  related_goal_id: number | null;
  attachment_url: string;
  visibility: string;
  is_favorite: boolean;
  is_pinned: boolean;
  metadata: Record<string, unknown>;
}

export interface GroupedTimeline {
  years: Record<string, Record<string, TimelineEvent[]>>;
  year_list: string[];
  total: number;
}

export interface TimelineStats {
  total: number;
  pinned: number;
  favorites: number;
  planned: number;
  in_progress: number;
  completed: number;
}

export interface CategoryCount {
  type: string;
  count: number;
}

export const TIMELINE_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  education: { label: "Education", icon: "GraduationCap", color: "#6366f1" },
  learning: { label: "Learning", icon: "BookOpen", color: "#8b5cf6" },
  project: { label: "Projects", icon: "FolderGit2", color: "#06b6d4" },
  career: { label: "Career", icon: "Briefcase", color: "#10b981" },
  coding: { label: "Coding", icon: "Code2", color: "#3b82f6" },
  achievement: { label: "Achievements", icon: "Trophy", color: "#f59e0b" },
  goal: { label: "Goals", icon: "Target", color: "#ef4444" },
  certificate: { label: "Certificates", icon: "Award", color: "#ec4899" },
  interview: { label: "Interviews", icon: "Users", color: "#14b8a6" },
  application: { label: "Applications", icon: "Send", color: "#f97316" },
  recommendation: { label: "Recommendations", icon: "Sparkles", color: "#a855f7" },
  resume: { label: "Resume", icon: "FileText", color: "#64748b" },
  offer: { label: "Offers", icon: "BadgeCheck", color: "#22c55e" },
  experience: { label: "Experience", icon: "Building2", color: "#0ea5e9" },
  custom: { label: "Custom", icon: "CalendarPlus", color: "#78716c" },
};

export const CAREER_STATUSES = [
  { value: "student", label: "Student" },
  { value: "fresher", label: "Fresher / Recent Graduate" },
  { value: "professional", label: "Working Professional" },
  { value: "switcher", label: "Career Switcher" },
];

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

export const WORK_PREFERENCES = ["Remote", "Hybrid", "On-site"];

export const PRESET_INTERESTS = [
  "AI", "Cybersecurity", "Cloud", "Backend", "Frontend",
  "Data Science", "Mobile", "Blockchain", "UI/UX",
  "Open Source", "Startups", "DevOps", "Machine Learning",
  "AR/VR", "Game Development", "IoT", "Quantum Computing",
  "Database Administration", "Network Engineering", "Product Management",
];

export const LANGUAGE_PROFICIENCIES = [
  { value: "native", label: "Native" },
  { value: "professional", label: "Professional" },
  { value: "intermediate", label: "Intermediate" },
  { value: "basic", label: "Basic" },
];

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0-2 years)" },
  { value: "intermediate", label: "Intermediate (2-5 years)" },
  { value: "advanced", label: "Advanced (5-8 years)" },
  { value: "expert", label: "Expert (8+ years)" },
];

export const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const EVENT_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

/** Known spoken languages for validation — prevents technical skills from being saved as languages. */
export const KNOWN_SPOKEN_LANGUAGES = new Set([
  "english", "spanish", "french", "german", "chinese", "mandarin", "japanese",
  "korean", "russian", "arabic", "portuguese", "italian", "dutch", "hindi",
  "bengali", "punjabi", "tamil", "telugu", "marathi", "urdu", "gujarati",
  "kannada", "malayalam", "odia", "nepali", "sanskrit", "persian", "farsi",
  "turkish", "vietnamese", "thai", "indonesian", "malay", "swahili",
  "hebrew", "greek", "polish", "romanian", "czech", "hungarian", "swedish",
  "norwegian", "danish", "finnish", "dutch", "belgian", "swiss", "australian",
  "broadcast", "sign language", "american sign language", "asl",
  "cantonese", "hokkien", "armenian", "georgian", "ukrainian", "serbian",
  "croatian", "bosnian", "bulgarian", "slovak", "slovenian", "lithuanian",
  "latvian", "estonian", "icelandic", "maltese", "albanian", "macedonian",
]);

/** Common technical keywords that should NOT be classified as languages. */
const TECH_KEYWORDS = [
  "api", "sdk", "framework", "library", "pipeline", "workflow", "automation",
  "agent", "llm", "gpt", "model", "inference", "deployment", "container",
  "kubernetes", "docker", "microservice", "database", "query", "sql",
  "nosql", "redis", "mongodb", "postgres", "graphql", "rest", "grpc",
  "javascript", "typescript", "python", "java", "golang", "rust", "c++",
  "react", "angular", "vue", "node", "express", "django", "flask",
  "tensorflow", "pytorch", "aws", "azure", "gcp", "terraform", "ansible",
  "jenkins", "ci/cd", "github", "gitlab", "jira", "confluence",
];

/** Returns true if the name looks like a genuine spoken language (not a technical skill). */
export function isValidSpokenLanguage(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 50) return false;
  const lower = trimmed.toLowerCase();
  if (KNOWN_SPOKEN_LANGUAGES.has(lower)) return true;
  // Reject if it contains technical keywords
  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw)) return false;
  }
  // Reject if it looks like a compound technical term (contains colons, parens, commas, etc.)
  if (/[:;,()&+/]/.test(trimmed)) return false;
  return true;
}

export const SOCIAL_PLATFORMS = [
  { value: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { value: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { value: "portfolio", label: "Portfolio", placeholder: "https://..." },
  { value: "leetcode", label: "LeetCode", placeholder: "https://leetcode.com/username" },
  { value: "hackerrank", label: "HackerRank", placeholder: "https://hackerrank.com/username" },
  { value: "codeforces", label: "Codeforces", placeholder: "https://codeforces.com/profile/username" },
  { value: "codechef", label: "CodeChef", placeholder: "https://codechef.com/users/username" },
  { value: "website", label: "Personal Website", placeholder: "https://..." },
];
