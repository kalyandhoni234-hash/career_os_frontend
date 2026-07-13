"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface Intelligence {
  total_jobs: number;
  skill_frequency: Record<string, { count: number; percentage: number }>;
  recommendations: { skill: string; appears_in_pct: number; message: string; priority: string }[];
  aggregated_missing_skills: [string, number][];
  top_companies: [string, number][];
  top_locations: [string, number][];
  top_titles: [string, number][];
  employment_type_distribution: Record<string, number>;
  remote_type_distribution: Record<string, number>;
  salary_distribution: { min: number; max: number; currency: string; title: string; company: string }[];
  summary: { total_jobs: number; unique_companies: number; unique_locations: number; skill_count: number; salary_avg: number | null; currency: string };
  user_skills: string[];
}

const COLORS = ["#6c63ff", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

export default function AnalyticsPage() {
  const [data, setData] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/opportunities/intelligence")
      .then((res: any) => setData(res.intelligence))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 space-y-4"><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></div>;
  if (!data || data.total_jobs === 0) return <EmptyState />;

  const skillChart = Object.entries(data.skill_frequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([skill, freq]) => ({ skill, count: freq.count, pct: freq.percentage }));

  const missingChart = data.aggregated_missing_skills.slice(0, 15).map(([skill, count]) => ({ skill, count }));

  const salaryChart = data.salary_distribution.map((s) => ({
    title: `${s.company.slice(0, 12)}`,
    avg: Math.round((s.min + s.max) / 2),
    min: s.min,
    max: s.max,
  }));

  const locationChart = Object.entries(data.remote_type_distribution).map(([name, value]) => ({ name, value }));
  const empTypeChart = Object.entries(data.employment_type_distribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-fg-default">Career Analytics</h1>
        <p className="text-fg-muted text-sm">
          Intelligence gathered across <strong className="text-accent">{data.total_jobs}</strong> saved jobs,
          <strong className="text-accent"> {data.summary.unique_companies}</strong> companies,
          <strong className="text-accent"> {data.summary.skill_count}</strong> unique skills
          {data.summary.salary_avg ? `, avg salary ₹${(data.summary.salary_avg / 100000).toFixed(1)}L` : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <SummaryCard label="Jobs Saved" value={data.total_jobs} icon="briefcase" />
        <SummaryCard label="Companies" value={data.summary.unique_companies} icon="building" />
        <SummaryCard label="Skills Tracked" value={data.summary.skill_count} icon="code" />
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Skill Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recommendations.slice(0, 8).map((rec) => (
              <div key={rec.skill} className="card p-4 border border-border rounded-xl bg-surface space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-fg-default">{rec.skill}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    rec.priority === "high" ? "bg-danger/10 text-danger" :
                    rec.priority === "medium" ? "bg-warning/10 text-warning" :
                    "bg-accent/10 text-accent"
                  }`}>{rec.appears_in_pct}%</span>
                </div>
                <p className="text-xs text-fg-muted">{rec.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skill Frequency */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Most In-Demand Skills</h2>
        <div className="card p-6 border border-border rounded-xl bg-surface">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={skillChart} layout="vertical" margin={{ left: 100, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="skill" type="category" tick={{ fontSize: 12 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#6c63ff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Missing Skills */}
      {missingChart.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Most Common Missing Skills</h2>
          <div className="card p-6 border border-border rounded-xl bg-surface">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={missingChart} layout="vertical" margin={{ left: 100, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Distribution */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Work Mode</h2>
          <div className="card p-6 border border-border rounded-xl bg-surface">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={locationChart} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}>
                  {locationChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Employment Type */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Employment Type</h2>
          <div className="card p-6 border border-border rounded-xl bg-surface">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={empTypeChart} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}>
                  {empTypeChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Top Companies */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Top Companies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.top_companies.map(([name, count]) => (
            <div key={name} className="card p-4 border border-border rounded-xl bg-surface text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                {name.charAt(0)}
              </div>
              <p className="font-semibold text-sm text-fg-default truncate">{name}</p>
              <p className="text-xs text-fg-muted">{count} job{count > 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Locations */}
      {data.top_locations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Top Locations</h2>
          <div className="flex flex-wrap gap-2">
            {data.top_locations.map(([loc, count]) => (
              <span key={loc} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
                {loc} ({count})
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Salary Distribution */}
      {salaryChart.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Salary Distribution</h2>
          <div className="card p-6 border border-border rounded-xl bg-surface">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryChart} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="min" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Min" />
                <Bar dataKey="avg" fill="#22c55e" radius={[4, 4, 0, 0]} name="Avg" />
                <Bar dataKey="max" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Max" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  const icons: Record<string, string> = { briefcase: "💼", building: "🏢", code: "💻" };
  return (
    <div className="card p-5 border border-border rounded-xl bg-surface flex items-center gap-4">
      <span className="text-2xl">{icons[icon] || "📊"}</span>
      <div>
        <p className="text-2xl font-bold text-fg-default">{value}</p>
        <p className="text-xs text-fg-muted">{label}</p>
      </div>
    </div>
  );
}

function SkeletonBlock() {
  return <div className="h-24 rounded-xl bg-surface border border-border shimmer" />;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
      <div className="text-6xl">📊</div>
      <h2 className="text-2xl font-bold text-fg-default">No Data Yet</h2>
      <p className="text-fg-muted max-w-md">
        Save some jobs to see analytics. Install the Career OS browser extension or paste job URLs to get started.
      </p>
    </div>
  );
}
