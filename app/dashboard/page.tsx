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

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((data) => setProfile(data.profile))
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
          <a href="/resume" className="text-sm text-blue-600 hover:underline">
            Edit Resume
          </a>
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
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
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
