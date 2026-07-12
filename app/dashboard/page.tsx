"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Briefcase, TrendingUp, Award, Target, BarChart3, Activity, FileText,
  MessageCircle, ListChecks,   BrainCircuit, Sparkles, ArrowRight,
  Check, Clock, AlertTriangle, GitBranch, Link2, Calendar, ArrowUpRight,
  Zap, BookOpen, User, GraduationCap, Globe, Upload,
  ChevronRight, Star, Plus, AlertCircle, RefreshCw, Layers,
  Code,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import { useDashboard } from "@/hooks/useDashboard";
import { useMutationRefresh } from "@/hooks/useMutationRefresh";
import {
  getActionPlan, getGoals, getSkillGraph, getCareerScore, getRecommendations, getSkillGaps,
} from "@/app/career/api";
import type { ActionPlanItem, CareerScoreResult, RecommendationData, SkillGapAnalysis } from "@/app/career/types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.1, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const stageLabels: Record<string, string> = {
  student: "Student", fresher: "Fresher", professional: "Professional", switcher: "Career Switcher",
};
const stageIcons: Record<string, typeof GraduationCap> = {
  student: GraduationCap, fresher: BookOpen, professional: Briefcase, switcher: RefreshCw,
};

const priorityLabel = (p: number) => p <= 2 ? "high" : p <= 4 ? "medium" : "low";
const priorityTone = (p: string) => p === "high" ? "danger" : p === "medium" ? "warning" : "neutral";

function ScoreRing({ score, size = 120, stroke = 8 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "var(--color-success)" : score >= 50 ? "var(--color-accent)" : "var(--color-warning)";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-bg-hover)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-2xl font-bold text-fg-default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <span className="text-[9px] font-mono uppercase tracking-wider text-fg-muted">Score</span>
      </div>
    </div>
  );
}

function Badge({ children, tone = "neutral", className = "" }: { children: React.ReactNode; tone?: string; className?: string }) {
  const t = {
    accent: "border-accent/20 bg-accent/10 text-accent",
    success: "border-success/20 bg-success/10 text-success",
    warning: "border-warning/20 bg-warning/10 text-warning",
    danger: "border-danger/20 bg-danger/10 text-danger",
    neutral: "border-border bg-bg-hover text-fg-muted",
  }[tone] || "border-border bg-bg-hover text-fg-muted";
  return <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${t} ${className}`}>{children}</span>;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-hover ${className}`} />;
}

