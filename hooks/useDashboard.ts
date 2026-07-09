"use client";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface RecentActivity {
  type: "job" | "coach" | "resume";
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
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

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const summary = await apiFetch("/api/users/dashboard-summary");
      setData(summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
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
