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

export const STATUS_COLORS: Record<string, { header: string; dot: string; badge: string }> = {
  applied: { header: "border-l-accent bg-bg-surface", dot: "bg-accent", badge: "bg-accent/10 text-accent border-accent/20" },
  oa: { header: "border-l-warning bg-bg-surface", dot: "bg-warning", badge: "bg-warning/10 text-warning border-warning/20" },
  interview: { header: "border-l-accent bg-bg-surface", dot: "bg-accent ring-1 ring-accent/30", badge: "bg-accent/10 text-accent border-accent/20" },
  offer: { header: "border-l-success bg-bg-surface", dot: "bg-success", badge: "bg-success/10 text-success border-success/20" },
  rejected: { header: "border-l-danger bg-bg-surface", dot: "bg-danger", badge: "bg-danger/10 text-danger border-danger/20" },
};

export const STATUS_CHART_FILL: Record<string, string> = {
  applied: "var(--accent)",
  oa: "var(--warning)",
  interview: "var(--accent)",
  offer: "var(--success)",
  rejected: "var(--danger)",
};
