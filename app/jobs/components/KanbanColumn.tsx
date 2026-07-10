"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";
import type { Job } from "../types";

interface KanbanColumnProps {
  status: string;
  label: string;
  color: string;
  jobs: Job[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onEdit: (job: Job) => void;
  onAddClick: () => void;
}

export function KanbanColumn({ status, label, color, jobs, onDelete, onStatusChange, onEdit, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}`, data: { type: "column", status } });
  const jobIds = jobs.map((j) => j.id.toString());

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Header */}
      <div className={`mb-3 flex items-center justify-between rounded-xl border border-border border-l-4 px-3.5 py-2.5 ${color}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-fg-default">{label}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-bg-hover px-1.5 font-mono text-[11px] font-bold text-fg-muted">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-hover transition-all duration-150 hover:bg-bg-raised active:scale-90"
        >
          <Plus size={14} className="text-fg-muted" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 rounded-xl border-2 p-2.5 transition-all duration-200 min-h-[120px] ${
          isOver ? "border-accent/40 bg-accent/5" : "border-transparent bg-transparent"
        } ${jobs.length === 0 ? "min-h-[120px]" : ""}`}
      >
        <AnimatePresence mode="popLayout">
          {jobs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border py-8"
            >
              <p className="font-mono text-[11px] text-fg-subtle">Drop here</p>
            </motion.div>
          ) : (
            <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
              {jobs.map((job) => (
                <ApplicationCard key={job.id} job={job} onDelete={onDelete} onStatusChange={onStatusChange} onEdit={onEdit} />
              ))}
            </SortableContext>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
