import { apiFetch } from "@/lib/api";

export interface InterviewRecord {
  id: number;
  opportunity_id: number | null;
  company: string;
  role: string;
  interview_type: string;
  round: number | null;
  date: string | null;
  questions_asked: string[];
  answers_given: string[];
  feedback: string | null;
  mistakes: string[];
  coding_problems: string[];
  behavioral_questions: string[];
  lessons_learned: string[];
  resources: string[];
  tags: string[];
  difficulty_rating: number | null;
  offer_received: boolean | null;
  notes: string | null;
  created_at: string | null;
}

export async function listInterviews(params?: { opportunity_id?: number; company?: string; page?: number; per_page?: number }): Promise<{ interviews: InterviewRecord[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.opportunity_id) qs.set("opportunity_id", String(params.opportunity_id));
  if (params?.company) qs.set("company", params.company);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/api/knowledge/interviews${query}`) as Promise<{ interviews: InterviewRecord[]; total: number }>;
}

export async function getInterview(id: number): Promise<{ interview: InterviewRecord }> {
  return apiFetch(`/api/knowledge/interviews/${id}`) as Promise<{ interview: InterviewRecord }>;
}

export async function createInterview(data: Partial<InterviewRecord>): Promise<{ interview: InterviewRecord }> {
  return apiFetch("/api/knowledge/interviews", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<{ interview: InterviewRecord }>;
}

export async function updateInterview(id: number, data: Partial<InterviewRecord>): Promise<{ interview: InterviewRecord }> {
  return apiFetch(`/api/knowledge/interviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<{ interview: InterviewRecord }>;
}

export async function deleteInterview(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/knowledge/interviews/${id}`, { method: "DELETE" }) as Promise<{ message: string }>;
}

export async function getTopicsByCompany(): Promise<{ topics_by_company: Record<string, string[]> }> {
  return apiFetch("/api/knowledge/interviews/topics-by-company") as Promise<{ topics_by_company: Record<string, string[]> }>;
}

export async function getInterviewStats(): Promise<{ stats: { total: number; by_type: Record<string, number>; offer_rate: number; avg_difficulty: number } }> {
  return apiFetch("/api/knowledge/interviews/stats") as Promise<{ stats: { total: number; by_type: Record<string, number>; offer_rate: number; avg_difficulty: number } }>;
}
