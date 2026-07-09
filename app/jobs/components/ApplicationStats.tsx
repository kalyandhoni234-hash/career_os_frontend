"use client";

import { Briefcase, TrendingUp, Award, Target, XCircle, BarChart3 } from "lucide-react";

interface ApplicationStatsProps {
  totalApplications: number;
  jobsByStatus: Record<string, number>;
  offers: number;
  activeApplications: number;
}

function MiniStat({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-surface p-4 transition-all duration-150 hover:border-accent/30 hover:shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-default ${accent || "text-accent"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{label}</p>
        <p className="mt-0.5 font-serif text-xl font-medium tracking-tight text-fg-default">{value}</p>
      </div>
    </div>
  );
}

export function ApplicationStats({ totalApplications, jobsByStatus, offers, activeApplications }: ApplicationStatsProps) {
  const applied = jobsByStatus.applied || 0;
  const oa = jobsByStatus.oa || 0;
  const interview = jobsByStatus.interview || 0;
  const rejected = jobsByStatus.rejected || 0;
  const interviewRate = totalApplications > 0 ? ((interview / totalApplications) * 100).toFixed(0) : "0";
  const successRate = totalApplications > 0 ? ((offers / totalApplications) * 100).toFixed(0) : "0";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <MiniStat label="Total" value={totalApplications} icon={<Briefcase size={16} />} />
      <MiniStat label="Applied" value={applied} icon={<BarChart3 size={16} />} />
      <MiniStat label="OA" value={oa} icon={<Target size={16} />} />
      <MiniStat label="Interviews" value={interview} icon={<TrendingUp size={16} />} />
      <MiniStat label="Offers" value={offers} icon={<Award size={16} />} accent="text-success" />
      <MiniStat label="Rejected" value={rejected} icon={<XCircle size={16} />} />
      {totalApplications > 0 && (
        <>
          <MiniStat label="Interview Rate" value={`${interviewRate}%`} icon={<TrendingUp size={16} />} accent="text-purple-500" />
          <MiniStat label="Success Rate" value={`${successRate}%`} icon={<Award size={16} />} accent="text-success" />
        </>
      )}
    </div>
  );
}
