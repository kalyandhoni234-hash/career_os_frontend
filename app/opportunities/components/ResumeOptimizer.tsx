"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ResumeOptimization, CoverLetter } from "../types";

interface ResumeOptimizerProps {
  opportunityId: number;
  onOptimize: (id: number) => Promise<{ optimization: ResumeOptimization }>;
  onCoverLetter: (id: number) => Promise<{ cover_letter: CoverLetter }>;
}

export function ResumeOptimizer({ opportunityId, onOptimize, onCoverLetter }: ResumeOptimizerProps) {
  const [optimization, setOptimization] = useState<ResumeOptimization | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleOptimize = async () => {
    setLoading("resume");
    try {
      const result = await onOptimize(opportunityId);
      setOptimization(result.optimization);
    } catch { /* ignore */ }
    setLoading(null);
  };

  const handleCoverLetter = async () => {
    setLoading("cover");
    try {
      const result = await onCoverLetter(opportunityId);
      setCoverLetter(result.cover_letter);
    } catch { /* ignore */ }
    setLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl border border-border p-5"
    >
      <h3 className="text-sm font-semibold mb-4">One-Click Optimization</h3>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleOptimize} disabled={loading !== null}>
          {loading === "resume" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading === "resume" ? "Optimizing..." : "Optimize Resume"}
        </Button>
        <Button variant="secondary" onClick={handleCoverLetter} disabled={loading !== null}>
          {loading === "cover" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          {loading === "cover" ? "Generating..." : "Cover Letter"}
        </Button>
      </div>

      {optimization && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center gap-2 text-xs text-success">
            <CheckCircle2 size={14} />
            Resume optimized for {optimization.company_name} — {optimization.role}
          </div>

          <div>
            <p className="text-[11px] font-medium text-fg-muted mb-1">Optimized Summary</p>
            <p className="text-xs p-3 rounded-lg bg-bg-raised">{optimization.optimized_summary}</p>
          </div>

          {optimization.added_keywords.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-fg-muted mb-1">Added Keywords</p>
              <div className="flex flex-wrap gap-1">
                {optimization.added_keywords.map((kw) => (
                  <Badge key={kw} tone="success">{kw}</Badge>
                ))}
              </div>
            </div>
          )}

          {optimization.ats_improvement_estimate > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-fg-muted">Estimated ATS improvement:</span>
              <span className="text-success font-bold">+{optimization.ats_improvement_estimate} points</span>
            </div>
          )}
        </div>
      )}

      {coverLetter && (
        <div className="mt-3 pt-3 border-t border-border animate-slide-up">
          <p className="text-[11px] font-medium text-fg-muted mb-1">Cover Letter</p>
          <p className="text-xs mb-1">{coverLetter.subject}</p>
          <div className="text-xs p-3 rounded-lg bg-bg-raised whitespace-pre-line">{coverLetter.body}</div>
        </div>
      )}
    </motion.div>
  );
}
