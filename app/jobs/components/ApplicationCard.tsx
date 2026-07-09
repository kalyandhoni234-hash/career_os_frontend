"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, DollarSign, MapPin, GripVertical, MoreHorizontal, Target, GitBranch, ArrowRight, Trash2, ExternalLink, Clock } from "lucide-react";
import type { Job } from "../types";

interface ApplicationCardProps {
  job: Job;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onEdit: (job: Job) => void;
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getNextActionLabel(action: string | null) {
  if (!action) return null;
  return action.length > 30 ? action.slice(0, 27) + "..." : action;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDaysRemaining(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function ApplicationCard({ job, onDelete, onStatusChange, onEdit }: ApplicationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id.toString(),
    data: { type: "job", job },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const days = getDaysRemaining(job.deadline);
  const isUrgent = days !== null && days <= 3 && days >= 0;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.1, 1] }}
      className="group relative rounded-xl border border-border bg-bg-surface transition-all duration-150 hover:border-accent/25 hover:shadow-md active:shadow-sm"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 cursor-grab rounded-md p-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical size={13} className="text-fg-subtle" />
      </div>

      <div className="p-3.5">
        {/* Top row: initials + company + menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-default font-mono text-xs font-bold text-accent">
              {getInitials(job.company)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg-default">{job.company}</p>
              <p className="truncate text-xs text-fg-muted">{job.role}</p>
            </div>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="rounded-md p-1 opacity-0 transition-all duration-150 hover:bg-bg-hover group-hover:opacity-100"
            >
              <MoreHorizontal size={14} className="text-fg-muted" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-lg border border-border bg-bg-surface shadow-lg">
                  {["applied", "oa", "interview", "offer", "rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(job.id, s); setMenuOpen(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors duration-100 hover:bg-bg-hover ${job.status === s ? "font-medium text-accent" : "text-fg-muted"}`}
                    >
                      {s === "applied" && <ArrowRight size={12} />}
                      {s === "oa" && <Target size={12} />}
                      {s === "interview" && <Calendar size={12} />}
                      {s === "offer" && <AwardIcon />}
                      {s === "rejected" && <Trash2 size={12} />}
                      Move to {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                  <div className="border-t border-border" />
                  <button
                    onClick={() => { onEdit(job); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-fg-muted transition-colors duration-100 hover:bg-bg-hover"
                  >
                    <ExternalLink size={12} /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(job.id); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-danger transition-colors duration-100 hover:bg-red-50"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags row */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {job.ats_score !== null && (
            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium ${
              job.ats_score >= 80 ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
              job.ats_score >= 50 ? "border-amber-200 bg-amber-50 text-amber-700" :
              "border-red-200 bg-red-50 text-red-700"
            }`}>
              {job.ats_score}% ATS
            </span>
          )}
          {job.resume_version && (
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-default px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
              <GitBranch size={10} /> {job.resume_version}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${
            job.priority === "high" ? "border-red-200 bg-red-50 text-red-700" :
            job.priority === "medium" ? "border-amber-200 bg-amber-50 text-amber-700" :
            "border-border bg-bg-default text-fg-muted"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[job.priority] || PRIORITY_DOT.medium}`} />
            {job.priority}
          </span>
        </div>

        {/* Details grid */}
        <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {job.salary && (
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <DollarSign size={11} className="shrink-0" />
              <span className="truncate">{job.salary}</span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
          {job.deadline && (
            <div className={`flex items-center gap-1.5 text-xs ${isUrgent ? "text-danger font-medium" : "text-fg-muted"}`}>
              {isUrgent ? <Clock size={11} className="shrink-0" /> : <Calendar size={11} className="shrink-0" />}
              <span className="truncate">{formatDate(job.deadline)}</span>
              {days !== null && <span className="shrink-0">({days > 0 ? `${days}d` : "due"})</span>}
            </div>
          )}
          {job.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <Calendar size={11} className="shrink-0" />
              <span className="truncate">{formatDate(job.created_at)}</span>
            </div>
          )}
        </div>

        {/* Next action */}
        {job.next_action && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-accent/10 bg-accent/5 px-2.5 py-1.5">
            <ArrowRight size={11} className="shrink-0 text-accent" />
            <span className="text-xs text-accent">{getNextActionLabel(job.next_action)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AwardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path d="M12 15v6" />
      <path d="M9 21h6" />
    </svg>
  );
}
