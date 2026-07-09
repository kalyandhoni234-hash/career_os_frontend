"use client";

import { Plus, FileSpreadsheet, Globe, FileText, GitBranch } from "lucide-react";

interface QuickActionsProps {
  onAddApplication: () => void;
}

const actions = [
  { label: "Add Application", icon: Plus, action: "add", primary: true },
  { label: "Import CSV", icon: FileSpreadsheet, action: "csv", primary: false },
  { label: "LinkedIn Jobs", icon: Globe, action: "linkedin", primary: false },
  { label: "Cover Letter", icon: FileText, action: "cover-letter", primary: false },
  { label: "Resume Version", icon: GitBranch, action: "resume-version", primary: false },
];

export function QuickActions({ onAddApplication }: QuickActionsProps) {
  const handleAction = (action: string) => {
    if (action === "add") {
      onAddApplication();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.action}
          onClick={() => handleAction(a.action)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
            a.primary
              ? "border-accent bg-accent text-white hover:bg-accent/90 active:scale-[0.97]"
              : "border-border bg-bg-surface text-fg-muted hover:border-accent/30 hover:text-fg-default active:scale-[0.97]"
          }`}
        >
          <a.icon size={13} />
          {a.label}
        </button>
      ))}
    </div>
  );
}
