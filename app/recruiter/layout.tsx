"use client";

import { useState, useEffect, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Search, Briefcase, Building2, BarChart3, Users,
  BookmarkCheck, LogOut, ChevronUp, Bell, Menu, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const AUTH_RECRUITER = ["/recruiter/login", "/recruiter/signup"];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name?: string; title?: string; company?: { name?: string } } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("recruiter-sidebar-collapsed");
    if (stored === "true") startTransition(() => { setCollapsed(true); });
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/recruiter") && !AUTH_RECRUITER.includes(pathname)) {
      apiFetch("/api/recruiters/auth/me")
        .then((d) => setProfile(d as { full_name?: string; title?: string; company?: { name?: string } }))
        .catch(() => {});
    }
  }, [pathname]);

  if (AUTH_RECRUITER.includes(pathname)) {
    return <>{children}</>;
  }

  const toggle = () => {
    setCollapsed((p) => { const n = !p; localStorage.setItem("recruiter-sidebar-collapsed", String(n)); return n; });
  };

  const isActive = (href: string) => pathname.startsWith(href);

  const handleLogout = async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.push("/recruiter/login");
  };

  const initials = (profile?.full_name || "R").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const sidebarContent = (
    <>
      <div className={`flex items-center border-b border-border py-3.5 transition-all duration-200 ${collapsed ? "justify-center" : "px-4"}`}>
        {collapsed ? (
          <span className="text-lg font-bold text-accent">R</span>
        ) : (
          <Link href="/recruiter/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold text-accent">R</span>
            <span className="font-serif text-base font-medium text-fg-default">Recruit</span>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        <RecruiterNavItem href="/recruiter/dashboard" label="Dashboard" icon={LayoutDashboard} active={isActive("/recruiter/dashboard")} collapsed={collapsed} />
        <RecruiterNavItem href="/recruiter/candidates" label="Search Candidates" icon={Search} active={isActive("/recruiter/candidates") && !pathname.includes("/compare")} collapsed={collapsed} />
        <RecruiterNavItem href="/recruiter/candidates/compare" label="Compare" icon={Users} active={pathname.includes("/compare")} collapsed={collapsed} />
        <RecruiterNavItem href="/recruiter/pipelines" label="Talent Pipelines" icon={BookmarkCheck} active={isActive("/recruiter/pipelines")} collapsed={collapsed} />
        <RecruiterNavItem href="/recruiter/jobs" label="Job Posts" icon={Briefcase} active={isActive("/recruiter/jobs")} collapsed={collapsed} />
        <RecruiterNavItem href="/recruiter/company" label="Company" icon={Building2} active={isActive("/recruiter/company")} collapsed={collapsed} />
        <RecruiterNavItem href="/recruiter/analytics" label="Analytics" icon={BarChart3} active={isActive("/recruiter/analytics")} collapsed={collapsed} />
      </nav>

      <div className={`flex border-t border-border ${collapsed ? "justify-center" : "px-3"} py-2`}>
        <button onClick={toggle} className="btn-press flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default" aria-label={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span className="font-mono text-[10px] uppercase tracking-wider">Collapse</span>}
        </button>
      </div>

      <div className={`relative border-t border-border ${collapsed ? "px-2 py-2" : ""}`}>
        <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`flex w-full items-center gap-2.5 px-3 py-2.5 transition-all duration-150 hover:bg-bg-hover/50 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">{initials}</div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="truncate text-sm font-medium text-fg-default">{profile?.full_name || "Recruiter"}</p>
                {profile?.company?.name && <p className="truncate text-[10px] text-fg-muted">{profile.company.name}</p>}
              </div>
              <ChevronUp size={14} className={`shrink-0 text-fg-subtle transition-transform duration-200 ${userMenuOpen ? "rotate-0" : "rotate-180"}`} />
            </>
          )}
        </button>
        {userMenuOpen && (
          <div className={`border-t border-border bg-bg-surface p-1.5 space-y-0.5 animate-slide-up ${collapsed ? "absolute bottom-full left-0 right-0 mb-2 rounded-lg border shadow-lg" : ""}`}>
            <Link href="/recruiter/company" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-muted hover:text-fg-default hover:bg-bg-hover">
              <Building2 size={14} /> Company
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger hover:bg-danger/5">
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg-default">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden cursor-pointer" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`flex h-screen flex-col border-r border-border bg-bg-surface transition-all duration-200 shrink-0 ${collapsed ? "w-[72px]" : "w-64"} ${mobileOpen ? "fixed left-0 top-0 z-50" : "hidden"} lg:sticky lg:top-0 lg:flex lg:translate-x-0`}>
        {sidebarContent}
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-bg-surface/80 backdrop-blur-sm px-4 lg:px-6 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="btn-press flex items-center justify-center rounded-lg p-1.5 text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default lg:hidden" aria-label="Toggle navigation">
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button className="btn-press relative flex items-center justify-center rounded-lg p-1.5 text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default" aria-label="Notifications">
            <Bell size={18} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function RecruiterNavItem({ href, label, icon: Icon, active, collapsed }: {
  href: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; active: boolean; collapsed: boolean;
}) {
  return (
    <Link href={href} title={collapsed ? label : undefined} className={`group/item relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 ${collapsed ? "justify-center px-0 py-2.5 mx-auto w-10" : "px-3 py-2.5"} ${active ? "bg-accent/10 text-accent" : "text-fg-muted hover:bg-bg-hover hover:text-fg-default"}`}>
      {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />}
      <Icon size={18} strokeWidth={active ? 2.5 : 1.5} className="shrink-0 transition-all duration-150 group-hover/item:scale-105" />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 rounded-lg border border-border bg-bg-surface px-2.5 py-1.5 text-xs font-medium text-fg-default opacity-0 shadow-lg transition-all duration-150 group-hover/item:pointer-events-auto group-hover/item:opacity-100 whitespace-nowrap">
          {label}
        </div>
      )}
    </Link>
  );
}
