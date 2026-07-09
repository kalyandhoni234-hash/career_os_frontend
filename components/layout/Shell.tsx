"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./TopBar";

const AUTH_ROUTES = ["/login", "/signup"];
const LANDING_ROUTE = "/";
const RECRUITER_PREFIX = "/recruiter";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (AUTH_ROUTES.includes(pathname) || pathname === LANDING_ROUTE || pathname.startsWith(RECRUITER_PREFIX)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <TopBar onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto bg-bg-default">
          {children}
        </main>
      </div>
    </div>
  );
}