function EmptyCard({ icon, title, desc, action, compact }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-bg-hover/30 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-hover text-fg-subtle">{icon}</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-fg-default">{title}</p>
            <p className="text-[11px] text-fg-muted truncate">{desc}</p>
          </div>
        </div>
        {action && <div className="shrink-0 ml-3">{action}</div>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface/50 px-6 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-hover text-fg-subtle">{icon}</div>
      <p className="text-sm font-medium text-fg-default">{title}</p>
      <p className="mt-1 max-w-[260px] text-xs text-fg-muted">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    apiFetch("/api/onboarding/status").then((res) => {
      if (!res.onboarding_completed) router.replace("/onboarding");
    }).catch(() => {});
  }, [isAuthenticated, router]);

  const { data, loading, error, careerScore: computedScore } = useDashboard();
  const { lastMutationTime } = useMutationRefresh();

  const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>([]);
  const [careerScoreData, setCareerScoreData] = useState<CareerScoreResult | null>(null);
  const [aiInsights, setAiInsights] = useState<RecommendationData[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis | null>(null);
  const [intelProfile, setIntelProfile] = useState<Record<string, unknown> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (lastMutationTime) {
      const timer = setTimeout(() => setRefreshKey((k) => k + 1), 0);
      return () => clearTimeout(timer);
    }
  }, [lastMutationTime]);

  useEffect(() => {
    if (!data) return;
    Promise.allSettled([
      getActionPlan(),
      getGoals(),
      getSkillGraph(),
      getCareerScore(),
      getRecommendations(),
      getSkillGaps().catch(() => null),
      apiFetch("/api/intelligence/profile").catch((e) => { if (process.env.NODE_ENV === "development") console.warn("Intelligence profile unavailable:", e?.message); return null; }),
    ]).then(([ap, , , cs, ri, gaps, ip]) => {
      if (ap.status === "fulfilled") setActionPlan(ap.value.action_plan || []);
      if (cs.status === "fulfilled") setCareerScoreData(cs.value);
      if (ri.status === "fulfilled") setAiInsights((ri.value.recommendations || []).slice(0, 5));
      if (gaps.status === "fulfilled" && gaps.value) setSkillGaps(gaps.value);
      if (ip.status === "fulfilled" && ip.value) setIntelProfile(ip.value as Record<string, unknown>);
    });
  }, [data, refreshKey]);

  useEffect(() => {
    if (error && error.toLowerCase().includes("unauthorized")) router.push("/login");
  }, [error, router]);

  const careerStage = useMemo(() => {
    const cp = intelProfile?.career as Record<string, unknown> | undefined;
    return (cp?.career_stage as string) || "";
  }, [intelProfile]);

  const dreamRole = useMemo(() => {
    const cp = intelProfile?.career as Record<string, unknown> | undefined;
    return (cp?.dream_role as string) || "";
  }, [intelProfile]);

  const integrations = useMemo(() => {
    return (intelProfile?.integrations as Record<string, { connected: boolean; last_sync?: string; username?: string; avatar_url?: string; bio?: string; repo_count?: number; followers?: number; contributions?: number; headline?: string; current_role?: string; experience_count?: number; skill_count?: number; pinned_repos?: { name: string; url: string; stars: number }[] }>) || {};
  }, [intelProfile]);

  const githubData = integrations.github;
  const linkedinData = integrations.linkedin;

  const projects = useMemo(() => {
    return (intelProfile?.projects as { id: number; name: string; description: string; url: string; stars: number; primary_language: string; is_pinned: boolean; source: string }[]) || [];
  }, [intelProfile]);

  const githubPinned = useMemo(() => {
    return githubData?.pinned_repos || projects.filter((p) => p.source === "github").slice(0, 4) || [];
  }, [githubData, projects]);

  const topActions = useMemo(() => {
    return [...aiInsights].sort((a, b) => (b.priority || 99) - (a.priority || 99)).slice(0, 4);
  }, [aiInsights]);

  const aiSummary = useMemo(() => {
    if (!data) return "";
    const parts: string[] = [];
    const skillsCount = data.resume_skills?.length || 0;
    const appCount = data.active_applications || 0;
    const interviewCount = data.jobs_by_status?.interview || 0;
    const missingSkills = skillGaps?.missing_skills || [];

    if (missingSkills.length > 0 && dreamRole) parts.push(`You're ${missingSkills.length} skill${missingSkills.length > 1 ? "s" : ""} away from ${dreamRole}.`);
    if (interviewCount > 0) parts.push(`${interviewCount} upcoming interview${interviewCount > 1 ? "s" : ""} to prepare for.`);
    else if (appCount > 0) parts.push(`${appCount} active application${appCount > 1 ? "s" : ""} in progress.`);
    if (!data.has_resume) parts.push("Upload your resume to unlock AI analysis.");
    else if (!data.resume_summary_set) parts.push("Add a professional summary to strengthen your resume.");
    if (skillsCount === 0) parts.push("Add skills to get personalized recommendations.");
    if (parts.length === 0) parts.push("Your profile looks great. Keep applying and upskilling!");
    return parts.join(" ");
  }, [data, skillGaps, dreamRole]);

  const primaryCta = useMemo(() => {
    if (!data) return { label: "Get Started", href: "/onboarding" };
    const ms = skillGaps?.missing_skills || [];
    if (!data.has_resume) return { label: "Upload Resume", href: "/resume" };
    if (ms.length > 0) return { label: "Bridge Skill Gaps", href: "/roadmaps" };
    if (data.active_applications === 0) return { label: "Find Jobs", href: "/jobs" };
    if ((data.jobs_by_status?.interview || 0) > 0) return { label: "Prepare for Interview", href: "/coach" };
    return { label: "Continue Career Plan", href: "/roadmaps" };
  }, [data, skillGaps]);

  function getWeeklyActivity() {
    if (!data?.recent_activity) return 0;
    // eslint-disable-next-line react-hooks/purity
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return data.recent_activity.filter((a) => new Date(a.timestamp).getTime() > weekAgo).length;
  }

  const skillSources = useMemo(() => {
    const src = (intelProfile?.sources as { skill_sources?: Record<string, number> }) || {};
    return src.skill_sources || {};
  }, [intelProfile]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 lg:space-y-5 p-4 lg:p-6">
        <SkeletonBlock className="h-36 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28 w-full" />)}
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <SkeletonBlock className="h-48 w-full" />
          <SkeletonBlock className="h-48 w-full" />
          <SkeletonBlock className="h-44 w-full" />
          <SkeletonBlock className="h-44 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/20 bg-danger-subtle">
            <AlertCircle size={24} className="text-danger" />
          </div>
          <p className="text-base font-semibold text-fg-default">Failed to load dashboard</p>
          <p className="mt-1.5 text-sm text-fg-muted">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-press mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const score = careerScoreData?.overall_score ?? computedScore;
  const scoreBreakdown = careerScoreData?.breakdown;
  const activeApps = data.active_applications;
  const totalApps = data.total_applications;
  const interviewCount = data.jobs_by_status?.interview || 0;
  const offerCount = data.offers;
  const totalInPipeline = (data.jobs_by_status?.applied || 0) + (data.jobs_by_status?.oa || 0) + interviewCount;
  const skillsList = data.resume_skills || [];
  const deadlines = data.upcoming_deadlines || [];
  const stageName = stageLabels[careerStage] || careerStage;
  const StageIcon = stageIcons[careerStage] || User;
  const missingSkills = skillGaps?.missing_skills || [];
  const skillGapCoverage = skillGaps?.coverage ?? 0;

  const scoreContributors = scoreBreakdown ? [
    { key: "Resume", value: scoreBreakdown.resume_score || 0, max: 20, icon: FileText, color: "var(--color-accent)" },
    { key: "ATS", value: scoreBreakdown.ats_score || 0, max: 15, icon: Target, color: "var(--color-success)" },
    { key: "Projects", value: scoreBreakdown.projects_score || 0, max: 15, icon: Layers, color: "var(--color-warning)" },
    { key: "Skills", value: scoreBreakdown.skill_coverage || 0, max: 20, icon: Zap, color: "var(--color-accent)" },
    { key: "Applications", value: scoreBreakdown.applications_score || 0, max: 10, icon: TrendingUp, color: "var(--color-warning)" },
    { key: "Learning", value: scoreBreakdown.learning_score || 0, max: 10, icon: BookOpen, color: "var(--color-success)" },
    { key: "Interviews", value: scoreBreakdown.interview_score || 0, max: 10, icon: MessageCircle, color: "var(--color-danger)" },
  ] : [];

  const pipelineSteps = [
    { key: "applied", label: "Applied", count: data.jobs_by_status?.applied || 0, color: "bg-accent" },
    { key: "oa", label: "Assessment", count: data.jobs_by_status?.oa || 0, color: "bg-warning" },
    { key: "interview", label: "Interview", count: interviewCount, color: "bg-accent" },
    { key: "offer", label: "Offer", count: offerCount, color: "bg-success" },
  ];

  const urgencyColor = (days: number) => days <= 3 ? "text-danger" : days <= 7 ? "text-warning" : "text-fg-muted";

  const connectedIntegrations = Object.entries(integrations).filter(([, v]) => v?.connected).length;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-7xl space-y-4 lg:space-y-5 overflow-x-hidden p-4 lg:p-6">

      {/* ═══ HERO ═══ */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-accent/5 p-5 sm:p-5 lg:p-6">
        <div className="absolute right-0 top-0 h-56 w-56 translate-x-16 -translate-y-16 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-5 lg:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <span className="font-serif text-xl sm:text-xl font-medium text-fg-default lg:text-2xl break-words">{timeOfDay()}, {data.name}</span>
              {stageName && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  <StageIcon size={12} />
                  {stageName}
                </span>
              )}
            </div>

            {dreamRole && (
              <div className="flex items-center gap-2 text-sm text-fg-muted">
                <Star size={14} className="text-accent shrink-0" />
                <span>Dream Role: <span className="font-medium text-fg-default">{dreamRole}</span></span>
              </div>
            )}

            <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{aiSummary}</p>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
              <Link href={primaryCta.href} className="btn-press inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 sm:py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-accent/30 min-h-[44px]">
                {primaryCta.label} <ArrowRight size={15} />
              </Link>
              <Link href="/intelligence" className="btn-press inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 sm:py-2.5 text-sm font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover min-h-[44px]">
                <Sparkles size={15} className="text-accent" /> View Intelligence
              </Link>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-center gap-8 border-t border-border pt-4 lg:w-auto lg:justify-center lg:gap-5 lg:border-t-0 lg:pt-0">
            <div className="flex flex-col items-center">
              <ScoreRing score={score} size={84} stroke={7} />
              <span className="mt-1.5 text-[11px] lg:text-[10px] font-mono uppercase tracking-wider text-fg-muted">Career Score</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative flex h-[84px] w-[84px] lg:h-[88px] lg:w-[88px] items-center justify-center">
                <svg width="84" height="84" viewBox="0 0 88 88" className="-rotate-90 w-[84px] h-[84px] lg:w-[88px] lg:h-[88px]">
                  <circle cx="44" cy="44" r="38" fill="none" stroke="var(--color-bg-hover)" strokeWidth="6" />
                  <motion.circle
                    cx="44" cy="44" r="38"
                    fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 38}
                    initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - (data.profile_completeness || 0) / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-fg-default">{data.profile_completeness || 0}</span>
                  <span className="text-[10px] lg:text-[9px] font-mono uppercase tracking-wider text-fg-muted">Complete</span>
                </div>
              </div>
              <span className="mt-1.5 text-[11px] lg:text-[10px] font-mono uppercase tracking-wider text-fg-muted">Profile</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ METRICS ROW (KPIs near top) ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-3 lg:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Applications", value: activeApps, icon: Briefcase, sub: `${totalInPipeline} in pipeline`, color: "text-accent" },
          { label: "Total Applied", value: totalApps, icon: TrendingUp, sub: "All time", color: "text-accent" },
          { label: "Interviews", value: interviewCount, icon: Target, sub: interviewCount > 0 ? `${interviewCount} upcoming` : "None scheduled", color: interviewCount > 0 ? "text-success" : "text-fg-muted" },
          { label: "Offers", value: offerCount, icon: Award, sub: offerCount > 0 ? `${offerCount} received` : "No offers yet", color: offerCount > 0 ? "text-success" : "text-fg-muted" },
        ].map((m) => (
          <div key={m.label} className="group rounded-xl border border-border bg-bg-surface p-5 card-hover">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] lg:text-[10px] font-medium uppercase tracking-widest text-fg-muted">{m.label}</p>
                <p className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-fg-default">{m.value}</p>
                <p className="mt-0.5 text-xs text-fg-muted">{m.sub}</p>
              </div>
              <div className={`rounded-lg border border-border bg-bg-default p-2.5 transition-all duration-150 group-hover:bg-accent-subtle group-hover:border-accent/30 ${m.color}`}>
                <m.icon size={16} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ═══ PAIRED ROWS ═══ */}

      {/* AI Summary + This Week */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 via-bg-surface to-bg-surface p-5 card-hover">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Summary</h3>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg-default">{aiSummary}</p>
              {topActions.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {topActions.map((a, i) => (
                    <Link key={i} href={a.action_link || "#"} className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-bg-default/50 px-3 py-2 text-xs text-fg-muted transition-colors hover:border-accent/30 hover:bg-bg-hover">
                      <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.priority <= 2 ? "bg-danger" : a.priority <= 4 ? "bg-warning" : "bg-fg-subtle"}`} />
                      {a.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">This Week</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Actions", value: getWeeklyActivity(), icon: Activity, color: "text-accent" },
              { label: "Active Apps", value: activeApps, icon: Briefcase, color: "text-accent" },
              { label: "Profile", value: `${data.profile_completeness ?? 0}%`, icon: User, color: "text-success" },
              { label: "Skills", value: skillsList.length, icon: Code, color: "text-accent" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-bg-default p-3.5 sm:p-3 text-center">
                <div className={`mx-auto mb-1.5 flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-bg-hover ${stat.color}`}><stat.icon size={13} /></div>
                <p className="font-serif text-xl sm:text-lg font-medium tracking-tight text-fg-default">{stat.value}</p>
                <p className="font-mono text-[11px] sm:text-[10px] uppercase tracking-wider text-fg-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Application Pipeline */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Application Pipeline</h3>
          </div>
          <Link href="/jobs" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">View all <ArrowRight size={11} className="ml-0.5 inline" /></Link>
        </div>

        {totalApps === 0 ? (
          <EmptyCard compact icon={<Briefcase size={18} />} title="No applications yet" desc="Start tracking to unlock pipeline insights." action={
            <Link href="/jobs" className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white">+ Add Application</Link>
          } />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pipelineSteps.map((step) => {
                const pct = totalApps > 0 ? Math.round((step.count / totalApps) * 100) : 0;
                return (
                  <div key={step.key} className="relative rounded-lg border border-border bg-bg-default p-3.5 sm:p-3 transition-all hover:border-accent/30 hover:bg-bg-hover">
                    <p className="font-mono text-xs uppercase tracking-wider text-fg-muted">{step.label}</p>
                    <p className="mt-1 font-serif text-2xl font-medium tracking-tight text-fg-default">{step.count}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-hover">
                      <div className={`h-full rounded-full transition-all duration-500 ${step.color}`} style={{ width: `${Math.max(pct, step.count > 0 ? 4 : 0)}%` }} />
                    </div>
                    <p className="mt-1 font-mono text-[11px] sm:text-[10px] text-fg-subtle">{pct}% of total</p>
                    {step.count > 0 && <Link href={`/jobs?status=${step.key}`} className="absolute inset-0 rounded-lg" />}
                  </div>
                );
              })}
            </div>

            {totalInPipeline > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Pipeline</p>
                  <p className="mt-0.5 font-medium text-fg-default">{totalInPipeline}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Conversion</p>
                  <p className="mt-0.5 font-medium text-fg-default">{totalApps > 0 ? Math.round((offerCount / totalApps) * 100) : 0}%</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Active</p>
                  <p className="mt-0.5 font-medium text-fg-default">{activeApps}</p>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Dream Career + Resume Intel */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center gap-2">
            <Target size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Dream Career Progress</h3>
          </div>

          {!dreamRole ? (
            <EmptyCard compact icon={<Star size={18} />} title="No dream role set" desc="Set your dream career to track progress." action={
              <Link href="/career-profile/wizard" className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover">Set Dream Role <ArrowRight size={12} /></Link>
            } />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Star size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-fg-default">{dreamRole}</p>
                  <p className="text-xs text-fg-muted">{skillGapCoverage > 0 ? `${skillGapCoverage}% skill match` : "Skill match pending"}</p>
                </div>
              </div>

              {skillGapCoverage > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-fg-muted">Skill readiness</span>
                    <span className="font-mono text-xs text-fg-default">{skillGapCoverage}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-bg-hover">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${skillGapCoverage}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-accent" />
                  </div>
                </div>
              )}

              {missingSkills.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-fg-muted">Missing skills to acquire</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.slice(0, 6).map((s) => (<Badge key={s} tone="warning">{s}</Badge>))}
                    {missingSkills.length > 6 && <Badge tone="neutral">+{missingSkills.length - 6} more</Badge>}
                  </div>
                  <Link href={`/roadmaps?role=${encodeURIComponent(dreamRole)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent/80 hover:underline">
                    <BookOpen size={12} /> Build learning roadmap <ArrowRight size={11} />
                  </Link>
                </div>
              )}

              {missingSkills.length === 0 && skillGapCoverage > 0 && (
                <div className="rounded-lg border border-success/20 bg-success/5 px-3 py-2.5 text-center">
                  <p className="text-xs font-medium text-success">All skills covered for {dreamRole}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-fg-muted" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Resume Intelligence</h3>
            </div>
            {data.has_resume && <Link href="/resume" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">Improve <ArrowRight size={11} className="ml-0.5 inline" /></Link>}
          </div>

          {!data.has_resume ? (
            <EmptyCard compact icon={<Upload size={18} />} title="No resume uploaded" desc="Upload to get AI-powered ATS analysis." action={
              <Link href="/resume" className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white"><Upload size={13} /> Upload Resume</Link>
            } />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
                  <svg width="56" height="56" className="-rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-bg-hover)" strokeWidth="4" />
                    <motion.circle
                      cx="28" cy="28" r="24"
                      fill="none" stroke={scoreBreakdown?.ats_score && scoreBreakdown.ats_score >= 10 ? "var(--color-success)" : "var(--color-warning)"}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24}
                      initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - Math.min((scoreBreakdown?.ats_score || 0) / 15, 1)) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-fg-default">{scoreBreakdown?.ats_score || 0}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-fg-default">ATS Score</p>
                  <p className="text-xs text-fg-muted">{scoreBreakdown?.ats_score && scoreBreakdown.ats_score >= 10 ? "Looking good for parsers" : "Room for improvement"}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: "Professional summary", done: data.resume_summary_set },
                  { label: "Skills listed", done: skillsList.length > 0 },
                  { label: "Experience added", done: data.has_resume },
                  { label: "ATS keywords found", done: missingSkills.length === 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.done ? "bg-success/10 text-success" : "border border-border bg-bg-hover text-fg-subtle"}`}>
                      {item.done ? <Check size={11} /> : <Plus size={11} />}
                    </div>
                    <span className={`text-xs ${item.done ? "text-fg-default" : "text-fg-muted"}`}>{item.label}</span>
                  </div>
                ))}
              </div>

              {missingSkills.length > 0 && (
                <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-warning"><AlertTriangle size={12} /> Missing ATS keywords</p>
                  <p className="mt-1 text-[11px] text-fg-muted">Add these to improve matching: {missingSkills.slice(0, 4).join(", ")}{missingSkills.length > 4 ? ` +${missingSkills.length - 4} more` : ""}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Career Feed + Upcoming */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-fg-muted" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Career Feed</h3>
            </div>
            {data.recent_activity.length > 0 && (
              <Link href="/timeline" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">View all <ArrowRight size={11} className="ml-0.5 inline" /></Link>
            )}
          </div>

          {data.recent_activity.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-bg-hover/30 px-4 py-3">
              <Clock size={16} className="text-fg-subtle shrink-0" />
              <p className="text-xs text-fg-muted">No recent activity — your actions will appear here.</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[13px] top-2 h-[calc(100%-16px)] w-px bg-border" />
              {data.recent_activity.slice(0, 4).map((item, i) => {
                const iconMap: Record<string, typeof Briefcase> = { job: Briefcase, coach: MessageCircle, resume: FileText };
                const colorMap: Record<string, string> = { job: "text-accent bg-accent/10", coach: "text-accent bg-accent/10", resume: "text-success bg-success/10" };
                const Icon = iconMap[item.type] || Activity;
                return (
                  <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
                    <div className={`relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg ${colorMap[item.type] || "bg-bg-hover text-fg-muted"}`}>
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm text-fg-default">{item.description}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">{timeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Upcoming</h3>
          </div>

          {deadlines.length === 0 && interviewCount === 0 && !data.last_coach_message ? (
            <EmptyCard compact icon={<Calendar size={18} />} title="Nothing upcoming" desc="Interviews and deadlines appear here." />
          ) : (
            <div className="space-y-2">
              {deadlines.map((d) => {
                const days = daysUntil(d.deadline);
                return (
                  <Link key={d.id} href={`/jobs/${d.id}`} className="flex items-start gap-3 rounded-lg border border-border bg-bg-default p-3 transition-all hover:border-accent/30 hover:bg-bg-hover">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-surface text-xs font-bold text-accent transition-all">{d.company.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg-default">{d.role}</p>
                      <p className="truncate text-xs text-fg-muted">{d.company}</p>
                      <p className={`mt-0.5 font-mono text-xs ${urgencyColor(days)}`}>{days <= 3 && <AlertTriangle size={10} className="mr-1 inline" />}Due in {days}d</p>
                    </div>
                    <ChevronRight size={14} className="mt-1 shrink-0 text-fg-subtle" />
                  </Link>
                );
              })}

              {interviewCount > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><MessageCircle size={14} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg-default">{interviewCount} interview{interviewCount > 1 ? "s" : ""} scheduled</p>
                    <p className="text-xs text-fg-muted">Prepare with AI coach</p>
                  </div>
                  <Link href="/coach" className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover">Practice</Link>
                </div>
              )}

              {data.last_coach_message && (
                <div className="flex items-start gap-3 rounded-lg border border-accent/10 bg-bg-default p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Sparkles size={12} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-muted line-clamp-2">{data.last_coach_message}</p>
                    <Link href="/coach" className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">Continue conversation <ArrowUpRight size={10} /></Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Score Breakdown + Action Plan */}
      {(scoreContributors.length > 0 || actionPlan.length > 0) && (
        <motion.div variants={fadeUp}>
          {(scoreContributors.length > 0 && actionPlan.length > 0) ? (
            <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
                <div className="mb-4 flex items-center gap-2">
                  <Award size={14} className="text-fg-muted" />
                  <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Career Score Breakdown</h3>
                </div>
                <div className="space-y-2.5">
                  {scoreContributors.map((c) => {
                    const pct = c.max > 0 ? Math.round((c.value / c.max) * 100) : 0;
                    return (
                      <div key={c.key}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-fg-muted"><c.icon size={11} /> {c.key}</span>
                          <span className="font-mono text-[11px] text-fg-default">{c.value}/{c.max}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-bg-hover">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks size={14} className="text-fg-muted" />
                    <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Action Plan</h3>
                  </div>
                  <Link href="/roadmaps" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">View all <ArrowRight size={11} className="ml-0.5 inline" /></Link>
                </div>
                <div className="space-y-2.5">
                  {actionPlan.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-bg-default p-3 transition-all hover:border-accent/30 hover:bg-bg-hover">
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.priority <= 2 ? "bg-danger" : a.priority <= 4 ? "bg-warning" : "bg-fg-subtle"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg-default">{a.title}</p>
                        {a.description && <p className="mt-0.5 text-xs text-fg-muted line-clamp-1">{a.description}</p>}
                      </div>
                      <Badge tone={priorityTone(priorityLabel(a.priority))}>{priorityLabel(a.priority)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : scoreContributors.length > 0 ? (
            <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
              <div className="mb-4 flex items-center gap-2">
                <Award size={14} className="text-fg-muted" />
                <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Career Score Breakdown</h3>
              </div>
              <div className="space-y-2.5">
                {scoreContributors.map((c) => {
                  const pct = c.max > 0 ? Math.round((c.value / c.max) * 100) : 0;
                  return (
                    <div key={c.key}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-fg-muted"><c.icon size={11} /> {c.key}</span>
                        <span className="font-mono text-[11px] text-fg-default">{c.value}/{c.max}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-bg-hover">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks size={14} className="text-fg-muted" />
                  <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Action Plan</h3>
                </div>
                <Link href="/roadmaps" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">View all <ArrowRight size={11} className="ml-0.5 inline" /></Link>
              </div>
              <div className="space-y-2.5">
                {actionPlan.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-bg-default p-3 transition-all hover:border-accent/30 hover:bg-bg-hover">
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.priority <= 2 ? "bg-danger" : a.priority <= 4 ? "bg-warning" : "bg-fg-subtle"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg-default">{a.title}</p>
                      {a.description && <p className="mt-0.5 text-xs text-fg-muted line-clamp-1">{a.description}</p>}
                    </div>
                    <Badge tone={priorityTone(priorityLabel(a.priority))}>{priorityLabel(a.priority)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ INTEGRATION INTELLIGENCE ═══ */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 size={14} className="text-fg-muted" />
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Integration Intelligence</h3>
          </div>
          <Link href="/settings" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">Manage <ArrowRight size={11} className="ml-0.5 inline" /></Link>
        </div>

        {connectedIntegrations === 0 ? (
          <EmptyCard compact icon={<Link2 size={18} />} title="No integrations connected" desc="Connect accounts to auto-import professional data." action={
            <Link href="/settings" className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover">Connect Accounts <ArrowRight size={12} /></Link>
          } />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
            {/* GitHub */}
            <div className="rounded-lg border border-border bg-bg-default p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${githubData?.connected ? "bg-accent/10 text-accent" : "bg-bg-hover text-fg-subtle"}`}><GitBranch size={14} /></div>
                <div>
                  <p className="text-sm font-medium text-fg-default">GitHub</p>
                  {githubData?.connected ? <p className="font-mono text-[10px] text-success">Connected{githubData.last_sync ? ` · ${timeAgo(githubData.last_sync)}` : ""}</p> : <p className="font-mono text-[10px] text-fg-subtle">Not connected</p>}
                </div>
              </div>
              {githubData?.connected && (
                <div className="space-y-3">
                  {githubData.username && <p className="flex items-center gap-1.5 text-xs text-fg-muted"><User size={11} /> {githubData.username}</p>}
                  {githubData.bio && <p className="text-xs text-fg-muted line-clamp-2">{githubData.bio}</p>}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {githubData.repo_count !== undefined && <div><p className="text-sm font-bold text-fg-default">{githubData.repo_count}</p><p className="font-mono text-[9px] text-fg-subtle">Repos</p></div>}
                    {githubData.followers !== undefined && <div><p className="text-sm font-bold text-fg-default">{githubData.followers}</p><p className="font-mono text-[9px] text-fg-subtle">Followers</p></div>}
                    {githubData.contributions !== undefined && <div><p className="text-sm font-bold text-fg-default">{githubData.contributions}</p><p className="font-mono text-[9px] text-fg-subtle">Contribs</p></div>}
                  </div>
                  {githubPinned.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-medium text-fg-muted">Pinned repos</p>
                      <div className="space-y-1.5">
                        {githubPinned.slice(0, 2).map((repo, i) => {
                          const r = repo as { name?: string; url?: string; stars?: number; description?: string; primary_language?: string };
                          return (
                            <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border border-border bg-bg-hover/50 px-2.5 py-1.5 text-xs hover:bg-bg-hover transition-colors">
                              <span className="truncate text-fg-default font-medium">{r.name || "Untitled"}</span>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {r.primary_language && <span className="text-[10px] text-fg-subtle">{r.primary_language}</span>}
                                {r.stars !== undefined && r.stars > 0 && <span className="flex items-center gap-0.5 text-[10px] text-fg-muted"><Star size={9} />{r.stars}</span>}
                              </div>
                            </a>
                          );
                        })}
                        {githubPinned.length > 2 && <p className="text-[10px] text-fg-subtle text-center">+{githubPinned.length - 2} more</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!githubData?.connected && <Link href="/api/auth/github/login" className="mt-2 inline-flex items-center min-h-[44px] gap-1 rounded-md border border-border px-2.5 py-1 text-[10px] font-medium text-fg-muted transition-all hover:border-accent/40 hover:text-accent">Connect <ArrowRight size={10} /></Link>}
            </div>

            {/* LinkedIn */}
            <div className="rounded-lg border border-border bg-bg-default p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${linkedinData?.connected ? "bg-accent/10 text-accent" : "bg-bg-hover text-fg-subtle"}`}><Link2 size={14} /></div>
                <div>
                  <p className="text-sm font-medium text-fg-default">LinkedIn</p>
                  {linkedinData?.connected ? <p className="font-mono text-[10px] text-success">Connected{linkedinData.last_sync ? ` · ${timeAgo(linkedinData.last_sync)}` : ""}</p> : <p className="font-mono text-[10px] text-fg-subtle">Not connected</p>}
                </div>
              </div>
              {linkedinData?.connected && (
                <div className="space-y-2">
                  {linkedinData.headline && <p className="text-xs text-fg-muted line-clamp-2">{linkedinData.headline}</p>}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {linkedinData.current_role && <div className="col-span-2"><p className="text-xs font-medium text-fg-default truncate">{linkedinData.current_role}</p></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {linkedinData.experience_count !== undefined && <div><p className="text-sm font-bold text-fg-default">{linkedinData.experience_count}</p><p className="font-mono text-[9px] text-fg-subtle">Roles</p></div>}
                    {linkedinData.skill_count !== undefined && <div><p className="text-sm font-bold text-fg-default">{linkedinData.skill_count}</p><p className="font-mono text-[9px] text-fg-subtle">Skills</p></div>}
                  </div>
                  {Object.keys(skillSources).length > 0 && skillSources.linkedin && <p className="text-[10px] text-fg-muted"><span className="text-success">{skillSources.linkedin}</span> skills imported</p>}
                </div>
              )}
              {!linkedinData?.connected && <Link href="/api/auth/linkedin/login" className="mt-2 inline-flex items-center min-h-[44px] gap-1 rounded-md border border-border px-2.5 py-1 text-[10px] font-medium text-fg-muted transition-all hover:border-accent/40 hover:text-accent">Connect <ArrowRight size={10} /></Link>}
            </div>

            {/* Calendar & Drive */}
            {(["google_calendar", "google_drive"] as const).map((provider) => {
              const info = integrations[provider] as { connected: boolean; last_sync?: string } | undefined;
              const labels: Record<string, string> = { google_calendar: "Calendar", google_drive: "Drive" };
              const desc: Record<string, string> = { google_calendar: "Sync interviews & events.", google_drive: "Import resumes & docs." };
              const activeMsg: Record<string, string> = { google_calendar: "Interview scheduling ready", google_drive: "Resume sync active" };
              return (
                <div key={provider} className="rounded-lg border border-border bg-bg-default p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${info?.connected ? "bg-accent/10 text-accent" : "bg-bg-hover text-fg-subtle"}`}>
                      {provider === "google_calendar" ? <Calendar size={14} /> : <Globe size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-fg-default">{labels[provider]}</p>
                      {info?.connected ? <p className="font-mono text-[10px] text-success">Connected{info.last_sync ? ` · ${timeAgo(info.last_sync)}` : ""}</p> : <p className="font-mono text-[10px] text-fg-subtle">Not connected</p>}
                    </div>
                  </div>
                  {info?.connected ? (
                    <p className="text-xs text-fg-muted">{activeMsg[provider]}</p>
                  ) : (
                    <div>
                      <p className="text-xs text-fg-muted">{desc[provider]}</p>
                      <Link href="/api/auth/google/login" className="mt-2 inline-flex items-center min-h-[44px] gap-1 rounded-md border border-border px-2.5 py-1 text-[10px] font-medium text-fg-muted transition-all hover:border-accent/40 hover:text-accent">Connect <ArrowRight size={10} /></Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ═══ SKILLS ═══ */}
      {skillsList.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><Zap size={14} className="text-fg-muted" /><h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Skills</h3></div>
            <Link href="/roadmaps" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">Upskill <ArrowRight size={11} className="ml-0.5 inline" /></Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.slice(0, 12).map((s) => (<Badge key={s} tone="accent">{s}</Badge>))}
            {skillsList.length > 12 && <Badge tone="neutral">+{skillsList.length - 12} more</Badge>}
          </div>
          {missingSkills.length > 0 && dreamRole && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-[11px] font-medium text-fg-muted">Missing for {dreamRole}</p>
              <div className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 5).map((s) => (<Badge key={s} tone="warning">{s}</Badge>))}
                {missingSkills.length > 5 && <Badge tone="neutral">+{missingSkills.length - 5}</Badge>}
              </div>
            </div>
          )}
          {Object.keys(skillSources).length > 0 && (
            <p className="mt-3 text-[10px] text-fg-muted">From: {Object.entries(skillSources).map(([src, count]) => `${src} (${count})`).join(", ")}</p>
          )}
        </motion.div>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      {aiInsights.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><BrainCircuit size={14} className="text-fg-muted" /><h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">AI Recommendations</h3></div>
            {aiInsights.length > 3 && <Link href="/intelligence" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">View all <ArrowRight size={11} className="ml-0.5 inline" /></Link>}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {aiInsights.map((rec, i) => (
              <div key={rec.id || i} className="group/rec flex items-start gap-3 rounded-lg border border-border bg-bg-default p-3 transition-all hover:border-accent/30 hover:bg-bg-hover">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${rec.priority <= 2 ? "bg-danger/10 text-danger" : rec.priority <= 4 ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"}`}>
                  {rec.priority <= 2 ? <AlertTriangle size={13} /> : <Check size={13} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg-default">{rec.title}</p>
                  {rec.description && <p className="mt-0.5 text-xs text-fg-muted line-clamp-2">{rec.description}</p>}
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone={priorityTone(priorityLabel(rec.priority))}>{priorityLabel(rec.priority)} priority</Badge>
                    {rec.impact_score > 0 && <span className="font-mono text-[10px] text-fg-subtle">+{rec.impact_score} impact</span>}
                  </div>
                </div>
                {rec.action_link && <Link href={rec.action_link} className="shrink-0 rounded-md p-1.5 text-fg-subtle opacity-0 transition-all hover:bg-accent/10 hover:text-accent group-hover/rec:opacity-100"><ArrowUpRight size={14} /></Link>}
              </div>
            ))}
          </div>
        </motion.div>
      )}



    </motion.div>
  );
}