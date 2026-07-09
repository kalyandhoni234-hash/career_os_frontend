import { apiFetch } from "@/lib/api";
import type { AgentDashboardData, CareerAgent, AgentTask, AgentType, AgentBriefing } from "./types";
import type { Opportunity } from "@/app/opportunities/types";

export async function getAgentDashboard(): Promise<AgentDashboardData> {
  return apiFetch("/api/agents/dashboard") as Promise<AgentDashboardData>;
}

export async function getAgents(): Promise<{ agents: CareerAgent[] }> {
  return apiFetch("/api/agents") as Promise<{ agents: CareerAgent[] }>;
}

export async function getAgentTasks(): Promise<{ tasks: AgentTask[] }> {
  return apiFetch("/api/agents/tasks") as Promise<{ tasks: AgentTask[] }>;
}

export async function runAgent(agentType: AgentType): Promise<{ task_id: number; status: string; result?: unknown; error?: string }> {
  return apiFetch(`/api/agents/${agentType}/run`, { method: "POST" }) as Promise<{ task_id: number; status: string; result?: unknown; error?: string }>;
}

export async function pingAgents(): Promise<{ blueprint: string; status: string }> {
  return apiFetch("/api/agents/ping") as Promise<{ blueprint: string; status: string }>;
}

export async function getJobDiscoveryResults(): Promise<{ discovered: Opportunity[]; total: number }> {
  return apiFetch("/api/agents/job_discovery/results") as Promise<{ discovered: Opportunity[]; total: number }>;
}

export async function getBriefing(): Promise<AgentBriefing> {
  return apiFetch("/api/agents/briefing") as Promise<AgentBriefing>;
}
