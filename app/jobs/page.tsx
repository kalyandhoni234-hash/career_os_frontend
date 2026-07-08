"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Job {
  id: number;
  company: string;
  role: string;
  status: string;
  salary: string | null;
  recruiter: string | null;
  notes: string | null;
  deadline: string | null;
  job_link: string | null;
}

const STATUSES = [
  { key: "applied", label: "Applied" },
  { key: "oa", label: "OA" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [jobLink, setJobLink] = useState("");

  function loadJobs() {
    apiFetch("/api/jobs")
      .then((data) => setJobs(data.jobs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          company,
          role,
          salary: salary || null,
          deadline: deadline || null,
          job_link: jobLink || null,
        }),
      });
      setCompany("");
      setRole("");
      setSalary("");
      setDeadline("");
      setJobLink("");
      setShowForm(false);
      loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    }
  }

  async function updateStatus(jobId: number, newStatus: string) {
    try {
      await apiFetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function deleteJob(jobId: number) {
    try {
      await apiFetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    }
  }

  function isOverdue(deadline: string | null) {
    if (!deadline) return false;
    return new Date(deadline) < new Date(new Date().toDateString());
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8">
        <h1 className="text-xl font-semibold sm:text-2xl">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</a>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            + Add Application
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-8">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mx-4 mt-4 space-y-3 rounded-lg border bg-white p-6 shadow-sm sm:mx-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="rounded border px-3 py-2" placeholder="Company *" value={company} onChange={(e) => setCompany(e.target.value)} required />
            <input className="rounded border px-3 py-2" placeholder="Role *" value={role} onChange={(e) => setRole(e.target.value)} required />
            <input className="rounded border px-3 py-2" placeholder="Salary (optional)" value={salary} onChange={(e) => setSalary(e.target.value)} />
            <input className="rounded border px-3 py-2" type="date" placeholder="Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <input className="rounded border px-3 py-2 sm:col-span-2" placeholder="Job link (optional)" value={jobLink} onChange={(e) => setJobLink(e.target.value)} />
          </div>
          <button type="submit" className="rounded bg-black px-5 py-2 text-sm text-white">
            Save
          </button>
        </form>
      )}

      <main className="overflow-x-auto p-4 sm:p-8">
        <div className="flex gap-4" style={{ minWidth: "1000px" }}>
          {STATUSES.map((col) => (
            <div key={col.key} className="flex-1 rounded-lg bg-gray-100 p-3">
              <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-600">
                {col.label}
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                  {jobs.filter((j) => j.status === col.key).length}
                </span>
              </h2>

              <div className="space-y-3">
                {jobs
                  .filter((j) => j.status === col.key)
                  .map((job) => (
                    <div key={job.id} className="rounded-lg border bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{job.company}</p>
                          <p className="text-sm text-gray-500">{job.role}</p>
                        </div>
                        <button onClick={() => deleteJob(job.id)} className="text-xs text-gray-400 hover:text-red-600">
                          ?
                        </button>
                      </div>

                      {job.salary && <p className="mt-1 text-xs text-gray-500">{job.salary}</p>}

                      {job.deadline && (
                        <p className={`mt-1 text-xs ${isOverdue(job.deadline) ? "text-red-600 font-medium" : "text-gray-500"}`}>
                          Deadline: {job.deadline} {isOverdue(job.deadline) && "(overdue)"}
                        </p>
                      )}

                      {job.job_link && (
                        <a href={job.job_link} target="_blank" className="mt-1 block text-xs text-blue-600 hover:underline">
                          View posting
                        </a>
                      )}

                      <select
                        value={job.status}
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                        className="mt-2 w-full rounded border px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
