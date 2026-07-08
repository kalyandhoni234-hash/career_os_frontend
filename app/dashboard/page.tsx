"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((data) => setProfile(data.profile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-semibold">Your Career Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Education</h2>
          <p className="text-lg">{profile?.education || "Not set yet"}</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Degree</h2>
          <p className="text-lg">{profile?.degree || "Not set yet"}</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Skills</h2>
          <p className="text-lg">
            {profile?.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "No skills added yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
