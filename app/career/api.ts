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
    career_memory: data.career_memory || {},
    recent_roadmaps: data.roadmaps || [],
    action_center: data.action_plan || [],
    skill_graph: data.skill_graph || {},
    recent_timeline: data.recent_timeline_events || [],
    goals: data.goals || [],
    recommendations: data.recommendations || [],
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
    analysis: { target_role: string; coverage: number; matched_skills: string[]; missing_skills: string[]; gaps: { skill: string; priority: number; recommended_project: string | null; estimated_ats_gain: number }[] } | null;
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
