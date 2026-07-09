"use client";
import Link from "next/link";
import { FileText, Briefcase, MessageCircle, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  hasResume: boolean;
  totalApplications: number;
}

export function QuickActions({ hasResume, totalApplications }: QuickActionsProps) {
  const actions = [
    {
      href: "/resume",
      icon: FileText,
      label: "Resume Studio",
      sub: hasResume ? "Update or optimize" : "Build your first resume",
    },
    {
      href: "/jobs",
      icon: Briefcase,
      label: "Applications",
      sub: totalApplications ? `${totalApplications} tracked` : "Track your first",
    },
    {
      href: "/coach",
      icon: MessageCircle,
      label: "Career Coach",
      sub: "Get AI-powered advice",
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      sub: "View metrics and insights",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-xl border border-border bg-bg-surface p-4 card-hover"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-border bg-bg-default p-2.5 text-accent transition-all duration-200 group-hover:bg-accent-subtle group-hover:border-accent/30 group-hover:scale-105">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg-default">{a.label}</p>
                <p className="mt-0.5 text-sm text-fg-muted">{a.sub}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
