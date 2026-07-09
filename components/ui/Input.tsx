"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, hint, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors duration-150 peer-focus:text-accent">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`peer w-full rounded-lg border bg-bg-surface px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-danger focus:border-danger focus:ring-danger/30" : "border-border"} ${icon ? "pl-9" : ""} ${className}`}
            {...props}
          />
        </div>
        {hint && !error && <p className="font-mono text-xs text-fg-subtle">{hint}</p>}
        {error && <p className="font-mono text-xs text-danger animate-slide-up">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
