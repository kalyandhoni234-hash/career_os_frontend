"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookmarkCheck, Bookmark, Archive, Trash2, ExternalLink,
  MapPin, Briefcase, IndianRupee, Clock, Tag, Sparkles,
  Cpu, TrendingUp, FileText, MessageSquare, Zap, Loader2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getSavedOpportunities, unsaveOpportunity, updateSavedOpportunity } from "@/app/opportunities/api";
import type { SavedOpportunity } from "@/app/opportunities/types";

type GroupKey = "ready" | "applied" | "exploring" | "archived";

const groupMeta: Record<GroupKey, { label: string; icon: typeof Zap; desc: string; tone: string }> = {
  ready:   { label: "Ready to Apply",  icon: Zap,        desc: "High-priority opportunities to act on",        tone: "success" },
  applied: { label: "Applied",         icon: FileText,   desc: "Track your applications",                      tone: "accent" },
  exploring: { label: "Exploring",     icon: TrendingUp, desc: "Opportunities you're watching",                tone: "neutral" },
  archived:  { label: "Archived",      icon: Archive,    desc: "Saved for future reference",                   tone: "neutral" },
};

function groupOpportunities(saved: SavedOpportunity[]): Record<GroupKey, SavedOpportunity[]> {
  const groups: Record<GroupKey, SavedOpportunity[]> = {
    ready: [], applied: [], exploring: [], archived: [],
  };
  for (const s of saved) {
    if (s.applied_at || s.application_status === "applied") groups.applied.push(s);
    else if (s.list_type === "archived") groups.archived.push(s);
    else if (s.list_type === "favorited" || s.tags?.includes("priority") || s.tags?.includes("apply")) groups.ready.push(s);
    else groups.exploring.push(s);
  }
  return groups;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getSavedOpportunities();
      setSaved(result.saved);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: number, opportunityId: number) => {
    await unsaveOpportunity(opportunityId);
    setSaved((prev) => prev.filter((s) => s.saved_id !== id));
  };

  const handleTag = async (savedId: number, opportunityId: number, tags: string[]) => {
    await updateSavedOpportunity(opportunityId, { tags });
    setSaved((prev) => prev.map((s) => s.saved_id === savedId ? { ...s, tags } : s));
  };

  const groups = useMemo(() => groupOpportunities(saved), [saved]);
  const totalCount = saved.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <BookmarkCheck size={20} className="text-accent" /> Saved Jobs
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            {totalCount} saved opportunit{totalCount === 1 ? "y" : "ies"} — organized by AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={async () => {
              setScanning(true);
              try {
                const { runAgent } = await import("@/app/agents/api");
                await runAgent("opportunity_ranking");
              } catch { /* ignore */ }
              setScanning(false);
            }}
            disabled={scanning}
          >
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <Cpu size={13} />}
            {scanning ? "Scanning..." : "Scan Saved"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/agents")}>
            <Cpu size={13} /> Agents
          </Button>
          <Button onClick={() => router.push("/opportunities")}>Browse Jobs</Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickActionCard
          icon={Zap}
          label="Prepare Interview"
          desc="AI-powered prep for saved roles"
          tone="accent"
          disabled={saved.length === 0}
          onClick={async () => {
            if (saved.length === 0) return;
            const { runAgent } = await import("@/app/agents/api");
            await runAgent("interview_preparation");
          }}
        />
        <QuickActionCard
          icon={FileText}
          label="Optimize Resumes"
          desc="Tailor resumes for each role"
          tone="accent"
          disabled={saved.length === 0}
          onClick={async () => {
            if (saved.length === 0) return;
            const { runAgent } = await import("@/app/agents/api");
            await runAgent("resume_optimization");
          }}
        />
        <QuickActionCard
          icon={TrendingUp}
          label="Rank by Match"
          desc="AI re-scores all saved jobs"
          tone="accent"
          disabled={saved.length === 0}
          onClick={async () => {
            if (saved.length === 0) return;
            const { runAgent } = await import("@/app/agents/api");
            await runAgent("opportunity_ranking");
          }}
        />
        <QuickActionCard
          icon={Cpu}
          label="Command Center"
          desc="Full agent dashboard"
          tone="accent"
          onClick={() => router.push("/agents")}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-16">
          <Bookmark size={40} className="mx-auto text-fg-subtle mb-3" />
          <p className="text-sm font-medium">No saved jobs yet</p>
          <p className="text-xs text-fg-muted mt-1">Save interesting jobs while browsing — your Career Agent will analyze them</p>
          <div className="flex justify-center gap-3 mt-4">
            <Button onClick={() => router.push("/opportunities")}>Find Jobs</Button>
            <Button variant="ghost" onClick={() => router.push("/agents")}>
              <Cpu size={13} /> Meet Your Agents
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupMeta) as [GroupKey, typeof groupMeta[GroupKey]][]).map(([key, meta]) => {
            const items = groups[key];
            if (items.length === 0 && key !== "exploring") return null;
            const Icon = meta.icon;
            const tone = key === "archived" ? "neutral" : key === "ready" ? "success" : key === "applied" ? "accent" : "neutral";
            const toneColor = `var(--color-${tone})`;

            return (
              <motion.section
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Group Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${toneColor}15`, color: toneColor }}
                  >
                    <Icon size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{meta.label}</h3>
                    <p className="text-[10px] text-fg-muted">{meta.desc} · {items.length} saved</p>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {items.map((s) => {
                    const o = s.opportunity;
                    return (
                      <motion.div
                        key={s.saved_id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl border border-border p-4 card-hover cursor-pointer group"
                        onClick={() => router.push(`/opportunity/${o.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border group-hover:ring-accent/30 transition-all">
                            {o.company_logo ? (
                              <img src={o.company_logo} alt={o.company_name} className="w-full h-full object-contain" />
                            ) : (
                              <Briefcase size={18} className="text-accent" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold truncate">{o.title}</h3>
                                <p className="text-xs text-fg-muted">{o.company_name}</p>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => router.push(`/opportunity/${o.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-accent-subtle text-fg-muted hover:text-accent transition-colors"
                                  title="AI Prep"
                                >
                                  <Sparkles size={13} />
                                </button>
                                <button
                                  onClick={() => handleRemove(s.saved_id, o.id)}
                                  className="p-1.5 rounded-lg hover:bg-danger-subtle text-fg-muted hover:text-danger transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-fg-muted mt-1.5">
                              {o.location && <span className="flex items-center gap-1"><MapPin size={10} /> {o.location}</span>}
                              {o.remote_type && <span className="flex items-center gap-1"><Briefcase size={10} /> {o.remote_type}</span>}
                              {o.salary_min && o.salary_max && (
                                <span className="flex items-center gap-1">
                                  <IndianRupee size={10} /> {(o.salary_min / 100000).toFixed(1)}–{(o.salary_max / 100000).toFixed(1)}L
                                </span>
                              )}
                              {o.employment_type && <span className="flex items-center gap-1"><Clock size={10} /> {o.employment_type}</span>}
                            </div>

                            {/* Tags + Tech Stack */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {(s.tags?.length ?? 0) > 0 && s.tags?.map((t: string) => (
                                <Badge key={t} tone={t === "priority" || t === "apply" ? "success" : "neutral"}>{t}</Badge>
                              ))}
                              {o.tech_stack?.slice(0, 3).map((t: string) => (
                                <Badge key={t} tone="neutral">{t}</Badge>
                              ))}
                              {(o.tech_stack?.length ?? 0) > 3 && (
                                <Badge tone="neutral">+{o.tech_stack.length - 3}</Badge>
                              )}
                            </div>

                            {/* Application status */}
                            {s.application_status && (
                              <div className="mt-2">
                                <Badge tone={s.application_status === "applied" ? "success" : s.application_status === "interviewing" ? "accent" : "warning"}>
                                  {s.application_status.replace("_", " ")}
                                </Badge>
                                {s.applied_at && (
                                  <span className="text-[9px] text-fg-muted ml-2">
                                    Applied {new Date(s.applied_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuickActionCard({
  icon: Icon, label, desc, tone, disabled, onClick,
}: {
  icon: typeof Zap;
  label: string;
  desc: string;
  tone: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-white rounded-xl border border-border p-3 text-left card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
    >
      <div className="w-7 h-7 rounded-lg bg-accent-subtle flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        <Icon size={13} className="text-accent" />
      </div>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-[9px] text-fg-muted mt-0.5">{desc}</p>
    </button>
  );
}
