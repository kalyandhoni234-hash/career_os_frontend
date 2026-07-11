"use client";

import { Search, Menu, Bell, Command } from "lucide-react";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const handleSearchFocus = () => {
    const event = new CustomEvent("open-command-palette");
    window.dispatchEvent(event);
  };

  return (
    <header className="flex h-14 min-w-0 items-center gap-2 sm:gap-4 border-b border-border bg-bg-surface px-3 sm:px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="btn-press flex shrink-0 items-center justify-center rounded-lg p-1.5 text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default lg:hidden cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        <Menu size={18} />
      </button>

      <div className="relative min-w-0 flex-1 max-w-md group">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-all duration-150 group-focus-within:text-accent" />
        <input
          placeholder="Search pages, jobs, skills..."
          onFocus={handleSearchFocus}
          className="w-full rounded-lg border border-border bg-bg-default py-1.5 pl-9 pr-10 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70 cursor-pointer"
          readOnly
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-bg-surface px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle sm:flex">
          <Command size={10} />K
        </kbd>
      </div>

      <button
        className="btn-press relative flex shrink-0 items-center justify-center rounded-lg p-1.5 text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
      </button>
    </header>
  );
}