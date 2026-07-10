"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface/50 px-6 py-12 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-hover">
        <Icon className="h-7 w-7 text-fg-subtle" />
      </div>
      <h4 className="mb-1 font-serif text-lg font-medium text-fg-default">{title}</h4>
      <p className="mb-5 max-w-xs text-sm leading-relaxed text-fg-muted">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </motion.div>
  );
}
