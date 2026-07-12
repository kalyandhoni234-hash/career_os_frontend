"use client";

import { motion } from "framer-motion";
import { Sparkles, Download, FileText, Eye, Target, Clock, ShieldCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ResumeData } from "../types";

interface ResumeStudioHeroProps {
  resume: ResumeData | null;
  atsScore: number | null;
  onGenerate: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onPreview: () => void;
  tailoringOpen: boolean;
  onToggleTailoring: () => void;
  aiLoading?: boolean;
}

export function ResumeStudioHero({
  resume, atsScore, onGenerate, onExportPDF, onExportDOCX, onPreview,
  tailoringOpen, onToggleTailoring, aiLoading,
}: ResumeStudioHeroProps) {
  const scoreColor = atsScore !== null
    ? atsScore >= 80 ? "text-success" : atsScore >= 50 ? "text-warning" : "text-danger"
    : "text-fg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-gradient-to-b from-bg-surface to-bg-default p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <FileText size={14} className="text-accent" />
            <span className="font-mono uppercase tracking-widest">Resume Studio</span>
            {resume?.id ? (
              <Badge tone="success">Active</Badge>
            ) : (
              <Badge tone="warning">Draft</Badge>
            )}
          </div>

          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-fg-default sm:text-3xl">
            {resume?.full_name || "Untitled Resume"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {resume?.title && (
              <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                <Target size={12} />
                <span>{resume.title}</span>
              </div>
            )}
            {atsScore !== null && (
              <div className={`flex items-center gap-1.5 text-xs ${scoreColor}`}>
                <ShieldCheck size={12} />
                <span className="font-mono font-medium">ATS {atsScore}%</span>
              </div>
            )}
            {resume?.updated_at && (
              <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                <Clock size={12} />
                <span>Updated {new Date(resume.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button size="sm" icon={aiLoading ? <RotateCw size={13} className="animate-spin" /> : <Sparkles size={13} />} onClick={onGenerate} loading={aiLoading}>
            {aiLoading ? "Generating..." : "Generate Resume"}
          </Button>
          <Button size="sm" variant="secondary" icon={<FileText size={13} />} onClick={onToggleTailoring}>
            {tailoringOpen ? "Hide Tailoring" : "Tailor for Job"}
          </Button>
          <Button size="sm" variant="secondary" icon={<Download size={13} />} onClick={onExportPDF}>
            Export PDF
          </Button>
          <Button size="sm" variant="ghost" icon={<Download size={12} />} onClick={onExportDOCX}>
            DOCX
          </Button>
          <Button size="sm" variant="ghost" icon={<Eye size={12} />} onClick={onPreview}>
            Preview
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
