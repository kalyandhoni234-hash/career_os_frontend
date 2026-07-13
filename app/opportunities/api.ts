import { apiFetch } from "@/lib/api";
import type {
  Opportunity, OpportunitySearchResult, MatchScore, SkillGap,
  SalaryEstimate, SavedOpportunity, InterviewPack, ApplicationReadiness,
  ResumeOptimization, CoverLetter, MarketTrends,
  CompanySearchResult, CompanyProfile, ApplicationHealth, AgentAction,
} from "./types";

export async function searchOpportunities(params: Record<string, string>): Promise<OpportunitySearchResult> {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/opportunities?${qs}`) as Promise<OpportunitySearchResult>;
}

export async function getOpportunity(id: number): Promise<{ opportunity: Opportunity; saved?: { id: number; list_type: string; notes: string | null; tags: string[] } }> {
  return apiFetch(`/api/opportunities/${id}`) as Promise<{ opportunity: Opportunity; saved?: { id: number; list_type: string; notes: string | null; tags: string[] } }>;
}

export async function getMatchScore(id: number, force = false): Promise<{ match_score: MatchScore }> {
  const qs = force ? "?force=true" : "";
  return apiFetch(`/api/opportunities/${id}/match${qs}`) as Promise<{ match_score: MatchScore }>;
}

export async function getSkillGaps(id: number, force = false): Promise<{ skill_gaps: SkillGap }> {
  const qs = force ? "?force=true" : "";
  return apiFetch(`/api/opportunities/${id}/skill-gaps${qs}`) as Promise<{ skill_gaps: SkillGap }>;
}

export async function getApplicationReadiness(id: number): Promise<{ readiness: ApplicationReadiness }> {
  return apiFetch(`/api/opportunities/${id}/application-readiness`) as Promise<{ readiness: ApplicationReadiness }>;
}

export async function saveOpportunity(id: number, data?: { list_type?: string; tags?: string[]; notes?: string }): Promise<{ message: string; saved_id?: number }> {
  return apiFetch(`/api/opportunities/${id}/save`, {
    method: "POST", body: JSON.stringify(data || { list_type: "saved" }),
  }) as Promise<{ message: string; saved_id?: number }>;
}

export async function updateSavedOpportunity(id: number, data: { list_type?: string; tags?: string[]; notes?: string; applied?: boolean; application_status?: string }): Promise<{ message: string }> {
  return apiFetch(`/api/opportunities/${id}/save`, {
    method: "PUT", body: JSON.stringify(data),
  }) as Promise<{ message: string }>;
}

export async function unsaveOpportunity(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/opportunities/${id}/save`, { method: "DELETE" }) as Promise<{ message: string }>;
}

export async function getSavedOpportunities(list_type?: string, includeScores = false): Promise<{ saved: SavedOpportunity[] }> {
  const params = new URLSearchParams();
  if (list_type) params.set("list_type", list_type);
  if (includeScores) params.set("include_scores", "true");
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/api/opportunities/saved${qs}`) as Promise<{ saved: SavedOpportunity[] }>;
}

export async function getInterviewPrep(id: number): Promise<{ interview_pack: InterviewPack }> {
  return apiFetch(`/api/opportunities/${id}/interview-prep`) as Promise<{ interview_pack: InterviewPack }>;
}

export async function optimizeResume(id: number): Promise<{ optimization: ResumeOptimization }> {
  return apiFetch(`/api/opportunities/${id}/optimize-resume`, { method: "POST" }) as Promise<{ optimization: ResumeOptimization }>;
}

export async function generateCoverLetter(id: number, tone = "professional"): Promise<{ cover_letter: CoverLetter }> {
  return apiFetch(`/api/opportunities/${id}/cover-letter`, {
    method: "POST", body: JSON.stringify({ tone }),
  }) as Promise<{ cover_letter: CoverLetter }>;
}

export async function getSalaryEstimate(role: string, location?: string, skills?: string): Promise<{ salary: SalaryEstimate }> {
  const params = new URLSearchParams({ role });
  if (location) params.set("location", location);
  if (skills) params.set("skills", skills);
  return apiFetch(`/api/opportunities/salary?${params.toString()}`) as Promise<{ salary: SalaryEstimate }>;
}

export async function getMarketTrends(): Promise<{ trends: MarketTrends }> {
  return apiFetch("/api/opportunities/market-trends") as Promise<{ trends: MarketTrends }>;
}

export async function getOpportunityRecommendations(): Promise<{ recommendations: { opportunity: Opportunity; match_score: MatchScore }[] }> {
  return apiFetch("/api/opportunities/recommendations") as Promise<{ recommendations: { opportunity: Opportunity; match_score: MatchScore }[] }>;
}

export async function searchCompanies(query: string): Promise<CompanySearchResult> {
  return apiFetch(`/api/opportunities/companies?q=${encodeURIComponent(query)}`) as Promise<CompanySearchResult>;
}

export async function getCompany(name: string): Promise<{ company: CompanyProfile }> {
  return apiFetch(`/api/opportunities/companies/${encodeURIComponent(name)}`) as Promise<{ company: CompanyProfile }>;
}

export async function getAllHealthScores(): Promise<{ health_scores: ApplicationHealth[] }> {
  return apiFetch("/api/opportunities/health/all") as Promise<{ health_scores: ApplicationHealth[] }>;
}

export async function getHealthScore(oppId: number): Promise<{ health: ApplicationHealth }> {
  return apiFetch(`/api/opportunities/${oppId}/health`) as Promise<{ health: ApplicationHealth }>;
}

export async function getAgentActions(opportunityId?: number): Promise<{ top_recommendation: AgentAction | null; tasks: AgentAction[]; reasoning: string[]; message: string | null }> {
  const qs = opportunityId ? `?opportunity_id=${opportunityId}` : "";
  return apiFetch(`/api/opportunities/agent/actions${qs}`) as Promise<{ top_recommendation: AgentAction | null; tasks: AgentAction[]; reasoning: string[]; message: string | null }>;
}

export async function getIntelligence(): Promise<{
  total_jobs: number;
  skill_frequency: Record<string, number>;
  recommendations: { skill: string; priority: string; appears_in_pct: number; reason: string }[];
  aggregated_missing_skills: Record<string, number>;
  top_companies: { name: string; count: number }[];
  top_locations: { name: string; count: number }[];
  top_titles: { title: string; count: number }[];
  employment_type_distribution: Record<string, number>;
  remote_type_distribution: Record<string, number>;
  salary_distribution: { role: string; min: number; avg: number; max: number }[];
  summary: string;
  user_skills: string[];
}> {
  return apiFetch("/api/opportunities/intelligence") as Promise<any>;
}
