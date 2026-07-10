"use client";

import { type ReactNode, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SectionCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  onEdit?: () => void;
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function SectionCard({ title, icon: Icon, onEdit, children, className = "", glow = false }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-xl border ${glow ? "border-accent/30 shadow-lg shadow-accent/5" : "border-border"} bg-bg-surface p-5 transition-all duration-200 hover:border-accent/20 hover:shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{title}</h3>
        </div>
        {onEdit && (
          <Button variant="ghost" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      {children}
    </motion.div>
  );
}
