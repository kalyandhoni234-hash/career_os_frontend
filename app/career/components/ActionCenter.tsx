"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star, ArrowRight, Loader2 } from "lucide-react";
import type { ActionPlanItem } from "../types";

interface ActionCenterProps {
  items: ActionPlanItem[];
  loading?: boolean;
  compact?: boolean;
}

export function ActionCenter({ items, loading, compact }: ActionCenterProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Today's Career Plan</h3>
        <div className="mt-3 flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-fg-muted" />
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Today's Career Plan</h3>
        <p className="mt-3 text-xs text-fg-subtle">No recommendations yet. Update your resume to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Today's Career Plan</h3>
        <span className="text-[10px] text-fg-subtle">{items.length} actions</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { if (item.action_link) router.push(item.action_link); }}
            className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-all duration-150 hover:bg-bg-hover active:scale-[0.99]"
          >
            <div className="mt-0.5 shrink-0">
              <Star size={compact ? 10 : 12} className={item.priority >= 4 ? "text-accent fill-accent" : "text-fg-subtle"} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium text-fg-default ${compact ? "text-[11px]" : "text-xs"}`}>{item.title}</span>
                <span className="text-[10px] font-mono text-fg-subtle">{item.stars}</span>
              </div>
              <p className={`mt-0.5 text-fg-muted line-clamp-2 ${compact ? "text-[10px]" : "text-[11px]"}`}>{item.description}</p>
              {item.impact_score > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                    +{item.impact_score}% ATS
                  </span>
                  {item.action_link && (
                    <span className="flex items-center gap-0.5 text-[10px] text-fg-subtle">
                      Open <ArrowRight size={10} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
