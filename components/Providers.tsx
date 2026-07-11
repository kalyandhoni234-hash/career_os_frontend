"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { MutationProvider } from "@/hooks/useMutationRefresh";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <MutationProvider>
        {children}
      </MutationProvider>
    </ToastProvider>
  );
}
