"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface ChecklistSection {
  key: string;
  label: string;
  completed: boolean;
}

interface CompletionChecklistProps {
  completionPct: number;
  sections: ChecklistSection[];
}

export function CompletionChecklist({ completionPct, sections }: CompletionChecklistProps) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 transition-all duration-200 hover:border-accent/20">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        <div className="relative flex shrink-0 items-center justify-center">
          <svg width="120" height="120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-bg-hover)" strokeWidth="6" />
            <motion.circle
              cx="60" cy="60"
              r={radius}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-serif text-2xl font-medium tracking-tight text-fg-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {completionPct}%
            </motion.span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-2.5"
            >
              {section.completed ? (
                <Check className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-fg-muted" />
              )}
              <span className={`text-sm ${section.completed ? "text-fg-default" : "text-fg-muted"}`}>
                {section.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-fg-subtle">
        Complete your profile to unlock AI recommendations, resume analysis, career insights, and personalized roadmaps.
      </p>
    </div>
  );
}
