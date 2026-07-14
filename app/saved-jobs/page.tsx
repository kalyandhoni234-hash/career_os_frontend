"use client";

import { useState, useEffect, useMemo, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck, Bookmark, Archive, Trash2, MapPin, Briefcase, IndianRupee,
  Clock, Sparkles, Cpu, TrendingUp, FileText, Zap, Loader2, Calendar,
  CheckCircle2, XCircle, ChevronRight, ChevronDown, Bell, Target,
  AlertCircle, ArrowRight, ExternalLink, MessageSquare, Timer,
  GraduationCap, Lightbulb, Brain, Rocket, Gauge,
  Search, SlidersHorizontal, MoreHorizontal, Play, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  getSavedOpportunities, unsaveOpportunity, updateSavedOpportunity,
  getAllHealthScores, getAgentActions, getIntelligence,
} from "@/app/opportunities/api";
import type { SavedOpportunity, ApplicationHealth, AgentAction } from "@/app/opportunities/types";

const STAGES = [
  "saved", "applied", "assessment", "interview", "offer", "rejected", "accepted",
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_META: Record<Stage, { label: string; icon: typeof Zap; color: string; bgClass: string }> = {
  saved:      { label: "Saved",      icon: BookmarkCheck, color: "#6D5EF8", bgClass: "bg-[#6D5EF8]/10" },
  applied:    { label: "Applied",    icon: FileText,      color: "#3B82F6", bgClass: "bg-[#3B82F6]/10" },
  assessment: { label: "Assessment", icon: Calendar,     color: "#F59E0B", bgClass: "bg-[#F59E0B]/10" },
  interview:  { label: "Interview",  icon: Briefcase,    color: "#F97316", bgClass: "bg-[#F97316]/10" },
  offer:      { label: "Offer",      icon: Sparkles,     color: "#22C55E", bgClass: "bg-[#22C55E]/10" },
  rejected:   { label: "Rejected",   icon: XCircle,      color: "#EF4444", bgClass: "bg-[#EF4444]/10" },
  accepted:   { label: "Accepted",   icon: CheckCircle2, color: "#16A34A", bgClass: "bg-[#16A34A]/10" },
};

const defaultGroups: Record<Stage, SavedOpportunity[]> = {
  saved: [], applied: [], assessment: [], interview: [], offer: [], rejected: [], accepted: [],
};

function matchColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

function pctColor(score: number): string {
  if (score >= 80) return "text-[#22C55E]";
  if (score >= 60) return "text-[#F59E0B]";
  if (score >= 40) return "text-[#F97316]";
  return "text-[#EF4444]";
}

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedOpportunity[]>([]);
  const [healthMap, setHealthMap] = useState<Record<number, ApplicationHealth>>({});
  const [agentActions, setAgentActions] = useState<Record<number, AgentAction | null>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "grid" | "timeline">("pipeline");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const savedRes = await getSavedOpportunities(undefined, true);
      setSaved(savedRes.saved || []);
          } catch {}
          setLoading(false);
        }, []);

  useEffect(() => { startTransition(() => { load(); }); }, [load]);

  const handleRemove = async (oppId: number) => {
    await unsaveOpportunity(oppId);
    setSaved((prev) => prev.filter((s) => s.opportunity.id !== oppId));
  };

  const handleStageChange = async (oppId: number, newStage: Stage) => {
    const now = new Date().toISOString();
    await updateSavedOpportunity(oppId, {
      application_status: newStage,
      ...(newStage === "applied" ? { applied: true } : {}),
    });
    setSaved((prev) =>
      prev.map((s) =>
        s.opportunity.id === oppId
          ? { ...s, application_status: newStage, applied_at: s.applied_at || (newStage === "applied" ? now : null) }
          : s
      )
    );
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return saved;
    const q = search.toLowerCase();
    return saved.filter((s) =>
      s.opportunity.title.toLowerCase().includes(q) ||
      s.opportunity.company_name.toLowerCase().includes(q) ||
      s.opportunity.tech_stack?.some((t) => t.toLowerCase().includes(q))
    );
  }, [saved, search]);

  const groups = useMemo(() => {
    const g: Record<Stage, SavedOpportunity[]> = { ...defaultGroups };
    for (const s of filtered) {
      const stage = (s.application_status as Stage) || "saved";
      if (stage in g) g[stage].push(s);
      else g.saved.push(s);
    }
    return g;
  }, [filtered]);

  const totalCount = saved.length;
  const interviewCount = groups.interview.length;
  const offerCount = groups.offer.length + groups.accepted.length;
  const avgMatch = useMemo(() => {
    const withScore = saved.filter((s) => s.match_score?.overall_score);
    if (!withScore.length) return 0;
    return Math.round(withScore.reduce((a, s) => a + (s.match_score?.overall_score || 0), 0) / withScore.length);
  }, [saved]);

  const priorityTasks = useMemo(() => {
    const tasks: { action: string; oppId: number; priority: string }[] = [];
    for (const s of saved) {
      const h = healthMap[s.opportunity.id];
      if (h && h.health_score < 50) {
        tasks.push({ action: `Health score ${h.health_score}% — needs attention`, oppId: s.opportunity.id, priority: "high" });
      }
    }
    return tasks.slice(0, 3);
  }, [saved, healthMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Rocket size={20} className="text-accent" /> Mission Control
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            {totalCount} active mission{totalCount === 1 ? "" : "s"} · {interviewCount} interview{interviewCount === 1 ? "" : "s"} · {offerCount} offer{offerCount === 1 ? "" : "s"} · Avg match {avgMatch}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-border rounded-lg p-0.5">
            {(["pipeline", "grid", "timeline"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  view === v ? "bg-surface text-fg-default shadow-sm" : "text-fg-muted hover:text-fg-default"
                }`}
              >
                {v === "pipeline" ? "Pipeline" : v === "grid" ? "Grid" : "Timeline"}
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => router.push("/analytics")}>
            <TrendingUp size={13} /> Analytics
          </Button>
          <Button onClick={() => router.push("/opportunities")}>Browse Jobs</Button>
        </div>
      </div>

      {/* AI Priority Strip */}
      {priorityTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-start gap-3"
        >
          <Brain size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-accent">AI Priority Actions</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {priorityTasks.map((t, i) => (
                <button
                  key={i}
                  onClick={() => router.push(`/opportunity/${t.oppId}`)}
                  className="text-[11px] bg-accent/10 text-accent px-2.5 py-1 rounded-lg hover:bg-accent/20 transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle size={11} />
                  {t.action}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search missions by title, company, or skill..."
          className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-fg-subtle"
        />
      </div>

      {/* Stage Progress Bar */}
      <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-3 overflow-x-auto">
        {STAGES.map((stage, i) => {
          const count = groups[stage]?.length || 0;
          const Icon = STAGE_META[stage].icon;
          const isActive = count > 0;
          return (
            <div key={stage} className="flex items-center gap-0 flex-1 min-w-0">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                isActive ? STAGE_META[stage].bgClass : ""
              }`}>
                <Icon size={11} style={{ color: STAGE_META[stage].color }} />
                <span className={`font-medium ${isActive ? "text-fg-default" : "text-fg-muted"}`}>
                  {STAGE_META[stage].label}
                </span>
                {count > 0 && (
                  <span className="text-[10px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: `${STAGE_META[stage].color}20`, color: STAGE_META[stage].color }}>
                    {count}
                  </span>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <ChevronRight size={12} className="text-fg-muted shrink-0 opacity-40" />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : totalCount === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Rocket size={32} className="text-accent" />
          </div>
          <p className="text-base font-semibold">No missions yet</p>
          <p className="text-xs text-fg-muted mt-1.5 max-w-md mx-auto">
            Save jobs from the Career OS extension or browse opportunities to start your mission control center
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={() => router.push("/opportunities")}>Browse Jobs</Button>
          </div>
        </motion.div>
      ) : view === "timeline" ? (
        <TimelineView saved={filtered} onStageChange={handleStageChange} onRemove={handleRemove} healthMap={healthMap} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((s) => (
              <IntelligentJobCard
                key={s.saved_id}
                saved={s}
                health={healthMap[s.opportunity.id]}
                onRemove={() => handleRemove(s.opportunity.id)}
                onStageChange={(stage) => handleStageChange(s.opportunity.id, stage)}
                onOpen={() => router.push(`/opportunity/${s.opportunity.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-6">
          {STAGES.map((stage) => {
            const items = groups[stage] || [];
            if (items.length === 0 && stage !== "saved") return null;
            const meta = STAGE_META[stage];
            const Icon = meta.icon;
            const count = items.length;
            return (
              <motion.section
                key={stage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{meta.label}</h3>
                    <p className="text-[10px] text-fg-muted">{count} mission{count === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((s) => (
                    <IntelligentJobCard
                      key={s.saved_id}
                      saved={s}
                      health={healthMap[s.opportunity.id]}
                      onRemove={() => handleRemove(s.opportunity.id)}
                      onStageChange={(stage) => handleStageChange(s.opportunity.id, stage)}
                      onOpen={() => router.push(`/opportunity/${s.opportunity.id}`)}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniGauge({ value, label, color }: { value: number; label: string; color?: string }) {
  const c = color || matchColor(value);
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={c} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: c }}>
          {value}
        </span>
      </div>
      <span className="text-[8px] text-fg-muted whitespace-nowrap">{label}</span>
    </div>
  );
}

function StageTransition({ saved, onStageChange }: { saved: SavedOpportunity; onStageChange: (stage: Stage) => void }) {
  const [open, setOpen] = useState(false);
  const currentIdx = STAGES.indexOf((saved.application_status as Stage) || "saved");

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-border text-fg-muted hover:text-fg-default transition-colors"
      >
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-xl p-2 min-w-[180px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[9px] font-medium text-fg-muted uppercase tracking-wider px-2 py-1">Change Stage</p>
            {STAGES.map((stage) => {
              const meta = STAGE_META[stage];
              const Icon = meta.icon;
              const isCurrent = stage === saved.application_status || (!saved.application_status && stage === "saved");
              if (isCurrent) return null;
              return (
                <button
                  key={stage}
                  onClick={() => { onStageChange(stage); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] font-medium hover:bg-bg-hover transition-colors text-fg-muted hover:text-fg-default"
                >
                  <Icon size={12} style={{ color: meta.color }} />
                  {meta.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntelligentJobCard({
  saved, health, onRemove, onStageChange, onOpen,
}: {
  saved: SavedOpportunity;
  health?: ApplicationHealth;
  onRemove: () => void;
  onStageChange: (stage: Stage) => void;
  onOpen: () => void;
}) {
  const o = saved.opportunity;
  const match = saved.match_score;
  const stage = (saved.application_status as Stage) || "saved";
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  const hs = health?.health_score ?? null;
  const daysSinceApplied = saved.applied_at ? daysAgo(saved.applied_at) : null;

  const deadlineSoon = stage === "interview";
  const needsFollowUp = stage === "applied" && saved.applied_at && (() => {
    const diff = Math.floor((Date.now() - new Date(saved.applied_at!).getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 7;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      whileHover={{ y: -1 }}
      onClick={onOpen}
      className="bg-surface border border-border rounded-xl card-hover cursor-pointer group overflow-hidden"
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border group-hover:ring-accent/30 transition-all">
            {o.company_logo ? (
              <Image src={o.company_logo} alt={o.company_name} width={44} height={44} className="w-full h-full object-contain" unoptimized />
            ) : (
              <Briefcase size={18} className="text-accent" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold truncate">{o.title}</h3>
                <p className="text-xs text-fg-muted">{o.company_name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <StageTransition saved={saved} onStageChange={onStageChange} />
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="p-1.5 rounded-lg hover:bg-danger/10 text-fg-muted hover:text-danger transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-fg-muted mt-1">
              {o.location && <span className="flex items-center gap-1"><MapPin size={10} /> {o.location}</span>}
              {o.remote_type && <span>{o.remote_type}</span>}
              {o.employment_type && <span>{o.employment_type}</span>}
              {o.salary_min && o.salary_max && (
                <span className="font-medium text-fg-default">
                  {(o.salary_min / 100000).toFixed(1)}–{(o.salary_max / 100000).toFixed(1)}L
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="flex items-end justify-between mt-3">
          <div className="flex items-center gap-3">
            {match && (
              <>
                <MiniGauge value={match.overall_score} label="Match" />
                <MiniGauge value={match.ats_match} label="ATS" />
              </>
            )}
            {hs !== null && (
              <MiniGauge value={hs} label="Health" color={matchColor(hs)} />
            )}
          </div>

          {/* Right info */}
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${meta.bgClass}`} style={{ color: meta.color }}>
              <Icon size={10} />
              {meta.label}
            </div>
            {deadlineSoon && (
              <div className="flex items-center gap-1 text-[9px] text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-full">
                <Timer size={9} />
                Today
              </div>
            )}
            {needsFollowUp && (
              <div className="flex items-center gap-1 text-[9px] text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">
                <Bell size={9} />
                Follow-up
              </div>
            )}
          </div>
        </div>

        {/* Tech stack */}
        {(o.tech_stack?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {o.tech_stack!.slice(0, 4).map((t: string) => {
              const matched = match && t && o.tech_stack!.includes(t);
              return (
                <Badge key={t} tone={matched ? "success" : "neutral"}>{t}</Badge>
              );
            })}
            {(o.tech_stack!.length) > 4 && (
              <Badge tone="neutral">+{o.tech_stack!.length - 4}</Badge>
            )}
          </div>
        )}

        {/* Activity row */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-[9px] text-fg-muted">
            {saved.created_at && (
              <span className="flex items-center gap-1">
                <Clock size={9} /> Saved {daysAgo(saved.created_at)}
              </span>
            )}
            {daysSinceApplied && (
              <span className="flex items-center gap-1">
                <Send size={9} /> Applied {daysSinceApplied}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="text-[9px] font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            >
              Open <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Send({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function TimelineView({
  saved, onStageChange, onRemove, healthMap,
}: {
  saved: SavedOpportunity[];
  onStageChange: (oppId: number, stage: Stage) => void;
  onRemove: (oppId: number) => void;
  healthMap: Record<number, ApplicationHealth>;
}) {
  const sorted = [...saved].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  return (
    <div className="relative space-y-0">
      {sorted.map((s, i) => {
        const stage = (s.application_status as Stage) || "saved";
        const meta = STAGE_META[stage];
        const Icon = meta.icon;
        const o = s.opportunity;
        const match = s.match_score;
        const hs = healthMap[o.id]?.health_score;
        return (
          <motion.div
            key={s.saved_id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative flex gap-4 pb-6 group"
          >
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-border z-10"
                style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                <Icon size={14} />
              </div>
              {i < sorted.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>

            <div
              className="flex-1 min-w-0 pb-2 bg-surface border border-border rounded-xl p-3 card-hover"
              onClick={() => window.location.href = `/opportunity/${o.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {o.company_logo ? (
                    <Image src={o.company_logo} alt={o.company_name} width={36} height={36} className="w-full h-full object-contain" unoptimized />
                  ) : (
                    <Briefcase size={14} className="text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{o.title}</p>
                    {match && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${pctColor(match.overall_score)}`} style={{ backgroundColor: `${matchColor(match.overall_score)}15` }}>
                        {match.overall_score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fg-muted">{o.company_name}{o.location ? ` · ${o.location}` : ""}</p>
                  {match && (
                    <div className="flex items-center gap-3 mt-1.5 text-[9px]">
                      <span className={pctColor(match.ats_match)}>ATS {match.ats_match}%</span>
                      {hs !== undefined && (
                        <span className={pctColor(hs!)}>Health {hs}%</span>
                      )}
                      {s.applied_at && <span className="text-fg-muted">Applied {daysAgo(s.applied_at)}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onStageChange(o.id, "applied")}
                    className="p-1.5 rounded-lg hover:bg-success/10 text-fg-muted hover:text-success transition-colors"
                    title="Mark as Applied"
                  >
                    <FileText size={11} />
                  </button>
                  <button
                    onClick={() => onRemove(o.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-fg-muted hover:text-danger transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}