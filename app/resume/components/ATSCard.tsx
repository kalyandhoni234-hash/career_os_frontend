"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, AlertTriangle, TrendingUp, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AtsResult } from "../types";

interface ATSCardProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  atsResult: AtsResult | null;
  loading: boolean;
  onScore: () => void;
  onImproveWithAI: () => void;
}

export function ATSCard({
  jobDescription, onJobDescriptionChange, atsResult, loading, onScore, onImproveWithAI,
}: ATSCardProps) {
  const overallScore = atsResult?.overall_score ?? null;
  const scoreColor = overallScore !== null
    ? overallScore >= 80 ? "text-success" : overallScore >= 50 ? "text-warning" : "text-danger"
    : "text-fg-muted";
  const strokeColor = overallScore !== null
    ? overallScore >= 80 ? "#22C55E" : overallScore >= 50 ? "#F59E0B" : "#EF4444"
    : "var(--border)";
  const circumference = 2 * Math.PI * 28;
  const offset = overallScore !== null ? circumference - (overallScore / 100) * circumference : circumference;

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-accent" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">ATS Score</h3>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-bg-default p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
                <motion.circle
                  cx="32" cy="32" r="28" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1, ease: [0.25, 0.1, 0.1, 1] }}
                />
              </svg>
            </div>
            <div>
              <p className={`font-serif text-2xl font-medium ${scoreColor}`}>
                {overallScore !== null ? `${overallScore}%` : "—"}
              </p>
              <p className="text-[11px] text-fg-muted">Overall match</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste a job description to check ATS compatibility..."
          rows={2}
          className="field mt-1 w-full resize-none"
        />
        <div className="mt-2 flex gap-2">
          <Button onClick={onScore} loading={loading} size="sm" className="flex-1" icon={<Search size={12} />}>
            {loading ? "Analyzing..." : "Check Score"}
          </Button>
          <Button onClick={onImproveWithAI} size="sm" variant="secondary" icon={<Sparkles size={12} />}>
            Improve
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {atsResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <MiniStat label="Keywords" value={`${atsResult.matched.length}/${atsResult.total_keywords}`} />
              <MiniStat label="Verb Score" value={`${atsResult.action_verb_score}%`} />
            </div>

            {atsResult.missing.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-danger">
                  <XCircle size={10} /> Missing Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {atsResult.missing.slice(0, 6).map((kw) => (
                    <Badge key={kw} tone="danger">{kw}</Badge>
                  ))}
                  {atsResult.missing.length > 6 && (
                    <Badge tone="neutral">+{atsResult.missing.length - 6}</Badge>
                  )}
                </div>
              </div>
            )}

            {atsResult.weak_verbs?.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning-subtle p-2">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-[11px] font-medium text-warning">Weak verbs detected</p>
                  <p className="text-[10px] text-fg-muted">{atsResult.weak_verbs.slice(0, 3).join(", ")}</p>
                </div>
              </div>
            )}

            {overallScore !== null && overallScore < 80 && (
              <Button size="sm" variant="secondary" className="w-full" icon={<TrendingUp size={12} />} onClick={onImproveWithAI}>
                Improve ATS Score
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-default p-2">
      <p className="font-mono text-[10px] text-fg-muted">{label}</p>
      <p className="font-mono text-xs font-medium text-fg-default">{value}</p>
    </div>
  );
}
