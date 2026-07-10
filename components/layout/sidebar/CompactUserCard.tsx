"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface CompactUserCardProps {
  name: string;
  collapsed: boolean;
}

const menuItems = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { type: "divider" as const },
  { label: "Log Out", icon: LogOut, href: null, destructive: true },
];

export function CompactUserCard({ name, collapsed }: CompactUserCardProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const getFocusableIndices = () => {
    const indices: number[] = [];
    menuItems.forEach((item, i) => {
      if (item.type !== "divider") indices.push(i);
    });
    return indices;
  };

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        close();
        ref.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const indices = getFocusableIndices();
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIdx((prev) => {
          const cur = indices.indexOf(prev);
          const next = (cur + 1) % indices.length;
          return indices[next];
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((prev) => {
          const cur = indices.indexOf(prev);
          const next = (cur - 1 + indices.length) % indices.length;
          return indices[next];
        });
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIdx >= 0) {
          const item = menuItems[focusedIdx];
          if (item.type === "divider") return;
          if (item.label === "Log Out") {
            handleLogout();
          } else if (item.href) {
            router.push(item.href);
            close();
          }
        }
        break;
    }
  };

  useEffect(() => {
    if (open && focusedIdx >= 0) {
      const el = menuRef.current?.querySelector(`[data-index="${focusedIdx}"]`) as HTMLElement;
      el?.focus();
    }
  }, [focusedIdx, open]);

  const handleLogout = async () => {
    logout();
    close();
    router.push("/");
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (collapsed) {
    return (
      <div className="relative border-t border-border" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold text-accent hover:bg-accent/10 active:scale-95 transition-all duration-150 my-2 cursor-pointer"
          title={name}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {initials}
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            onKeyDown={handleKeyDown}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-50 w-56 origin-bottom animate-scale-in"
          >
            <UserMenuDropdown
              items={menuItems}
              initials={initials}
              name={name}
              focusedIdx={focusedIdx}
              onItemClick={(label) => {
                if (label === "Log Out") handleLogout();
                close();
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative border-t border-border" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 transition-all duration-150 hover:bg-bg-hover/50 active:bg-bg-hover/80 cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">
          {initials}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="truncate text-sm font-medium text-fg-default">{name}</p>
        </div>
        <ChevronUp
          size={14}
          className={`shrink-0 text-fg-subtle transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          onKeyDown={handleKeyDown}
          className="border-t border-border bg-bg-surface animate-slide-up"
        >
          <UserMenuDropdown
            items={menuItems}
            initials={initials}
            name={name}
            focusedIdx={focusedIdx}
            onItemClick={(label) => {
              if (label === "Log Out") handleLogout();
              close();
            }}
            inline
          />
        </div>
      )}
    </div>
  );
}

function UserMenuDropdown({
  items,
  initials,
  name,
  focusedIdx,
  onItemClick,
  inline,
}: {
  items: typeof menuItems;
  initials: string;
  name: string;
  focusedIdx: number;
  onItemClick: (label: string) => void;
  inline?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden ${
        inline
          ? ""
          : "rounded-xl border border-border bg-bg-surface shadow-xl shadow-black/10 backdrop-blur-xl"
      }`}
    >
      {!inline && (
        <div className="px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg-default">{name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="py-1">
        {items.map((item, i) => {
          if (item.type === "divider") {
            return (
              <div
                key={`divider-${i}`}
                className="my-1 border-t border-border"
              />
            );
          }

          const isFocused = focusedIdx === i;
          const isDestructive = item.destructive;

          return (
            <button
              key={item.label}
              data-index={i}
              role="menuitem"
              tabIndex={isFocused ? 0 : -1}
              onClick={() => {
                if (isDestructive) {
                  onItemClick(item.label);
                } else if (item.href) {
                  if (inline) {
                    window.location.href = item.href;
                  } else {
                    onItemClick(item.label);
                  }
                }
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors duration-100 cursor-pointer ${
                isFocused
                  ? "bg-bg-hover"
                  : "bg-transparent"
              } ${
                isDestructive
                  ? "text-danger hover:bg-danger/5"
                  : "text-fg-muted hover:text-fg-default hover:bg-bg-hover"
              }`}
            >
              <item.icon size={15} strokeWidth={1.5} className="shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
