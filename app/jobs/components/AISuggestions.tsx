"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Suggestion } from "../types";

const IMPACT_ORDER = { high: 0, medium: 1, low: 2 };
const IMPACT_COLORS = { high: "bg-accent/10 border-accent/20 text-accent", medium: "bg-warning/10 border-warning/20 text-warning", low: "bg-bg-default border-border text-fg-muted" };
const CATEGORY_LABELS: Record<string, string> = {
  resume: "Resume",
  applications: "Applications",
  "interview-prep": "Interview Prep",
  networking: "Networking",
};

export function AISuggestions({ refreshKey }: { refreshKey: number }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(() => {
      setLoading(true);
      apiFetch("/api/jobs/suggestions")
        .then((data) => setSuggestions(data.suggestions || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [refreshKey]);

  const sorted = [...suggestions].sort((a, b) => IMPACT_ORDER[a.impact as keyof typeof IMPACT_ORDER] - IMPACT_ORDER[b.impact as keyof typeof IMPACT_ORDER]);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 transition-all duration-150 hover:border-accent/20">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-accent" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">AI Suggestions</h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-fg-muted" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sorted.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.25, 0.1, 0.1, 1] }}
                className={`group rounded-lg border p-3 transition-all duration-150 hover:shadow-sm ${IMPACT_COLORS[s.impact as keyof typeof IMPACT_COLORS] || IMPACT_COLORS.medium}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={12} className="shrink-0 opacity-60" />
                      <span className="font-mono text-[10px] font-medium uppercase tracking-widest opacity-60">
                        {CATEGORY_LABELS[s.category] || s.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-fg-default">{s.title}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">{s.description}</p>
                    <div className="mt-1.5">
                      <span className="inline-block rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg-muted">
                        {s.score_impact}
                      </span>
                    </div>
                  </div>
                </div>
                {s.link && (
                  <a
                    href={s.link}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-all duration-150 group-hover:opacity-100"
                  >
                    {s.action} <ArrowRight size={10} />
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
