"use client";

import { motion } from "framer-motion";
import { Target, Plus, CheckCircle2, Circle } from "lucide-react";
import type { CareerGoalData } from "../types";

interface GoalTrackerProps {
  goals: CareerGoalData[];
  onAdd?: () => void;
  loading?: boolean;
  compact?: boolean;
}

export function GoalTracker({ goals, onAdd, loading, compact }: GoalTrackerProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Goals</h3>
        <div className="mt-3 space-y-2">
          {[1, 2].map((i) => <div key={i} className={`shimmer rounded-lg ${compact ? "h-8" : "h-10"}`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={compact ? 12 : 14} className="text-accent" />
          <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Goals</h3>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 transition-colors">
            <Plus size={12} /> Add
          </button>
        )}
      </div>
      {goals.length === 0 ? (
        <p className="mt-3 text-xs text-fg-subtle">No goals set. Set a career goal to get personalized recommendations.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-bg-default p-2.5"
            >
              <div className="flex items-start gap-2">
                {goal.progress >= 100 ? (
                  <CheckCircle2 size={compact ? 12 : 14} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <Circle size={compact ? 12 : 14} className="mt-0.5 shrink-0 text-fg-subtle" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-medium text-fg-default ${compact ? "text-[11px]" : "text-xs"}`}>{goal.title}</p>
                  <p className="text-[10px] text-fg-muted">
                    {goal.category || "Career goal"}
                  </p>
                  {goal.progress > 0 && goal.progress < 100 && (
                    <div className={`rounded-full bg-bg-default overflow-hidden ${compact ? "mt-0.5 h-1" : "mt-1 h-1.5"}`}>
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
