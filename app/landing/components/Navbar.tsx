"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-fg-muted transition-colors hover:text-fg-default"
          >
            Features
          </Link>
          <Link
            href="#agent"
            className="text-sm font-medium text-fg-muted transition-colors hover:text-fg-default"
          >
            Agent
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-fg-muted transition-colors hover:text-fg-default"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-fg-muted transition-colors hover:text-fg-default"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
