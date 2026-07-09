"use client";

import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AIInsightCardProps {
  insights: string[];
  loading?: boolean;
}

export function AIInsightCard({ insights, loading }: AIInsightCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Insights</h3>
        </div>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-8 shimmer rounded" />)}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  const getIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("strong") || lower.includes("excellent") || lower.includes("good")) {
      return <CheckCircle2 size={14} className="shrink-0 text-success" />;
    }
    if (lower.includes("weak") || lower.includes("need") || lower.includes("missing") || lower.includes("low") || lower.includes("consider")) {
      return <AlertTriangle size={14} className="shrink-0 text-warning" />;
    }
    return <TrendingUp size={14} className="shrink-0 text-accent" />;
  };

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb size={14} className="text-accent" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 rounded-lg bg-bg-default p-2.5"
          >
            {getIcon(insight)}
            <p className="text-[11px] leading-relaxed text-fg-default">{insight}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
