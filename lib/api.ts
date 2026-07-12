import { getCsrfToken, clearCsrfToken } from "./csrf";

export class HttpError extends Error {
  status: number;
  body: unknown;
  url: string;
  method: string;
  errorCode: string;

  constructor(message: string, status: number, url: string, body: unknown, method: string = "GET") {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
    this.url = url;
    this.method = method;
    this.errorCode =
      body && typeof body === "object" && !Array.isArray(body)
        ? ((body as Record<string, unknown>).code as string) || ""
        : "";
  }
}

interface NormalizedError {
  message: string;
  status: number;
  url: string;
  method: string;
  body: unknown;
  code: string;
  raw: unknown;
  stack: string | undefined;
}

function normalizeError(err: unknown, url: string, method: string = "GET"): NormalizedError {
  const extractCode = (b: unknown): string =>
    b && typeof b === "object" && !Array.isArray(b)
      ? ((b as Record<string, unknown>).code as string) || ""
      : "";

  if (err instanceof HttpError) {
    return {
      message: err.message,
      status: err.status,
      url: err.url,
      method: err.method,
      body: err.body,
      code: err.errorCode,
      raw: err,
      stack: err.stack,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message || String(err),
      status: 0,
      url,
      method,
      body: null,
      code: "",
      raw: err,
      stack: err.stack,
    };
  }

  if (err instanceof Response) {
    return {
      message: `HTTP ${err.status} ${err.statusText}`,
      status: err.status,
      url: err.url || url,
      method,
      body: null,
      code: "",
      raw: err,
      stack: undefined,
    };
  }

  if (typeof err === "string") {
    return {
      message: err,
      status: 0,
      url,
      method,
      body: null,
      code: "",
      raw: err,
      stack: undefined,
    };
  }

  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    return {
      message: typeof obj.message === "string" ? obj.message : String(err),
      status: typeof obj.status === "number" ? obj.status : 0,
      url: typeof obj.url === "string" ? obj.url : url,
      method,
      body: obj,
      code: extractCode(obj),
      raw: err,
      stack: typeof obj.stack === "string" ? obj.stack : undefined,
    };
  }

  return {
    message: String(err),
    status: 0,
    url,
    method,
    body: null,
    code: "",
    raw: err,
    stack: undefined,
  };
}

function logError(norm: NormalizedError, isDev: boolean): void {
  if (!isDev) return;
  console.group(`[API Error] ${norm.method} ${norm.url}`);
  console.error("Status:", norm.status);
  console.error("Message:", norm.message);
  console.error("Error Code:", norm.code || "(none)");
  console.error("Body:", norm.body);
  if (norm.stack) console.error("Stack:", norm.stack);
  console.groupEnd();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = path.startsWith("http") ? path : `${window.location.origin}${path}`;
  const isDev = process.env.NODE_ENV === "development";
  const isMutating = CSRF_METHODS.has(method);

  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = options.body instanceof FormData;

  let csrfToken: string | null = null;
  if (isMutating) {
    csrfToken = await getCsrfToken();
  }

  const userHeaders = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : Array.isArray(options.headers)
      ? Object.fromEntries(options.headers)
      : ({ ...options.headers } as Record<string, string>);

  const headers: Record<string, string> = {};
  if (hasBody && !isFormData) headers["Content-Type"] = "application/json";
  Object.assign(headers, userHeaders);
  if (isMutating && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (err) {
    const norm = normalizeError(err, url, method);
    logError(norm, isDev);
    throw new HttpError(
      norm.message || "Network error. Check your internet connection.",
      norm.status,
      url,
      norm.body,
      method,
    );
  }

  if (!response.ok) {
    const body = await parseResponseBody(response);
    const code =
      body && typeof body === "object" && !Array.isArray(body)
        ? ((body as Record<string, unknown>).code as string) || ""
        : "";

    if (response.status === 403 && code === "INVALID_CSRF_TOKEN") {
      clearCsrfToken();
      const newToken = await getCsrfToken();
      if (newToken) {
        headers["X-CSRF-Token"] = newToken;
        try {
          response = await fetch(path, {
            ...options,
            credentials: "include",
            headers,
          });
          if (response.ok) {
            const retryBody = await parseResponseBody(response);
            if (isDev) {
              console.log(`[API] ${method} ${url} → ${response.status} (CSRF retry)`, retryBody);
            }
            return retryBody as T;
          }
          const retryBody = await parseResponseBody(response);
          const message =
            retryBody && typeof retryBody === "object" && !Array.isArray(retryBody)
              ? (retryBody as Record<string, unknown>).error || (retryBody as Record<string, unknown>).message || `HTTP ${response.status} ${response.statusText}`
              : typeof retryBody === "string"
                ? retryBody
                : `HTTP ${response.status} ${response.statusText}`;
          throw new HttpError(String(message), response.status, url, retryBody, method);
        } catch (retryErr) {
          if (retryErr instanceof HttpError) throw retryErr;
          const norm = normalizeError(retryErr, url, method);
          logError(norm, isDev);
          throw new HttpError(
            norm.message || "Network error. Check your internet connection.",
            norm.status,
            url,
            norm.body,
            method,
          );
        }
      }
    }

    const message =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>).error || (body as Record<string, unknown>).message || `HTTP ${response.status} ${response.statusText}`
        : typeof body === "string"
          ? body
          : `HTTP ${response.status} ${response.statusText}`;

    if (isDev) {
      console.group(`[API Error] ${method} ${url}`);
      console.error("Status:", response.status);
      console.error("Message:", message);
      console.error("Error Code:", code || "(none)");
      console.error("Body:", body);
      console.groupEnd();
    }

    throw new HttpError(String(message), response.status, url, body, method);
  }

  const body = await parseResponseBody(response);
  if (isDev) {
    console.log(`[API] ${method} ${url} → ${response.status}`, body);
  }
  return body as T;
}

export { normalizeError, logError };
