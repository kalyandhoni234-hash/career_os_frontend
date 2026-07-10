import { apiFetch } from "@/lib/api";
import type {
  WizardData,
  ProfileDashboard,
  Education,
  Skill,
  Interest,
  Language,
  SocialLink,
  TimelineEvent,
  TimelineEventFormData,
  GroupedTimeline,
  TimelineStats,
  CategoryCount,
} from "./types";

// ── Profile Wizard ──────────────────────────────────────────

export async function getWizardData(): Promise<WizardData> {
  return apiFetch("/api/profile/wizard");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveWizardStep(step: string, data: any): Promise<{ message: string; completion_pct: number }> {
  return apiFetch(`/api/profile/wizard/${step}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getProfileDashboard(): Promise<ProfileDashboard> {
  return apiFetch("/api/profile/dashboard");
}

export async function updateProfileSection(section: string, fields: Record<string, unknown>): Promise<{ message: string; completion_pct: number }> {
  return apiFetch("/api/profile/update", {
    method: "PUT",
    body: JSON.stringify({ section, fields }),
  });
}

// ── Education ────────────────────────────────────────────────

export async function createEducation(data: Partial<Education>): Promise<Education> {
  return apiFetch("/api/profile/education", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEducation(id: number, data: Partial<Education>): Promise<{ message: string }> {
  return apiFetch(`/api/profile/education/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEducation(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/profile/education/${id}`, { method: "DELETE" });
}

export async function reorderEducation(order: Record<string, number>): Promise<{ message: string }> {
  return apiFetch("/api/profile/education/reorder", {
    method: "PUT",
    body: JSON.stringify({ order }),
  });
}

// ── Skills ───────────────────────────────────────────────────

export async function createSkill(data: Partial<Skill>): Promise<Skill> {
  return apiFetch("/api/profile/skills", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSkill(id: number, data: Partial<Skill>): Promise<{ message: string }> {
  return apiFetch(`/api/profile/skills/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSkill(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/profile/skills/${id}`, { method: "DELETE" });
}

// ── Interests ────────────────────────────────────────────────

export async function createInterest(data: Partial<Interest>): Promise<Interest> {
  return apiFetch("/api/profile/interests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function batchInterests(names: string[]): Promise<{ message: string }> {
  return apiFetch("/api/profile/interests/batch", {
    method: "PUT",
    body: JSON.stringify({ interests: names }),
  });
}

export async function deleteInterest(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/profile/interests/${id}`, { method: "DELETE" });
}

// ── Languages ────────────────────────────────────────────────

export async function createLanguage(data: Partial<Language>): Promise<Language> {
  return apiFetch("/api/profile/languages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLanguage(id: number, data: Partial<Language>): Promise<{ message: string }> {
  return apiFetch(`/api/profile/languages/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLanguage(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/profile/languages/${id}`, { method: "DELETE" });
}

// ── Social Links ─────────────────────────────────────────────

export async function createSocialLink(data: Partial<SocialLink>): Promise<SocialLink> {
  return apiFetch("/api/profile/social-links", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSocialLink(id: number, data: Partial<SocialLink>): Promise<{ message: string }> {
  return apiFetch(`/api/profile/social-links/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSocialLink(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/profile/social-links/${id}`, { method: "DELETE" });
}

// ── Resume Upload ────────────────────────────────────────────

export async function uploadResume(file: File): Promise<{ id: number; filename: string; original_filename: string; file_size: number; file_type: string; uploaded_at: string | null }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/profile/resume/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return response.json();
}

export async function deleteResume(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/profile/resume/${id}`, { method: "DELETE" });
}

// ── Timeline ─────────────────────────────────────────────────

export async function getTimelineEvents(params?: { category?: string; status?: string; search?: string; favorite?: string; pinned?: string; sort?: string; limit?: number; offset?: number }): Promise<{ events: TimelineEvent[]; total: number; limit: number; offset: number; has_more: boolean }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/api/timeline/events${qs ? `?${qs}` : ""}`);
}

export async function getGroupedTimeline(params?: { category?: string; status?: string; search?: string }): Promise<GroupedTimeline> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/api/timeline/grouped${qs ? `?${qs}` : ""}`);
}

export async function getTimelineEvent(id: number): Promise<{ event: TimelineEvent }> {
  return apiFetch(`/api/timeline/events/${id}`);
}

export async function createTimelineEvent(data: Partial<TimelineEventFormData>): Promise<{ event: TimelineEvent }> {
  return apiFetch("/api/timeline/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTimelineEvent(id: number, data: Partial<TimelineEventFormData>): Promise<{ event: TimelineEvent }> {
  return apiFetch(`/api/timeline/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTimelineEvent(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/timeline/events/${id}`, { method: "DELETE" });
}

export async function duplicateTimelineEvent(id: number): Promise<{ event: TimelineEvent }> {
  return apiFetch(`/api/timeline/events/${id}/duplicate`, { method: "POST" });
}

export async function togglePinEvent(id: number): Promise<{ is_pinned: boolean }> {
  return apiFetch(`/api/timeline/events/${id}/pin`, { method: "POST" });
}

export async function toggleFavoriteEvent(id: number): Promise<{ is_favorite: boolean }> {
  return apiFetch(`/api/timeline/events/${id}/favorite`, { method: "POST" });
}

export async function reorderTimelineEvents(order: Record<string, number>): Promise<{ message: string }> {
  return apiFetch("/api/timeline/events/reorder", {
    method: "PUT",
    body: JSON.stringify({ order }),
  });
}

export async function getTimelineCategories(): Promise<{ categories: CategoryCount[]; total: number }> {
  return apiFetch("/api/timeline/categories");
}

export async function getTimelineStats(): Promise<TimelineStats> {
  return apiFetch("/api/timeline/stats");
}
