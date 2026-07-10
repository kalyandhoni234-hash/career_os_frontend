"use client";

import { Suspense, useEffect, useState, useCallback, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, CheckCircle2, Circle, Loader2, ArrowLeft, ExternalLink, Clock, Award } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { RoadmapData, RoadmapNodeData } from "../career/types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const ROADMAP_CATEGORIES = [
  { id: "backend", label: "Backend Engineer" },
  { id: "frontend", label: "Frontend Engineer" },
  { id: "fullstack", label: "Full Stack" },
  { id: "ai", label: "AI Engineer" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "cloud", label: "Cloud Engineer" },
  { id: "devops", label: "DevOps" },
  { id: "data", label: "Data Engineer" },
  { id: "pm", label: "Product Manager" },
];

function RoadmapsContent() {
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const loadRoadmaps = useCallback(async () => {
    try {
      const data = await apiFetch("/api/career/roadmaps");
      setRoadmaps(data.roadmaps || []);
    } catch {
      addToast("error", "Failed to load roadmaps");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { startTransition(() => { loadRoadmaps(); }); }, [loadRoadmaps]);

  useEffect(() => {
    const roadmapId = searchParams?.get("id");
    if (!roadmapId) return;
    apiFetch(`/api/career/roadmaps/${roadmapId}`)
      .then((rd) => { if (rd.roadmap) setActiveRoadmap(rd.roadmap); })
      .catch(() => addToast("error", "Failed to load roadmap"));
  }, [searchParams, addToast]);

  const generateRoadmap = async (category: string, label: string) => {
    setGenerating(true);
    try {
      const data = await apiFetch("/api/career/roadmaps/generate", {
        method: "POST",
        body: JSON.stringify({ category, target_role: label }),
      });
      if (data.roadmap) {
        setActiveRoadmap(data.roadmap);
        setShowGenerator(false);
        addToast("success", `Roadmap for ${label} created!`);
        loadRoadmaps();
      }
    } catch {
      addToast("error", "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const updateNodeStatus = async (nodeId: number, status: string) => {
    try {
      const data = await apiFetch(`/api/career/roadmaps/node/${nodeId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (data.roadmap) setActiveRoadmap(data.roadmap);
      loadRoadmaps();
    } catch {
      addToast("error", "Failed to update progress");
    }
  };

  const viewRoadmap = async (id: number) => {
    try {
      const data = await apiFetch(`/api/career/roadmaps/${id}`);
      if (data.roadmap) {
        setActiveRoadmap(data.roadmap);
        router.push(`/roadmaps?id=${id}`);
      }
    } catch {
      addToast("error", "Failed to load roadmap");
    }
  };

  const deleteRoadmap = async (id: number) => {
    try {
      await apiFetch(`/api/career/roadmaps/${id}`, { method: "DELETE" });
      setActiveRoadmap(null);
      loadRoadmaps();
      router.push("/roadmaps");
      addToast("success", "Roadmap deleted");
    } catch {
      addToast("error", "Failed to delete roadmap");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-fg-muted" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      className="mx-auto max-w-6xl p-4 sm:p-6"
    >
      <motion.div variants={fadeUp} className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-accent" />
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg-default">Learning Roadmaps</h1>
            <p className="text-xs text-fg-muted">Personalized learning paths to reach your career goals</p>
          </div>
        </div>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setShowGenerator(true)}>
          New Roadmap
        </Button>
      </motion.div>

      <div className="flex gap-6">
        {/* Sidebar: roadmap list */}
        <div className="w-64 shrink-0 space-y-2">
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">
            Your Roadmaps ({roadmaps.length})
          </h3>
          {roadmaps.length === 0 ? (
            <p className="text-xs text-fg-subtle">No roadmaps yet. Generate your first one!</p>
          ) : (
            roadmaps.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => viewRoadmap(r.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  activeRoadmap?.id === r.id
                    ? "border-accent bg-accent/5"
                    : "border-border bg-bg-surface hover:border-accent/30"
                }`}
              >
                <p className="text-xs font-medium text-fg-default truncate">{r.title}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-fg-muted">
                  <span className="rounded bg-bg-hover px-1 py-0.5">{r.category || "general"}</span>
                  <span>{r.progress}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-bg-default overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${r.progress}%` }} />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {showGenerator ? (
              <motion.div key="generator"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-border bg-bg-surface p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Choose a Career Path</h2>
                  <button onClick={() => setShowGenerator(false)} className="text-xs text-fg-muted hover:text-fg-default">Cancel</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ROADMAP_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => generateRoadmap(cat.id, cat.label)}
                      disabled={generating}
                      className="rounded-lg border border-border bg-bg-default p-3 text-left transition-all hover:border-accent/30 disabled:opacity-50"
                    >
                      <p className="text-sm font-medium text-fg-default">{cat.label}</p>
                      <p className="text-[11px] text-fg-muted mt-1">
                        Personalized learning path with projects
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : activeRoadmap ? (
              <motion.div key={activeRoadmap.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {/* Roadmap header */}
                <div className="rounded-xl border border-border bg-bg-surface p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-lg font-medium text-fg-default">{activeRoadmap.title}</h2>
                      <p className="mt-1 text-xs text-fg-muted">{activeRoadmap.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-fg-muted">
                        {activeRoadmap.category && (
                          <span className="rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">{activeRoadmap.category}</span>
                        )}
                        <span className="flex items-center gap-1"><Clock size={11} /> ~{activeRoadmap.estimated_weeks} weeks</span>
                        <span className="flex items-center gap-1"><Award size={11} /> {activeRoadmap.completed_nodes}/{activeRoadmap.total_nodes} completed</span>
                      </div>
                    </div>
                    <button onClick={() => deleteRoadmap(activeRoadmap.id)} className="text-[11px] text-fg-muted hover:text-danger transition-colors">
                      Delete
                    </button>
                  </div>

                  {/* Overall progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-fg-muted mb-1">
                      <span>Progress</span>
                      <span className="font-mono font-medium text-fg-default">{activeRoadmap.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-default overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeRoadmap.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Nodes timeline */}
                <div className="mt-4 space-y-1">
                  {activeRoadmap.nodes?.map((node) => (
                    <NodeCard key={node.id} node={node} onToggle={updateNodeStatus} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border-2 border-dashed border-border p-12 text-center"
              >
                <BookOpen size={32} className="mx-auto text-fg-subtle" />
                <h2 className="mt-3 font-serif text-lg text-fg-muted">Select or Create a Roadmap</h2>
                <p className="mt-1 text-xs text-fg-subtle">Choose a learning path to start tracking your progress.</p>
                <button onClick={() => setShowGenerator(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 active:scale-95"
                >
                  <Plus size={13} /> Create Your First Roadmap
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function RoadmapsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-fg-muted" />
        </div>
      </div>
    }>
      <RoadmapsContent />
    </Suspense>
  );
}

function NodeCard({ node, onToggle }: { node: RoadmapNodeData; onToggle: (id: number, status: string) => void }) {
  const isCompleted = node.status === "completed";
  const isInProgress = node.status === "in_progress";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-3 transition-all ${
        isCompleted
          ? "border-success/30 bg-success/5"
          : isInProgress
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-bg-surface hover:border-accent/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(node.id, isCompleted ? "pending" : "completed")}
          className="mt-0.5 shrink-0 transition-colors hover:scale-110"
        >
          {isCompleted ? (
            <CheckCircle2 size={16} className="text-success" />
          ) : (
            <Circle size={16} className="text-fg-subtle hover:text-accent" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-xs font-medium ${isCompleted ? "text-success line-through" : "text-fg-default"}`}>
                {node.title}
              </p>
              {node.description && (
                <p className="mt-0.5 text-[11px] text-fg-muted">{node.description}</p>
              )}
            </div>
            <span className="shrink-0 text-[10px] text-fg-subtle font-mono">Week {node.week}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {(node.skill_tags || []).map((tag) => (
              <span key={tag} className="rounded bg-bg-hover px-1.5 py-0.5 text-[10px] text-fg-muted">{tag}</span>
            ))}
            {node.resource_url && (
              <a href={node.resource_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-0.5 text-[10px] text-accent hover:text-accent/80 ml-auto"
              >
                <ExternalLink size={10} /> {node.resource_type}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
