"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Code2, Award, Target, Star, Send, FileText } from "lucide-react";
import type { TimelineEvent } from "../types";

interface CareerTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

const eventIcons: Record<string, React.ReactNode> = {
  experience: <Briefcase size={14} />,
  education: <GraduationCap size={14} />,
  project: <Code2 size={14} />,
  certificate: <Award size={14} />,
  achievement: <Star size={14} />,
  resume: <FileText size={14} />,
  application: <Send size={14} />,
  interview: <Briefcase size={14} />,
  offer: <Award size={14} />,
  goal: <Target size={14} />,
  recommendation: <Star size={14} />,
};

const eventColors: Record<string, string> = {
  experience: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  education: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  project: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  certificate: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  achievement: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  resume: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  application: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  interview: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
  offer: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  goal: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  recommendation: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
};

function getEventType(e: TimelineEvent): string {
  return e.event_type || e.type || "experience";
}

function getEventDate(e: TimelineEvent): string {
  const d = e.event_date || e.date || "";
  if (d.length >= 10) return d.slice(0, 10);
  return d;
}

export function CareerTimeline({ events, loading }: CareerTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 shimmer rounded-lg" />)}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
        <p className="text-xs text-fg-subtle">No timeline events yet. Start building your career!</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {events.slice(0, 15).map((event, i) => {
        const etype = getEventType(event);
        const icon = eventIcons[etype] || <Star size={14} />;
        const colorClass = eventColors[etype] || "bg-gray-100 text-gray-700 border-gray-200";
        const dateStr = getEventDate(event);

        return (
          <motion.div
            key={`${event.title}-${event.event_date || event.date || i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative flex gap-3 pb-3 pl-6"
          >
            {/* Timeline line */}
            {i < events.length - 1 && i < 14 && (
              <div className="absolute left-[11px] top-5 bottom-0 w-px bg-border" />
            )}
            {/* Dot */}
            <div className={`absolute left-0 top-1 rounded-full border-2 p-1 ${colorClass}`}>
              {icon}
            </div>
            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-fg-default">{event.title}</p>
                {dateStr && <span className="shrink-0 text-[10px] text-fg-muted">{dateStr}</span>}
              </div>
              {event.description && (
                <p className="mt-0.5 text-[11px] text-fg-muted line-clamp-2">{event.description}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
