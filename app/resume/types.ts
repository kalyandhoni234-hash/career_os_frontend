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
  created_at: string | null;
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
