"use strict";

const BACKEND_URL = "http://127.0.0.1:5000";

async function fetchCsrfToken() {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/auth/csrf-token`, {
      credentials: "include",
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.csrf_token || null;
  } catch {
    return null;
  }
}

async function makeApiRequest(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  const csrfToken = await fetchCsrfToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

  const resp = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  return resp;
}

async function parseJobUrl(url) {
  const resp = await makeApiRequest("/api/opportunities/parse-url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  if (!resp.ok) throw new Error("Parse failed");
  return resp.json();
}

async function createOpportunity(data) {
  const resp = await makeApiRequest("/api/opportunities", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("Create failed");
  return resp.json();
}

async function saveOpportunity(oppId) {
  const resp = await makeApiRequest(`/api/opportunities/${oppId}/save`, {
    method: "POST",
    body: JSON.stringify({ list_type: "saved" }),
  });
  return resp.ok;
}

async function getMatchScore(oppId) {
  try {
    const resp = await makeApiRequest(
      `/api/opportunities/${oppId}/match?force=true`
    );
    if (!resp.ok) return {};
    const data = await resp.json();
    return data.match_score || {};
  } catch {
    return {};
  }
}

async function getSkillGaps(oppId) {
  try {
    const resp = await makeApiRequest(
      `/api/opportunities/${oppId}/skill-gaps?force=true`
    );
    if (!resp.ok) return {};
    const data = await resp.json();
    return data.skill_gaps || {};
  } catch {
    return {};
  }
}

async function triggerAction(action, data) {
  const endpoints = {
    optimize: (id) => `/api/opportunities/${id}/optimize-resume`,
    "cover-letter": (id) => `/api/opportunities/${id}/cover-letter`,
    interview: (id) => `/api/opportunities/${id}/interview-prep`,
  };

  const endpointFn = endpoints[action];
  if (!endpointFn || !data.id) {
    // Fallback: open the app
    const appUrl = `http://localhost:3000/opportunity/${data.id || ""}`;
    await chrome.tabs.create({ url: appUrl });
    return;
  }

  const endpoint = endpointFn(data.id);
  const method = action === "interview" ? "GET" : "POST";
  const body = action === "cover-letter" ? JSON.stringify({ tone: "professional" }) : undefined;

  await makeApiRequest(endpoint, { method, body });
  const appUrl = `http://localhost:3000/opportunity/${data.id}`;
  await chrome.tabs.create({ url: appUrl });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "save_job") {
    (async () => {
      try {
        const { url, title } = message;
        const parseResult = await parseJobUrl(url);
        const parsed = parseResult.parsed || {};

        const createResult = await createOpportunity({
          title: parsed.title || title || "Unknown Position",
          company_name: parsed.company_name || "Unknown Company",
          company_logo: parsed.company_logo || "",
          location: parsed.location || "",
          description: parsed.description || "",
          url: url,
          source: url,
          tech_stack: parsed.skills || [],
          employment_type: parsed.employment_type || "",
          salary_min: parsed.salary_min || null,
          salary_max: parsed.salary_max || null,
          currency: parsed.currency || "INR",
          experience_required: parsed.experience_required || null,
          provider: parsed.platform || "extension",
        });

        const oppId = createResult.opportunity?.id;
        if (oppId) {
          await saveOpportunity(oppId);
          const [match, skillGaps] = await Promise.all([
            getMatchScore(oppId),
            getSkillGaps(oppId),
          ]);
          sendResponse({ success: true, data: { parsed, match, skill_gaps: skillGaps } });
        } else {
          sendResponse({ success: false, error: "No opportunity ID returned" });
        }
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === "action") {
    triggerAction(message.action, message.data);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "get_auth_status") {
    (async () => {
      try {
        const resp = await makeApiRequest("/api/auth/me");
        const ok = resp.ok;
        let email = "";
        if (ok) {
          const data = await resp.json();
          email = data.email || "";
        }
        sendResponse({ authenticated: ok, email });
      } catch {
        sendResponse({ authenticated: false, email: "" });
      }
    })();
    return true;
  }
});
