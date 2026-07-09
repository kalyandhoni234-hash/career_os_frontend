"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Send, CheckCircle, XCircle, Clock, Users, Award, GraduationCap, Code2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getAnalytics } from "../api";
import type { RecruiterAnalytics } from "../types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function AnalyticsPage() {
  const [data, setData] = useState<RecruiterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAnalytics().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-bg-hover" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-6xl space-y-6 p-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-serif text-2xl font-medium text-fg-default">Analytics</h1>
        <p className="mt-1 text-sm text-fg-muted">Hiring metrics and candidate insights.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Invites Sent" value={data.invites_sent} icon={<Send size={18} />} />
        <StatCard label="Accepted" value={data.invites_accepted} icon={<CheckCircle size={18} />} color="success" />
        <StatCard label="Pending" value={data.invites_pending} icon={<Clock size={18} />} color="warning" />
        <StatCard label="Rejected" value={data.invites_rejected} icon={<XCircle size={18} />} color="danger" />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Hiring Funnel</span>
            </div>
            <div className="space-y-3">
              <FunnelRow label="Available Candidates" value={data.total_students} max={data.total_students} />
              <FunnelRow label="Invites Sent" value={data.invites_sent} max={data.total_students} />
              <FunnelRow label="Interviews" value={data.invites_sent} max={data.total_students} />
              <FunnelRow label="Accepted" value={data.invites_accepted} max={data.total_students} />
              <FunnelRow label="Rejected" value={data.invites_rejected} max={data.total_students} />
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Award size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Rates</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-serif text-2xl font-medium text-accent">{data.interview_rate}%</p>
                <p className="text-xs text-fg-muted">Interview Rate</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-2xl font-medium text-success">{data.acceptance_rate}%</p>
                <p className="text-xs text-fg-muted">Acceptance Rate</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Top Colleges</span>
            </div>
            {data.top_colleges.length === 0 ? (
              <p className="text-sm text-fg-muted">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.top_colleges.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-1.5 last:border-0">
                    <span className="text-sm text-fg-default">{c.name}</span>
                    <span className="font-mono text-xs text-fg-muted">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Code2 size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Top Skills</span>
            </div>
            {data.top_skills.length === 0 ? (
              <p className="text-sm text-fg-muted">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.top_skills.slice(0, 8).map((s, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-1.5 last:border-0">
                    <span className="text-sm text-fg-default">{s.name}</span>
                    <span className="font-mono text-xs text-fg-muted">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Users size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Talent Pool</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-muted">Total students on platform</span>
                <span className="font-serif text-xl font-medium text-fg-default">{data.total_students}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-muted">Average ATS score</span>
                <span className="font-serif text-xl font-medium text-fg-default">{data.average_ats_score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-fg-muted">Candidates viewed</span>
                <span className="font-serif text-xl font-medium text-fg-default">{data.total_candidates_viewed}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, color = "accent" }: { label: string; value: number; icon: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = { accent: "text-accent", success: "text-success", warning: "text-warning", danger: "text-danger" };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-fg-muted">{label}</p>
          <p className="mt-1.5 font-serif text-3xl font-medium text-fg-default">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color] || colorMap.accent}/10 ${colorMap[color] || colorMap.accent}`}>{icon}</div>
      </div>
    </Card>
  );
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono text-fg-default">{value} ({pct}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
