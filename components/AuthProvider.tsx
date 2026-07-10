"use client";

import { createContext, useContext, useState, useEffect, useCallback, startTransition, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import { SplashScreen } from "./SplashScreen";

export interface AuthUser {
  user_id: number;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getLastVisited(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("last_visited_page");
  } catch {
    return null;
  }
}

export function setLastVisited(path: string) {
  try {
    if (path && path !== "/" && path !== "/login" && path !== "/signup") {
      localStorage.setItem("last_visited_page", path);
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialPath, setInitialPath] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      setInitialPath(getLastVisited());
      checkAuth();
    });
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem("last_visited_page");
    } catch {}
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getLastVisited };
