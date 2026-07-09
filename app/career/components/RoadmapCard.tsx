"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";

interface RoadmapCardProps {
  id: number;
  title: string;
  progress: number;
  estimated_weeks: number;
  category: string | null;
  completed_nodes?: number;
  total_nodes?: number;
}

export function RoadmapCard({ id, title, progress, estimated_weeks, category, completed_nodes, total_nodes }: RoadmapCardProps) {
  const router = useRouter();
  const color = progress >= 80 ? "#16a34a" : progress >= 50 ? "#2563eb" : progress >= 25 ? "#d97706" : "#6b7280";

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => router.push(`/roadmaps?id=${id}`)}
      className="w-full rounded-lg border border-border bg-bg-default p-3 text-left transition-all duration-150 hover:border-accent/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <BookOpen size={12} className="shrink-0 text-accent" />
            <span className="text-xs font-medium text-fg-default truncate">{title}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-fg-muted">
            {category && <span className="rounded bg-bg-hover px-1.5 py-0.5">{category}</span>}
            <span>~{estimated_weeks} weeks</span>
            {total_nodes !== undefined && <span>{completed_nodes || 0}/{total_nodes} done</span>}
          </div>
        </div>
        <ArrowRight size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-bg-default overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className="mt-0.5 text-right text-[10px] font-mono text-fg-muted">{progress}%</p>
    </motion.button>
  );
}
