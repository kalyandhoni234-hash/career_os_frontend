"use client";
import { Briefcase, MessageCircle, FileText, Clock } from "lucide-react";

interface ActivityItem {
  type: "job" | "coach" | "resume";
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const iconMap = {
  job: Briefcase,
  coach: MessageCircle,
  resume: FileText,
};

const colorMap: Record<string, string> = {
  job: "text-accent bg-accent-subtle",
  coach: "text-accent bg-accent-subtle",
  resume: "text-success bg-success-subtle",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="py-6 text-center">
        <Clock size={20} className="mx-auto text-fg-subtle" />
        <p className="mt-2 text-sm text-fg-muted">No recent activity</p>
        <p className="mt-0.5 text-xs text-fg-subtle">Start applying or chatting with the coach</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((item, i) => {
        const Icon = iconMap[item.type];
        return (
          <div key={`${item.type}-${item.timestamp}-${i}`} className="flex items-start gap-3 py-3 ledger-row transition-all duration-150 hover:pl-1 hover:bg-bg-hover/50 rounded-lg -mx-1 px-1">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colorMap[item.type]}`}>
              <Icon size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg-default line-clamp-1">{item.description}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
                {timeAgo(item.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
