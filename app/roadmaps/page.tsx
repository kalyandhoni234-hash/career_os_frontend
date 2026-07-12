"use client";

import { Suspense, useEffect, useState, useCallback, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle2, Circle, Loader2, ExternalLink, Clock, Award,
  Zap, BarChart3, ChevronDown, ChevronRight, Sparkles,
  Play, SkipForward, AlertTriangle,
} from "lucide-react";
import { apiFetch, HttpError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { DashboardRoadmap, FullRoadmap, PhaseData } from "../career/types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-success" />,
  in_progress: <Play size={14} className="text-accent" />,
  not_started: <Circle size={14} className="text-fg-subtle" />,
  skipped: <SkipForward size={14} className="text-fg-subtle" />,
  need_revision: <AlertTriangle size={14} className="text-warning" />,
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  not_started: "Not Started",
  skipped: "Skipped",
  need_revision: "Need Revision",
};

function RoadmapsContent() {
  const [roadmaps, setRoadmaps] = useState<DashboardRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<FullRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedModule, setExpandedModule] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<{ phaseId: string; moduleId: string; lessonId: string } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, unknown> | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const loadRoadmaps = useCallback(async () => {
    try {
      const data = await apiFetch("/api/career/my-roadmap");
      setRoadmaps(data.roadmap ? [data.roadmap] : []);
    } catch {
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { startTransition(() => { loadRoadmaps(); }); }, [loadRoadmaps]);

  const loadFullRoadmap = useCallback(async (id: number) => {
    try {
      const data = await apiFetch(`/api/career/roadmaps/${id}/full`);
      if (data.roadmap) {
        return data.roadmap as FullRoadmap;
      }
    } catch {
      addToast("error", "Failed to load roadmap details");
    }
    return null;
  }, [addToast]);

  useEffect(() => {
    const roadmapId = searchParams?.get("id");
    if (roadmapId) {
      loadFullRoadmap(Number(roadmapId)).then((r) => {
        startTransition(() => {
          if (r) { setActiveRoadmap(r); setSelectedLesson(null); setRecommendations(null); }
        });
      });
    }
  }, [searchParams, loadFullRoadmap]);

  const autoGenerate = async () => {
    setGenerating(true);
    try {
      const data = await apiFetch("/api/career/roadmaps/auto-generate", { method: "POST" });
      if (data.roadmap) {
        const r = data.roadmap as DashboardRoadmap;
        setRoadmaps([r]);
        setShowGenerator(false);
        addToast("success", "Personalized roadmap created!");
        loadFullRoadmap(r.id);
        router.push(`/roadmaps?id=${r.id}`);
      } else {
        addToast("error", data.error || "Could not auto-generate. Set a target role first.");
      }
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.errorCode === "ONBOARDING_REQUIRED" || err.errorCode === "PROFILE_NOT_FOUND") {
          addToast("error", err.message || "Complete onboarding first.");
          setTimeout(() => router.push("/onboarding"), 1500);
        } else if (err.errorCode?.startsWith("MISSING_")) {
          addToast("error", err.message || "Update your profile and try again.");
        } else {
          addToast("error", err.message || "Failed to generate roadmap");
        }
      } else {
        addToast("error", "Failed to generate roadmap");
      }
    } finally {
      setGenerating(false);
    }
  };

  const updateLessonProgress = async (lessonId: string, status: string, roadmapId: number) => {
    setUpdating(lessonId);
    try {
      const data = await apiFetch(`/api/career/roadmaps/${roadmapId}/lesson/${lessonId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (data.roadmap) setActiveRoadmap(data.roadmap as FullRoadmap);
      loadRoadmaps();
    } catch {
      addToast("error", "Failed to update progress");
    } finally {
      setUpdating(null);
    }
  };

  const loadRecommendations = async (roadmapId: number, lessonId: string) => {
    setLoadingRecs(true);
    try {
      const data = await apiFetch(`/api/career/roadmaps/${roadmapId}/lesson/${lessonId}/recommendations`);
      setRecommendations(data);
    } catch {
      addToast("error", "Failed to load recommendations");
    } finally {
      setLoadingRecs(false);
    }
  };

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleModule = (id: string) => {
    setExpandedModule((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectLesson = (phaseId: string, moduleId: string, lessonId: string) => {
    setSelectedLesson({ phaseId, moduleId, lessonId });
    if (activeRoadmap) loadRecommendations(activeRoadmap.id, lessonId);
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
        <Button size="sm" icon={<Sparkles size={16} />} onClick={() => setShowGenerator(true)} className="min-h-[44px]">
          Auto-Generate
        </Button>
      </motion.div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">
            Your Roadmaps ({roadmaps.length})
          </h3>
          {roadmaps.length === 0 ? (
            <p className="text-xs text-fg-subtle">No roadmaps yet.</p>
          ) : (
            roadmaps.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  loadFullRoadmap(r.id);
                  router.push(`/roadmaps?id=${r.id}`);
                }}
                className={`w-full min-h-[44px] rounded-lg border p-3 text-left transition-all ${
                  activeRoadmap?.id === r.id
                    ? "border-accent bg-accent/5"
                    : "border-border bg-bg-surface hover:border-accent/30"
                }`}
              >
                <p className="text-xs font-medium text-fg-default truncate">{r.title}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-fg-muted">
                  {r.target_role && <span className="rounded bg-accent/10 px-1 py-0.5 text-accent">{r.target_role}</span>}
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
                  <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Auto-Generate Roadmap</h2>
                  <button onClick={() => setShowGenerator(false)} className="min-h-[44px] px-3 text-xs text-fg-muted hover:text-fg-default">Cancel</button>
                </div>
                <p className="text-xs text-fg-muted mb-4">
                  Generates a personalized roadmap based on your profile, resume skills, and target role.
                  Already-known skills will be skipped, and lessons will adapt to your level.
                </p>
                <button
                  onClick={autoGenerate}
                  disabled={generating}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-5 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-50"
                >
                  {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {generating ? "Generating..." : "Generate My Personalized Roadmap"}
                </button>
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
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-lg font-medium text-fg-default">{activeRoadmap.title}</h2>
                        {activeRoadmap.status === "active" && <span className="rounded bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Active</span>}
                      </div>
                      <p className="mt-1 text-xs text-fg-muted">{activeRoadmap.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-fg-muted">
                        <span className="rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">{activeRoadmap.target_role}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> ~{activeRoadmap.estimated_weeks} weeks</span>
                        <span className="flex items-center gap-1"><Award size={11} /> {activeRoadmap.totals.completed}/{activeRoadmap.totals.total} completed</span>
                        <span className="flex items-center gap-1"><Zap size={11} className="text-warning" /> {activeRoadmap.streak} day streak</span>
                        <span className="flex items-center gap-1"><BarChart3 size={11} /> ~{activeRoadmap.weekly_hours}h/week</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall progress + weekly */}
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <div className="flex items-center justify-between text-xs text-fg-muted mb-1">
                        <span>Overall Progress</span>
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
                    <div className="text-center rounded-lg bg-bg-default p-2">
                      <p className="text-[18px] font-mono font-bold text-accent">{activeRoadmap.totals.not_started}</p>
                      <p className="text-[9px] text-fg-muted uppercase tracking-wider">Pending</p>
                    </div>
                    <div className="text-center rounded-lg bg-bg-default p-2">
                      <p className="text-[18px] font-mono font-bold text-success">{activeRoadmap.totals.completed}</p>
                      <p className="text-[9px] text-fg-muted uppercase tracking-wider">Done</p>
                    </div>
                  </div>

                  {/* Current lesson banner */}
                  {activeRoadmap.current_lesson && (
                    <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play size={14} className="text-accent shrink-0" />
                        <div>
                          <p className="text-[10px] text-accent uppercase tracking-wider font-medium">Continue Learning</p>
                          <p className="text-xs font-medium text-fg-default">{activeRoadmap.current_lesson.title}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-fg-muted">
                        {activeRoadmap.current_phase_title} &rsaquo; {activeRoadmap.current_module_title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Phases / Modules / Lessons tree */}
                <div className="mt-4 space-y-2">
                  {activeRoadmap.phases.map((phase) => (
                    <PhaseCard
                      key={phase.id}
                      phase={phase}
                      isExpanded={expandedPhases.has(phase.id)}
                      onToggle={() => togglePhase(phase.id)}
                      expandedModule={expandedModule}
                      onToggleModule={toggleModule}
                      selectedLesson={selectedLesson}
                      onSelectLesson={selectLesson}
                      onUpdateProgress={(lessonId, status) => updateLessonProgress(lessonId, status, activeRoadmap.id)}
                      updating={updating}
                      recommendations={selectedLesson && selectedLesson.phaseId === phase.id ? recommendations : null}
                      loadingRecs={loadingRecs}
                    />
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
                <h2 className="mt-3 font-serif text-lg text-fg-muted">No Roadmap Selected</h2>
                <p className="mt-1 text-xs text-fg-subtle">Generate a personalized roadmap or select one from the sidebar.</p>
                <button onClick={() => setShowGenerator(true)}
                  className="mt-4 min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 active:scale-95"
                >
                  <Sparkles size={13} /> Generate My Roadmap
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

/* ── Phase Card ── */
function PhaseCard({
  phase, isExpanded, onToggle, expandedModule, onToggleModule,
  selectedLesson, onSelectLesson, onUpdateProgress, updating, recommendations, loadingRecs,
}: {
  phase: PhaseData;
  isExpanded: boolean;
  onToggle: () => void;
  expandedModule: Set<string>;
  onToggleModule: (id: string) => void;
  selectedLesson: { phaseId: string; moduleId: string; lessonId: string } | null;
  onSelectLesson: (phaseId: string, moduleId: string, lessonId: string) => void;
  onUpdateProgress: (lessonId: string, status: string) => void;
  updating: string | null;
  recommendations: Record<string, unknown> | null;
  loadingRecs: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full min-h-[44px] flex items-center justify-between p-4 transition-colors hover:bg-bg-hover"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={14} className="text-fg-muted" /> : <ChevronRight size={14} className="text-fg-muted" />}
          <div className="text-left">
            <p className="text-sm font-medium text-fg-default">Phase {phase.order}: {phase.title}</p>
            <p className="text-[10px] text-fg-muted">{phase.modules.length} modules &middot; {phase.progress}% complete</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-bg-default overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: `${phase.progress}%` }} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 space-y-2">
              {phase.modules.map((mod) => (
                <div key={mod.id} className="mt-2">
                  <button
                    onClick={() => onToggleModule(mod.id)}
                    className="w-full min-h-[36px] flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-bg-hover"
                  >
                    <div className="flex items-center gap-2">
                      {expandedModule.has(mod.id) ? <ChevronDown size={12} className="text-fg-subtle" /> : <ChevronRight size={12} className="text-fg-subtle" />}
                      <span className="text-xs font-medium text-fg-default">{mod.title}</span>
                      <span className="text-[10px] text-fg-muted">({mod.lessons.length} lessons)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-fg-muted">{mod.progress}%</span>
                      <div className="h-1 w-12 rounded-full bg-bg-default overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${mod.progress}%` }} />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedModule.has(mod.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 space-y-1">
                          {mod.lessons.map((lesson) => {
                            const isSelected = selectedLesson?.phaseId === phase.id && selectedLesson?.moduleId === mod.id && selectedLesson?.lessonId === lesson.id;
                            return (
                              <div key={lesson.id}>
                                <button
                                  onClick={() => onSelectLesson(phase.id, mod.id, lesson.id)}
                                  className={`w-full min-h-[36px] flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all ${
                                    isSelected
                                      ? "bg-accent/10 border border-accent/30"
                                      : "hover:bg-bg-hover border border-transparent"
                                  }`}
                                >
                                  <span className="shrink-0">
                                    {statusIcons[lesson.status || "not_started"]}
                                  </span>
                                  <span className={`flex-1 text-[11px] ${
                                    lesson.status === "completed" ? "text-success line-through" :
                                    lesson.status === "skipped" ? "text-fg-subtle" : "text-fg-default"
                                  }`}>
                                    {lesson.title}
                                  </span>
                                  <span className="text-[9px] text-fg-muted">{lesson.estimated_minutes}m</span>
                                  {lesson.difficulty && (
                                    <span className={`text-[9px] rounded px-1 ${
                                      lesson.difficulty === "beginner" ? "bg-green-500/10 text-green-400" :
                                      lesson.difficulty === "intermediate" ? "bg-yellow-500/10 text-yellow-400" :
                                      "bg-red-500/10 text-red-400"
                                    }`}>{lesson.difficulty[0].toUpperCase()}</span>
                                  )}
                                </button>

                                {/* Lesson detail panel */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="ml-6 border-l-2 border-accent/30 pl-4 py-2 space-y-3">
                                        {/* Progress controls */}
                                        <div className="flex flex-wrap gap-1.5">
                                          {["not_started", "in_progress", "completed", "skipped", "need_revision"].map((s) => (
                                            <button
                                              key={s}
                                              onClick={() => onUpdateProgress(lesson.id, s)}
                                              disabled={updating === lesson.id}
                                              className={`min-h-[28px] inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                                                lesson.status === s
                                                  ? "bg-accent/20 text-accent border border-accent/40"
                                                  : "border border-border text-fg-muted hover:border-accent/30 hover:text-fg-default"
                                              } disabled:opacity-50`}
                                            >
                                              {statusIcons[s]}
                                              {statusLabels[s]}
                                            </button>
                                          ))}
                                        </div>

                                        {/* Resources */}
                                        {lesson.resources && lesson.resources.length > 0 && (
                                          <DetailSection title="Resources">
                                            {lesson.resources.map((r, i) => (
                                              <a key={i} href={r.url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 text-[11px] text-accent hover:text-accent/80"
                                              >
                                                <ExternalLink size={10} />
                                                {r.title} <span className="text-[9px] text-fg-subtle">({r.type})</span>
                                              </a>
                                            ))}
                                          </DetailSection>
                                        )}

                                        {/* Practice Labs */}
                                        {lesson.practice_labs && lesson.practice_labs.length > 0 && (
                                          <DetailSection title="Practice Labs">
                                            {lesson.practice_labs.map((lab, i) => (
                                              <a key={i} href={lab.url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 text-[11px] text-accent hover:text-accent/80"
                                              >
                                                <ExternalLink size={10} /> {lab.title} <span className="text-[9px] text-fg-subtle">({lab.platform})</span>
                                              </a>
                                            ))}
                                          </DetailSection>
                                        )}

                                        {/* Projects */}
                                        {lesson.projects && lesson.projects.length > 0 && (
                                          <DetailSection title="Projects">
                                            {lesson.projects.map((p, i) => (
                                              <p key={i} className="text-[11px] text-fg-default">{p.title}: {p.description}</p>
                                            ))}
                                          </DetailSection>
                                        )}

                                        {/* Quiz */}
                                        {lesson.quiz && lesson.quiz.length > 0 && (
                                          <DetailSection title="Knowledge Check">
                                            <p className="text-[11px] text-fg-muted">{lesson.quiz[0].question}</p>
                                            <div className="mt-1 space-y-0.5">
                                              {lesson.quiz[0].options.map((opt, i) => (
                                                <div key={i} className={`text-[10px] px-2 py-1 rounded ${
                                                  i === lesson.quiz[0].correct_index ? "bg-success/10 text-success" : "text-fg-muted"
                                                }`}>
                                                  {i === lesson.quiz[0].correct_index && <CheckCircle2 size={8} className="inline mr-1" />}
                                                  {opt}
                                                </div>
                                              ))}
                                            </div>
                                          </DetailSection>
                                        )}

                                        {/* Skills gained */}
                                        {lesson.skills_gained && lesson.skills_gained.length > 0 && (
                                          <DetailSection title="Skills You'll Gain">
                                            <div className="flex flex-wrap gap-1">
                                              {lesson.skills_gained.map((s, i) => (
                                                <span key={i} className="rounded bg-bg-hover px-1.5 py-0.5 text-[10px] text-fg-muted">{s}</span>
                                              ))}
                                            </div>
                                          </DetailSection>
                                        )}

                                        {/* AI Recommendations */}
                                        {loadingRecs && (
                                          <div className="flex items-center gap-1 text-[10px] text-fg-muted">
                                            <Loader2 size={10} className="animate-spin" /> Loading recommendations...
                                          </div>
                                        )}
                                        {recommendations && !loadingRecs && (
                                          <DetailSection title="AI Recommendations">
                                            {(recommendations.next_lesson as string) && (
                                              <p className="text-[11px] text-fg-default">
                                                <span className="text-accent">Next:</span> {recommendations.next_lesson as string}
                                              </p>
                                            )}
                                            {(recommendations.projects as string[])?.length > 0 && (
                                              <div className="mt-1">
                                                <p className="text-[10px] text-fg-muted">Suggested projects:</p>
                                                {(recommendations.projects as string[]).map((p, i) => (
                                                  <p key={i} className="text-[10px] text-fg-default">- {p}</p>
                                                ))}
                                              </div>
                                            )}
                                            {(recommendations.resources as string[])?.length > 0 && (
                                              <div className="mt-1">
                                                <p className="text-[10px] text-fg-muted">Recommended resources:</p>
                                                {(recommendations.resources as string[]).map((r, i) => (
                                                  <p key={i} className="text-[10px] text-accent">- {r}</p>
                                                ))}
                                              </div>
                                            )}
                                          </DetailSection>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-fg-muted mb-1">{title}</p>
      {children}
    </div>
  );
}
