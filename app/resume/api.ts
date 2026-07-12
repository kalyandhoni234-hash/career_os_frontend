import { apiFetch, HttpError } from "@/lib/api";
import type { AtsResult } from "./types";

export { HttpError as AiHttpError };

export class AiError extends Error {
  type: string;
  retryable: boolean;
  statusCode: number;
  providerMessage: string;
  requestUrl: string;

  constructor(
    type: string,
    message: string,
    statusCode: number,
    retryable: boolean,
    providerMessage = "",
    requestUrl = "",
  ) {
    super(message);
    this.name = "AiError";
    this.type = type;
    this.retryable = retryable;
    this.statusCode = statusCode;
    this.providerMessage = providerMessage;
    this.requestUrl = requestUrl;
  }
}

interface ClassifyInput {
  message: string;
  status: number;
  body: unknown;
  url: string;
  raw: unknown;
}

function classifyAiError(input: ClassifyInput): AiError {
  const { message, status, body, url, raw } = input;
  const msg = message.toLowerCase();
  const isDev = process.env.NODE_ENV === "development";

  const providerMessage =
    body && typeof body === "object"
      ? String((body as Record<string, unknown>).error || (body as Record<string, unknown>).message || "")
      : "";

  if (isDev) {
    console.group(`[AI Error] ${url}`);
    console.error("Type: classify");
    console.error("Message:", message);
    console.error("Status:", status);
    console.error("Body:", body);
    if (raw instanceof Error && raw.stack) console.error("Stack:", raw.stack);
    console.groupEnd();
  }

  if (status === 401 || status === 403) {
    if (msg.includes("api key")) {
      return new AiError("invalid-api-key", "The AI API key is invalid. Contact your administrator.", status, false, providerMessage, url);
    }
    return new AiError("api-key-missing", "AI service is not configured. Contact your administrator to set up an API key.", status, false, providerMessage, url);
  }

  if (status === 429 || msg.includes("rate limit") || msg.includes("too many requests")) {
    return new AiError("rate-limited", "AI rate limit exceeded. Please wait a moment and try again.", status, true, providerMessage, url);
  }

  if (status === 502 || status === 503 || msg.includes("unavailable") || msg.includes("upstream") || msg.includes("provider")) {
    return new AiError("ai-unavailable", "AI service is temporarily unavailable. Please try again later.", status, true, providerMessage, url);
  }

  if (status === 400 || status === 422 || status === 404) {
    return new AiError("validation-error", message || "Invalid request. Please check your input.", status, false, providerMessage, url);
  }

  if (status === 0 && (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused") || msg.includes("timeout") || msg.includes("abort") || msg.includes("load"))) {
    return new AiError("network-error", "Network error. Check your internet connection and try again.", 0, true, message, url);
  }

  if (status >= 500) {
    return new AiError("server-error", "Something went wrong on our end. Please try again.", status, true, providerMessage, url);
  }

  return new AiError("server-error", "Something went wrong on our end. Please try again.", status || 500, true, message, url);
}

async function aiFetch<T>(fetchUrl: string, options: RequestInit = {}): Promise<T> {
  const isDev = process.env.NODE_ENV === "development";

  try {
    const data = await apiFetch<T>(fetchUrl, options);
    return data;
  } catch (err) {
    if (err instanceof HttpError) {
      throw classifyAiError({
        message: err.message,
        status: err.status,
        body: err.body,
        url: err.url,
        raw: err,
      });
    }

    if (err instanceof AiError) {
      throw err;
    }

    if (err instanceof Error) {
      throw classifyAiError({
        message: err.message,
        status: 0,
        body: null,
        url: fetchUrl,
        raw: err,
      });
    }

    const fallbackMsg = typeof err === "string" ? err : String(err);
    if (isDev) {
      console.warn("[aiFetch] Unrecognized error type:", typeof err, err);
    }
    throw classifyAiError({
      message: fallbackMsg,
      status: 0,
      body: err,
      url: fetchUrl,
      raw: err,
    });
  }
}

export async function generateResume() {
  return aiFetch<Record<string, unknown>>(
    "/api/resume/generate",
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function improveSummary(summary: string, tone: string, skills: string[]) {
  return aiFetch<{ result: string }>(
    "/api/resume/ai/improve-summary",
    { method: "POST", body: JSON.stringify({ summary, tone, skills }) },
  );
}

export async function atsOptimize(text: string, jobDescription?: string) {
  return aiFetch<{ optimized?: string; keywords_added?: string[]; changes?: string[] }>(
    "/api/resume/ai/ats-optimize",
    { method: "POST", body: JSON.stringify({ text, job_description: jobDescription }) },
  );
}

export async function computeAtsScore(jobDescription: string) {
  return aiFetch<AtsResult>(
    "/api/resume/ats-score",
    { method: "POST", body: JSON.stringify({ job_description: jobDescription }) },
  );
}

export async function tailorVersion(versionId: number, jobDescription: string) {
  return aiFetch<Record<string, unknown>>(
    `/api/resume/versions/${versionId}/tailor`,
    { method: "POST", body: JSON.stringify({ job_description: jobDescription }) },
  );
}

export async function changeTone(text: string, tone: string) {
  return aiFetch<{ result: string }>(
    "/api/resume/ai/change-tone",
    { method: "POST", body: JSON.stringify({ text, tone }) },
  );
}

export async function generateCoverLetter(company: string, role: string, jobDescription: string, tone: string) {
  return aiFetch<{ cover_letter: string }>(
    "/api/resume/cover-letter",
    { method: "POST", body: JSON.stringify({ company, role, job_description: jobDescription, tone }) },
  );
}
