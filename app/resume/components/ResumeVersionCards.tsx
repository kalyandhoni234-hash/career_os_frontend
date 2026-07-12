"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Copy, Trash2, Download, RotateCcw,
  ChevronDown, ChevronUp, History, Briefcase, Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { VersionInfo } from "../types";

interface ResumeVersionCardsProps {
  versions: VersionInfo[];
  onRestore: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onTailor: (id: number) => void;
  onExportPDF: (id: number) => void;
}

const SOURCE_BADGE: Record<string, { tone: "accent" | "success" | "warning" | "neutral"; label: string }> = {
  ai_generated: { tone: "accent", label: "AI" },
  tailored: { tone: "success", label: "Tailored" },
  manual: { tone: "neutral", label: "Manual" },
};

export function ResumeVersionCards({
  versions, onRestore, onDuplicate, onDelete, onTailor, onExportPDF,
}: ResumeVersionCardsProps) {
  const [expanded, setExpanded] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const startRename = (v: VersionInfo) => {
    setRenamingId(v.id);
    setRenameValue(v.version_name);
  };

  const commitRename = () => {
    if (renamingId !== null && renameValue.trim()) {
      void onRestore(renamingId);
    }
    setRenamingId(null);
  };

  const displayVersions = expanded ? versions : versions.slice(0, 4);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <History size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">
            Resume Versions
          </h3>
          <span className="rounded-full border border-border bg-bg-hover px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
            {versions.length}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-fg-muted" /> : <ChevronDown size={14} className="text-fg-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {versions.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
                <p className="text-xs text-fg-subtle">
                  No versions yet. Generate or save your resume to create versions.
                </p>
              </div>
            ) : (
              displayVersions.map((v) => {
                const badgeInfo = SOURCE_BADGE[v.source || "manual"] || SOURCE_BADGE.manual;
                const scoreColor = v.ats_score !== null && v.ats_score !== undefined
                  ? v.ats_score >= 80 ? "text-success" : v.ats_score >= 50 ? "text-warning" : "text-danger"
                  : "text-fg-muted";
                return (
                  <motion.div
                    key={v.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-lg border border-border bg-bg-default p-3 transition-all duration-150 hover:border-accent/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {renamingId === v.id ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => e.key === "Enter" && commitRename()}
                              className="field h-6 px-1.5 py-0 text-xs"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <FileText size={12} className="text-fg-muted" />
                              <span className="text-xs font-medium text-fg-default">{v.version_name}</span>
                            </div>
                          )}
                          <Badge tone={badgeInfo.tone}>{badgeInfo.label}</Badge>
                          {v.ats_score !== null && v.ats_score !== undefined && (
                            <span className={`font-mono text-[10px] font-medium ${scoreColor}`}>
                              ATS {v.ats_score}%
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-fg-subtle">
                          {v.target_role && (
                            <span className="flex items-center gap-1">
                              <Target size={9} /> {v.target_role}
                            </span>
                          )}
                          {v.updated_at && (
                            <span>{new Date(v.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button size="sm" variant="ghost" icon={<RotateCcw size={10} />} onClick={() => onRestore(v.id)}>
                        Open
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Copy size={10} />} onClick={() => onDuplicate(v.id)}>
                        Duplicate
                      </Button>
                      <Button size="sm" variant="ghost" icon={<FileText size={10} />} onClick={() => startRename(v)}>
                        Rename
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Briefcase size={10} />} onClick={() => onTailor(v.id)}>
                        Tailor
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Download size={10} />} onClick={() => onExportPDF(v.id)}>
                        Export
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={10} />} onClick={() => onDelete(v.id)}>
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
            {versions.length > 4 && (
              <button
                onClick={() => setExpanded(false)}
                className="w-full pt-1 text-center text-[10px] text-fg-muted transition-colors duration-150 hover:text-fg-default"
              >
                Show less
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


