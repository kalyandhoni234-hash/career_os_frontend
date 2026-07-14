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
  const resp = await fetch(url, { ...options, headers, credentials: "include" });
  return resp;
}

async function checkAuth() {
  const statusDot = document.querySelector(".status-dot");
  const statusText = document.querySelector(".status");
  try {
    const resp = await makeApiRequest("/api/auth/me");
    if (resp.ok) {
      statusDot.className = "status-dot online";
      statusText.innerHTML = '<span class="status-dot online"></span>Online';
    } else {
      statusDot.className = "status-dot offline";
      statusText.innerHTML = '<span class="status-dot offline"></span>Offline';
    }
  } catch {
    statusDot.className = "status-dot offline";
    statusText.innerHTML = '<span class="status-dot offline"></span>Offline';
  }
}

async function loadSavedJobs() {
  const container = document.getElementById("saved-jobs-list");
  const emptyState = document.getElementById("empty-state");

  try {
    const resp = await makeApiRequest(
      "/api/opportunities/saved?include_scores=true"
    );
    if (!resp.ok) {
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    const data = await resp.json();
    const saved = data.saved || [];

    if (saved.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    // Remove existing job cards (keep empty state)
    container.querySelectorAll(".job-card").forEach((el) => el.remove());

    saved.slice(0, 5).forEach((item) => {
      const opp = item.opportunity || {};
      const score = item.match_score?.overall_score || 0;
      const badgeClass = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

      const card = document.createElement("div");
      card.className = "job-card";
      card.innerHTML = `
        <h3>${escapeHtml(opp.title || "Job")}</h3>
        <p>${escapeHtml(opp.company_name || "")}${opp.location ? " &middot; " + escapeHtml(opp.location) : ""}</p>
        ${score ? `<span class="match-badge ${badgeClass}">${score}% Match</span>` : ""}
      `;
      card.addEventListener("click", () => {
        chrome.tabs.create({
          url: `http://localhost:3000/opportunity/${opp.id}`,
        });
      });
      container.appendChild(card);
    });
  } catch {
    // silently fail
  }
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("parse-btn").addEventListener("click", async () => {
  const input = document.getElementById("job-url-input");
  const url = input.value.trim();
  if (!url) return;

  const btn = document.getElementById("parse-btn");
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="loader"></span>';
  btn.disabled = true;

  try {
    const parseResp = await makeApiRequest("/api/opportunities/parse-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    if (!parseResp.ok) throw new Error("Parse failed");
    const parseData = await parseResp.json();
    const parsed = parseData.parsed || {};

    const createResp = await makeApiRequest("/api/opportunities", {
      method: "POST",
      body: JSON.stringify({
        title: parsed.title || "Unknown Position",
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
        provider: parsed.platform || "url",
      }),
    });
    if (!createResp.ok) throw new Error("Create failed");
    const created = await createResp.json();
    const oppId = created.opportunity?.id;

    if (oppId) {
      await makeApiRequest(`/api/opportunities/${oppId}/save`, {
        method: "POST",
        body: JSON.stringify({ list_type: "saved" }),
      });
    }

    input.value = "";
    btn.textContent = "\u2713 Saved";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);

    await loadSavedJobs();
  } catch (err) {
    btn.textContent = "\u2717 Failed";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  }
});

document.getElementById("open-app-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000/opportunities" });
});

document.getElementById("refresh-btn").addEventListener("click", () => {
  loadSavedJobs();
  checkAuth();
});

checkAuth();
loadSavedJobs();
