"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Profile {
  education: string | null;
  degree: string | null;
  graduation_year: number | null;
  skills: string[] | null;
}

interface Deadline {
  company: string;
  role: string;
  deadline: string;
}

interface Summary {
  has_resume: boolean;
  resume_summary_set: boolean;
  active_applications: number;
  offers: number;
  total_applications: number;
  upcoming_deadlines: Deadline[];
  last_coach_message: string | null;
  last_coach_message_at: string | null;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      apiFetch("/api/users/profile"),
      apiFetch("/api/users/dashboard-summary"),
    ])
      .then(([profileData, summaryData]) => {
        setProfile(profileData.profile);
        setSummary(summaryData);
      })
      .catch((err) => {
        setError(err.message);
        if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8">
        <h1 className="text-xl font-semibold sm:text-2xl">Career OS</h1>
        <div className="flex items-center gap-4">
          <a href="/jobs" className="text-sm text-blue-600 hover:underline">Job Tracker</a>
          <a href="/coach" className="text-sm text-blue-600 hover:underline">Career Coach</a>
          <a href="/resume" className="text-sm text-blue-600 hover:underline">Edit Resume</a>
          <button
            onClick={handleLogout}
            className="rounded border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 sm:px-4 sm:py-2"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">Your Career Dashboard</h2>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a href="/jobs" className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <h3 className="mb-1 text-sm font-medium text-gray-500">Active Applications</h3>
            <p className="text-3xl font-semibold">{summary?.active_applications ?? 0}</p>
            <p className="mt-1 text-xs text-gray-400">{summary?.total_applications ?? 0} total tracked</p>
          </a>

          <a href="/resume" className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <h3 className="mb-1 text-sm font-medium text-gray-500">Resume Status</h3>
            <p className="text-lg font-semibold">
              {summary?.has_resume ? (summary.resume_summary_set ? "Ready" : "Incomplete") : "Not started"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {summary?.has_resume ? "Click to edit or run AI review" : "Build your resume to get started"}
            </p>
          </a>

          <a href="/coach" className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <h3 className="mb-1 text-sm font-medium text-gray-500">Career Coach</h3>
            <p className="line-clamp-2 text-sm text-gray-700">
              {summary?.last_coach_message || "No conversations yet - ask a question to get started"}
            </p>
          </a>
        </div>

        {summary && summary.upcoming_deadlines.length > 0 && (
          <div className="mb-6 rounded-lg border bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-3 text-sm font-medium text-gray-500">Upcoming Deadlines</h3>
            <div className="space-y-2">
              {summary.upcoming_deadlines.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <span>{d.role} at {d.company}</span>
                  <span className="text-gray-500">{d.deadline}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Education</h3>
            <p className="text-base sm:text-lg">{profile?.education || "Not set yet"}</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Degree</h3>
            <p className="text-base sm:text-lg">{profile?.degree || "Not set yet"}</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Graduation Year</h3>
            <p className="text-base sm:text-lg">{profile?.graduation_year || "Not set yet"}</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm sm:col-span-2 sm:p-6 lg:col-span-3">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Skills</h3>
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-base sm:text-lg">No skills added yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


