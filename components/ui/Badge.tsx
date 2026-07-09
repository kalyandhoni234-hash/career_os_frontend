"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "accent" | "success" | "warning" | "danger" | "neutral";
  className?: string;
  onClick?: () => void;
}

const toneStyles: Record<string, string> = {
  accent: "border-accent/20 bg-accent-subtle text-accent",
  success: "border-success/20 bg-success-subtle text-success",
  warning: "border-warning/20 bg-warning-subtle text-warning",
  danger: "border-danger/20 bg-danger-subtle text-danger",
  neutral: "border-border bg-bg-hover text-fg-muted",
};

export function Badge({ children, tone = "neutral", className = "", onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium transition-all duration-150 ${toneStyles[tone]} ${onClick ? "cursor-pointer hover:opacity-80 active:scale-95" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
