"use client";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sublabel?: string;
}

export function StatCard({ label, value, icon, sublabel }: StatCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-bg-surface p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{label}</p>
          <p className="mt-1.5 font-serif text-3xl font-medium tracking-tight text-fg-default">{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-fg-subtle">{sublabel}</p>}
        </div>
        <div className="rounded-lg border border-border bg-bg-default p-2 text-accent transition-all duration-150 group-hover:bg-accent-subtle group-hover:border-accent/30">{icon}</div>
      </div>
    </div>
  );
}
