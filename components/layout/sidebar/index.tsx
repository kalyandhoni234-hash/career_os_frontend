"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Bot,
  BarChart3,
  Route,
  FileStack,
  Send,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Search,
  BookmarkCheck,
  Cpu,
  Database,
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
  title?: string;
  education: string | null;
  degree: string | null;
  skills: string | null;
}

const MOBILE_BREAKPOINT = 768;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    const prefersCollapsed = stored === "true";
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    setCollapsed(prefersCollapsed || isMobile);
  }, []);

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

  const displayName = profile?.full_name || profile?.education || "User";

  const sidebarContent = (
    <>
      <div className={`flex items-center border-b border-border py-3.5 transition-all duration-200 ${collapsed ? "justify-center px-0" : "px-4"}`}>
        <Logo showText={!collapsed} size="sm" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        <SidebarItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={isActive("/dashboard")} collapsed={collapsed} onClick={closeNav} />

        <SidebarSection title="Build" collapsed={collapsed} icon={<FileStack size={14} strokeWidth={1.5} />}>
          <SidebarItem href="/import-hub" label="Import Hub" icon={Database} active={isActive("/import-hub")} collapsed={collapsed} onClick={closeNav} />
          <SidebarItem href="/resume" label="Resume Studio" icon={FileText} active={isActive("/resume")} collapsed={collapsed} onClick={closeNav} />
        </SidebarSection>

        <SidebarSection title="Apply" collapsed={collapsed} icon={<Send size={14} strokeWidth={1.5} />}>
          <SidebarItem href="/opportunities" label="Opportunities" icon={Search} active={isActive("/opportunities")} collapsed={collapsed} onClick={closeNav} />
          <SidebarItem href="/saved-jobs" label="Saved Jobs" icon={BookmarkCheck} active={isActive("/saved-jobs")} collapsed={collapsed} onClick={closeNav} />
          <SidebarItem href="/jobs" label="Applications" icon={Briefcase} active={isActive("/jobs")} collapsed={collapsed} onClick={closeNav} />
        </SidebarSection>

        <SidebarSection title="AI Copilot" collapsed={collapsed} icon={<Sparkles size={14} strokeWidth={1.5} />}>
          <SidebarItem href="/coach" label="Career Coach" icon={Bot} active={isActive("/coach")} collapsed={collapsed} onClick={closeNav} />
          <SidebarItem href="/roadmaps" label="Roadmaps" icon={Route} active={isActive("/roadmaps")} collapsed={collapsed} onClick={closeNav} />
        </SidebarSection>

        <SidebarSection title="Agents" collapsed={collapsed} icon={<Cpu size={14} strokeWidth={1.5} />}>
          <SidebarItem href="/agents" label="Command Center" icon={Cpu} active={isActive("/agents")} collapsed={collapsed} onClick={closeNav} />
        </SidebarSection>

        <SidebarSection title="Insights" collapsed={collapsed} icon={<BarChart3 size={14} strokeWidth={1.5} />}>
          <SidebarItem href="/analytics" label="Analytics" icon={BarChart3} active={isActive("/analytics")} collapsed={collapsed} onClick={closeNav} />
          <SidebarItem href="/career-overview" label="Reports" icon={Route} active={isActive("/career-overview")} collapsed={collapsed} onClick={closeNav} />
        </SidebarSection>
      </nav>

      <div className={`flex border-t border-border ${collapsed ? "justify-center" : "px-3"} py-2`}>
        <button
          onClick={toggle}
          className="btn-press flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span className="font-mono text-[10px] uppercase tracking-wider">Collapse</span>}
        </button>
      </div>

      <CompactUserCard name={displayName} collapsed={collapsed} />
    </>
  );

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
        {sidebarContent}
      </aside>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
