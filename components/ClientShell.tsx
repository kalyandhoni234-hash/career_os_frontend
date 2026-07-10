"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Shell } from "@/components/layout/Shell";
import { Providers } from "@/components/Providers";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell>
          <Providers>
            {children}
          </Providers>
        </Shell>
      </AuthProvider>
    </ThemeProvider>
  );
}
