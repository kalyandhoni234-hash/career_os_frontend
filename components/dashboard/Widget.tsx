"use client";
import type { ReactNode } from "react";

interface WidgetProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  glow?: "accent" | "success" | "warning" | "danger" | false;
}

export function Widget({ title, icon, action, children, className = "", glow }: WidgetProps) {
  return (
    <div
      className={`group rounded-xl border border-border bg-bg-surface p-5 card-hover ${glow ? `glow-${glow}` : ""} ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-fg-muted transition-colors duration-150 group-hover:text-accent">{icon}</span>}
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{title}</h3>
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>
      {children}
    </div>
  );
}
