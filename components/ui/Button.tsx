"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent/90 active:bg-accent/80 border border-accent shadow-sm hover:shadow-md",
  secondary:
    "bg-bg-surface text-fg-default hover:bg-bg-hover active:bg-bg-hover border border-border hover:border-accent/40 hover:shadow-sm",
  ghost:
    "bg-transparent text-fg-muted hover:text-fg-default hover:bg-bg-hover active:bg-bg-hover border border-transparent",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:bg-danger/80 border border-danger shadow-sm hover:shadow-md",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`btn-press inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent-ring focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:transform-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0 transition-transform duration-150 group-hover:scale-110">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
