"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Briefcase, BookmarkCheck, Users, Send, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getRecruiterDashboard } from "../api";
import type { RecruiterDashboard as DashboardData } from "../types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecruiterDashboard()
      .then(setData)
      .catch(() => router.push("/recruiter/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded-md bg-bg-hover" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-6xl space-y-6 p-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-serif text-2xl font-medium text-fg-default">Recruiter Dashboard</h1>
        <p className="mt-1 text-sm text-fg-muted">Discover and engage with top talent.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Candidates" value={data.total_candidates.toLocaleString()} icon={<Search size={18} />} subtitle="Discoverable talent" />
        <MetricCard label="Active Job Posts" value={data.active_jobs} icon={<Briefcase size={18} />} subtitle="Currently hiring" />
        <MetricCard label="Saved Candidates" value={data.saved_candidates} icon={<BookmarkCheck size={18} />} subtitle="In your pipelines" />
        <MetricCard label="Invites Sent" value={data.total_invites} icon={<Send size={18} />} subtitle={`${data.pending_invites} pending`} />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="space-y-4 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent" />
              <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction href="/recruiter/candidates" icon={Search} label="Search Candidates" desc="Find talent by skills, college, and more" />
              <QuickAction href="/recruiter/jobs/new" icon={Briefcase} label="Post a Job" desc="Create a new job listing" />
              <QuickAction href="/recruiter/candidates/compare" icon={Users} label="Compare Candidates" desc="Side-by-side candidate comparison" />
              <QuickAction href="/recruiter/pipelines" icon={BookmarkCheck} label="View Pipelines" desc="Manage your talent pipelines" />
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Eye size={14} className="text-accent" />
              <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Recent Activity</h2>
            </div>
            {data.recent_activity.length === 0 ? (
              <p className="text-sm text-fg-muted">No recent activity yet. Start exploring candidates!</p>
            ) : (
              <div className="space-y-2">
                {data.recent_activity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-border pb-2 last:border-0">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10">
                      {activity.type === "saved" ? <BookmarkCheck size={12} className="text-accent" /> : <Send size={12} className="text-accent" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-fg-default">{activity.description}</p>
                      {activity.timestamp && <p className="text-[11px] text-fg-subtle">{new Date(activity.timestamp).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Users size={14} className="text-accent" />
              <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Hiring Analytics</h2>
            </div>
            <div className="space-y-3">
              <MiniStat label="Candidates Viewed" value={data.total_views} icon={<Eye size={14} />} />
              <MiniStat label="Active Jobs" value={data.active_jobs} icon={<Briefcase size={14} />} />
              <MiniStat label="Saved Candidates" value={data.saved_candidates} icon={<BookmarkCheck size={14} />} />
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent" />
              <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Your Jobs</h2>
            </div>
            <p className="mb-3 text-sm text-fg-muted">{data.active_jobs} active out of {data.total_jobs} total job posts</p>
            <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              View all jobs <ArrowRight size={12} />
            </Link>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, icon, subtitle }: { label: string; value: string | number; icon: React.ReactNode; subtitle?: string }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-fg-muted">{label}</p>
          <p className="mt-1.5 font-serif text-3xl font-medium text-fg-default">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-fg-subtle">{subtitle}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
      </div>
    </Card>
  );
}

function QuickAction({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <Link href={href} className="card-hover group rounded-lg border border-border bg-bg-raised p-3.5 transition-all duration-150 hover:border-accent/30 hover:shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-150 group-hover:bg-accent/15">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-default">{label}</p>
          <p className="text-[11px] text-fg-muted">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-fg-muted">{icon}</span>
        <span className="text-xs text-fg-muted">{label}</span>
      </div>
      <span className="font-mono text-sm font-medium text-fg-default">{value}</span>
    </div>
  );
}
