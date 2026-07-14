"use strict";

(function () {
  if (window.__careerOsInjected) return;
  window.__careerOsInjected = true;

  const BACKEND_URL = "http://127.0.0.1:5000";

  const PLATFORMS = {
    linkedin: /linkedin\.com\/jobs/,
    indeed: /indeed\.com\/.*(?:viewjob|jk=|job)/,
    greenhouse: /greenhouse\.io\/.*jobs/,
    lever: /lever\.co\/.*/,
    ashby: /ashbyhq\.com\/.*/,
    workday: /myworkdayjobs\.com\/.*/,
    wellfound: /wellfound\.com\/company\/.*\/jobs/,
    ycombinator: /ycombinator\.com\/jobs/,
    naukri: /naukri\.com\/.*job/,
    internshala: /internshala\.com\/internship/,
  };

  function detectPlatform(url) {
    for (const [name, pattern] of Object.entries(PLATFORMS)) {
      if (pattern.test(url)) return name;
    }
    return "unknown";
  }

  function createFloatingButton() {
    const existing = document.getElementById("career-os-float-btn");
    if (existing) return existing;

    const btn = document.createElement("button");
    btn.id = "career-os-float-btn";

    const logo = document.createElement("span");
    logo.className = "cos-logo-mark";
    logo.textContent = "C";

    const label = document.createElement("span");
    label.className = "cos-label";
    label.textContent = "Save Job";

    const badge = document.createElement("span");
    badge.className = "cos-badge";
    badge.textContent = "Career OS";

    btn.appendChild(logo);
    btn.appendChild(label);
    btn.appendChild(badge);
    document.body.appendChild(btn);
    return btn;
  }

  function createSidebar() {
    const existing = document.getElementById("career-os-sidebar");
    if (existing) return existing;

    const sidebar = document.createElement("div");
    sidebar.id = "career-os-sidebar";

    sidebar.innerHTML = `
      <div class="cos-side-header">
        <h2>Career OS</h2>
        <button class="cos-side-close" id="cos-side-close">&times;</button>
      </div>
      <div class="cos-side-body" id="cos-side-body">
        <div class="cos-loader" id="cos-loader">
          <p>Analyzing job posting...</p>
        </div>
        <div id="cos-side-content" style="display:none;"></div>
      </div>
    `;

    document.body.appendChild(sidebar);

    document.getElementById("cos-side-close").addEventListener("click", () => {
      sidebar.classList.remove("cos-open");
    });

    return sidebar;
  }

  function showLoader(sidebar) {
    const loader = sidebar.querySelector("#cos-loader");
    const content = sidebar.querySelector("#cos-side-content");
    if (loader) loader.style.display = "block";
    if (content) content.style.display = "none";
  }

  function hideLoader(sidebar) {
    const loader = sidebar.querySelector("#cos-loader");
    const content = sidebar.querySelector("#cos-side-content");
    if (loader) loader.style.display = "none";
    if (content) content.style.display = "block";
  }

  function renderSidebarContent(sidebar, data) {
    const container = sidebar.querySelector("#cos-side-content");
    if (!container) return;

    const parsed = data.parsed || {};
    const match = data.match || {};
    const skillGaps = data.skill_gaps || {};
    const overall = match.overall_score || 0;
    const missing = skillGaps.missing_skills || [];

    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (overall / 100) * circ;
    const color = overall >= 70 ? "#065f46" : overall >= 40 ? "#d97706" : "#dc2626";

    let missingHtml = "";
    if (missing.length > 0) {
      missingHtml = `
        <div class="cos-side-section">
          <h3>Missing Skills</h3>
          <div class="cos-missing-skills">
            ${missing.map((s) => `<span class="cos-missing-skill">${s}</span>`).join("")}
          </div>
        </div>`;
    }

    container.innerHTML = `
      <div class="cos-side-section">
        <h3>Resume Match</h3>
        <div class="cos-score-ring">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="5"/>
            <circle cx="32" cy="32" r="${radius}" fill="none" stroke="${color}" stroke-width="5"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
              transform="rotate(-90 32 32)" stroke-linecap="round"/>
            <text x="32" y="36" text-anchor="middle" font-size="12" font-weight="800" fill="${color}">${overall}%</text>
          </svg>
          <div class="cos-score-detail">
            <span class="cos-score-value">${overall}%</span>
            <span class="cos-score-label">
              ${overall >= 70 ? "Strong match" : overall >= 40 ? "Moderate match" : "Low match"}
            </span>
          </div>
        </div>
      </div>
      ${missingHtml}
      <div class="cos-side-section">
        <h3>Quick Actions</h3>
        <button class="cos-btn cos-btn-primary" data-action="optimize">Optimize Resume</button>
        <button class="cos-btn cos-btn-secondary" data-action="cover-letter">Cover Letter</button>
        <button class="cos-btn cos-btn-secondary" data-action="interview">Interview Prep</button>
        <button class="cos-btn cos-btn-secondary" data-action="learning">Learning Plan</button>
      </div>
    `;

    container.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.currentTarget.dataset.action;
        chrome.runtime.sendMessage(
          {
            type: "action",
            action,
            data: parsed,
          },
          () => {
            sidebar.classList.remove("cos-open");
          }
        );
      });
    });
  }

  async function saveJob(url, title) {
    const backendUrl = BACKEND_URL;

    try {
      const parseResp = await fetch(`${backendUrl}/api/opportunities/parse-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });

      if (!parseResp.ok) {
        const err = await parseResp.json().catch(() => ({ error: "Parse failed" }));
        throw new Error(err.error || "Parse failed");
      }

      const parseData = await parseResp.json();
      const parsed = parseData.parsed || {};

      const createResp = await fetch(`${backendUrl}/api/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
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
        }),
      });

      if (!createResp.ok) throw new Error("Failed to save opportunity");

      const created = await createResp.json();

      // Save it for the user
      const oppId = created.opportunity?.id || parsed.id;
      if (oppId) {
        await fetch(`${backendUrl}/api/opportunities/${oppId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ list_type: "saved" }),
        });
      }

      // Fetch match score and skill gaps
      let match = {};
      let skillGaps = {};
      if (oppId) {
        try {
          const matchResp = await fetch(
            `${backendUrl}/api/opportunities/${oppId}/match?force=true`,
            { credentials: "include" }
          );
          if (matchResp.ok) {
            const matchData = await matchResp.json();
            match = matchData.match_score || {};
          }
        } catch (_) {}

        try {
          const gapsResp = await fetch(
            `${backendUrl}/api/opportunities/${oppId}/skill-gaps?force=true`,
            { credentials: "include" }
          );
          if (gapsResp.ok) {
            const gapsData = await gapsResp.json();
            skillGaps = gapsData.skill_gaps || {};
          }
        } catch (_) {}
      }

      return { parsed, match, skill_gaps: skillGaps };
    } catch (err) {
      console.error("[Career OS] Save failed:", err);
      throw err;
    }
  }

  async function handleSaveClick(btn) {
    const platform = detectPlatform(window.location.href);
    let jobTitle = document.title.replace(/\s*\|.*$/, "").trim();

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="cos-logo-mark">C</span><span>Analyzing...</span><span class="cos-badge">Career OS</span>`;
    btn.disabled = true;

    try {
      const data = await saveJob(window.location.href, jobTitle);

      const sidebar = createSidebar();
      hideLoader(sidebar);
      renderSidebarContent(sidebar, data);
      sidebar.classList.add("cos-open");

      btn.innerHTML =
        '<span class="cos-logo-mark" style="background:#065f46">&#10003;</span><span>Saved</span><span class="cos-badge">Career OS</span>';
      btn.style.borderLeft = "4px solid #065f46";

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.borderLeft = "";
        btn.disabled = false;
      }, 3000);
    } catch (err) {
      btn.innerHTML = `<span class="cos-logo-mark" style="background:#dc2626">!</span><span>Failed</span><span class="cos-badge">Career OS</span>`;
      btn.disabled = false;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    }
  }

  function init() {
    const platform = detectPlatform(window.location.href);
    if (platform === "unknown") return;

    const btn = createFloatingButton();
    btn.addEventListener("click", () => handleSaveClick(btn));

    // Also create the sidebar
    createSidebar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
