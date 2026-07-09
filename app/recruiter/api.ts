import { apiFetch } from "@/lib/api";
import type {
  RecruiterProfile, RecruiterDashboard, CandidateSearchResult, CandidateDetail,
  MatchResult, CandidatePreview, JobPostItem, JobPostDetail, Pipeline,
  CompanyData, RecruiterAnalytics, CandidateCompareItem, Invite, Notification,
} from "./types";

export async function recruiterSignup(data: {
  email: string; password: string; full_name?: string; company_name: string;
}) {
  return apiFetch("/api/recruiters/auth/signup", {
    method: "POST", body: JSON.stringify(data),
  });
}

export async function recruiterLogin(data: { email: string; password: string }) {
  return apiFetch("/api/recruiters/auth/login", {
    method: "POST", body: JSON.stringify(data),
  }) as Promise<{ message: string; user_id: number; role: string }>;
}

export async function getRecruiterMe() {
  return apiFetch("/api/recruiters/auth/me") as Promise<RecruiterProfile>;
}

export async function getRecruiterDashboard() {
  return apiFetch("/api/recruiters/dashboard") as Promise<RecruiterDashboard>;
}

export async function searchCandidates(params: Record<string, string | number | boolean | string[]>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return apiFetch(`/api/recruiters/candidates/search?${qs.toString()}`) as Promise<CandidateSearchResult>;
}

export async function getCandidateDetail(candidateId: number) {
  return apiFetch(`/api/recruiters/candidates/${candidateId}`) as Promise<{ candidate: CandidateDetail }>;
}

export async function getCandidateSummary(candidateId: number) {
  return apiFetch(`/api/recruiters/candidates/${candidateId}/summary`) as Promise<{ summary: string }>;
}

export async function getCandidateMatch(candidateId: number, data: {
  job_title?: string; job_description?: string; skills_required?: string[];
}) {
  return apiFetch(`/api/recruiters/candidates/${candidateId}/match`, {
    method: "POST", body: JSON.stringify(data),
  }) as Promise<{ match: MatchResult | null; reason?: string }>;
}

export async function saveCandidate(data: { candidate_id: number; pipeline_id?: number; notes?: string }) {
  return apiFetch("/api/recruiters/candidates/saved", {
    method: "POST", body: JSON.stringify(data),
  }) as Promise<{ message: string; saved_id: number }>;
}

export async function unsaveCandidate(savedId: number) {
  return apiFetch(`/api/recruiters/candidates/saved/${savedId}`, { method: "DELETE" });
}

export async function updateSavedCandidate(savedId: number, data: Record<string, unknown>) {
  return apiFetch(`/api/recruiters/candidates/saved/${savedId}`, {
    method: "PUT", body: JSON.stringify(data),
  });
}

export async function getSavedCandidates() {
  return apiFetch("/api/recruiters/candidates/saved") as Promise<{ saved_candidates: CandidatePreview[] }>;
}

export async function listPipelines() {
  return apiFetch("/api/recruiters/pipelines") as Promise<{ pipelines: Pipeline[] }>;
}

export async function createPipeline(data: { name: string; description?: string; color?: string }) {
  return apiFetch("/api/recruiters/pipelines", {
    method: "POST", body: JSON.stringify(data),
  }) as Promise<{ message: string; pipeline: Pipeline }>;
}

export async function deletePipeline(pipelineId: number) {
  return apiFetch(`/api/recruiters/pipelines/${pipelineId}`, { method: "DELETE" });
}

export async function listJobPosts() {
  return apiFetch("/api/recruiters/jobs") as Promise<{ jobs: JobPostItem[] }>;
}

export async function getJobPost(jobId: number) {
  return apiFetch(`/api/recruiters/jobs/${jobId}`) as Promise<{ job: JobPostDetail }>;
}

export async function createJobPost(data: Record<string, unknown>) {
  return apiFetch("/api/recruiters/jobs", {
    method: "POST", body: JSON.stringify(data),
  }) as Promise<{ message: string; job_id: number }>;
}

export async function updateJobPost(jobId: number, data: Record<string, unknown>) {
  return apiFetch(`/api/recruiters/jobs/${jobId}`, {
    method: "PUT", body: JSON.stringify(data),
  });
}

export async function deleteJobPost(jobId: number) {
  return apiFetch(`/api/recruiters/jobs/${jobId}`, { method: "DELETE" });
}

export async function getCompany() {
  return apiFetch("/api/recruiters/company") as Promise<CompanyData>;
}

export async function updateCompany(data: Record<string, unknown>) {
  return apiFetch("/api/recruiters/company", {
    method: "PUT", body: JSON.stringify(data),
  }) as Promise<{ message: string }>;
}

export async function getAnalytics() {
  return apiFetch("/api/recruiters/analytics") as Promise<RecruiterAnalytics>;
}

export async function compareCandidates(candidateIds: number[]) {
  return apiFetch("/api/recruiters/candidates/compare", {
    method: "POST", body: JSON.stringify({ candidate_ids: candidateIds }),
  }) as Promise<{ candidates: CandidateCompareItem[] }>;
}

export async function contactCandidate(candidateId: number, action: string) {
  return apiFetch(`/api/recruiters/candidates/${candidateId}/contact`, {
    method: "POST", body: JSON.stringify({ action }),
  });
}

export async function getInvites() {
  return apiFetch("/api/recruiters/invites") as Promise<{ invites: Invite[] }>;
}

export async function createInvite(data: {
  candidate_id: number; job_post_id?: number; message?: string;
  interview_type?: string; scheduled_date?: string; duration_minutes?: number; location?: string;
}) {
  return apiFetch("/api/recruiters/invites", {
    method: "POST", body: JSON.stringify(data),
  }) as Promise<{ message: string; invite_id: number }>;
}

export async function getNotifications() {
  return apiFetch("/api/recruiters/notifications") as Promise<{ notifications: Notification[] }>;
}

export async function markNotificationsRead(ids?: number[]) {
  return apiFetch("/api/recruiters/notifications/read", {
    method: "POST", body: JSON.stringify({ notification_ids: ids }),
  });
}
