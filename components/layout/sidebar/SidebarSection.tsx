"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  collapsed: boolean;
  defaultOpen?: boolean;
}

const STORAGE_PREFIX = "sidebar-section-";

export function SidebarSection({ title, icon, children, collapsed, defaultOpen = true }: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (collapsed) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${title}`);
      if (stored !== null) {
        setOpen(stored === "true");
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
    <div className="space-y-0.5">
      <button
        onClick={toggle}
        className={`
          flex w-full items-center gap-2 rounded-lg text-xs font-medium transition-all duration-150
          ${collapsed ? "justify-center px-0 py-1.5" : "px-3 py-1.5"}
          text-fg-subtle hover:text-fg-default hover:bg-bg-hover/50 active:bg-bg-hover/80
        `}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {!collapsed && (
          <>
            <span className="flex-1 text-left font-mono text-[10px] font-medium uppercase tracking-[0.15em]">
              {title}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-fg-subtle transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
            />
          </>
        )}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}
