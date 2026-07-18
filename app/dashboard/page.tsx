"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Briefcase, TrendingUp, Award, Target, FileText,
  MessageCircle, BrainCircuit, Sparkles, ArrowRight,
  Check, Clock, AlertTriangle, ArrowUpRight,
  Zap, BookOpen, User, GraduationCap, RefreshCw,
  ChevronRight, Star, Upload, AlertCircle, Code,
} from "lucide-react";
import { RoadmapWidget } from "@/app/dashboard/components/RoadmapWidget";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import { useDashboard } from "@/hooks/useDashboard";
import { useMutationRefresh } from "@/hooks/useMutationRefresh";
import {
  getCareerScore, getSkillGaps,
} from "@/app/career/api";
import type { CareerScoreResult, SkillGapAnalysis } from "@/app/career/types";

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

const impactColors: Record<string, string> = {
  high: "border-success/20 bg-success/10 text-success",
  medium: "border-warning/20 bg-warning/10 text-warning",
  low: "border-border bg-bg-hover text-fg-muted",
};

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

  const [careerScoreData, setCareerScoreData] = useState<CareerScoreResult | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis | null>(null);
  const [intelProfile, setIntelProfile] = useState<Record<string, unknown> | null>(null);
  const [nextAction, setNextAction] = useState<{ task: string; reason: string; impact: string; based_on: string[] } | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
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
      getCareerScore(),
      getSkillGaps().catch(() => null),
      apiFetch("/api/intelligence/profile").catch(() => null),
      apiFetch("/api/intelligence/next-action").catch(() => null),
      apiFetch("/api/opportunities/recommendations").catch(() => null),
    ]).then(([cs, gaps, ip, action, opps]) => {
      if (cs.status === "fulfilled") setCareerScoreData(cs.value);
      if (gaps.status === "fulfilled" && gaps.value) setSkillGaps(gaps.value);
      if (ip.status === "fulfilled" && ip.value) setIntelProfile(ip.value as Record<string, unknown>);
      if (action.status === "fulfilled" && action.value?.action) setNextAction(action.value.action);
      if (opps.status === "fulfilled" && opps.value?.recommendations) setOpportunities(opps.value.recommendations.slice(0, 3));
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

  const primaryCta = useMemo(() => {
    if (!data) return { label: "Get Started", href: "/onboarding" };
    const ms = skillGaps?.missing_skills || [];
    if (!data.has_resume) return { label: "Upload Resume", href: "/resume" };
    if (ms.length > 0) return { label: "Bridge Skill Gaps", href: "/roadmaps" };
    if (data.active_applications === 0) return { label: "Find Jobs", href: "/jobs" };
    if ((data.jobs_by_status?.interview || 0) > 0) return { label: "Prepare for Interview", href: "/coach" };
    return { label: "Continue Career Plan", href: "/roadmaps" };
  }, [data, skillGaps]);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 lg:space-y-5 p-4 lg:p-6">
        <SkeletonBlock className="h-36 w-full" />
        <SkeletonBlock className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonBlock className="h-64 w-full" />
          <SkeletonBlock className="h-64 w-full" />
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
  const skillsList = data.resume_skills || [];
  const missingSkills = skillGaps?.missing_skills || [];
  const stageName = stageLabels[careerStage] || careerStage;
  const StageIcon = stageIcons[careerStage] || User;
  const activeApps = data.active_applications;
  const totalApps = data.total_applications;
  const interviewCount = data.jobs_by_status?.interview || 0;
  const offerCount = data.offers;

  const scoreContributors = scoreBreakdown ? [
    { key: "Resume", value: scoreBreakdown.resume_score || 0, max: 20, icon: FileText, color: "var(--color-accent)", desc: "Quality & completeness of your resume document" },
    { key: "ATS", value: scoreBreakdown.ats_score || 0, max: 15, icon: Target, color: "var(--color-success)", desc: "How well your resume passes ATS parsers" },
    { key: "Projects", value: scoreBreakdown.projects_score || 0, max: 15, icon: Code, color: "var(--color-warning)", desc: "Portfolio depth & impact of your projects" },
    { key: "Skills", value: scoreBreakdown.skill_coverage || 0, max: 20, icon: Zap, color: "var(--color-accent)", desc: "Breadth & market relevance of your skills" },
    { key: "Applications", value: scoreBreakdown.applications_score || 0, max: 10, icon: TrendingUp, color: "var(--color-warning)", desc: "Application volume & targeting strategy" },
    { key: "Learning", value: scoreBreakdown.learning_score || 0, max: 10, icon: BookOpen, color: "var(--color-success)", desc: "Active upskilling & course progress" },
    { key: "Interviews", value: scoreBreakdown.interview_score || 0, max: 10, icon: MessageCircle, color: "var(--color-danger)", desc: "Interview readiness & conversion rate" },
  ] : [];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-7xl space-y-4 lg:space-y-5 overflow-x-hidden p-4 lg:p-6">

      {/* ═══ 1. HERO ═══ */}
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

      {/* ═══ 2. TODAY'S BEST MOVE ═══ */}
      <motion.div variants={fadeUp} className="rounded-xl border border-accent/30 bg-gradient-to-r from-accent/5 to-success/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit size={18} className="text-accent" />
          <h2 className="font-serif text-base font-medium text-fg-default">Today&apos;s Best Move</h2>
        </div>
        {!nextAction ? (
          <div className="h-16 animate-pulse rounded-lg bg-bg-hover/50" />
        ) : (
          <div>
            <p className="text-sm font-medium text-fg-default">{nextAction.task}</p>
            <p className="mt-1 text-xs text-fg-muted">{nextAction.reason}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {nextAction.impact && (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${impactColors[nextAction.impact] || impactColors.low}`}>
                  {nextAction.impact === "high" ? <Zap size={12} /> : nextAction.impact === "medium" ? <TrendingUp size={12} /> : <Clock size={12} />}
                  {nextAction.impact} impact
                </span>
              )}
              {nextAction.based_on?.map((s: string) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-default px-2 py-0.5 text-[10px] text-fg-muted">
                  based on {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ═══ 3. CAREER HEALTH ═══ */}
      {scoreContributors.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <Award size={14} className="text-fg-muted" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Career Health</h3>
            </div>
            <div className="space-y-3">
              {scoreContributors.map((c) => {
                const pct = c.max > 0 ? Math.round((c.value / c.max) * 100) : 0;
                return (
                  <div key={c.key} className="group relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-xs text-fg-muted"><c.icon size={11} /> {c.key}</span>
                      <span className="font-mono text-[11px] text-fg-default">{c.value}/{c.max}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-fg-subtle">{c.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ 4. OPPORTUNITY RADAR ═══ */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-fg-muted" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Opportunity Radar</h3>
            </div>
            <Link href="/jobs" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">
              {totalApps > 0 ? "View all" : "Browse Jobs"} <ArrowRight size={11} className="ml-0.5 inline" />
            </Link>
          </div>

          {opportunities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {opportunities.map((rec: any) => {
                const opp = rec.opportunity;
                const match = rec.match_score?.overall_score ?? 0;
                return (
                  <Link
                    key={opp.id}
                    href={`/jobs/${opp.id}`}
                    className="group relative rounded-lg border border-border bg-bg-default p-4 transition-all hover:border-accent/30 hover:bg-bg-hover active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg-default truncate group-hover:text-accent transition-colors">{opp.title}</p>
                        {opp.company_name && <p className="text-xs text-fg-muted mt-0.5">{opp.company_name}</p>}
                      </div>
                      {match > 0 && (
                        <div className="flex items-center gap-1 shrink-0 rounded-md border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          <Star size={10} /> {match}%
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {opp.location && <span className="text-[10px] text-fg-subtle">{opp.location}</span>}
                      {opp.remote_type && <span className="text-[10px] text-fg-subtle">{opp.remote_type}</span>}
                      {opp.salary_min && <span className="text-[10px] text-fg-subtle">${opp.salary_min.toLocaleString()}{opp.salary_max ? `–${opp.salary_max.toLocaleString()}` : ""}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Active Apps", value: activeApps, href: "/jobs" },
                { label: "Interviews", value: interviewCount, href: interviewCount > 0 ? "/jobs?status=interview" : "/jobs" },
                { label: "Offers", value: offerCount, href: "/jobs?status=offer" },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-default p-4 transition-all hover:border-accent/30 hover:bg-bg-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">{stat.label}</p>
                    <p className="font-serif text-xl font-medium text-fg-default mt-0.5">{stat.value}</p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-fg-subtle" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══ 5. SKILL + ROADMAP SNIPPET ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
        <RoadmapWidget dreamRole={dreamRole} />
        <div className="rounded-xl border border-border bg-bg-surface p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-fg-muted" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Skills</h3>
            </div>
            <Link href="/roadmaps" className="inline-flex items-center min-h-[44px] text-[11px] font-medium text-accent transition-colors hover:text-accent/80 hover:underline">Upskill <ArrowRight size={11} className="ml-0.5 inline" /></Link>
          </div>

          {skillsList.length === 0 ? (
            <EmptyCard compact icon={<Code size={18} />} title="No skills yet" desc="Add skills to unlock personalized recommendations." action={
              <Link href="/resume" className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white"><Upload size={13} /> Upload Resume</Link>
            } />
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.slice(0, 18).map((s: string) => (<Badge key={s} tone="accent">{s}</Badge>))}
                {skillsList.length > 18 && <Badge tone="neutral">+{skillsList.length - 18} more</Badge>}
              </div>
              {missingSkills.length > 0 && dreamRole && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-2 text-[11px] font-medium text-fg-muted">Missing for {dreamRole}</p>
                  <div className="flex flex-wrap gap-1">
                    {missingSkills.slice(0, 5).map((s: string) => (<Badge key={s} tone="warning">{s}</Badge>))}
                    {missingSkills.length > 5 && <Badge tone="neutral">+{missingSkills.length - 5}</Badge>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
