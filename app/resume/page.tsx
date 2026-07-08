"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string;
}

interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
}

interface Project {
  name: string;
  description: string;
  link: string;
}

interface Review {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  weak_action_verbs: string[];
  suggestions: string[];
}

export default function ResumePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    apiFetch("/api/resume").then((data) => {
      if (data.resume) {
        setFullName(data.resume.full_name || "");
        setEmail(data.resume.email || "");
        setPhone(data.resume.phone || "");
        setLocation(data.resume.location || "");
        setSummary(data.resume.summary || "");
        setSkills((data.resume.skills || []).join(", "));
        setExperience(data.resume.experience || []);
        setEducation(data.resume.education || []);
        setProjects(data.resume.projects || []);
      }
    });
  }, []);

  function addExperience() {
    setExperience([...experience, { company: "", role: "", start: "", end: "", bullets: "" }]);
  }
  function updateExperience(i: number, field: keyof Experience, value: string) {
    const copy = [...experience];
    copy[i] = { ...copy[i], [field]: value };
    setExperience(copy);
  }
  function removeExperience(i: number) {
    setExperience(experience.filter((_, idx) => idx !== i));
  }

  function addEducation() {
    setEducation([...education, { school: "", degree: "", start: "", end: "" }]);
  }
  function updateEducation(i: number, field: keyof Education, value: string) {
    const copy = [...education];
    copy[i] = { ...copy[i], [field]: value };
    setEducation(copy);
  }
  function removeEducation(i: number) {
    setEducation(education.filter((_, idx) => idx !== i));
  }

  function addProject() {
    setProjects([...projects, { name: "", description: "", link: "" }]);
  }
  function updateProject(i: number, field: keyof Project, value: string) {
    const copy = [...projects];
    copy[i] = { ...copy[i], [field]: value };
    setProjects(copy);
  }
  function removeProject(i: number) {
    setProjects(projects.filter((_, idx) => idx !== i));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      await apiFetch("/api/resume", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          location,
          summary,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience,
          education,
          projects,
        }),
      });
      setStatus("Saved!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleReview() {
    setReviewLoading(true);
    setReviewError("");
    setReview(null);
    try {
      const data = await apiFetch("/api/resume/review", { method: "POST" });
      setReview(data.review);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setReviewLoading(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">Resume Builder</h1>
        <div className="flex gap-3">
          <button onClick={handleReview} disabled={reviewLoading} className="rounded border px-4 py-2 text-sm">
            {reviewLoading ? "Reviewing..." : "AI Review"}
          </button>
          <a href="/api/resume/export" target="_blank" className="rounded border px-4 py-2 text-sm">
            Download PDF
          </a>
        </div>
      </div>

      {reviewError && (
        <div className="mb-4 max-w-3xl rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reviewError}
        </div>
      )}

      {review && (
        <div className="mb-6 max-w-3xl space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">ATS Score</h2>
            <span className={`text-2xl font-bold ${scoreColor(review.ats_score)}`}>{review.ats_score}/100</span>
          </div>

          {review.strengths?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Strengths</h3>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                {review.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {review.weaknesses?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Weaknesses</h3>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                {review.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {review.missing_keywords?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Missing Keywords</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {review.missing_keywords.map((k, i) => (
                  <span key={i} className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">{k}</span>
                ))}
              </div>
            </div>
          )}

          {review.weak_action_verbs?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Weak Action Verbs</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {review.weak_action_verbs.map((v, i) => (
                  <span key={i} className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">{v}</span>
                ))}
              </div>
            </div>
          )}

          {review.suggestions?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Suggestions</h3>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                {review.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">Basics</h2>
          <input className="w-full rounded border px-3 py-2" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <textarea className="w-full rounded border px-3 py-2" placeholder="Summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Experience</h2>
            <button type="button" onClick={addExperience} className="text-sm text-blue-600">+ Add</button>
          </div>
          {experience.map((exp, i) => (
            <div key={i} className="space-y-2 rounded border p-4">
              <div className="flex justify-end">
                <button type="button" onClick={() => removeExperience(i)} className="text-xs text-red-600">Remove</button>
              </div>
              <input className="w-full rounded border px-3 py-2" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
              <input className="w-full rounded border px-3 py-2" placeholder="Role" value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} />
              <div className="flex gap-2">
                <input className="w-1/2 rounded border px-3 py-2" placeholder="Start (e.g. Jan 2024)" value={exp.start} onChange={(e) => updateExperience(i, "start", e.target.value)} />
                <input className="w-1/2 rounded border px-3 py-2" placeholder="End (e.g. Present)" value={exp.end} onChange={(e) => updateExperience(i, "end", e.target.value)} />
              </div>
              <textarea className="w-full rounded border px-3 py-2" placeholder="Bullet points (one per line)" rows={3} value={exp.bullets} onChange={(e) => updateExperience(i, "bullets", e.target.value)} />
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Education</h2>
            <button type="button" onClick={addEducation} className="text-sm text-blue-600">+ Add</button>
          </div>
          {education.map((edu, i) => (
            <div key={i} className="space-y-2 rounded border p-4">
              <div className="flex justify-end">
                <button type="button" onClick={() => removeEducation(i)} className="text-xs text-red-600">Remove</button>
              </div>
              <input className="w-full rounded border px-3 py-2" placeholder="School" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} />
              <input className="w-full rounded border px-3 py-2" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} />
              <div className="flex gap-2">
                <input className="w-1/2 rounded border px-3 py-2" placeholder="Start" value={edu.start} onChange={(e) => updateEducation(i, "start", e.target.value)} />
                <input className="w-1/2 rounded border px-3 py-2" placeholder="End" value={edu.end} onChange={(e) => updateEducation(i, "end", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Projects</h2>
            <button type="button" onClick={addProject} className="text-sm text-blue-600">+ Add</button>
          </div>
          {projects.map((proj, i) => (
            <div key={i} className="space-y-2 rounded border p-4">
              <div className="flex justify-end">
                <button type="button" onClick={() => removeProject(i)} className="text-xs text-red-600">Remove</button>
              </div>
              <input className="w-full rounded border px-3 py-2" placeholder="Project name" value={proj.name} onChange={(e) => updateProject(i, "name", e.target.value)} />
              <textarea className="w-full rounded border px-3 py-2" placeholder="Description" rows={2} value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
              <input className="w-full rounded border px-3 py-2" placeholder="Link (optional)" value={proj.link} onChange={(e) => updateProject(i, "link", e.target.value)} />
            </div>
          ))}
        </div>

        <button type="submit" className="rounded bg-black px-6 py-2 text-white">
          Save Resume
        </button>
        {status && <p className="text-sm text-gray-500">{status}</p>}
      </form>
    </div>
  );
}
