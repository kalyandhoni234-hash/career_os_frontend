"use client";

import { motion } from "framer-motion";
import type { CareerScoreResult } from "../types";

interface CareerScoreCardProps {
  score: CareerScoreResult;
  compact?: boolean;
}

export function CareerScoreCard({ score, compact }: CareerScoreCardProps) {
  if (typeof score.overall_score !== "number" || !score.breakdown) {
    console.error("[CareerScoreCard] Contract violation: score must contain overall_score (number) and breakdown (object). Received:", score);
    return null;
  }
  const s = score.overall_score;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (s / 100) * circumference;
  const color = s >= 80 ? "#16a34a" : s >= 60 ? "#2563eb" : s >= 40 ? "#d97706" : "#dc2626";
  const label = s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Developing" : "Getting started";

  const breakdown = score.breakdown;
  const bars = [
    { label: "Resume", value: breakdown.resume_score, color: "#2563eb" },
    { label: "ATS", value: breakdown.ats_score, color: "#7c3aed" },
    { label: "Projects", value: breakdown.projects_score, color: "#059669" },
    { label: "Applications", value: breakdown.applications_score, color: "#d97706" },
    { label: "Learning", value: breakdown.learning_score, color: "#0891b2" },
    { label: "Interviews", value: breakdown.interview_score, color: "#db2777" },
    { label: "Skills", value: breakdown.skill_coverage, color: "#6366f1" },
  ];

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.1, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-2xl font-medium" style={{ color }}>{s}</span>
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-fg-muted">Career Score</p>
          <p className="mt-0.5 text-sm font-medium text-fg-default" style={{ color }}>{label}</p>
          {!compact && (
            <p className="mt-1 text-xs text-fg-subtle">
              Updated {score.timestamp ? new Date(score.timestamp).toLocaleDateString() : "today"}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-4 space-y-1.5">
          {bars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="w-20 text-[11px] text-fg-muted">{bar.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-bg-default overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: bar.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <span className="w-8 text-right text-[11px] font-medium text-fg-default">{bar.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
