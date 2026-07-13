import { apiFetch } from "@/lib/api";

export interface Contact {
  id: number;
  opportunity_id: number | null;
  name: string;
  role: string | null;
  company: string | null;
  email: string | null;
  linkedin_url: string | null;
  phone: string | null;
  relationship: string;
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  status: string;
  created_at: string | null;
  interactions?: Interaction[];
}

export interface Interaction {
  id: number;
  interaction_type: string;
  notes: string | null;
  outcome: string | null;
  occurred_at: string | null;
}

export interface NetworkingHealth {
  health_score: number;
  total_contacts: number;
  active_contacts: number;
  contacted_recently: number;
  with_upcoming_follow_up: number;
  relationship_diversity: number;
  breakdown: Record<string, number>;
}

export async function listContacts(params?: { opportunity_id?: number; relationship?: string; status?: string; page?: number; per_page?: number }): Promise<{ contacts: Contact[]; total: number; page: number; per_page: number }> {
  const qs = new URLSearchParams();
  if (params?.opportunity_id) qs.set("opportunity_id", String(params.opportunity_id));
  if (params?.relationship) qs.set("relationship", params.relationship);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/api/relationships${query}`) as Promise<{ contacts: Contact[]; total: number; page: number; per_page: number }>;
}

export async function getContact(id: number): Promise<{ contact: Contact }> {
  return apiFetch(`/api/relationships/${id}`) as Promise<{ contact: Contact }>;
}

export async function createContact(data: Partial<Contact>): Promise<{ contact: Contact }> {
  return apiFetch("/api/relationships", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<{ contact: Contact }>;
}

export async function updateContact(id: number, data: Partial<Contact>): Promise<{ contact: Contact }> {
  return apiFetch(`/api/relationships/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<{ contact: Contact }>;
}

export async function deleteContact(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/relationships/${id}`, { method: "DELETE" }) as Promise<{ message: string }>;
}

export async function logInteraction(contactId: number, data: { interaction_type: string; notes?: string; outcome?: string; occurred_at?: string }): Promise<{ interaction: Interaction }> {
  return apiFetch(`/api/relationships/${contactId}/interactions`, {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<{ interaction: Interaction }>;
}

export async function getNetworkingHealth(): Promise<{ health: NetworkingHealth }> {
  return apiFetch("/api/relationships/health") as Promise<{ health: NetworkingHealth }>;
}

export async function getDueFollowUps(): Promise<{ follow_ups: Contact[] }> {
  return apiFetch("/api/relationships/follow-ups") as Promise<{ follow_ups: Contact[] }>;
}
