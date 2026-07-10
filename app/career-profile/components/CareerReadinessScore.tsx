"use client";

import { motion } from "framer-motion";

interface CareerReadinessScoreProps {
  score: {
    overall: number;
    breakdown: Record<string, number>;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  profile: "Profile",
  education: "Education",
  skills: "Skills",
  resume: "Resume",
  projects: "Projects",
  experience: "Experience",
  networking: "Networking",
};

function getColor(pct: number): string {
  if (pct >= 80) return "var(--color-success)";
  if (pct >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function CareerReadinessScore({ score }: CareerReadinessScoreProps) {
  const categories = Object.entries(score.breakdown).filter(([key]) => key in CATEGORY_LABELS);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 transition-all duration-200 hover:border-accent/20">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
          </svg>
        </div>
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Score Breakdown</h3>
      </div>

      <div className="mb-5 flex flex-col items-center">
        <motion.span
          className="font-serif text-4xl font-medium tracking-tight text-fg-default"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
        >
          {score.overall}
        </motion.span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Career Readiness Score</span>
      </div>

      <div className="space-y-3">
        {categories.map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-fg-default">{CATEGORY_LABELS[key] || key}</span>
              <span className="font-mono text-xs text-fg-muted">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getColor(value) }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
