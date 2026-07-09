"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

interface GapItem {
  skill: string;
  priority: number;
  recommended_project: string | null;
  estimated_ats_gain: number;
}

interface AnalysisData {
  target_role?: string;
  coverage: number;
  matched_skills: string[];
  missing_skills: string[];
  gaps?: GapItem[];
}

interface SkillGapAnalysisProps {
  analysis: AnalysisData | null;
  loading?: boolean;
}

export function SkillGapAnalysis({ analysis, loading }: SkillGapAnalysisProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Skill Gap Analysis</h3>
        <div className="mt-3 space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 shimmer rounded" />)}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Skill Gap Analysis</h3>
        <p className="mt-2 text-xs text-fg-subtle">Set a target role to see your skill gaps.</p>
      </div>
    );
  }

  const { target_role, coverage, matched_skills, missing_skills, gaps } = analysis;
  const coverageColor = coverage >= 80 ? "#16a34a" : coverage >= 50 ? "#2563eb" : coverage >= 25 ? "#d97706" : "#dc2626";

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
        Skill Gap: {target_role || "Unknown"}
      </h3>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <motion.circle
              cx="30" cy="30" r="25" fill="none" stroke={coverageColor} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 25}
              initial={{ strokeDashoffset: 2 * Math.PI * 25 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 25 * (1 - coverage / 100) }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: coverageColor }}>{coverage}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-fg-default">
            {matched_skills.length}/{matched_skills.length + missing_skills.length} skills matched
          </p>
          <p className="text-[10px] text-fg-muted">Required for {target_role}</p>
        </div>
      </div>

      {matched_skills.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-success">
            <CheckCircle2 size={11} /> Matched Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {matched_skills.map((s) => (
              <span key={s} className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] text-success">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {gaps && gaps.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-warning">
            <AlertTriangle size={11} /> Skill Gaps
          </p>
          <div className="space-y-1.5">
            {gaps.slice(0, 5).map((gap) => (
              <div key={gap.skill} className="flex items-center justify-between rounded-lg bg-bg-default p-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-fg-default">{gap.skill}</span>
                    <span className="text-[10px] text-fg-muted">
                      {"★".repeat(gap.priority)}{"☆".repeat(5 - gap.priority)}
                    </span>
                  </div>
                  {gap.recommended_project && (
                    <p className="mt-0.5 text-[10px] text-fg-muted">{gap.recommended_project}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-medium text-accent">+{gap.estimated_ats_gain}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {missing_skills.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-fg-muted">
            <TrendingUp size={11} /> Missing Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {missing_skills.slice(0, 10).map((s) => (
              <span key={s} className="rounded bg-bg-hover px-1.5 py-0.5 text-[10px] text-fg-muted">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
