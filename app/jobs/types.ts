export interface Job {
  id: number;
  company: string;
  role: string;
  status: string;
  salary: string | null;
  recruiter: string | null;
  notes: string | null;
  deadline: string | null;
  job_link: string | null;
  priority: string;
  next_action: string | null;
  resume_version: string | null;
  ats_score: number | null;
  location: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface JobFormData {
  company: string;
  role: string;
  status: string;
  salary: string;
  deadline: string;
  job_link: string;
  priority: string;
  next_action: string;
  resume_version: string;
  location: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: string;
  action: string;
  link: string | null;
  score_impact: string;
}

export interface DashboardSummary {
  email: string;
  name: string;
  has_resume: boolean;
  resume_summary_set: boolean;
  profile_completeness: number;
  resume_skills: string[];
  active_applications: number;
  offers: number;
  total_applications: number;
  jobs_by_status: Record<string, number>;
  upcoming_deadlines: { company: string; role: string; deadline: string; id: number; status: string }[];
  last_coach_message: string | null;
  last_coach_message_at: string | null;
  recent_activity: { type: string; description: string; timestamp: string; metadata: Record<string, unknown> }[];
}

export const STATUSES = ["applied", "oa", "interview", "offer", "rejected"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  oa: "Online Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  applied: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  oa: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  interview: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  offer: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
};
