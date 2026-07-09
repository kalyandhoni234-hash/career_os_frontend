"use client";

import { motion } from "framer-motion";

interface SkillItem {
  name: string;
  level: number;
}

interface SkillGraphProps {
  categories: { name: string; skills: SkillItem[] }[];
  loading?: boolean;
  compact?: boolean;
}

export function SkillGraph({ categories, loading, compact }: SkillGraphProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Skill Graph</h3>
        <div className="mt-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`shimmer rounded ${compact ? "h-3" : "h-4"}`} />)}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Skill Graph</h3>
        <p className="mt-2 text-xs text-fg-subtle">Add skills to your resume to see your skill graph.</p>
      </div>
    );
  }

  const averaged = categories.map((cat) => {
    const avg = cat.skills.length > 0
      ? Math.round(cat.skills.reduce((sum, s) => sum + s.level, 0) / cat.skills.length)
      : 0;
    return { name: cat.name, proficiency: avg, skillCount: cat.skills.length };
  }).sort((a, b) => b.proficiency - a.proficiency);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <h3 className={`font-mono font-medium uppercase tracking-widest text-fg-muted ${compact ? "text-[10px]" : "text-xs"}`}>Skill Graph</h3>
      <div className={`space-y-2.5 ${compact ? "mt-2" : "mt-3"}`}>
        {averaged.map((cat, i) => {
          const fillColor = cat.proficiency >= 80 ? "#16a34a" : cat.proficiency >= 50 ? "#2563eb" : cat.proficiency >= 25 ? "#d97706" : "#dc2626";
          return (
            <div key={cat.name}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`font-medium text-fg-default ${compact ? "text-[11px]" : "text-xs"}`}>{cat.name}</span>
                <span className={`font-mono text-fg-muted ${compact ? "text-[10px]" : "text-[11px]"}`}>{cat.proficiency}%</span>
              </div>
              <div className={`rounded-full bg-bg-default overflow-hidden ${compact ? "h-1.5" : "h-2"}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: fillColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.proficiency}%` }}
                  transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                />
              </div>
              {cat.skillCount > 0 && (
                <p className={`text-fg-subtle ${compact ? "mt-0 text-[9px]" : "mt-0.5 text-[10px]"}`}>{cat.skillCount} skill{cat.skillCount !== 1 ? "s" : ""}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
