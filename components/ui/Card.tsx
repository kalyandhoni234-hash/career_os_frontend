"use client";

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "accent" | "success" | "none";
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, glow = "none", onClick }: CardProps) {
  const glowClass = glow === "accent" ? "glow-accent" : glow === "success" ? "glow-success" : "";

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-bg-surface p-5 transition-all duration-200 ${glowClass} ${hover ? "card-hover hover:border-accent/30" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
