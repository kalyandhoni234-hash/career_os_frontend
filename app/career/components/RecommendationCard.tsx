"use client";

import { motion } from "framer-motion";
import { Lightbulb, X, Check } from "lucide-react";
import type { RecommendationData } from "../types";

interface RecommendationCardProps {
  recommendations: RecommendationData[];
  onDismiss?: (id: number) => void;
  onComplete?: (id: number) => void;
  loading?: boolean;
}

export function RecommendationCard({ recommendations, onDismiss, onComplete, loading }: RecommendationCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Insights</h3>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 shimmer rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Insights</h3>
        </div>
        <p className="mt-2 text-xs text-fg-subtle">No insights yet. Add more data to unlock personalized AI recommendations.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-center gap-2">
        <Lightbulb size={14} className="text-accent" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Insights</h3>
      </div>
      <div className="mt-3 space-y-2">
        {recommendations.map((rec, i) => {
          const typeColors: Record<string, string> = {
            skill: "bg-accent/10 text-accent border-accent/20",
            learning: "bg-accent/10 text-accent border-accent/20",
            resume: "bg-success/10 text-success border-success/20",
            job: "bg-warning/10 text-warning border-warning/20",
            interview: "bg-danger/10 text-danger border-danger/20",
            goal: "bg-accent/10 text-accent border-accent/20",
            project: "bg-accent/10 text-accent border-accent/20",
          };
          const typeClass = typeColors[rec.rec_type || rec.type || ""] || "bg-bg-hover text-fg-muted border-border";

          return (
            <motion.div
              key={rec.id || `rec-${i}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border p-2.5 ${typeClass.replace(/bg-\S+/, "")}`}
              style={{ backgroundColor: typeClass.split(" ")[0].replace("bg-", "#").replace("-50", "0a") || "#f9fafb" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${typeClass}`}>
                      {rec.rec_type || rec.type || "general"}
                    </span>
                    <span className="text-xs font-medium text-fg-default">{rec.title}</span>
                  </div>
                  {rec.description && (
                    <p className="mt-1 text-[11px] opacity-80 line-clamp-2">{rec.description}</p>
                  )}
                  {rec.impact_score > 0 && (
                    <span className="mt-1 inline-block text-[10px] font-medium">+{rec.impact_score}% ATS impact</span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {onComplete && (
                    <button onClick={() => onComplete(rec.id || i)} className="rounded p-1 opacity-50 hover:opacity-100 hover:text-success transition-opacity" title="Complete">
                      <Check size={12} />
                    </button>
                  )}
                  {onDismiss && (
                    <button onClick={() => onDismiss(rec.id || i)} className="rounded p-1 opacity-50 hover:opacity-100 hover:text-danger transition-opacity" title="Dismiss">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
