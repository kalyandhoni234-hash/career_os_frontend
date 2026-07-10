"use client";

import { useEffect, useState } from "react";
import { BarChart3, Briefcase, TrendingUp, Award, Target, ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface Job {
  id: number;
  company: string;
  role: string;
  status: string;
  salary: string | null;
  deadline: string | null;
  job_link: string | null;
}

interface DashboardSummary {
  has_resume: boolean;
  resume_summary_set: boolean;
  active_applications: number;
  offers: number;
  total_applications: number;
  upcoming_deadlines: { company: string; role: string; deadline: string }[];
  last_coach_message: string | null;
  last_coach_message_at: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  oa: "Online Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  applied: "#2563eb",
  oa: "#d97706",
  interview: "#8b5cf6",
  offer: "#16a34a",
  rejected: "#dc2626",
};

const PIE_COLORS = ["#2563eb", "#d97706", "#8b5cf6", "#16a34a", "#dc2626"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted truncate">{label}</p>
          <p className="mt-1.5 font-serif text-3xl font-medium tracking-tight text-fg-default">{value}</p>
          {sub && <p className="mt-0.5 font-mono text-xs text-fg-subtle">{sub}</p>}
        </div>
        <div className="rounded-lg border border-border bg-bg-default p-2 text-accent shrink-0">{icon}</div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiFetch("/api/jobs"),
      apiFetch("/api/users/dashboard-summary"),
    ])
      .then(([jobsResult, summaryResult]) => {
        if (jobsResult.status === "fulfilled") setJobs(jobsResult.value.jobs || []);
        if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-8 w-48 shimmer rounded-md" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (<CardSkeleton key={i} />))}
        </div>
      </div>
    );
  }

  const statusCounts: Record<string, number> = {};
  jobs.forEach((j) => { statusCounts[j.status] = (statusCounts[j.status] || 0) + 1; });

  const statusData = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: statusCounts[key] || 0,
    fill: STATUS_COLORS[key],
  }));

  const pipelineData = [
    { name: "Applied", value: statusCounts.applied || 0 },
    { name: "OA", value: statusCounts.oa || 0 },
    { name: "Interview", value: statusCounts.interview || 0 },
    { name: "Offer", value: statusCounts.offer || 0 },
  ];

  const totalStarted = jobs.length;
  const totalApplied = statusCounts.applied || 0;
  const totalInterview = statusCounts.interview || 0;
  const totalOffer = statusCounts.offer || 0;
  const totalRejected = statusCounts.rejected || 0;

  const interviewRate = totalApplied > 0 ? ((totalInterview / totalApplied) * 100).toFixed(1) : "0.0";
  const offerRate = totalInterview > 0 ? ((totalOffer / totalInterview) * 100).toFixed(1) : "0.0";
  const rejectionRate = totalStarted > 0 ? ((totalRejected / totalStarted) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto max-w-6xl space-y-6 p-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-accent" />
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg-default">Analytics</h1>
          </div>
          <p className="mt-0.5 font-sans text-sm text-fg-muted">Track your performance and pipeline metrics</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={summary?.total_applications ?? 0} icon={<Briefcase size={18} />} />
        <StatCard label="Active" value={summary?.active_applications ?? 0} sub="In progress" icon={<TrendingUp size={18} />} />
        <StatCard label="Offers" value={summary?.offers ?? 0} icon={<Award size={18} />} />
        <StatCard label="Resume" value={summary?.has_resume ? "Complete" : "Not started"} icon={<FileText size={18} />} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Pipeline Funnel</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "var(--fg-subtle)" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "var(--fg-muted)" }} width={80} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-default)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  formatter={(value) => [value, "Applications"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Target size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Status Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--bg-default)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full transition-transform duration-150 hover:scale-125" style={{ backgroundColor: STATUS_COLORS[key] }} />
                <span className="font-mono text-xs text-fg-muted">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Conversion Rates</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-fg-muted">Applied → Interview</span>
                <span className="font-mono text-sm font-medium text-fg-default">{interviewRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(Number(interviewRate), 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-fg-muted">Interview → Offer</span>
                <span className="font-mono text-sm font-medium text-fg-default">{offerRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
                <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${Math.min(Number(offerRate), 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-fg-muted">Rejection rate</span>
                <span className="font-mono text-sm font-medium text-fg-default">{rejectionRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
                <div className="h-full rounded-full bg-danger transition-all duration-500" style={{ width: `${Math.min(Number(rejectionRate), 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Company Breakdown</h3>
          </div>
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {jobs.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-fg-muted">No applications yet</p>
              </div>
            ) : (
              [...new Set(jobs.map((j) => j.company))].slice(0, 10).map((company) => {
                const count = jobs.filter((j) => j.company === company).length;
                const maxCount = Math.max(...jobs.map((j) => j.company).map((c) => jobs.filter((j) => j.company === c).length));
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={company} className="group flex items-center gap-3 transition-all duration-150">
                    <span className="w-24 truncate font-mono text-xs text-fg-muted group-hover:text-fg-default">{company}</span>
                    <div className="flex-1">
                      <div className="h-5 overflow-hidden rounded-md bg-bg-hover transition-all duration-150 group-hover:bg-bg-hover/80">
                        <div className="h-full rounded-md bg-accent/70 transition-all duration-300 group-hover:bg-accent/90" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                    <span className="w-6 text-right font-mono text-xs text-fg-default transition-all duration-150 group-hover:font-medium">{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Insights</h3>
          </div>
          <div className="mt-4 space-y-3">
            {totalStarted === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm text-fg-muted">No data yet</p>
                <p className="mt-0.5 text-xs text-fg-subtle">Start tracking applications to see insights</p>
              </div>
            )}
            {totalOffer > 0 && (
              <div className="card-hover flex items-start gap-3 rounded-lg border border-success/20 bg-success-subtle p-3">
                <Award size={16} className="mt-0.5 shrink-0 text-success" />
                <div>
                  <p className="text-sm font-medium text-fg-default">Offers received!</p>
                  <p className="text-xs text-fg-muted">You have {totalOffer} offer{totalOffer > 1 ? "s" : ""}. Make sure to review deadlines.</p>
                </div>
              </div>
            )}
            {totalApplied > 0 && (totalRejected / totalApplied) > 0.5 && (
              <div className="card-hover flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-subtle p-3">
                <ArrowRight size={16} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-medium text-fg-default">High rejection rate</p>
                  <p className="text-xs text-fg-muted">Consider refining your resume or targeting different roles.</p>
                </div>
              </div>
            )}
            {!summary?.has_resume && (
              <div className="card-hover flex items-start gap-3 rounded-lg border border-warning/20 bg-warning-subtle p-3">
                <FileText size={16} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-medium text-fg-default">Resume missing</p>
                  <p className="text-xs text-fg-muted">Create your resume to improve your application success rate.</p>
                </div>
              </div>
            )}
            {totalApplied > 0 && Number(interviewRate) < 20 && (
              <div className="card-hover flex items-start gap-3 rounded-lg border border-warning/20 bg-warning-subtle p-3">
                <TrendingUp size={16} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-medium text-fg-default">Low interview rate</p>
                  <p className="text-xs text-fg-muted">Try optimizing your resume for ATS and tailoring applications.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
