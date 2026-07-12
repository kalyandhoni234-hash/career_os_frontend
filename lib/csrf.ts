let cachedToken: string | null = null;
let inflightFetch: Promise<string> | null = null;

function getCsrfFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? match[1] : null;
}

async function fetchToken(): Promise<string> {
  if (inflightFetch) return inflightFetch;
  inflightFetch = (async () => {
    const response = await fetch("/api/auth/csrf-token", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
    const data = await response.json();
    cachedToken = data.csrf_token;
    return cachedToken!;
  })();
  try {
    return await inflightFetch;
  } finally {
    inflightFetch = null;
  }
}

export async function getCsrfToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const fromCookie = getCsrfFromCookie();
  if (fromCookie) {
    cachedToken = fromCookie;
    return cachedToken;
  }
  try {
    return await fetchToken();
  } catch {
    return null;
  }
}

export function clearCsrfToken(): void {
  cachedToken = null;
}
