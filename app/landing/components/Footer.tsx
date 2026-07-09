"use client";

import Link from "next/link";
import { Globe, ExternalLink } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Product", links: [
      { label: "Features", href: "#features" },
      { label: "Agent", href: "#agent" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources", links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Company", links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
  {
    title: "Legal", links: [
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socials = [
  { icon: GithubIcon, name: "GitHub", href: "https://github.com/kalyandhoni234-hash" },
  { icon: LinkedinIcon, name: "LinkedIn", href: "https://www.linkedin.com/in/guru-sharan-kalyan-gr718" },
  { icon: Globe, name: "Portfolio", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface/50">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 sm:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              The AI-powered career operating system.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socials.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                >
                  <s.icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-muted">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg-default"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-fg-subtle">
              &copy; {new Date().getFullYear()} Career OS. All rights reserved.
            </p>
            <p className="text-xs text-fg-subtle">
              Built with care for career growth.
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-accent/10 bg-accent/5 px-6 py-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm font-medium text-fg-default">
                  Created by Guru Sharan Kalyan
                </p>
                <p className="text-xs text-fg-muted">
                  Computer Science Student &bull; Cybersecurity &bull; AI &bull; Full Stack
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="https://www.linkedin.com/in/guru-sharan-kalyan-gr718"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                >
                  <LinkedinIcon className="h-3.5 w-3.5" />
                  LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href="https://github.com/kalyandhoni234-hash"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Portfolio
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
