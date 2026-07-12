export class HttpError extends Error {
  status: number;
  body: unknown;
  url: string;

  constructor(message: string, status: number, url: string, body: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

interface NormalizedError {
  message: string;
  status: number;
  url: string;
  body: unknown;
  raw: unknown;
  stack: string | undefined;
}

function normalizeError(err: unknown, url: string): NormalizedError {
  if (err instanceof HttpError) {
    return {
      message: err.message,
      status: err.status,
      url: err.url,
      body: err.body,
      raw: err,
      stack: err.stack,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message || String(err),
      status: 0,
      url,
      body: null,
      raw: err,
      stack: err.stack,
    };
  }

  if (err instanceof Response) {
    return {
      message: `HTTP ${err.status} ${err.statusText}`,
      status: err.status,
      url: err.url || url,
      body: null,
      raw: err,
      stack: undefined,
    };
  }

  if (typeof err === "string") {
    return {
      message: err,
      status: 0,
      url,
      body: null,
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
      body: obj,
      raw: err,
      stack: typeof obj.stack === "string" ? obj.stack : undefined,
    };
  }

  return {
    message: String(err),
    status: 0,
    url,
    body: null,
    raw: err,
    stack: undefined,
  };
}

function logError(norm: NormalizedError, isDev: boolean): void {
  if (!isDev) return;
  console.group(`[API Error] ${norm.url}`);
  console.error("Message:", norm.message);
  console.error("Status:", norm.status);
  console.error("Body:", norm.body);
  if (norm.stack) console.error("Stack:", norm.stack);
  console.error("Raw:", norm.raw);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${window.location.origin}${path}`;
  const isDev = process.env.NODE_ENV === "development";

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (err) {
    const norm = normalizeError(err, url);
    logError(norm, isDev);
    throw new HttpError(
      norm.message || "Network error. Check your internet connection.",
      norm.status,
      url,
      norm.body,
    );
  }

  if (!response.ok) {
    const body = await parseResponseBody(response);
    const message =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>).error || (body as Record<string, unknown>).message || `HTTP ${response.status} ${response.statusText}`
        : typeof body === "string"
          ? body
          : `HTTP ${response.status} ${response.statusText}`;

    if (isDev) {
      console.group(`[API Error] ${response.status} ${url}`);
      console.error("Message:", message);
      console.error("Body:", body);
      console.groupEnd();
    }

    throw new HttpError(String(message), response.status, url, body);
  }

  const body = await parseResponseBody(response);
  return body as T;
}

export { normalizeError, logError };
