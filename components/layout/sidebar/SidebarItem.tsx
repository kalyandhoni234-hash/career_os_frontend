"use client";

import Link from "next/link";
import { forwardRef, type ForwardedRef } from "react";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

export const SidebarItem = forwardRef(function SidebarItem(
  { href, label, icon: Icon, active, collapsed, onClick }: SidebarItemProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`
        group/item relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150
        ${collapsed ? "justify-center py-2.5 mx-auto w-10" : "px-3 py-2.5"}
        ${active
          ? "bg-accent/10 text-accent"
          : "text-fg-muted hover:bg-bg-hover hover:text-fg-default"
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-200" />
      )}
      <Icon
        size={18}
        strokeWidth={active ? 2.5 : 1.5}
        className="shrink-0 transition-all duration-150 group-hover/item:scale-105"
      />
      {!collapsed && (
        <span className="truncate transition-all duration-150">{label}</span>
      )}

      {collapsed && (
        <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 rounded-lg border border-border bg-bg-surface px-2.5 py-1.5 text-xs font-medium text-fg-default opacity-0 shadow-lg transition-all duration-150 group-hover/item:pointer-events-auto group-hover/item:opacity-100 whitespace-nowrap">
          {label}
        </div>
      )}
    </Link>
  );
});
