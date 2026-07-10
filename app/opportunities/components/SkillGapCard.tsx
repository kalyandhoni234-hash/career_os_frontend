"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { SkillGap } from "../types";

interface SkillGapCardProps {
  gap: SkillGap;
}

export function SkillGapCard({ gap }: SkillGapCardProps) {
  const priorityColor = gap.priority === "high" ? "var(--color-danger)" : gap.priority === "medium" ? "var(--color-warning)" : "var(--color-success)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Skill Gap Analysis</h3>
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-mono"
            style={{
              backgroundColor: gap.coverage_pct >= 70 ? "var(--color-success-subtle)" : gap.coverage_pct >= 40 ? "var(--color-warning-subtle)" : "var(--color-danger-subtle)",
              color: priorityColor,
            }}
          >
            {gap.coverage_pct}%
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] text-fg-muted mb-2">Coverage</p>
        <div className="h-2.5 rounded-full bg-bg-hover overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gap.coverage_pct}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full"
            style={{ backgroundColor: priorityColor }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-medium text-fg-muted mb-2 flex items-center gap-1">
            <CheckCircle2 size={12} /> Current Skills ({gap.current_skills.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {gap.current_skills.map((s) => (
              <Badge key={s} tone="success">{s}</Badge>
            ))}
            {gap.current_skills.length === 0 && (
              <p className="text-[11px] text-fg-subtle">No matching skills</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium text-fg-muted mb-2 flex items-center gap-1">
            <AlertTriangle size={12} /> Missing Skills ({gap.missing_skills.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {gap.missing_skills.map((s) => (
              <Badge key={s} tone="danger">
                {s}
                {gap.ats_gain_estimates[s] && (
                  <span className="ml-1 opacity-70">+{gap.ats_gain_estimates[s]}ATS</span>
                )}
              </Badge>
            ))}
            {gap.missing_skills.length === 0 && (
              <p className="text-[11px] text-fg-subtle">No gaps found</p>
            )}
          </div>
        </div>
      </div>

      {gap.missing_skills.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[11px] text-fg-muted flex items-center gap-1">
            <TrendingUp size={12} />
            Estimated ATS improvement: <strong>+{Object.values(gap.ats_gain_estimates).reduce((a: number, b: number) => a + b, 0)}</strong> points
          </p>
        </div>
      )}
    </motion.div>
  );
}
