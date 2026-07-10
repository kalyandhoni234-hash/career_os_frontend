"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, setLastVisited } from "@/components/AuthProvider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./TopBar";

const AUTH_ROUTES = ["/login", "/signup"];
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

  if (isAuthRoute || isLanding || isRecruiter || isApi) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar mobileOpen={false} onMobileClose={() => {}} />
      <div className="flex flex-1 flex-col">
        <TopBar onMenuToggle={() => {}} />
        <main className="flex-1 overflow-y-auto bg-bg-default">
          {children}
        </main>
      </div>
    </div>
  );
}
