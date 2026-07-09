import { apiFetch } from "@/lib/api";
import type {
  CareerScoreResult,
  ActionPlanItem,
  RecommendationData,
  CareerDashboardData,
  CareerGoalData,
} from "./types";

export async function getCareerDashboard(): Promise<CareerDashboardData> {
  const data = await apiFetch("/api/career/dashboard");
  return {
    career_score: data.score,
    career_memory: {
      user_profile: {
        current_role: data.profile?.current_level || "Not set",
        years_of_experience: data.profile?.total_experience_entries || 0,
        top_skills: data.profile?.strong_skills || [],
        target_role: data.profile?.target_role || "Not set",
      },
      job_search_stats: {
        total_applied: data.profile?.applications_total || 0,
        total_interviews: data.profile?.interview_count || 0,
        total_offers: data.profile?.offer_count || 0,
        active_applications: (data.profile?.applications_total || 0) - (data.profile?.interview_count || 0),
      },
      learning_stats: {
        skills_learning: 0,
        completed_nodes: 0,
      },
    },
    recent_roadmaps: data.roadmaps || [],
    action_center: data.action_plan || [],
    skill_graph: data.skill_graph || {},
    recent_timeline: data.recent_timeline_events || [],
    goals: data.goals || [],
    recommendations: [],
  };
}

export async function getCareerScore(): Promise<CareerScoreResult> {
  const data = await apiFetch("/api/career/score");
  const score = data.score;
  if (!score || typeof score.overall_score !== "number") {
    console.error("[career/api] Malformed /api/career/score response", data);
    return {
      overall_score: 0,
      breakdown: { resume_score: 0, ats_score: 0, projects_score: 0, applications_score: 0, learning_score: 0, interview_score: 0, skill_coverage: 0, roadmap_bonus: 0 },
      snapshot_id: 0, timestamp: null,
    };
  }
  return score as CareerScoreResult;
}

export async function getGoals() {
  return apiFetch("/api/career/goals") as Promise<{ goals: CareerGoalData[] }>;
}

export async function getActionPlan() {
  return apiFetch("/api/career/action-center") as Promise<{ action_plan: ActionPlanItem[] }>;
}

export async function getSkillGraph() {
  return apiFetch("/api/career/skill-graph") as Promise<{ categories: { name: string; skills: { name: string; level: number }[] }[] }>;
}

export async function getSkillGaps(targetRole?: string) {
  const params = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : "";
  return apiFetch(`/api/career/skill-gaps${params}`) as Promise<{
    target_role: string;
    coverage: number;
    current_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
    required_skills: string[];
    learning_skills: Record<string, number>;
    graph: Record<string, number>;
    gaps: { skill: string; priority: number; recommended_project: string; estimated_ats_gain: number }[];
  }>;
}

export async function getRecommendations() {
  return apiFetch("/api/career/recommendations") as Promise<{ recommendations: RecommendationData[] }>;
}

export async function sendCareerContextMessage(message: string) {
  return apiFetch("/api/career/copilot/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  }) as Promise<{ response: string }>;
}
