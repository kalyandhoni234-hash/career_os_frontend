"use client";

import { motion } from "framer-motion";
import { Clock, FileText, TrendingUp, Download, Briefcase, Code2, Globe2, Sparkles } from "lucide-react";
import type { RecentActivityItem } from "../types";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  resume: <FileText size={12} />,
  ats: <TrendingUp size={12} />,
  export: <Download size={12} />,
  tailor: <Briefcase size={12} />,
  generate: <Sparkles size={12} />,
  github: <Code2 size={12} />,
  linkedin: <Globe2 size={12} />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  resume: "text-accent",
  ats: "text-success",
  export: "text-fg-muted",
  tailor: "text-warning",
  generate: "text-accent",
  github: "text-fg-muted",
  linkedin: "text-blue-500",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock size={14} className="text-fg-muted" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Recent Activity</h3>
        </div>
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-5">
          <p className="text-xs text-fg-subtle">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock size={14} className="text-fg-muted" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Recent Activity</h3>
      </div>
      <div className="space-y-1">
        {activities.slice(0, 8).map((item, i) => {
          const icon = ACTIVITY_ICONS[item.type] || <FileText size={12} />;
          const color = ACTIVITY_COLORS[item.type] || "text-fg-muted";
          return (
            <motion.div
              key={`${item.timestamp}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-bg-hover"
            >
              <span className={`shrink-0 ${color}`}>{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-fg-default">{item.description}</p>
              </div>
              <span className="shrink-0 text-[10px] text-fg-subtle">
                {formatTimeAgo(item.timestamp)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(timestamp).toLocaleDateString();
}
