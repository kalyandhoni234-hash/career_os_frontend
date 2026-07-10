"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, HelpCircle } from "lucide-react";
import type { MatchScore } from "../types";

interface MatchScoreCardProps {
  score: MatchScore;
}

export function MatchScoreCard({ score }: MatchScoreCardProps) {
  const items = [
    { key: "ats_match" as const, label: "ATS Match", weight: "25%" },
    { key: "skill_match" as const, label: "Skill Match", weight: "20%" },
    { key: "resume_match" as const, label: "Resume Fit", weight: "15%" },
    { key: "experience_match" as const, label: "Experience", weight: "12%" },
    { key: "project_match" as const, label: "Projects", weight: "10%" },
    { key: "goal_match" as const, label: "Goal Match", weight: "8%" },
    { key: "location_match" as const, label: "Location", weight: "5%" },
    { key: "salary_match" as const, label: "Salary", weight: "5%" },
  ];

  const getColor = (v: number) => {
    if (v >= 80) return "var(--color-success)";
    if (v >= 50) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const getLabel = (v: number) => {
    if (v >= 80) return "Excellent";
    if (v >= 60) return "Good";
    if (v >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl border border-border p-5"
    >
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold font-mono"
          style={{
            backgroundColor: `${getColor(score.overall_score)}15`,
            color: getColor(score.overall_score),
          }}
        >
          {score.overall_score}
        </div>
        <div>
          <h3 className="text-sm font-semibold">Overall Match</h3>
          <p className="text-xs text-fg-muted">{getLabel(score.overall_score)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(({ key, label, weight }) => {
          const value = score[key];
          const explanation = score.explanation?.[key];
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-fg-subtle">{weight}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold" style={{ color: getColor(value) }}>
                    {value}%
                  </span>
                  <span className="text-[10px] text-fg-muted">{getLabel(value)}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-bg-hover overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getColor(value) }}
                />
              </div>
              {explanation && (
                <p className="text-[10px] text-fg-muted mt-1 flex items-start gap-1">
                  <Info size={10} className="shrink-0 mt-0.5" />
                  {explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[11px] text-fg-muted text-center">
          {score.overall_score >= 70
            ? "You're a strong candidate for this role"
            : score.overall_score >= 40
              ? "You could be competitive — address the gaps below"
              : "Focus on building relevant skills and experience"}
        </p>
      </div>
    </motion.div>
  );
}
