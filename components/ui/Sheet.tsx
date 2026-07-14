"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  widthClassName?: string;
}

export function Sheet({ open, onClose, title, description, children, widthClassName = "max-w-md" }: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard SSR-safe portal-mount check
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — glass blur so the board stays visible behind it */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            key="sheet-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.1, 1] }}
            role="dialog"
            aria-modal="true"
            className={`fixed right-0 top-0 z-50 h-full w-full ${widthClassName} overflow-y-auto border-l border-border bg-bg-surface/95 backdrop-blur-md shadow-2xl`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-bg-surface/90 backdrop-blur-md px-5 py-4">
              <div className="min-w-0">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-fg-default">{title}</h2>
                {description && <p className="mt-1 text-xs text-fg-muted">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-md p-1.5 text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default active:scale-90"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}