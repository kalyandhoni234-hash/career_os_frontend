"use client";
import { motion } from "framer-motion";

interface CareerScoreProps {
  score: number;
  name: string;
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getColor(s: number) {
  if (s >= 80) return "#16a34a";
  if (s >= 50) return "#d97706";
  return "#dc2626";
}

export function CareerScore({ score = 0, name }: CareerScoreProps) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-6 transition-all duration-150 hover:border-accent/20">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <div className="relative flex shrink-0 items-center justify-center">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--color-bg-hover)" strokeWidth="8" />
            <motion.circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={getColor(score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-serif text-3xl font-medium tracking-tight text-fg-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {score}
            </motion.span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">Score</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-serif text-2xl font-medium tracking-tight text-fg-default">
            {timeOfDay()}, {name}
          </p>
          <p className="mt-1 text-sm text-fg-muted">Here&apos;s your career overview</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-lg border border-border bg-bg-default px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Status</p>
              <p className="text-sm font-medium text-fg-default">
                {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Developing" : "Getting started"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-bg-default px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Profile</p>
              <p className="text-sm font-medium text-success">{score}% complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
