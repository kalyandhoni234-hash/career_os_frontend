"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Link as LinkIcon, Sparkles, XCircle, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface JobTailoringPanelProps {
  onTailor: (jobDescription: string) => void;
  tailoringResult: {
    fit_score?: number;
    missing_skills?: string[];
    improvements?: string[];
  } | null;
  loading: boolean;
}

export function JobTailoringPanel({ onTailor, tailoringResult, loading }: JobTailoringPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "url">("text");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const handleGenerate = () => {
    const jd = inputMode === "url" ? jobUrl : jobDescription;
    if (!jd.trim()) return;
    onTailor(jd.trim());
  };

  const scoreColor = tailoringResult?.fit_score !== undefined
    ? tailoringResult.fit_score >= 80 ? "text-success" : tailoringResult.fit_score >= 50 ? "text-warning" : "text-danger"
    : "text-fg-muted";

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Job Tailoring</h3>
        </div>
        {expanded ? <ChevronUp size={14} className="text-fg-muted" /> : <ChevronDown size={14} className="text-fg-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-default p-1">
              <button
                onClick={() => setInputMode("text")}
                className={`flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                  inputMode === "text" ? "bg-accent text-white shadow-sm" : "text-fg-muted hover:text-fg-default"
                }`}
              >
                Paste JD
              </button>
              <button
                onClick={() => setInputMode("url")}
                className={`flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                  inputMode === "url" ? "bg-accent text-white shadow-sm" : "text-fg-muted hover:text-fg-default"
                }`}
              >
                Job URL
              </button>
            </div>

            {inputMode === "text" ? (
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={4}
                className="field w-full resize-none"
              />
            ) : (
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="shrink-0 text-fg-muted" />
                <input
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                  className="field flex-1"
                />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              loading={loading}
              size="sm"
              className="w-full"
              icon={<Sparkles size={12} />}
            >
              {loading ? "Generating..." : "Generate Tailored Resume"}
            </Button>

            <p className="text-[10px] leading-tight text-fg-subtle">
              Creates a new tailored version. Your original resume is never overwritten.
            </p>

            <AnimatePresence>
              {tailoringResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 rounded-lg border border-border bg-bg-default p-3"
                >
                  {tailoringResult.fit_score !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-fg-muted">Fit Score</span>
                      <span className={`font-serif text-lg font-medium ${scoreColor}`}>
                        {tailoringResult.fit_score}%
                      </span>
                    </div>
                  )}

                  {tailoringResult.missing_skills && tailoringResult.missing_skills.length > 0 && (
                    <div>
                      <p className="mb-1 flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-warning">
                        <XCircle size={10} /> Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tailoringResult.missing_skills.map((s) => (
                          <Badge key={s} tone="warning">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tailoringResult.improvements && tailoringResult.improvements.length > 0 && (
                    <div>
                      <p className="mb-1 flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-accent">
                        <TrendingUp size={10} /> Improvements
                      </p>
                      <ul className="space-y-0.5">
                        {tailoringResult.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-fg-muted">
                            <span className="mt-0.5 text-accent">•</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
