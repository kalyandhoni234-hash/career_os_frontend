"use client";

import { useEffect, useRef, useState, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight, LayoutDashboard, FileText, Briefcase, Bot, BarChart3, Route, Settings as SettingsIcon, User } from "lucide-react";

interface CommandItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview", "main"] },
  { label: "Resume Studio", href: "/resume", icon: FileText, keywords: ["resume", "cv", "builder", "edit"] },
  { label: "Applications", href: "/jobs", icon: Briefcase, keywords: ["jobs", "apply", "tracker", "kanban"] },
  { label: "Career Coach", href: "/coach", icon: Bot, keywords: ["ai", "chat", "advice", "mentor"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, keywords: ["stats", "data", "charts"] },
  { label: "Career Overview", href: "/career-overview", icon: Route, keywords: ["timeline", "milestones", "journey"] },
  { label: "Profile", href: "/profile", icon: User, keywords: ["account", "info", "personal"] },
  { label: "Settings", href: "/settings", icon: SettingsIcon, keywords: ["preferences", "config", "options"] },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = query.trim()
    ? COMMANDS.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.keywords.some((k) => k.includes(query.toLowerCase())),
      )
    : COMMANDS;

  useEffect(() => {
    startTransition(() => { setSelectedIndex(0); });
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      startTransition(() => { setQuery(""); });
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          const event = new CustomEvent("open-command-palette");
          window.dispatchEvent(event);
        }
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        router.push(filtered[selectedIndex].href);
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex, router, onClose]);

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-200 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-bg-surface shadow-2xl transition-all duration-200 animate-scale-in">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={16} className="shrink-0 text-fg-subtle" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-fg-default placeholder:text-fg-subtle focus:outline-none"
          />
          <kbd className="flex items-center gap-0.5 rounded border border-border bg-bg-default px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
            <Command size={10} />K
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-fg-subtle">
              No results found
            </p>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.href}
                  onClick={() => handleSelect(cmd.href)}
                  className={`
                    flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 cursor-pointer
                    ${i === selectedIndex ? "bg-accent/10 text-accent" : "text-fg-muted hover:bg-bg-hover hover:text-fg-default"}
                  `}
                >
                  <Icon size={16} strokeWidth={i === selectedIndex ? 2.5 : 1.5} className="shrink-0" />
                  <span className="flex-1 text-left">{cmd.label}</span>
                  {i === selectedIndex && <ArrowRight size={14} className="shrink-0" />}
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center gap-4 text-[10px] text-fg-subtle">
            <span><kbd className="rounded border border-border px-1 py-0.5 font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="rounded border border-border px-1 py-0.5 font-mono">↵</kbd> open</span>
            <span><kbd className="rounded border border-border px-1 py-0.5 font-mono">Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
