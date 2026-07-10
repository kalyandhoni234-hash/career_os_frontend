"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Clock,
  Bot,
  Route,
  FileText,
  Search,
  Briefcase,
  BookmarkCheck,
  Database,
  Cpu,
  BarChart3,
  TrendingUp,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SidebarItem } from "./SidebarItem";
import { SidebarSection } from "./SidebarSection";
import { CompactUserCard } from "./CompactUserCard";
import { CommandPalette } from "./CommandPalette";
import { Logo } from "@/components/ui/Logo";

interface Profile {
  email: string;
  full_name?: string;
  education: string | null;
}

const MOBILE_BREAKPOINT = 768;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("sidebar-collapsed");
    return stored === "true" || window.innerWidth < MOBILE_BREAKPOINT;
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((d) => setProfile(d.profile))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleOpen() { setCommandOpen(true); }
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const closeNav = () => {
    if (mobileOpen) onMobileClose?.();
  };

  const displayName = profile?.full_name || "User";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={onMobileClose}
        />
      )}

      <aside
        role="navigation"
        aria-label="Main navigation"
        className={`
          flex h-screen flex-col border-r border-border bg-bg-surface transition-all duration-200
          self-start shrink-0
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "fixed left-0 top-0 z-50" : "hidden"}
          lg:sticky lg:top-0 lg:flex lg:translate-x-0
        `}
      >
        {/* ── Header: Logo + Collapse Toggle ── */}
        <div className={`flex items-center border-b border-border py-3 transition-all duration-200 ${collapsed ? "flex-col gap-2 px-0" : "justify-between px-4"}`}>
          <Logo showText={!collapsed} size="sm" />
          <button
            onClick={toggle}
            className="btn-press flex items-center justify-center rounded-lg p-1.5 text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* ── Navigation (scrollable) ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 scroll-smooth">
          <div className="space-y-3">
            <SidebarItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={isActive("/dashboard")} collapsed={collapsed} onClick={closeNav} />

            <SidebarSection title="Profile" collapsed={collapsed}>
              <SidebarItem href="/career-profile" label="My Profile" icon={UserCircle} active={isActive("/career-profile")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/timeline" label="Timeline" icon={Clock} active={isActive("/timeline")} collapsed={collapsed} onClick={closeNav} />
            </SidebarSection>

            <SidebarSection title="AI" collapsed={collapsed}>
              <SidebarItem href="/coach" label="Career Coach" icon={Bot} active={isActive("/coach")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/roadmaps" label="Roadmaps" icon={Route} active={isActive("/roadmaps")} collapsed={collapsed} onClick={closeNav} />
            </SidebarSection>

            <SidebarSection title="Career" collapsed={collapsed}>
              <SidebarItem href="/resume" label="Resume Studio" icon={FileText} active={isActive("/resume")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/opportunities" label="Opportunities" icon={Search} active={isActive("/opportunities")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/jobs" label="Applications" icon={Briefcase} active={isActive("/jobs")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/saved-jobs" label="Saved Jobs" icon={BookmarkCheck} active={isActive("/saved-jobs")} collapsed={collapsed} onClick={closeNav} />
            </SidebarSection>

            <SidebarSection title="Tools" collapsed={collapsed}>
              <SidebarItem href="/import-hub" label="Import Hub" icon={Database} active={isActive("/import-hub")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/agents" label="Command Center" icon={Cpu} active={isActive("/agents")} collapsed={collapsed} onClick={closeNav} />
            </SidebarSection>

            <SidebarSection title="Insights" collapsed={collapsed}>
              <SidebarItem href="/analytics" label="Analytics" icon={BarChart3} active={isActive("/analytics")} collapsed={collapsed} onClick={closeNav} />
              <SidebarItem href="/career-overview" label="Reports" icon={TrendingUp} active={isActive("/career-overview")} collapsed={collapsed} onClick={closeNav} />
            </SidebarSection>
          </div>
        </nav>

        {/* ── User section (pinned bottom) ── */}
        <CompactUserCard name={displayName} collapsed={collapsed} />
      </aside>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
