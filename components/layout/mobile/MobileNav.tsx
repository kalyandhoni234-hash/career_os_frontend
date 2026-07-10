"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Bot, Route, UserCircle,
  Clock, FileText, Search, BookmarkCheck, Database, Cpu,
  BarChart3, TrendingUp, Star, Settings, X, Menu,
} from "lucide-react";

const PRIMARY_TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Apps", icon: Briefcase },
  { href: "/coach", label: "Coach", icon: Bot },
  { href: "/roadmaps", label: "Roadmaps", icon: Route },
  { href: "/career-profile", label: "Profile", icon: UserCircle },
] as const;

const DRAWER_SECTIONS = [
  {
    title: "Career",
    items: [
      { href: "/resume", label: "Resume Studio", icon: FileText },
      { href: "/opportunities", label: "Opportunities", icon: Search },
      { href: "/saved-jobs", label: "Saved Jobs", icon: BookmarkCheck },
      { href: "/import-hub", label: "Import Hub", icon: Database },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/timeline", label: "Timeline", icon: Clock },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/career-overview", label: "Reports", icon: TrendingUp },
      { href: "/intelligence", label: "Intelligence", icon: Star },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/agents", label: "Command Center", icon: Cpu },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Swipe to open: swipe right from left edge
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches[0].clientX < 30) setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStart !== null && e.changedTouches[0].clientX - touchStart > 80) {
      setDrawerOpen(true);
    }
    setTouchStart(null);
  }, [touchStart]);

  // Swipe to close: swipe left on drawer
  const handleDrawerTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleDrawerTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart !== null && touchStart - e.changedTouches[0].clientX > 60) {
      setDrawerOpen(false);
    }
    setTouchStart(null);
  }, [touchStart]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Close drawer on route change
  const prevRoute = useRef(pathname);
  useEffect(() => {
    if (prevRoute.current !== pathname) {
      prevRoute.current = pathname;
      closeDrawer();
    }
  }, [pathname, closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-bg-surface/95 backdrop-blur-lg pb-safe">
        {PRIMARY_TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-[56px] min-h-[48px] rounded-lg transition-all duration-150 active:scale-95 ${
                active ? "text-accent" : "text-fg-muted hover:text-fg-default"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[9px] font-mono uppercase tracking-wider">{tab.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-[56px] min-h-[48px] rounded-lg text-fg-muted hover:text-fg-default transition-all duration-150 active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
          <span className="text-[9px] font-mono uppercase tracking-wider">More</span>
        </button>
      </nav>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[80vw] bg-bg-surface border-r border-border shadow-2xl transform transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="font-serif text-base font-medium text-fg-default">Career OS</span>
          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-bg-hover hover:text-fg-default active:scale-95 transition-all duration-150"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-56px)] px-3 py-4 space-y-5">
          {DRAWER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                        active
                          ? "bg-accent/10 text-accent"
                          : "text-fg-muted hover:bg-bg-hover hover:text-fg-default"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={17} strokeWidth={active ? 2.5 : 1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
