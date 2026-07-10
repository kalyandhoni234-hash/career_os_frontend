"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AtsResult } from "../types";

interface ATSPanelProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  atsResult: AtsResult | null;
  loading: boolean;
  onScore: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  devops: "DevOps",
  ai: "AI / ML",
  testing: "Testing",
};

export function ATSPanel({ jobDescription, onJobDescriptionChange, atsResult, loading, onScore }: ATSPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-center gap-2">
        <Search size={14} className="text-accent" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">ATS Intelligence</h3>
      </div>

      <div className="mt-3">
        <label htmlFor="ats-job-description" className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Target Job Description</label>
        <textarea
          id="ats-job-description"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste a job description to check ATS compatibility..."
          rows={3}
          className="mt-1 w-full resize-none rounded-lg border border-border bg-bg-default px-3 py-2 text-xs text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
        />
        <Button onClick={onScore} loading={loading} size="sm" className="mt-2 w-full" icon={<Search size={12} />}>
          {loading ? "Analyzing..." : "Check ATS Score"}
        </Button>
      </div>

      <AnimatePresence>
        {atsResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
          >
            {atsResult.overall_score !== null && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-bg-default p-3">
                <span className="text-sm text-fg-muted">Overall Score</span>
                <span className={`font-serif text-xl font-medium ${
                  atsResult.overall_score >= 80 ? "text-success" : atsResult.overall_score >= 50 ? "text-warning" : "text-danger"
                }`}>
                  {atsResult.overall_score}%
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <MiniScore label="Keyword Match" value={atsResult.keyword_match} />
              <MiniScore label="Action Verbs" value={atsResult.action_verb_score} />
              <MiniScore label="Skills Density" value={Math.round(atsResult.skills_density)} />
              <MiniScore label="Keywords" value={atsResult.total_keywords} suffix="total" />
            </div>

            {Object.keys(atsResult.category_scores || {}).length > 0 && (
              <div>
                <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Category Breakdown</p>
                <div className="space-y-1.5">
                  {Object.entries(atsResult.category_scores).map(([cat, score]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="w-20 text-[10px] text-fg-muted">{CATEGORY_LABELS[cat] || cat}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-hover">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.1, 1] }}
                          className={`h-full rounded-full ${score >= 80 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-danger"}`}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-fg-muted">{score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {atsResult.matched.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-success">
                  <CheckCircle2 size={10} /> Matched ({atsResult.matched.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {atsResult.matched.map((kw) => (
                    <Badge key={kw} tone="success">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {atsResult.missing.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-danger">
                  <XCircle size={10} /> Missing ({atsResult.missing.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {atsResult.missing.map((kw) => (
                    <Badge key={kw} tone="danger">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {atsResult.weak_verbs && atsResult.weak_verbs.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning-subtle p-2.5">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-[11px] font-medium text-warning">Weak verbs found</p>
                  <p className="text-[10px] text-fg-muted">{atsResult.weak_verbs.join(", ")}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniScore({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const color = value >= 80 ? "text-success" : value >= 50 ? "text-warning" : "text-danger";
  return (
    <div className="rounded-lg border border-border bg-bg-default p-2.5">
      <p className="font-mono text-[10px] text-fg-muted">{label}</p>
      <p className={`font-mono text-sm font-medium ${color}`}>{value}{suffix ? ` ${suffix}` : "%"}</p>
    </div>
  );
}
