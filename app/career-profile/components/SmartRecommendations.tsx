"use client";

import { useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, GraduationCap, BookOpen, FolderGit2, Briefcase,
  Code2, Trophy, Target, Award, Users, Send, BadgeCheck, Building2, CalendarPlus, X,
} from "lucide-react";

interface Recommendation {
  id: string;
  action: string;
  description: string;
  icon: string;
  priority: number;
}

interface SmartRecommendationsProps {
  recommendations: Recommendation[];
  onAction?: (id: string) => void;
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Sparkles, FileText, GraduationCap, BookOpen, FolderGit2, Briefcase,
  Code2, Trophy, Target, Award, Users, Send, BadgeCheck, Building2, CalendarPlus,
};

export function SmartRecommendations({ recommendations, onAction }: SmartRecommendationsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = recommendations.filter((r) => !dismissed.has(r.id));

  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Recommended Next Steps</h3>
      </div>

      <div className="space-y-2.5">
        {visible.map((rec, i) => {
          const Icon = ICON_MAP[rec.icon] || Sparkles;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group flex items-start gap-3 rounded-xl border border-border bg-bg-surface p-4 transition-all duration-200 hover:border-accent/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="cursor-pointer text-sm font-medium text-fg-default hover:text-accent"
                  onClick={() => onAction?.(rec.id)}
                >
                  {rec.action}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{rec.description}</p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(rec.id))}
                className="mt-1 shrink-0 rounded p-0.5 text-fg-subtle opacity-0 transition-all duration-150 hover:text-fg-default group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
