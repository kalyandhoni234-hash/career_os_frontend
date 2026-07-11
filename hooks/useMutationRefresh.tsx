"use client";

import { createContext, useContext, useCallback, useState, type ReactNode } from "react";

type MutationType = "resume" | "profile" | "application" | "roadmap" | "skill" | "integration";

interface MutationContextType {
  notifyMutation: (type: MutationType) => void;
  lastMutation: MutationType | null;
  lastMutationTime: number;
}

const MutationContext = createContext<MutationContextType | null>(null);

export function MutationProvider({ children }: { children: ReactNode }) {
  const [lastMutation, setLastMutation] = useState<MutationType | null>(null);
  const [lastMutationTime, setLastMutationTime] = useState(0);

  const notifyMutation = useCallback((type: MutationType) => {
    setLastMutation(type);
    setLastMutationTime(Date.now());
  }, []);

  return (
    <MutationContext.Provider value={{ notifyMutation, lastMutation, lastMutationTime }}>
      {children}
    </MutationContext.Provider>
  );
}

export function useMutationRefresh() {
  const ctx = useContext(MutationContext);
  if (!ctx) throw new Error("useMutationRefresh must be used within MutationProvider");
  return ctx;
}
