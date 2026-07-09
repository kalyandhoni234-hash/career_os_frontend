"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User, ChevronUp } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CompactUserCardProps {
  name: string;
  collapsed: boolean;
}

export function CompactUserCard({ name, collapsed }: CompactUserCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
    }
    router.push("/login");
  };

  if (collapsed) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold text-accent transition-all duration-150 hover:bg-accent/10 active:scale-95"
          title={name}
        >
          {initials}
        </button>
        {open && (
          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-50 w-40 rounded-lg border border-border bg-bg-surface p-1.5 shadow-lg">
            <div className="px-2.5 py-2 border-b border-border mb-1">
              <p className="text-sm font-medium text-fg-default truncate">{name}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-muted hover:text-fg-default hover:bg-bg-hover transition-colors duration-150"
            >
              <User size={14} /> Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-muted hover:text-fg-default hover:bg-bg-hover transition-colors duration-150"
            >
              <Settings size={14} /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger hover:bg-danger/5 transition-colors duration-150"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative border-t border-border" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 transition-all duration-150 hover:bg-bg-hover/50 active:bg-bg-hover/80"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent transition-all duration-150 group-hover:scale-105">
          {initials}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="truncate text-sm font-medium text-fg-default">{name}</p>
        </div>
        <ChevronUp
          size={14}
          className={`shrink-0 text-fg-subtle transition-transform duration-200 ${open ? "rotate-0" : "rotate-180"}`}
        />
      </button>
      {open && (
        <div className="border-t border-border bg-bg-surface p-1.5 space-y-0.5 animate-slide-up">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-muted hover:text-fg-default hover:bg-bg-hover transition-colors duration-150"
          >
            <User size={14} /> Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-muted hover:text-fg-default hover:bg-bg-hover transition-colors duration-150"
          >
            <Settings size={14} /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger hover:bg-danger/5 transition-colors duration-150"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
