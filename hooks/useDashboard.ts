"use client";
import { useEffect, useState, useCallback, startTransition } from "react";
import { apiFetch } from "@/lib/api";

export interface RecentActivity {
  type: "job" | "coach" | "resume";
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface DashboardData {
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
  recent_activity: RecentActivity[];
}

function normalize(raw: Record<string, unknown>): DashboardData {
  return {
    email: (raw.email as string) || "",
    name: (raw.name as string) || "",
    has_resume: !!raw.has_resume,
    resume_summary_set: !!raw.resume_summary_set,
    profile_completeness: (raw.profile_completeness as number) || 0,
    resume_skills: Array.isArray(raw.resume_skills) ? raw.resume_skills as string[] : [],
    active_applications: (raw.active_applications as number) || 0,
    offers: (raw.offers as number) || 0,
    total_applications: (raw.total_applications as number) || 0,
    jobs_by_status: (raw.jobs_by_status && typeof raw.jobs_by_status === "object" ? raw.jobs_by_status : {}) as Record<string, number>,
    upcoming_deadlines: Array.isArray(raw.upcoming_deadlines) ? raw.upcoming_deadlines as { company: string; role: string; deadline: string; id: number; status: string }[] : [],
    last_coach_message: (raw.last_coach_message as string) || null,
    last_coach_message_at: (raw.last_coach_message_at as string) || null,
    recent_activity: Array.isArray(raw.recent_activity) ? raw.recent_activity as RecentActivity[] : [],
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const summary = await apiFetch("/api/users/dashboard-summary");
      setData(normalize(summary));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => { fetch(); });
  }, [fetch]);

  const careerScore = (() => {
    if (!data) return 0;
    const profileScore = data.profile_completeness * 0.3;
    const items = [data.has_resume, data.resume_summary_set, data.resume_skills.length > 0];
    const resumeHealth = (items.filter(Boolean).length / items.length) * 100;
    const resumeScore = resumeHealth * 0.3;
    const appScore = Math.min(data.total_applications * 5, 100) * 0.25;
    const interviewScore = Math.min(
      ((data.jobs_by_status.interview || 0) + (data.jobs_by_status.offer || 0)) * 10,
      100
    ) * 0.15;
    return Math.round(profileScore + resumeScore + appScore + interviewScore);
  })();

  return { data, loading, error, careerScore, refetch: fetch };
}
