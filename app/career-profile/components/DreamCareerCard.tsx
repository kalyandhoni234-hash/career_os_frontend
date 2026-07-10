"use client";

import { motion } from "framer-motion";
import { Target, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "./EmptyState";
import type { DreamCareer } from "@/app/career-profile/types";

interface DreamCareerCardProps {
  dreamCareer: DreamCareer | null;
  onEdit: () => void;
}

export function DreamCareerCard({ dreamCareer, onEdit }: DreamCareerCardProps) {
  if (!dreamCareer || (!dreamCareer.dream_role && !dreamCareer.dream_company)) {
    return (
      <EmptyState
        icon={Target}
        title="Dream Career"
        description="Set your dream career goals to track your progress and get personalized recommendations."
        actionLabel="Set Dream Career"
        onAction={onEdit}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-border bg-bg-surface p-5 transition-all duration-200 hover:border-accent/20"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Target className="h-4 w-4" />
          </div>
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Dream Career</h3>
        </div>
        <Button variant="ghost" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={onEdit}>
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {dreamCareer.dream_role && (
          <Field label="Dream Role" value={dreamCareer.dream_role} />
        )}
        {dreamCareer.dream_company && (
          <Field label="Dream Company" value={dreamCareer.dream_company} />
        )}
        {dreamCareer.preferred_country && (
          <Field label="Preferred Country" value={dreamCareer.preferred_country} />
        )}
        {dreamCareer.preferred_industry && (
          <Field label="Preferred Industry" value={dreamCareer.preferred_industry} />
        )}
        {dreamCareer.salary_goal && (
          <Field label="Salary Goal" value={dreamCareer.salary_goal} />
        )}
        {dreamCareer.target_joining_year && (
          <Field label="Target Year" value={String(dreamCareer.target_joining_year)} />
        )}
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-default px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-fg-default">{value}</p>
    </div>
  );
}
