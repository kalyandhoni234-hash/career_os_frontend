"use client";

import { motion } from "framer-motion";
import { Info, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { MatchScore } from "../types";

interface MatchScoreCardProps {
  score: MatchScore;
  matched_skills?: string[];
  missing_skills?: string[];
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MatchScoreCard({ score, matched_skills, missing_skills }: MatchScoreCardProps) {
  const pct = Math.min(Math.max(score.overall_score || 0, 0), 100);
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : pct >= 40 ? "#f97316" : "#ef4444";
  const label = pct >= 80 ? "Strong Match" : pct >= 60 ? "Good Match" : pct >= 40 ? "Fair" : "Low Match";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl p-6 space-y-6"
    >
      {/* Radial Score */}
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <motion.circle
              cx="64" cy="64" r={RADIUS} fill="none" stroke={color} strokeWidth="10"
              strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
              transform="rotate(-90 64 64)"
              style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
            />
            <text x="64" y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill={color}>
              {pct}%
            </text>
            <text x="64" y="76" textAnchor="middle" fontSize="10" fill="var(--color-fg-muted)">
              Match
            </text>
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-fg-default">{label}</h3>
          <p className="text-sm text-fg-muted">
            {pct >= 70
              ? "You look like a strong candidate for this role"
              : pct >= 40
                ? "You could be competitive — address the gaps below"
                : "Focus on building relevant skills and experience"}
          </p>
          {score.explanation?.overall && (
            <p className="text-xs text-fg-muted flex items-start gap-1.5 mt-2">
              <Info size={12} className="shrink-0 mt-0.5 text-accent" />
              <span>{score.explanation.overall}</span>
            </p>
          )}
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Score Breakdown</h4>
        {items.map(({ key, label, weight }) => {
          const value = score[key] || 0;
          const ex = score.explanation?.[key];
          const barColor = value >= 80 ? "#22c55e" : value >= 60 ? "#f59e0b" : value >= 40 ? "#f97316" : "#ef4444";
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-fg-default">{label}</span>
                  <span className="text-[10px] text-fg-muted">{weight}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: barColor }}>{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                />
              </div>
              {ex && (
                <p className="text-[10px] text-fg-muted mt-1 flex items-start gap-1">
                  <Info size={10} className="shrink-0 mt-0.5" />
                  {ex}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {matched_skills && matched_skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-success flex items-center gap-1.5">
              <CheckCircle size={12} /> Strengths
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {matched_skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {missing_skills && missing_skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-danger flex items-center gap-1.5">
              <XCircle size={12} /> Missing
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {missing_skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-danger/10 text-danger text-[11px] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
