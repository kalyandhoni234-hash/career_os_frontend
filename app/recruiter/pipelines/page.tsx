"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookmarkCheck, Plus, FolderKanban, ExternalLink, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { listPipelines, createPipeline, deletePipeline, getSavedCandidates } from "../api";
import type { Pipeline, CandidatePreview } from "../types";

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#2563eb");

  const load = async () => {
    try {
      const [p, s] = await Promise.all([listPipelines(), getSavedCandidates()]);
      setPipelines(p.pipelines);
      setSavedCandidates(s.saved_candidates);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createPipeline({ name: newName, color: newColor });
    setNewName("");
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deletePipeline(id);
    load();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-bg-hover" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-fg-default">Talent Pipelines</h1>
          <p className="mt-1 text-sm text-fg-muted">Organize saved candidates into pipelines.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-press flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
          <Plus size={16} /> New Pipeline
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-bg-surface p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Pipeline Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Backend Engineers" className="field" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Color</label>
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-12 rounded-lg border border-border cursor-pointer" />
            </div>
            <button onClick={handleCreate} disabled={!newName.trim()} className="btn-press rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50">Create</button>
          </div>
        </motion.div>
      )}

      {pipelines.length === 0 && savedCandidates.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <FolderKanban size={32} className="mx-auto text-fg-subtle" />
            <p className="mt-3 font-medium text-fg-default">No pipelines yet</p>
            <p className="mt-1 text-sm text-fg-muted">Create pipelines to organize your saved candidates.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pipelines.map((p) => (
              <Card key={p.id} hover>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: p.color + "15" }}>
                      <FolderKanban size={18} style={{ color: p.color || "#2563eb" }} />
                    </div>
                    <div>
                      <p className="font-medium text-fg-default">{p.name}</p>
                      <p className="text-xs text-fg-muted">{p.candidate_count} candidates</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="btn-press rounded-lg p-1.5 text-fg-subtle hover:bg-danger/5 hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {savedCandidates.length > 0 && (
            <>
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <BookmarkCheck size={14} className="text-accent" />
                <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Saved Candidates</h2>
              </div>
              <div className="space-y-2">
                {savedCandidates.map((c) => (
                  <div key={c.saved_id} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface p-3 transition-all duration-150 hover:border-accent/30">
                    <div className="flex items-center gap-3">
                      <div>
                        <Link href={`/recruiter/candidates/${c.user_id}`} className="text-sm font-medium text-fg-default hover:text-accent transition-colors">{c.full_name}</Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {c.pipeline_name && <span className="rounded-full px-2 py-0.5 font-mono text-[9px]" style={{ backgroundColor: (c.pipeline_color || "#2563eb") + "15", color: c.pipeline_color || "#2563eb" }}>{c.pipeline_name}</span>}
                          {c.ats_score !== null && <span className="font-mono text-[10px] text-fg-muted">ATS {c.ats_score}</span>}
                          {c.skills && <span className="text-[11px] text-fg-muted">{c.skills.slice(0, 3).join(", ")}{c.skills.length > 3 ? "..." : ""}</span>}
                        </div>
                      </div>
                    </div>
                    <Link href={`/recruiter/candidates/${c.user_id}`} className="btn-press rounded-lg border border-border px-2.5 py-1.5 text-fg-muted hover:bg-bg-hover">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
