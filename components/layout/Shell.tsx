"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, setLastVisited } from "@/components/AuthProvider";
import { useMobile } from "@/hooks/useMobile";
import { Sidebar } from "./sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./mobile/MobileNav";

const AUTH_ROUTES = ["/login", "/signup", "/onboarding"];
const LANDING_ROUTE = "/";
const RECRUITER_PREFIX = "/recruiter";
const PROTECTED_API_PREFIX = "/api";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isMobile } = useMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isLanding = pathname === LANDING_ROUTE;
  const isRecruiter = pathname.startsWith(RECRUITER_PREFIX);
  const isApi = pathname.startsWith(PROTECTED_API_PREFIX);
  const needsSidebar = !isAuthRoute && !isLanding && !isRecruiter && !isApi;

  useEffect(() => {
    if (needsSidebar && !isAuthenticated) {
      router.replace("/");
    }
  }, [needsSidebar, isAuthenticated, router]);

  useEffect(() => {
    if (needsSidebar && isAuthenticated) {
      setLastVisited(pathname);
    }
  }, [pathname, needsSidebar, isAuthenticated]);

  // Close mobile sidebar on route change
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setMobileOpen(false);
    }
  }, [pathname]);

  if (isAuthRoute || isLanding || isRecruiter || isApi) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex h-screen">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-bg-default pb-16">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-bg-default">
          {children}
        </main>
      </div>
    </div>
  );
}