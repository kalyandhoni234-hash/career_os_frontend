"use client";

import { motion } from "framer-motion";
import { SendHorizontal, FileSpreadsheet, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  onAddApplication: () => void;
}

export function EmptyState({ onAddApplication }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.1, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-bg-default">
        <Briefcase size={36} className="text-fg-muted" />
      </div>
      <h2 className="font-serif text-2xl font-medium tracking-tight text-fg-default">No applications yet</h2>
      <p className="mt-2 max-w-md text-sm text-fg-muted">
        Start tracking your internship and job applications. Add your first application to begin monitoring your pipeline.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={onAddApplication} icon={<SendHorizontal size={14} />} size="md">
          Add Application
        </Button>
        <Button variant="secondary" icon={<FileSpreadsheet size={14} />} size="md">
          Import from CSV
        </Button>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Track pipeline", desc: "Know which stage each application is in" },
          { label: "Never miss a deadline", desc: "Get reminded about upcoming assessments" },
          { label: "Improve your strategy", desc: "AI insights help you optimize your job search" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            className="rounded-xl border border-border bg-bg-surface p-4 text-left"
          >
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">Step {i + 1}</p>
            <p className="mt-1.5 text-sm font-medium text-fg-default">{item.label}</p>
            <p className="mt-0.5 text-xs text-fg-subtle">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
