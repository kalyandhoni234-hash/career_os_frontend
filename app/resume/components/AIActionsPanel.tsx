"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2, FileText, Target, Activity, Trophy, Briefcase, Mail, RotateCw } from "lucide-react";
import type { AiOperation } from "../types";

interface AIActionsPanelProps {
  onGenerate: () => void;
  onImproveResume: () => void;
  onRewriteSummary: () => void;
  onImproveBullets: () => void;
  onOptimizeATS: () => void;
  onQuantifyAchievements: () => void;
  onTailor: () => void;
  onCoverLetter: () => void;
  loading: boolean;
  currentOperation?: AiOperation | null;
}

const actions = [
  { id: "generate", label: "Generate Resume", icon: Sparkles, desc: "AI creates from profile", color: "accent" },
  { id: "improve", label: "Improve Resume", icon: Wand2, desc: "Enhance all sections", color: "accent" },
  { id: "rewrite-summary", label: "Rewrite Summary", icon: FileText, desc: "Stronger professional summary", color: "accent" },
  { id: "improve-bullets", label: "Improve Bullets", icon: Activity, desc: "More impact, metrics-driven", color: "accent" },
  { id: "optimize-ats", label: "Optimize ATS", icon: Target, desc: "Maximize keyword matching", color: "accent" },
  { id: "quantify", label: "Quantify Achievements", icon: Trophy, desc: "Add measurable results", color: "accent" },
  { id: "tailor", label: "Tailor for Job", icon: Briefcase, desc: "Customize for any role", color: "accent" },
  { id: "cover-letter", label: "Cover Letter", icon: Mail, desc: "Generate matching letter", color: "accent" },
] as const;

export function AIActionsPanel(props: AIActionsPanelProps) {
  const handlerMap: Record<string, () => void> = {
    generate: props.onGenerate,
    improve: props.onImproveResume,
    "rewrite-summary": props.onRewriteSummary,
    "improve-bullets": props.onImproveBullets,
    "optimize-ats": props.onOptimizeATS,
    quantify: props.onQuantifyAchievements,
    tailor: props.onTailor,
    "cover-letter": props.onCoverLetter,
  };

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-accent" />
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">AI Resume Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = props.currentOperation === action.id;
          const disabled = props.loading && !isActive;
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => handlerMap[action.id]()}
              disabled={disabled}
              className={`group flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all duration-150 disabled:pointer-events-none ${
                isActive
                  ? "border-accent/40 bg-accent/5 shadow-sm"
                  : "border-border bg-bg-default hover:border-accent/30 hover:shadow-sm disabled:opacity-40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isActive ? (
                  <RotateCw size={13} className="animate-spin text-accent" />
                ) : (
                  <Icon size={13} className="text-accent transition-transform duration-150 group-hover:scale-110" />
                )}
                <span className="text-[11px] font-medium text-fg-default">{action.label}</span>
              </div>
              <span className="text-[10px] leading-tight text-fg-subtle">
                {isActive ? "Processing..." : action.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
