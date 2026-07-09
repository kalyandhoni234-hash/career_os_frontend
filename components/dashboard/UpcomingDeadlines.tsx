"use client";
import { Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface DeadlineItem {
  company: string;
  role: string;
  deadline: string;
  id: number;
  status: string;
}

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = then.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="py-6 text-center">
        <Calendar size={20} className="mx-auto text-fg-subtle" />
        <p className="mt-2 text-sm text-fg-muted">No upcoming deadlines</p>
        <p className="mt-0.5 text-xs text-fg-subtle">Add deadlines in your applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {deadlines.map((d) => {
        const days = daysUntil(d.deadline);
        const urgent = days <= 3;
        return (
          <Link
            key={d.id}
            href="/jobs"
            className="flex items-start gap-3 rounded-lg border border-border bg-bg-default p-3 card-hover"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-bg-surface text-xs font-bold text-accent transition-all duration-150 group-hover:bg-accent-subtle group-hover:border-accent/30">
              {d.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg-default">{d.role}</p>
              <p className="truncate text-xs text-fg-muted">{d.company}</p>
              <p className={`mt-0.5 font-mono text-xs ${urgent ? "text-danger" : "text-warning"}`}>
                {urgent && <AlertTriangle size={10} className="inline mr-1 -mt-0.5" />}
                {d.deadline} ({days}d)
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
