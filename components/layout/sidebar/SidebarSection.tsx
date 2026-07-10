"use client";

import { useState, useEffect, useCallback, startTransition, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  collapsed: boolean;
  defaultOpen?: boolean;
}

const STORAGE_PREFIX = "sidebar-section-";

export function SidebarSection({ title, children, collapsed, defaultOpen = true }: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (collapsed) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${title}`);
      if (stored !== null) {
        startTransition(() => { setOpen(stored === "true"); });
      }
    } catch {}
  }, [collapsed, title]);

  const toggle = useCallback(() => {
    if (collapsed) return;
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${title}`, String(next));
      } catch {}
      return next;
    });
  }, [collapsed, title]);

  return (
    <div>
      <button
        onClick={toggle}
        className={`
          flex w-full items-center gap-2 rounded-lg text-xs font-medium transition-all duration-150
          ${collapsed ? "justify-center py-1.5" : "px-3 py-1.5"}
          text-fg-subtle hover:text-fg-default hover:bg-bg-hover/50
        `}
      >
        {!collapsed && (
          <>
            <span className="flex-1 text-left font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
              {title}
            </span>
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className={`shrink-0 text-fg-subtle transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
            />
          </>
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-0.5 pt-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}
