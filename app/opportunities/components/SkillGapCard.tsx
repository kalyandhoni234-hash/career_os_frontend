"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp, BookOpen, Clock, Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { SkillGap } from "../types";

interface SkillGapCardProps {
  gap: SkillGap;
}

const LEARNING_PLANS: Record<string, { difficulty: string; hours: number; resources: string[] }> = {
  Docker: { difficulty: "Medium", hours: 6, resources: ["Docker Docs", "Docker Mastery (Udemy)", "Career OS Docker Roadmap"] },
  Kubernetes: { difficulty: "Hard", hours: 16, resources: ["K8s Docs", "CKAD Prep", "KodeKloud"] },
  Redis: { difficulty: "Medium", hours: 4, resources: ["Redis University", "Redis in Action"] },
  AWS: { difficulty: "Hard", hours: 40, resources: ["AWS Free Tier", "AWS Certified Solutions Architect"] },
  "CI/CD": { difficulty: "Medium", hours: 8, resources: ["GitHub Actions Docs", "Jenkins Tutorials"] },
  GraphQL: { difficulty: "Medium", hours: 6, resources: ["How to GraphQL", "Apollo Odyssey"] },
  TypeScript: { difficulty: "Medium", hours: 10, resources: ["TypeScript Handbook", "TypeScript Deep Dive"] },
  PostgreSQL: { difficulty: "Medium", hours: 8, resources: ["PostgreSQL Tutorial", "PG Exercises"] },
  Go: { difficulty: "Medium", hours: 12, resources: ["Go Tour", "Learn Go with Tests"] },
  Rust: { difficulty: "Hard", hours: 20, resources: ["Rust Book", "Rustlings"] },
  React: { difficulty: "Medium", hours: 8, resources: ["React Docs", "Epic React"] },
  MongoDB: { difficulty: "Medium", hours: 6, resources: ["MongoDB University", "Mongo Docs"] },
  Kafka: { difficulty: "Hard", hours: 10, resources: ["Kafka Docs", "Confluent Tutorials"] },
  Terraform: { difficulty: "Medium", hours: 8, resources: ["Terraform Docs", "HashiCorp Learn"] },
};

export function SkillGapCard({ gap }: SkillGapCardProps) {
  const priorityColor = gap.priority === "high" ? "var(--color-danger)" : gap.priority === "medium" ? "var(--color-warning)" : "var(--color-success)";
  const totalAtsGain = Object.values(gap.ats_gain_estimates || {}).reduce((a: number, b: number) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl p-5 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg-default flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-warning" />
          Skill Gap Analysis
        </h3>
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-mono"
            style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}
          >
            {gap.coverage_pct}%
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] text-fg-muted mb-2">Coverage</p>
        <div className="h-2.5 rounded-full bg-border overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gap.coverage_pct}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full"
            style={{ backgroundColor: priorityColor }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-fg-muted flex items-center gap-1">
            <CheckCircle2 size={12} className="text-success" /> Current Skills ({gap.current_skills.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {gap.current_skills.map((s) => (
              <Badge key={s} tone="success">{s}</Badge>
            ))}
            {gap.current_skills.length === 0 && (
              <p className="text-[11px] text-fg-muted">No matching skills</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium text-fg-muted flex items-center gap-1">
            <BookOpen size={12} className="text-danger" /> Missing Skills ({gap.missing_skills.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {gap.missing_skills.map((s) => (
              <Badge key={s} tone="danger">
                {s}
                {gap.ats_gain_estimates?.[s] && (
                  <span className="ml-1 opacity-70">+{gap.ats_gain_estimates[s]} ATS</span>
                )}
              </Badge>
            ))}
            {gap.missing_skills.length === 0 && (
              <p className="text-[11px] text-fg-muted">No gaps found</p>
            )}
          </div>
        </div>
      </div>

      {/* Learning Plans */}
      {gap.missing_skills.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} /> Suggested Learning Plans
          </h4>
          <div className="space-y-2">
            {gap.missing_skills.slice(0, 4).map((skill) => {
              const plan = LEARNING_PLANS[skill] || { difficulty: "Unknown", hours: 0, resources: ["Career OS Roadmap"] };
              return (
                <div key={skill} className="flex items-start gap-3 p-2.5 rounded-lg bg-bg-hover/50 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-fg-default">{skill}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        plan.difficulty === "Easy" ? "bg-success/10 text-success" :
                        plan.difficulty === "Medium" ? "bg-warning/10 text-warning" :
                        "bg-danger/10 text-danger"
                      }`}>{plan.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-fg-muted">
                      <span className="flex items-center gap-1"><Clock size={10} />~{plan.hours}h</span>
                      {gap.ats_gain_estimates?.[skill] && (
                        <span className="flex items-center gap-1"><TrendingUp size={10} />+{gap.ats_gain_estimates[skill]} ATS</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {plan.resources.map((r) => (
                        <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-border text-fg-muted">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-fg-muted flex items-center gap-1 pt-1">
            <ExternalLink size={10} /> Connect to Learning Roadmaps for structured learning
          </p>
        </div>
      )}

      {totalAtsGain > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-[11px] text-fg-muted flex items-center gap-1">
            <TrendingUp size={12} className="text-accent" />
            Estimated ATS improvement: <strong className="text-accent">+{totalAtsGain}</strong> points by filling these gaps
          </p>
        </div>
      )}
    </motion.div>
  );
}
