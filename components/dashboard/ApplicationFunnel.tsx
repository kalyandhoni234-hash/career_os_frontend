"use client";
import { BarChart3, Plus } from "lucide-react";
import Link from "next/link";

interface ApplicationFunnelProps {
  jobsByStatus: Record<string, number>;
  totalJobs: number;
}

const PIPELINE = [
  { key: "applied", label: "Applied", color: "bg-accent" },
  { key: "oa", label: "OA", color: "bg-warning" },
  { key: "interview", label: "Interview", color: "bg-accent" },
  { key: "offer", label: "Offer", color: "bg-success" },
];

export function ApplicationFunnel({ jobsByStatus, totalJobs }: ApplicationFunnelProps) {
  const maxPipeline = Math.max(...PIPELINE.map((p) => jobsByStatus[p.key] || 0), 1);

  if (totalJobs === 0) {
    return (
      <div className="py-6 text-center">
        <Plus size={20} className="mx-auto text-fg-subtle" />
        <p className="mt-2 text-sm text-fg-muted">No applications yet</p>
        <Link href="/jobs" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent/80 hover:underline">
          Add your first application
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {PIPELINE.map((p) => {
        const count = jobsByStatus[p.key] || 0;
        const pct = (count / maxPipeline) * 100;
        return (
          <div key={p.key} className="group flex items-center gap-3 transition-all duration-150">
            <span className="w-20 truncate font-mono text-xs text-fg-muted group-hover:text-fg-default">{p.label}</span>
            <div className="flex-1">
              <div className="h-6 overflow-hidden rounded-md bg-bg-hover transition-all duration-150 group-hover:bg-bg-hover/80">
                <div
                  className={`h-full rounded-md transition-all duration-300 ${p.color} opacity-80 group-hover:opacity-100`}
                  style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
            <span className="w-6 text-right font-mono text-xs text-fg-default transition-all duration-150 group-hover:text-fg-default group-hover:font-medium">{count}</span>
          </div>
        );
      })}

      {(jobsByStatus.rejected || 0) > 0 && (
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <span className="w-20 truncate font-mono text-xs text-fg-muted">Rejected</span>
          <span className="font-mono text-xs text-danger">{jobsByStatus.rejected}</span>
        </div>
      )}
    </div>
  );
}
