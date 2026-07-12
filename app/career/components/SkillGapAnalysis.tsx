"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ExternalLink,
  Unlock,
  Layers,
} from "lucide-react";

interface GapItem {
  skill: string;
  priority: number;
  tier?: string;
  reason?: string;
  recommended_project?: string | null;
  estimated_ats_gain?: number;
  learning_time_weeks?: number;
  resources?: string[];
  unlocks?: string[];
}

interface PhaseItem {
  phase: number;
  title: string;
  description: string;
  months_estimated: number;
  skills: GapItem[];
}

interface RoadmapData {
  phases: PhaseItem[];
  total_months_estimated: number;
}

interface AnalysisData {
  target_role?: string;
  role_description?: string;
  coverage: number;
  coverage_by_tier?: {
    core: number;
    intermediate: number;
    advanced: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  gaps?: GapItem[];
  roadmap?: RoadmapData;
}

interface SkillGapAnalysisProps {
  analysis: AnalysisData | null;
  loading?: boolean;
}

function priorityColor(p: number): string {
  if (p >= 5) return "bg-red-500/10 text-red-400 border-red-500/20";
  if (p >= 4) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (p >= 3) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-green-500/10 text-green-400 border-green-500/20";
}

function priorityLabel(p: number): string {
  if (p >= 5) return "Critical";
  if (p >= 4) return "High";
  if (p >= 3) return "Medium";
  return "Nice to Have";
}

function tierColor(tier?: string): string {
  switch (tier) {
    case "core":
      return "bg-accent/10 text-accent border-accent/20";
    case "intermediate":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "advanced":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default:
      return "bg-fg-muted/10 text-fg-muted border-fg-muted/20";
  }
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

  const {
    target_role,
    role_description,
    coverage = 0,
    coverage_by_tier,
    matched_skills,
    missing_skills,
    gaps,
    roadmap,
  } = analysis;

  const totalSkills = (matched_skills?.length || 0) + (missing_skills?.length || 0);
  const coverageColor = coverage >= 80 ? "#16a34a" : coverage >= 50 ? "#2563eb" : coverage >= 25 ? "#d97706" : "#dc2626";

  const coreCoverage = coverage_by_tier?.core ?? null;
  const intermediateCoverage = coverage_by_tier?.intermediate ?? null;
  const advancedCoverage = coverage_by_tier?.advanced ?? null;

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
            Skill Gap: {target_role || "Unknown"}
          </h3>
          {role_description && (
            <p className="mt-0.5 text-[10px] text-fg-subtle leading-relaxed max-w-md">{role_description}</p>
          )}
        </div>
      </div>

      {/* Coverage donut + tier breakdown */}
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="none" stroke="var(--border)" strokeWidth="5" />
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

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-fg-default">
            {matched_skills.length}/{totalSkills} skills matched
          </p>
          <p className="text-[10px] text-fg-muted">Required for {target_role}</p>

          {coverage_by_tier && (
            <div className="mt-1.5 flex flex-wrap gap-2">
              {coreCoverage !== null && (
                <span className="inline-flex items-center gap-1 rounded border border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[9px] text-accent">
                  <Layers size={9} /> Core: {coreCoverage}%
                </span>
              )}
              {intermediateCoverage !== null && (
                <span className="inline-flex items-center gap-1 rounded border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 text-[9px] text-blue-400">
                  <Layers size={9} /> Intermediate: {intermediateCoverage}%
                </span>
              )}
              {advancedCoverage !== null && (
                <span className="inline-flex items-center gap-1 rounded border border-purple-500/20 bg-purple-500/5 px-1.5 py-0.5 text-[9px] text-purple-400">
                  <Layers size={9} /> Advanced: {advancedCoverage}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Matched skills */}
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

      {/* Skill gaps with explainability */}
      {gaps && gaps.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-warning">
            <AlertTriangle size={11} /> Skill Gaps
          </p>
          <div className="space-y-2">
            {gaps.slice(0, 8).map((gap) => (
              <div key={gap.skill} className="rounded-lg bg-bg-default p-2.5">
                {/* Header: skill name + priorities */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-fg-default">{gap.skill}</span>

                  {gap.tier && (
                    <span className={`rounded border px-1 py-px text-[9px] font-medium uppercase ${tierColor(gap.tier)}`}>
                      {gap.tier}
                    </span>
                  )}

                  <span className={`rounded border px-1 py-px text-[9px] font-medium ${priorityColor(gap.priority)}`}>
                    {priorityLabel(gap.priority)}
                  </span>

                  {gap.estimated_ats_gain != null && (
                    <span className="text-[10px] font-medium text-accent ml-auto">+{gap.estimated_ats_gain}% ATS</span>
                  )}
                </div>

                {/* Reason */}
                {gap.reason && (
                  <p className="mt-1 text-[10px] text-fg-subtle leading-relaxed">{gap.reason}</p>
                )}

                {/* Meta row: learning time + resources + unlocks */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {gap.learning_time_weeks != null && (
                    <span className="flex items-center gap-1 text-[9px] text-fg-muted">
                      <Clock size={9} /> ~{gap.learning_time_weeks} weeks
                    </span>
                  )}

                  {gap.unlocks && gap.unlocks.length > 0 && (
                    <span className="flex items-center gap-1 text-[9px] text-fg-muted">
                      <Unlock size={9} /> Unlocks: {gap.unlocks.slice(0, 3).join(", ")}
                    </span>
                  )}
                </div>

                {/* Resources */}
                {gap.resources && gap.resources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {gap.resources.slice(0, 3).map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5 text-[9px] text-accent">
                        <ExternalLink size={8} /> {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommended project */}
                {gap.recommended_project && (
                  <p className="mt-1 text-[9px] text-fg-muted italic leading-relaxed">
                    {gap.recommended_project}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills fallback (flat list) */}
      {(!gaps || gaps.length === 0) && missing_skills.length > 0 && (
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

      {/* Learning Roadmap */}
      {roadmap && roadmap.phases && roadmap.phases.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-fg-default">
            <Layers size={11} /> Learning Roadmap
            <span className="text-[9px] text-fg-muted font-normal">
              (~{roadmap.total_months_estimated} months estimated)
            </span>
          </p>
          <div className="space-y-2">
            {roadmap.phases.map((phase) => (
              <div key={phase.phase} className="rounded-lg border border-border bg-bg-surface/50 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-fg-default">
                    Phase {phase.phase}: {phase.title}
                  </span>
                  <span className="text-[9px] text-fg-muted">~{phase.months_estimated} months</span>
                </div>
                <p className="mt-0.5 text-[9px] text-fg-subtle">{phase.description}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {phase.skills.map((s) => {
                    const pc = priorityColor(s.priority);
                    return (
                      <span key={s.skill} className={`rounded px-1 py-px text-[9px] ${pc}`}>
                        {s.skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
