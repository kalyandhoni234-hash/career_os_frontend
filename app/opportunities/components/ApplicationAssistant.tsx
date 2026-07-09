"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, HelpCircle, Loader2 } from "lucide-react";
import type { ApplicationReadiness } from "../types";

interface ApplicationAssistantProps {
  readiness: ApplicationReadiness | null;
  loading: boolean;
}

const verdictConfig = {
  ready: { color: "var(--color-success)", bg: "var(--color-success-subtle)", icon: CheckCircle2, label: "Ready to Apply" },
  ready_with_caveats: { color: "var(--color-warning)", bg: "var(--color-warning-subtle)", icon: Info, label: "Ready with Caveats" },
  almost_ready: { color: "var(--color-warning)", bg: "var(--color-warning-subtle)", icon: AlertCircle, label: "Almost Ready" },
  not_ready: { color: "var(--color-danger)", bg: "var(--color-danger-subtle)", icon: AlertCircle, label: "Not Ready" },
};

export function ApplicationAssistant({ readiness, loading }: ApplicationAssistantProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader2 size={16} className="animate-spin" />
          Analyzing your profile...
        </div>
      </div>
    );
  }

  if (!readiness) return null;

  const config = verdictConfig[readiness.verdict];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: config.bg }}>
          <Icon size={22} style={{ color: config.color }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</h3>
          <p className="text-[11px] text-fg-muted">{readiness.message}</p>
        </div>
      </div>

      <div className="space-y-2">
        {readiness.checks.map((check, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-2.5 rounded-lg"
            style={{ backgroundColor: check.status === "pass" ? "var(--color-success-subtle)" : check.status === "warn" ? "var(--color-warning-subtle)" : check.status === "fail" ? "var(--color-danger-subtle)" : "transparent" }}
          >
            {check.status === "pass" ? (
              <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-success" />
            ) : check.status === "warn" ? (
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-warning" />
            ) : check.status === "fail" ? (
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-danger" />
            ) : (
              <HelpCircle size={14} className="shrink-0 mt-0.5 text-fg-subtle" />
            )}
            <div>
              <p className="text-xs font-medium">{check.check}</p>
              <p className="text-[10px] text-fg-muted">{check.message}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
