"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Target, BarChart3, MessageSquare, Cpu, BrainCircuit,
  TrendingUp, Sparkles, Zap, Clock, CheckCircle2, AlertTriangle,
  BookmarkCheck, Briefcase, GraduationCap, Award, ChevronDown,
  ChevronRight, ExternalLink, Loader2, Bot, User, Sun, Moon,
  FileText, Globe, Lightbulb, Star, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getBriefing, runAgent } from "./api";
import type { AgentBriefing, AgentActivity, AgentRecommendation, TimelineEvent } from "./types";

function useBriefing() {
  const [data, setData] = useState<AgentBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBriefing();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load briefing");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}

// ── Animated Counter ──
function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display}{suffix}</span>;
}

// ── Stat Card ──
function StatCard({ icon: Icon, label, value, sub, trend, color }: {
  icon: typeof Zap; label: string; value: number | string; sub?: string; trend?: string; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1 font-mono" style={color ? { color } : undefined}>
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </p>
          {sub && <p className="text-[10px] text-fg-muted mt-0.5">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
          <Icon size={16} className="text-accent" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-1">
          <TrendingUp size={10} className="text-success" />
          <span className="text-[10px] text-success font-medium">{trend}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Highlight Card ──
function HighlightBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    opportunity: "bg-accent/10 text-accent border-accent/20",
    insight: "bg-warning/10 text-warning border-warning/20",
    resume: "bg-success/10 text-success border-success/20",
    deadline: "bg-danger/10 text-danger border-danger/20",
  };
  const labels: Record<string, string> = {
    opportunity: "New Role",
    insight: "Market Intel",
    resume: "Resume",
    deadline: "Deadline",
  };
  return (
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${styles[type] || styles.insight}`}>
      {labels[type] || type}
    </span>
  );
}

// ── Circular Gauge ──
function Gauge({ value, label, size = 72, stroke = 5 }: { value: number; label: string; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? "#16a34a" : value >= 60 ? "#2563eb" : value >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-bg-hover)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="text-lg font-bold font-mono mt-1" style={{ color }}>{value}</span>
      <span className="text-[9px] text-fg-muted text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Agent Icon Resolver ──
function AgentIcon({ agentType, size = 14 }: { agentType: string; size?: number }) {
  const map: Record<string, typeof Zap> = {
    job_discovery: Search, resume_optimization: FileText, ats_intelligence: Target,
    opportunity_ranking: BarChart3, company_intelligence: Globe, salary_intelligence: Award,
    learning: GraduationCap, project_recommendation: Lightbulb, interview_preparation: MessageSquare,
    networking: User, notification: Clock, weekly_report: FileText, career_strategy: BrainCircuit,
  };
  const Icon = map[agentType] || Cpu;
  return <Icon size={size} />;
}

// ── Timeline Icon ──
function TimelineIcon({ iconName }: { iconName: string }) {
  const map: Record<string, typeof Zap> = {
    Search, FileText, Target, BarChart3, MessageSquare, Cpu, TrendingUp,
    Briefcase, Zap, GraduationCap, Bot,
  };
  const Icon = map[iconName] || Cpu;
  return (
    <div className="w-7 h-7 rounded-full bg-accent-subtle flex items-center justify-center shrink-0">
      <Icon size={11} className="text-accent" />
    </div>
  );
}

export default function CommandCenterPage() {
  const router = useRouter();
  const { data, loading, error, refresh } = useBriefing();

  if (error && error.toLowerCase().includes("unauthorized")) {
    router.push("/login");
  }
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState<string | null>(null);

  const handleRunAgent = async (agentType: string) => {
    setRunLoading(agentType);
    try {
      await runAgent(agentType as any);
      setTimeout(refresh, 2000);
    } catch { /* ignore */ }
    setRunLoading(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 w-64 shimmer rounded" />
        <div className="h-4 w-96 shimmer rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 shimmer rounded-xl" />)}
        </div>
        <div className="h-48 shimmer rounded-xl" />
        <div className="grid grid-cols-2 gap-4"><div className="h-64 shimmer rounded-xl" /><div className="h-64 shimmer rounded-xl" /></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <AlertTriangle size={40} className="mx-auto text-fg-subtle mb-4" />
        <p className="text-sm font-medium">Could not load your briefing</p>
        <p className="text-xs text-fg-muted mt-1">{error}</p>
        <button onClick={refresh} className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const { greeting, hero_stats, daily_brief, recommendations, agent_activities, timeline,
    career_health, ai_memory, opportunity_feed, career_forecast, weekly_progress } = data;

  const greetingText = greeting.hour < 12 ? "Good Morning" : greeting.hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ── Hero Section ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {greetingText}, {greeting.name}
            </h1>
            <p className="text-xs text-fg-muted">Your Career Agent has been working.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <StatCard icon={Search} label="Jobs Scanned" value={hero_stats.jobs_scanned}
            sub="in database" color="var(--color-accent)" />
          <StatCard icon={Zap} label="Excellent Matches" value={hero_stats.excellent_matches}
            sub="≥80% match" color="var(--color-success)" />
          <StatCard icon={FileText} label="Resume Versions" value={hero_stats.resume_improvements}
            sub="optimized" color="var(--color-accent)" />
          <StatCard icon={MessageSquare} label="Interview Packs" value={hero_stats.interview_packs_prepared}
            sub="prepared" color="var(--color-warning)" />
          <StatCard icon={Award} label="Career Score" value={hero_stats.career_score.current}
            trend={hero_stats.career_score.change >= 0 ? `+${hero_stats.career_score.change} today` : `${hero_stats.career_score.change} today`}
            color={hero_stats.career_score.current >= 80 ? "var(--color-success)" : hero_stats.career_score.current >= 60 ? "var(--color-accent)" : "var(--color-warning)"} />
          <StatCard icon={TrendingUp} label="Interview Prob." value={`${hero_stats.interview_probability.current}%`}
            trend={hero_stats.interview_probability.change >= 0 ? `+${hero_stats.interview_probability.change}% projected` : `${hero_stats.interview_probability.change}% projected`} />
        </div>
      </motion.div>

      {/* ── Today's Briefing ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-accent" /> Today's Briefing
          </h2>
          <span className="text-[10px] text-fg-muted">{daily_brief.date}</span>
        </div>
        <div className="bg-gradient-to-br from-white to-accent/[0.02] rounded-xl border border-border p-5">
          {daily_brief.highlights.length === 0 ? (
            <p className="text-xs text-fg-muted text-center py-4">No highlights yet today. Run a job discovery scan to get started.</p>
          ) : (
            <div className="space-y-3">
              {daily_brief.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  {h.type === "opportunity" ? (
                    <div className="flex-1 flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle2 size={14} className="text-success" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <HighlightBadge type={h.type} />
                          <span className="text-xs font-medium">{h.title}</span>
                          {h.match != null && (
                            <span className={`text-[10px] font-mono font-bold ${
                              h.match >= 90 ? "text-success" : h.match >= 70 ? "text-accent" : "text-warning"
                            }`}>
                              {h.match}% Match
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => h.url && router.push(h.url)}
                          className="text-[10px] text-accent hover:underline mt-0.5 flex items-center gap-0.5"
                        >
                          View details <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-start gap-3">
                      <div className="mt-0.5">
                        {h.type === "deadline" ? (
                          <AlertTriangle size={14} className="text-danger" />
                        ) : h.type === "resume" ? (
                          <CheckCircle2 size={14} className="text-success" />
                        ) : (
                          <Lightbulb size={14} className="text-warning" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <HighlightBadge type={h.type} />
                          <span className="text-xs">{h.text}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Recommended Actions + Career Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recommendations */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Lightbulb size={14} className="text-accent" /> Recommended Actions
          </h2>
          <div className="space-y-2">
            {recommendations.length === 0 ? (
              <p className="text-xs text-fg-muted text-center py-8 bg-white rounded-xl border border-border">
                No recommendations yet. Complete your profile and career goals.
              </p>
            ) : (
              recommendations.map((rec: AgentRecommendation, i: number) => (
                <motion.div
                  key={rec.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-border p-4 card-hover group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={8}
                          className={star <= rec.priority ? "text-warning fill-warning" : "text-fg-subtle"}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{rec.action}</p>
                        <Badge tone={rec.category === "skill" ? "success" : rec.category === "application" ? "accent" : "neutral"}>
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-fg-muted mt-1 leading-relaxed">{rec.why}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] text-fg-subtle flex items-center gap-1">
                          <Award size={9} /> Impact: {rec.impact}
                        </span>
                        <span className="text-[9px] text-fg-subtle flex items-center gap-1">
                          <Target size={9} /> {rec.confidence}% confident
                        </span>
                      </div>
                      <details className="mt-1.5 group">
                        <summary className="text-[9px] text-fg-subtle cursor-pointer hover:text-fg-muted transition-colors">
                          Why this recommendation
                        </summary>
                        <p className="text-[9px] text-fg-muted mt-1 leading-relaxed bg-bg-hover rounded p-2">
                          {rec.evidence}
                        </p>
                      </details>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Career Health */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Award size={14} className="text-accent" /> Career Health
          </h2>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="grid grid-cols-2 gap-5">
              <Gauge value={career_health.career_score} label="Career Score" />
              <Gauge value={career_health.resume_score} label="Resume Score" />
              <Gauge value={career_health.ats_score} label="ATS Score" />
              <Gauge value={career_health.interview_readiness} label="Interview Ready" />
              <Gauge value={career_health.project_strength} label="Project Strength" />
              <Gauge value={career_health.application_activity} label="App. Activity" />
              <Gauge value={career_health.learning_progress} label="Learning" />
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── Career Agent Status (Activities) ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Cpu size={14} className="text-accent" /> Career Agent Status
          </h2>
          <button
            onClick={refresh}
            className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
          >
            <Loader2 size={10} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agent_activities.filter(a => a.status === "running" || a.status === "idle" || a.status === "error").slice(0, 6).map((act: AgentActivity, i: number) => (
            <motion.div
              key={act.agent_type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-xl border p-4 card-hover ${
                act.status === "error" ? "border-danger/20" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  act.status === "running" ? "bg-success-subtle" :
                  act.status === "error" ? "bg-danger-subtle" : "bg-accent-subtle"
                }`}>
                  <AgentIcon agentType={act.agent_type} size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{act.label}</p>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      act.status === "running" ? "bg-success animate-pulse" :
                      act.status === "error" ? "bg-danger" : "bg-fg-subtle"
                    }`} />
                    {act.status === "running" && <span className="text-[9px] text-success font-medium">ACTIVE</span>}
                    {act.status === "error" && <span className="text-[9px] text-danger font-medium">ERROR</span>}
                  </div>
                  {act.status === "running" && act.action && (
                    <p className="text-[10px] text-fg-muted mt-1 flex items-center gap-1">
                      <Loader2 size={9} className="animate-spin" /> {act.action}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-fg-subtle">
                    <span>{act.total_runs} runs</span>
                    {act.last_run && <span>Last: {new Date(act.last_run).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                    {act.next_run && <span>Next: {new Date(act.next_run).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                  {act.status === "running" && (
                    <div className="mt-2 h-1 rounded-full bg-bg-hover overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: "0%" }}
                        animate={{ width: `${act.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRunAgent(act.agent_type)}
                  disabled={runLoading === act.agent_type}
                  className="px-2 py-1 rounded text-[9px] font-medium border border-border hover:bg-bg-hover transition-colors disabled:opacity-40"
                >
                  {runLoading === act.agent_type ? <Loader2 size={9} className="animate-spin" /> : "Run"}
                </button>
              </div>
              {/* Expandable detail */}
              <AnimatePresence>
                {expandedAgent === act.agent_type && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-border space-y-1">
                      <p className="text-[9px] text-fg-muted">Total runs: {act.total_runs} · Errors: {act.total_errors} · Pending tasks: {act.pending_tasks}</p>
                      {act.last_run && <p className="text-[9px] text-fg-muted">Last run: {new Date(act.last_run).toLocaleString()}</p>}
                      {act.next_run && <p className="text-[9px] text-fg-muted">Next scheduled: {new Date(act.next_run).toLocaleString()}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {expandedAgent !== act.agent_type && (
                <button
                  onClick={() => setExpandedAgent(act.agent_type)}
                  className="text-[9px] text-fg-subtle hover:text-fg-muted mt-1.5 flex items-center gap-0.5 transition-colors"
                >
                  Show details <ChevronDown size={8} />
                </button>
              )}
              {expandedAgent === act.agent_type && (
                <button
                  onClick={() => setExpandedAgent(null)}
                  className="text-[9px] text-fg-subtle hover:text-fg-muted mt-1.5 flex items-center gap-0.5 transition-colors"
                >
                  Hide details <ChevronDown size={8} className="rotate-180" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Timeline + AI Memory ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-accent" /> Activity Timeline
          </h2>
          <div className="bg-white rounded-xl border border-border p-4">
            {timeline.length === 0 ? (
              <p className="text-xs text-fg-muted text-center py-6">No activity yet today. Agents will log their work here.</p>
            ) : (
              <div className="space-y-0">
                {timeline.slice(0, 12).map((event: TimelineEvent, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <TimelineIcon iconName={event.icon} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">{event.text}</p>
                    </div>
                    <span className="text-[9px] text-fg-muted font-mono shrink-0">{event.time || "Today"}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* AI Memory */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <BrainCircuit size={14} className="text-accent" /> AI Memory
          </h2>
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div>
              <p className="text-[9px] text-fg-muted uppercase tracking-wider font-medium">Career Goal</p>
              <p className="text-sm font-semibold mt-0.5">{ai_memory.career_goal}</p>
            </div>
            <div>
              <p className="text-[9px] text-fg-muted uppercase tracking-wider font-medium">Preferred Location</p>
              <p className="text-xs mt-0.5">{ai_memory.preferred_location}</p>
            </div>
            <div>
              <p className="text-[9px] text-fg-muted uppercase tracking-wider font-medium">Target Companies</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ai_memory.target_companies.length > 0 ? ai_memory.target_companies.map((c: string) => (
                  <Badge key={c}>{c}</Badge>
                )) : <span className="text-[10px] text-fg-subtle">Not set</span>}
              </div>
            </div>
            <div>
              <p className="text-[9px] text-fg-muted uppercase tracking-wider font-medium">Preferred Stack</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ai_memory.preferred_stack.length > 0 ? ai_memory.preferred_stack.map((s: string) => (
                  <Badge key={s} tone="success">{s}</Badge>
                )) : <span className="text-[10px] text-fg-subtle">Not set</span>}
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center gap-2">
              <FileText size={11} className="text-fg-muted" />
              <span className="text-[10px] text-fg-muted">
                Resume: <span className="font-medium text-fg-default">{ai_memory.resume_version}</span>
              </span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── Opportunity Feed + Career Forecast ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Opportunity Feed */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Zap size={14} className="text-accent" /> Top Matches
            </h2>
            <button
              onClick={() => router.push("/opportunities")}
              className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
            >
              View all <ChevronRight size={10} />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            {opportunity_feed.length === 0 ? (
              <p className="text-xs text-fg-muted text-center py-6">No matched opportunities yet. Save jobs to get match scores.</p>
            ) : (
              <div className="space-y-1">
                {opportunity_feed.slice(0, 6).map((opp, i) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => router.push(`/opportunity/${opp.id}`)}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border">
                      {opp.logo ? (
                        <img src={opp.logo} alt={opp.company} className="w-full h-full object-contain" />
                      ) : (
                        <Briefcase size={14} className="text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate group-hover:text-accent transition-colors">{opp.company}</p>
                      <p className="text-[9px] text-fg-muted truncate">{opp.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold font-mono ${
                        opp.match >= 90 ? "text-success" : opp.match >= 70 ? "text-accent" : "text-warning"
                      }`}>
                        {opp.match}%
                      </p>
                      <p className="text-[8px] text-fg-subtle">match</p>
                    </div>
                    <ChevronRight size={12} className="text-fg-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Career Forecast */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-accent" /> Career Forecast
          </h2>
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-fg-muted">Current Score</span>
              <span className="text-base font-bold font-mono text-accent">{career_forecast.current_score}</span>
            </div>
            <div className="space-y-3">
              <ForecastRow label="After Docker" current={career_forecast.current_score} predicted={career_forecast.after_docker} />
              <ForecastRow label="After Resume Update" current={career_forecast.current_score} predicted={career_forecast.after_resume_update} />
              <ForecastRow label="After Skill Fill" current={career_forecast.current_score} predicted={career_forecast.after_skill_fill} />
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-[9px] text-fg-muted uppercase tracking-wider font-medium mb-2">Interview Probability</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-fg-muted">Current</span>
                    <span className="font-mono">{career_forecast.estimated_interview_probability.current}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-hover overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-warning"
                      initial={{ width: 0 }}
                      animate={{ width: `${career_forecast.estimated_interview_probability.current}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <ArrowRight size={12} className="text-fg-muted" />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-fg-muted">Predicted</span>
                    <span className="font-mono text-success">{career_forecast.estimated_interview_probability.predicted}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-hover overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-success"
                      initial={{ width: 0 }}
                      animate={{ width: `${career_forecast.estimated_interview_probability.predicted}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── Weekly Progress ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <BarChart3 size={14} className="text-accent" /> Weekly Progress
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <WeekStat label="Applications" current={weekly_progress.applications.current} last={weekly_progress.applications.last_week} />
          <WeekStat label="Resume Updates" current={weekly_progress.resume_updates.current} last={weekly_progress.resume_updates.last_week} />
          <WeekStat label="Skills Learned" current={weekly_progress.skills_learned.current} last={weekly_progress.skills_learned.last_week} />
          <WeekStat label="Interviews" current={weekly_progress.interviews.current} last={weekly_progress.interviews.last_week} />
          <WeekStat label="Career Score" current={weekly_progress.career_score_growth.current} last={weekly_progress.career_score_growth.last_week} isScore />
          <WeekStat label="ATS Score" current={weekly_progress.ats_growth.current} last={weekly_progress.ats_growth.last_week} isScore />
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <div className="text-center pt-4 pb-8">
        <p className="text-[9px] text-fg-subtle">
          Briefing generated {new Date(data.built_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ── Forecast Row ──
function ForecastRow({ label, current, predicted }: { label: string; current: number; predicted: number }) {
  const gain = predicted - current;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono font-medium">{predicted}</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-hover overflow-hidden relative">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: `${(current / 100) * 100}%` }}
          animate={{ width: `${(predicted / 100) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {gain > 0 && (
          <motion.div
            className="absolute top-0 h-full rounded-full bg-success/30"
            initial={{ left: `${(current / 100) * 100}%`, width: 0 }}
            animate={{ left: `${(current / 100) * 100}%`, width: `${((gain) / 100) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </div>
      {gain > 0 && <p className="text-[8px] text-success mt-0.5">+{gain} projected</p>}
    </div>
  );
}

// ── Weekly Stat ──
function WeekStat({ label, current, last, isScore }: { label: string; current: number; last: number; isScore?: boolean }) {
  const diff = current - last;
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-[10px] text-fg-muted font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold font-mono mt-1">{current}{isScore ? "" : ""}</p>
      <div className="flex items-center gap-1 mt-1">
        {diff > 0 ? (
          <TrendingUp size={10} className="text-success" />
        ) : diff < 0 ? (
          <TrendingUp size={10} className="text-danger rotate-180" />
        ) : (
          <span className="w-2.5" />
        )}
        <span className={`text-[9px] font-medium ${diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "text-fg-subtle"}`}>
          {diff > 0 ? `+${diff}` : diff === 0 ? "—" : `${diff}`} vs last week
        </span>
      </div>
    </div>
  );
}
