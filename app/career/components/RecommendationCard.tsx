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
            skill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
            learning: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
            resume: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
            job: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
            interview: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
            goal: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
            project: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
          };
          const typeClass = typeColors[rec.rec_type || rec.type || ""] || "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

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
