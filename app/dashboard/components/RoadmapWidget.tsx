"use client";

import { useEffect, useState, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Target, Clock, Zap, ArrowRight, CheckCircle2, BarChart3 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { DashboardRoadmap } from "@/app/career/types";

interface RoadmapWidgetProps {
  dreamRole: string;
}

export function RoadmapWidget({ dreamRole }: RoadmapWidgetProps) {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<DashboardRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoadmap = useCallback(async () => {
    try {
      const res = await apiFetch("/api/career/my-roadmap");
      if (res.roadmap) {
        startTransition(() => setRoadmap(res.roadmap));
      } else if (dreamRole) {
        const gen = await apiFetch("/api/career/roadmaps/auto-generate", {
          method: "POST",
          body: JSON.stringify({ target_role: dreamRole }),
        });
        if (gen.roadmap) startTransition(() => setRoadmap(gen.roadmap));
      }
    } catch {
      // silent
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [dreamRole]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-5">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-fg-muted" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Your Career Roadmap</h3>
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-5 shimmer rounded" />)}
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-5">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-fg-muted" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Your Career Roadmap</h3>
        </div>
        <div className="mt-4 text-center py-4">
          <Target size={24} className="mx-auto text-fg-subtle" />
          <p className="mt-2 text-xs text-fg-muted">Set a target role to get a personalized roadmap</p>
          {dreamRole && (
            <button
              onClick={() => {
                apiFetch("/api/career/roadmaps/auto-generate", {
                  method: "POST",
                  body: JSON.stringify({ target_role: dreamRole }),
                }).then((res) => {
                  if (res.roadmap) setRoadmap(res.roadmap as DashboardRoadmap);
                });
              }}
              className="mt-3 min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white"
            >
              Generate Roadmap <Zap size={12} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentLesson = roadmap.current_lesson;

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Your Career Roadmap</h3>
        </div>
        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
          {roadmap.target_role}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatBox icon={<Target size={12} />} label="Current Phase" value={roadmap.current_phase_title || "Starting"} />
        <StatBox icon={<BookOpen size={12} />} label="Current Module" value={roadmap.current_module_title || "Getting Started"} />
        <StatBox icon={<BarChart3 size={12} />} label="Progress" value={`${roadmap.progress}%`} />
        <StatBox icon={<Clock size={12} />} label="Est. Time Left" value={roadmap.estimated_days_remaining > 0 ? `${roadmap.estimated_days_remaining} days` : "Completed!"} />
      </div>

      {/* Streak + weekly hours */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-fg-muted">
        <span className="flex items-center gap-1">
          <Zap size={10} className="text-warning" /> {roadmap.streak} day streak
        </span>
        <span className="flex items-center gap-1">
          <Clock size={10} /> ~{roadmap.weekly_hours}h/week
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={10} className="text-success" /> {roadmap.totals.completed}/{roadmap.totals.total} lessons
        </span>
      </div>

      {/* Today's task */}
      {currentLesson && (
        <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="text-[10px] font-medium text-accent uppercase tracking-wider">Current Task</p>
          <p className="mt-1 text-xs font-medium text-fg-default">{currentLesson.title}</p>
          <div className="mt-1 flex items-center gap-2 text-[9px] text-fg-muted">
            <span className={`rounded px-1 py-px ${
              currentLesson.difficulty === "beginner" ? "bg-green-500/10 text-green-400" :
              currentLesson.difficulty === "intermediate" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-red-500/10 text-red-400"
            }`}>{currentLesson.difficulty}</span>
            <span>~{currentLesson.estimated_minutes} min</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 rounded-full bg-bg-default overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${roadmap.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-3 flex gap-2">
        {currentLesson && (
          <button
            onClick={() => router.push(`/roadmaps?id=${roadmap.id}`)}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 active:scale-95"
          >
            Continue Learning <ArrowRight size={12} />
          </button>
        )}
        <button
          onClick={() => router.push(`/roadmaps?id=${roadmap.id}`)}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-fg-default transition-all hover:border-accent/30 hover:bg-bg-hover active:scale-95"
        >
          View Full Roadmap <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-default p-2.5">
      <div className="flex items-center gap-1 text-[9px] text-fg-muted uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-xs font-medium text-fg-default truncate">{value}</p>
    </div>
  );
}
