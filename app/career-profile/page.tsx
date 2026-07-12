"use client";

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Heart,
  Globe,
  Link2,
  FileText,
  Settings,
  Target,
  Sparkles,
  TrendingUp,
  Star,
  Pencil,
  Trash2,
  Download,
  Upload,
  Plus,
  ExternalLink,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useMutationRefresh } from "@/hooks/useMutationRefresh";
import {
  getProfileDashboard,
  createEducation,
  deleteEducation,
  createSkill,
  deleteSkill,
  batchInterests,
  deleteInterest,
  createLanguage,
  deleteLanguage,
  createSocialLink,
  deleteSocialLink,
  uploadResume,
  deleteResume,
} from "./api";
import type { ProfileDashboard, Education } from "./types";
import {
  SOCIAL_PLATFORMS,
  SKILL_LEVELS,
  LANGUAGE_PROFICIENCIES,
  CAREER_STATUSES,
  isValidSpokenLanguage,
} from "./types";

type ReadinessScore = {
  overall: number;
  breakdown: Record<string, number>;
  weights: Record<string, number>;
};

type SmartRecommendation = {
  id: string;
  action: string;
  description: string;
  icon: string;
  priority: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.1, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

function CompletionRing({ pct }: { pct: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 200);
    return () => clearTimeout(timer);
  }, [offset]);

  const color =
    pct >= 80
      ? "var(--color-success)"
      : pct >= 50
        ? "var(--color-accent)"
        : pct >= 25
          ? "var(--color-warning)"
          : "var(--color-fg-subtle)";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={animatedOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-fg-default">{Math.round(pct)}</span>
        <span className="text-[10px] text-fg-muted">/ 100</span>
      </div>
    </div>
  );
}

function SectionCard({
  icon, title, children, action, className = "",
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
  action?: React.ReactNode; className?: string;
}) {
  return (
    <Card hover className={`h-full ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-subtle text-accent">
            {icon}
          </span>
          <h3 className="text-sm font-semibold text-fg-default">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function EmptyState({ icon, message, action }: {
  icon: React.ReactNode; message: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-hover text-fg-subtle">
        {icon}
      </span>
      <p className="max-w-[240px] text-xs leading-relaxed text-fg-muted">{message}</p>
      {action}
    </div>
  );
}

function ReadinessRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const [animated, setAnimated] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(offset), 300);
    return () => clearTimeout(t);
  }, [offset]);

  const color =
    score >= 80 ? "var(--color-success)" : score >= 50 ? "var(--color-accent)" : "var(--color-warning)";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="7" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke={color}
          strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={animated}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-fg-default">{score}</span>
        <span className="text-[9px] text-fg-muted">readiness</span>
      </div>
    </div>
  );
}

function ReadinessBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "bg-success" : value >= 50 ? "bg-accent" : "bg-warning";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-muted capitalize">{label.replace(/_/g, " ")}</span>
        <span className="text-[11px] font-mono text-fg-subtle">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-hover">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-success" : value >= 50 ? "bg-accent" : "bg-warning";
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-bg-hover">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

const skillTone = (level: string): "success" | "accent" | "warning" | "neutral" => {
  switch (level) {
    case "expert": return "success";
    case "advanced": return "accent";
    case "intermediate": return "warning";
    default: return "neutral";
  }
};

const langTone = (prof: string): "success" | "accent" | "warning" | "neutral" => {
  switch (prof) {
    case "native": return "success";
    case "professional": return "accent";
    case "intermediate": return "warning";
    default: return "neutral";
  }
};

const socialLabel = (v: string) =>
  SOCIAL_PLATFORMS.find((p) => p.value === v)?.label ?? v;

const skillLevelLabel = (v: string) =>
  SKILL_LEVELS.find((s) => s.value === v)?.label ?? v;

const proficiencyLabel = (v: string) =>
  LANGUAGE_PROFICIENCIES.find((l) => l.value === v)?.label ?? v;
export default function CareerProfilePage() {
  const [dashboard, setDashboard] = useState<ProfileDashboard | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { notifyMutation } = useMutationRefresh();

  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("intermediate");
  const [savingSkill, setSavingSkill] = useState(false);

  const [addEduOpen, setAddEduOpen] = useState(false);
  const [eduForm, setEduForm] = useState({ institution: "", degree: "", branch: "", cgpa: "", graduation_year: "" });
  const [savingEdu, setSavingEdu] = useState(false);

  const [addInterestOpen, setAddInterestOpen] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [savingInterest, setSavingInterest] = useState(false);

  const [addLangOpen, setAddLangOpen] = useState(false);
  const [langForm, setLangForm] = useState({ language: "", proficiency: "intermediate" });
  const [savingLang, setSavingLang] = useState(false);

  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [socialForm, setSocialForm] = useState({ platform: "github", url: "" });
  const [savingSocial, setSavingSocial] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, score, recs] = await Promise.all([
        getProfileDashboard(),
        apiFetch("/api/profile/readiness-score").catch(() => null),
        apiFetch("/api/profile/smart-recommendations").catch(() => ({ recommendations: [] })),
      ]);
      setDashboard(dash);
      if (score) setReadiness(score as ReadinessScore);
      if (recs) setRecommendations((recs as { recommendations: SmartRecommendation[] }).recommendations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { startTransition(() => { fetchData(); }); }, [fetchData]);

  const refreshDash = useCallback(async () => {
    try {
      const [dash, score] = await Promise.all([
        getProfileDashboard(),
        apiFetch("/api/profile/readiness-score").catch(() => null),
      ]);
      setDashboard(dash);
      if (score) setReadiness(score as ReadinessScore);
    } catch { /* silent */ }
  }, []);

  const handleAddSkill = useCallback(async () => {
    if (!newSkillName.trim()) return;
    setSavingSkill(true);
    try {
      const skill = await createSkill({
        name: newSkillName.trim(),
        experience_level: newSkillLevel,
        years_of_experience: 0,
        confidence_rating: 3,
      });
      setDashboard((prev) => prev ? { ...prev, skills: [...prev.skills, skill] } : prev);
      setNewSkillName("");
      setAddSkillOpen(false);
      notifyMutation("profile");
      addToast("success", `Added "${skill.name}" to your skills`);
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Failed to add skill");
    } finally {
      setSavingSkill(false);
    }
  }, [newSkillName, newSkillLevel, addToast, notifyMutation]);

  const handleDeleteSkill = useCallback(async (id: number) => {
    try {
      await deleteSkill(id);
      setDashboard((prev) => prev ? { ...prev, skills: prev.skills.filter((s) => s.id !== id) } : prev);
      notifyMutation("profile");
      addToast("success", "Skill removed");
    } catch {
      addToast("error", "Failed to remove skill");
    }
  }, [addToast, notifyMutation]);

  const handleAddEducation = useCallback(async () => {
    if (!eduForm.institution.trim()) return;
    setSavingEdu(true);
    try {
      const data: Partial<Education> = {
        institution: eduForm.institution.trim(),
        degree: eduForm.degree.trim(),
        branch: eduForm.branch.trim(),
        cgpa: eduForm.cgpa ? Number(eduForm.cgpa) : null,
        graduation_year: eduForm.graduation_year ? Number(eduForm.graduation_year) : null,
        specialization: "",
        current_semester: null,
        relevant_coursework: [],
        achievements: "",
        order: 0,
      };
      const edu = await createEducation(data);
      setDashboard((prev) => prev ? { ...prev, education: [...prev.education, edu] } : prev);
      setEduForm({ institution: "", degree: "", branch: "", cgpa: "", graduation_year: "" });
      setAddEduOpen(false);
      notifyMutation("profile");
      addToast("success", `Added "${edu.institution}"`);
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Failed to add education");
    } finally {
      setSavingEdu(false);
    }
  }, [eduForm, addToast, notifyMutation]);

  const handleDeleteEducation = useCallback(async (id: number) => {
    try {
      await deleteEducation(id);
      setDashboard((prev) => prev ? { ...prev, education: prev.education.filter((e) => e.id !== id) } : prev);
      notifyMutation("profile");
      addToast("success", "Education removed");
    } catch {
      addToast("error", "Failed to remove education");
    }
  }, [addToast, notifyMutation]);

  const handleAddInterests = useCallback(async () => {
    if (!newInterest.trim()) return;
    setSavingInterest(true);
    try {
      const names = newInterest.split(",").map((n) => n.trim()).filter(Boolean);
      await batchInterests(names);
      await refreshDash();
      setNewInterest("");
      setAddInterestOpen(false);
      notifyMutation("profile");
      addToast("success", `Added ${names.length} interest(s)`);
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Failed to add interests");
    } finally {
      setSavingInterest(false);
    }
  }, [newInterest, refreshDash, addToast, notifyMutation]);

  const handleDeleteInterest = useCallback(async (id: number) => {
    try {
      await deleteInterest(id);
      setDashboard((prev) => prev ? { ...prev, interests: prev.interests.filter((i) => i.id !== id) } : prev);
      notifyMutation("profile");
      addToast("success", "Interest removed");
    } catch {
      addToast("error", "Failed to remove interest");
    }
  }, [addToast, notifyMutation]);

  const handleAddLanguage = useCallback(async () => {
    const value = langForm.language.trim();
    if (!value) return;
    if (!isValidSpokenLanguage(value)) {
      addToast("error", "This does not appear to be a spoken language. Add technical skills in the Skills section.");
      return;
    }
    setSavingLang(true);
    try {
      const lang = await createLanguage({ language: value, proficiency: langForm.proficiency });
      setDashboard((prev) => prev ? { ...prev, languages: [...prev.languages, lang] } : prev);
      setLangForm({ language: "", proficiency: "intermediate" });
      setAddLangOpen(false);
      notifyMutation("profile");
      addToast("success", `Added "${lang.language}"`);
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Failed to add language");
    } finally {
      setSavingLang(false);
    }
  }, [langForm, addToast, notifyMutation]);

  const handleDeleteLanguage = useCallback(async (id: number) => {
    try {
      await deleteLanguage(id);
      setDashboard((prev) => prev ? { ...prev, languages: prev.languages.filter((l) => l.id !== id) } : prev);
      notifyMutation("profile");
      addToast("success", "Language removed");
    } catch {
      addToast("error", "Failed to remove language");
    }
  }, [addToast, notifyMutation]);

  const handleAddSocial = useCallback(async () => {
    if (!socialForm.url.trim()) return;
    setSavingSocial(true);
    try {
      const link = await createSocialLink({ platform: socialForm.platform, url: socialForm.url.trim() });
      setDashboard((prev) => prev ? { ...prev, social_links: [...prev.social_links, link] } : prev);
      setSocialForm({ platform: "github", url: "" });
      setAddSocialOpen(false);
      notifyMutation("profile");
      addToast("success", "Social link added");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Failed to add link");
    } finally {
      setSavingSocial(false);
    }
  }, [socialForm, addToast, notifyMutation]);

  const handleDeleteSocial = useCallback(async (id: number) => {
    try {
      await deleteSocialLink(id);
      setDashboard((prev) => prev ? { ...prev, social_links: prev.social_links.filter((l) => l.id !== id) } : prev);
      notifyMutation("profile");
      addToast("success", "Link removed");
    } catch {
      addToast("error", "Failed to remove link");
    }
  }, [addToast, notifyMutation]);

  const handleUploadResume = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadResume(file);
      setDashboard((prev) => prev ? { ...prev, resume_files: [...prev.resume_files, result] } : prev);
      notifyMutation("profile");
      addToast("success", "Resume uploaded successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Upload failed");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [addToast, notifyMutation]);

  const handleDeleteResume = useCallback(async (id: number) => {
    try {
      await deleteResume(id);
      setDashboard((prev) => prev ? { ...prev, resume_files: prev.resume_files.filter((r) => r.id !== id) } : prev);
      notifyMutation("profile");
      addToast("success", "Resume deleted");
    } catch {
      addToast("error", "Failed to delete resume");
    }
  }, [addToast, notifyMutation]);
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="mb-6">
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
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
          <p className="text-base font-semibold text-fg-default">Failed to load profile</p>
          <p className="mt-1.5 text-sm text-fg-muted">{error}</p>
          <Button variant="secondary" className="mt-5" onClick={fetchData} icon={<RefreshCw size={15} />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-hover">
            <User size={24} className="text-fg-muted" />
          </div>
          <p className="text-base font-semibold text-fg-default">No profile data yet</p>
          <p className="mt-1.5 text-sm text-fg-muted">Complete the wizard to get started.</p>
          <Link href="/career-profile/wizard">
            <Button variant="secondary" className="mt-5">
              Open Wizard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pct = dashboard.completion_pct ?? 0;
  const name =
    [dashboard.basic_info.first_name, dashboard.basic_info.last_name].filter(Boolean).join(" ") || "Your Profile";
  const initials = [dashboard.basic_info.first_name?.[0], dashboard.basic_info.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase();
  const statusLabel =
    CAREER_STATUSES.find((s) => s.value === dashboard.career_info.current_status)?.label ?? dashboard.career_info.current_status;
  const incompleteRecs = recommendations.filter((r) => r.priority === "high" || r.priority === "medium");

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-7xl space-y-6 lg:space-y-8 p-4 lg:p-6">

      {/* ── Page Header ──────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg-default">Profile Dashboard</h1>
          <p className="mt-0.5 text-sm text-fg-muted">Your career profile at a glance</p>
        </div>
        <Link href="/career-profile/wizard">
          <Button variant="secondary" icon={<Pencil size={15} />}>Edit Profile</Button>
        </Link>
      </motion.div>

      {/* ── Profile Header Card ──────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/50">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent-subtle text-2xl font-bold text-accent">
              {initials || <User size={32} />}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-fg-default">{name}</h2>
              {dashboard.basic_info.email && (
                <p className="mt-0.5 text-sm text-fg-muted">{dashboard.basic_info.email}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {statusLabel && (
                  <Badge tone="accent"><BriefcaseBusiness size={11} className="mr-1" />{statusLabel}</Badge>
                )}
                {[dashboard.basic_info.city, dashboard.basic_info.country].filter(Boolean).join(", ") && (
                  <Badge tone="neutral">
                    <Building2 size={11} className="mr-1" />
                    {[dashboard.basic_info.city, dashboard.basic_info.country].filter(Boolean).join(", ")}
                  </Badge>
                )}
                <Badge tone="neutral"><Zap size={11} className="mr-1" />{dashboard.skills.length} skills</Badge>
                <Badge tone="neutral"><GraduationCap size={11} className="mr-1" />{dashboard.education.length} education</Badge>
              </div>
            </div>
            <div className="hidden shrink-0 md:block">
              <CompletionRing pct={pct} />
              <p className="mt-1 text-center text-[10px] text-fg-subtle">Profile Complete</p>
            </div>
          </div>

          {/* ── Completion + Readiness row ────────────────── */}
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-2">
            {/* Completion Checklist */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                <Check size={13} className="text-accent" />Completion Checklist
              </h4>
              {[
                { label: "Basic Information", done: !!(dashboard.basic_info.first_name && dashboard.basic_info.email) },
                { label: "Education History", done: dashboard.education.length > 0 },
                { label: "Skills Added", done: dashboard.skills.length > 0 },
                { label: "Career Information", done: !!dashboard.career_info.current_status },
                { label: "Dream Career", done: !!dashboard.dream_career.dream_role },
                { label: "Resume Uploaded", done: dashboard.resume_files.length > 0 },
                { label: "Interests Defined", done: dashboard.interests.length > 0 },
                { label: "Languages Added", done: dashboard.languages.length > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    item.done ? "bg-success-subtle text-success" : "border border-border bg-bg-hover text-fg-subtle"
                  }`}>
                    {item.done ? <Check size={11} /> : ""}
                  </span>
                  <span className={`text-sm ${item.done ? "text-fg-default" : "text-fg-muted"}`}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Readiness Score */}
            {readiness && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                  <TrendingUp size={13} className="text-accent" />Career Readiness
                </h4>
                <div className="flex items-start gap-5">
                  <ReadinessRing score={readiness.overall} />
                  <div className="flex-1 space-y-2.5 pt-1">
                    {Object.entries(readiness.breakdown).map(([key, val]) => (
                      <ReadinessBar key={key} label={key} value={val as number} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      {/* ── Smart Recommendations ────────────────────────── */}
      {incompleteRecs.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-accent/20 bg-accent-subtle/30">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
                <Sparkles size={15} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-fg-default">Smart Recommendations</h3>
                <p className="text-[11px] text-fg-muted">Actions to boost your profile</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {incompleteRecs.slice(0, 6).map((rec) => (
                <div key={rec.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-bg-surface p-3 transition-colors hover:border-accent/30">
                  <Badge tone={rec.priority === "high" ? "danger" : "warning"} className="mt-0.5 shrink-0">
                    {rec.priority}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-fg-default">{rec.action}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-fg-muted">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Dream Career + Career Info (2-col) ────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Dream Career */}
        <motion.div variants={fadeUp}>
          <SectionCard icon={<Star size={16} />} title="Dream Career" className="h-full">
            {dashboard.dream_career.dream_role ? (
              <div className="space-y-3">
                {[
                  { label: "Dream Role", value: dashboard.dream_career.dream_role },
                  { label: "Dream Company", value: dashboard.dream_career.dream_company },
                  { label: "Industry", value: dashboard.dream_career.preferred_industry },
                  { label: "Country", value: dashboard.dream_career.preferred_country },
                  { label: "Work Preference", value: dashboard.dream_career.work_preference },
                  { label: "Salary Goal", value: dashboard.dream_career.salary_goal },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-2">
                    <span className="shrink-0 text-xs text-fg-muted">{row.label}</span>
                    <span className="text-right text-sm text-fg-default">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Star size={20} />}
                message="Set your dream career to get personalized recommendations"
                action={
                  <Link href="/career-profile/wizard">
                    <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
                      Set Dream Career
                    </Button>
                  </Link>
                }
              />
            )}
          </SectionCard>
        </motion.div>

        {/* Career Info */}
        <motion.div variants={fadeUp}>
          <SectionCard icon={<Briefcase size={16} />} title="Career Information" className="h-full">
            {dashboard.career_info.current_status ? (
              <div className="space-y-3">
                {[
                  { label: "Status", value: statusLabel },
                  { label: "Company", value: dashboard.career_info.company },
                  { label: "Position", value: dashboard.career_info.position },
                  { label: "Experience", value: dashboard.career_info.experience_years ? `${dashboard.career_info.experience_years} years` : null },
                  { label: "Employment", value: dashboard.career_info.employment_type },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-2">
                    <span className="shrink-0 text-xs text-fg-muted">{row.label}</span>
                    <span className="text-right text-sm text-fg-default">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Briefcase size={20} />}
                message="Add career information to help track your professional journey"
                action={
                  <Link href="/career-profile/wizard">
                    <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
                      Add Career Info
                    </Button>
                  </Link>
                }
              />
            )}
          </SectionCard>
        </motion.div>
      </div>
      {/* ── Education + Skills (2-col) ────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Education */}
        <motion.div variants={fadeUp}>
          <SectionCard
            icon={<GraduationCap size={16} />}
            title="Education"
            action={
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setAddEduOpen(!addEduOpen)}>
                Add
              </Button>
            }
          >
            {addEduOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-2.5 rounded-lg border border-accent/20 bg-accent-subtle/20 p-3"
              >
                <Input
                  label="Institution"
                  placeholder="University name"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Degree"
                    placeholder="B.Tech"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  />
                  <Input
                    label="Branch"
                    placeholder="CS"
                    value={eduForm.branch}
                    onChange={(e) => setEduForm({ ...eduForm, branch: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="CGPA"
                    placeholder="8.5"
                    value={eduForm.cgpa}
                    onChange={(e) => setEduForm({ ...eduForm, cgpa: e.target.value })}
                  />
                  <Input
                    label="Year"
                    placeholder="2025"
                    value={eduForm.graduation_year}
                    onChange={(e) => setEduForm({ ...eduForm, graduation_year: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setAddEduOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" loading={savingEdu} onClick={handleAddEducation}>
                    Save
                  </Button>
                </div>
              </motion.div>
            )}
            {dashboard.education.length === 0 ? (
              <EmptyState
                icon={<GraduationCap size={20} />}
                message="No education added yet. Add your education history to improve AI recommendations and job matching."
                action={
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddEduOpen(true)}>
                    Add Education
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {dashboard.education.map((edu) => (
                  <div key={edu.id} className="group flex items-start justify-between gap-2 rounded-lg border border-border bg-bg-raised p-3 transition-colors hover:border-accent/20">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg-default">{edu.institution}</p>
                      <p className="text-xs text-fg-muted">{[edu.degree, edu.branch].filter(Boolean).join(" - ")}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-fg-subtle">
                        {edu.cgpa != null && <span>CGPA: {edu.cgpa}</span>}
                        {edu.graduation_year != null && <span>Year: {edu.graduation_year}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => edu.id != null && handleDeleteEducation(edu.id)}
                      className="shrink-0 rounded-md p-1 text-fg-subtle opacity-0 transition-all hover:bg-danger-subtle hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Skills */}
        <motion.div variants={fadeUp}>
          <SectionCard
            icon={<Zap size={16} />}
            title="Skills"
            action={
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setAddSkillOpen(!addSkillOpen)}>
                Add
              </Button>
            }
          >
            {addSkillOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-2.5 rounded-lg border border-accent/20 bg-accent-subtle/20 p-3"
              >
                <Input
                  label="Skill Name"
                  placeholder="e.g. React, Python"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <div>
                  <label className="mb-1 block font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                    Level
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILL_LEVELS.map((level) => (
                      <Badge
                        key={level.value}
                        tone={newSkillLevel === level.value ? skillTone(level.value) : "neutral"}
                        className="cursor-pointer"
                        onClick={() => setNewSkillLevel(level.value)}
                      >
                        {level.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setAddSkillOpen(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={savingSkill} onClick={handleAddSkill}>Save</Button>
                </div>
              </motion.div>
            )}
            {dashboard.skills.length === 0 ? (
              <EmptyState
                icon={<Zap size={20} />}
                message="No skills added yet. Showcase your technical and professional abilities."
                action={
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddSkillOpen(true)}>
                    Add Skills
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {dashboard.skills.map((skill) => (
                  <Badge key={skill.id} tone={skillTone(skill.experience_level)} className="group/skill cursor-default">
                    {skill.name}
                    <span className="ml-1 opacity-60">&middot;</span>
                    <span className="font-normal opacity-60">{skillLevelLabel(skill.experience_level)}</span>
                    <button
                      onClick={() => skill.id != null && handleDeleteSkill(skill.id)}
                      className="ml-1 hidden rounded-sm p-0.5 transition-colors hover:bg-danger/20 group-hover/skill:inline-flex"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>
      {/* ── Interests + Languages + Social Links (3-col) ─── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Interests */}
        <motion.div variants={fadeUp}>
          <SectionCard
            icon={<Heart size={16} />}
            title="Interests"
            action={
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setAddInterestOpen(!addInterestOpen)}>
                Add
              </Button>
            }
          >
            {addInterestOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 space-y-2.5 rounded-lg border border-accent/20 bg-accent-subtle/20 p-3"
              >
                <Input
                  label="Interests (comma-separated)"
                  placeholder="e.g. AI, Cybersecurity, Cloud"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddInterests()}
                />
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setAddInterestOpen(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={savingInterest} onClick={handleAddInterests}>Save</Button>
                </div>
              </motion.div>
            )}
            {dashboard.interests.length === 0 ? (
              <EmptyState
                icon={<Heart size={20} />}
                message="Define your interests to get better AI-powered career suggestions."
                action={
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddInterestOpen(true)}>
                    Add Interests
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {dashboard.interests.map((interest) => (
                  <Badge key={interest.id} tone="neutral" className="group/interest">
                    {interest.name}
                    <button
                      onClick={() => interest.id != null && handleDeleteInterest(interest.id)}
                      className="ml-1 hidden rounded-sm p-0.5 transition-colors hover:bg-danger/20 group-hover/interest:inline-flex"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Languages */}
        <motion.div variants={fadeUp}>
          <SectionCard
            icon={<Globe size={16} />}
            title="Languages"
            action={
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setAddLangOpen(!addLangOpen)}>
                Add
              </Button>
            }
          >
            {addLangOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 space-y-2.5 rounded-lg border border-accent/20 bg-accent-subtle/20 p-3"
              >
                <Input
                  label="Language"
                  placeholder="e.g. English, Spanish"
                  value={langForm.language}
                  onChange={(e) => setLangForm({ ...langForm, language: e.target.value })}
                />
                <div>
                  <label className="mb-1 block font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                    Proficiency
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_PROFICIENCIES.map((p) => (
                      <Badge
                        key={p.value}
                        tone={langForm.proficiency === p.value ? langTone(p.value) : "neutral"}
                        className="cursor-pointer"
                        onClick={() => setLangForm({ ...langForm, proficiency: p.value })}
                      >
                        {p.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setAddLangOpen(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={savingLang} onClick={handleAddLanguage}>Save</Button>
                </div>
              </motion.div>
            )}
            {dashboard.languages.length === 0 ? (
              <EmptyState
                icon={<Globe size={20} />}
                message="Add languages you speak to enhance your professional profile."
                action={
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddLangOpen(true)}>
                    Add Language
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {dashboard.languages.map((lang) => (
                  <Badge key={lang.id} tone={langTone(lang.proficiency)} className="group/lang">
                    {lang.language}
                    <span className="ml-1 opacity-60">&middot;</span>
                    <span className="font-normal opacity-60">{proficiencyLabel(lang.proficiency)}</span>
                    <button
                      onClick={() => lang.id != null && handleDeleteLanguage(lang.id)}
                      className="ml-1 hidden rounded-sm p-0.5 transition-colors hover:bg-danger/20 group-hover/lang:inline-flex"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Social Links */}
        <motion.div variants={fadeUp}>
          <SectionCard
            icon={<Link2 size={16} />}
            title="Social Links"
            action={
              <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setAddSocialOpen(!addSocialOpen)}>
                Add
              </Button>
            }
          >
            {addSocialOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 space-y-2.5 rounded-lg border border-accent/20 bg-accent-subtle/20 p-3"
              >
                <div>
                  <label className="mb-1 block font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                    Platform
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SOCIAL_PLATFORMS.map((p) => (
                      <Badge
                        key={p.value}
                        tone={socialForm.platform === p.value ? "accent" : "neutral"}
                        className="cursor-pointer"
                        onClick={() => setSocialForm({ ...socialForm, platform: p.value })}
                      >
                        {p.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Input
                  label="URL"
                  placeholder={SOCIAL_PLATFORMS.find((p) => p.value === socialForm.platform)?.placeholder ?? "https://"}
                  value={socialForm.url}
                  onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                />
                <div className="flex justify-end gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setAddSocialOpen(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={savingSocial} onClick={handleAddSocial}>Save</Button>
                </div>
              </motion.div>
            )}
            {dashboard.social_links.length === 0 ? (
              <EmptyState
                icon={<Link2 size={20} />}
                message="Connect your social profiles and online presence."
                action={
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setAddSocialOpen(true)}>
                    Connect Accounts
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {dashboard.social_links.map((link) => (
                  <div key={link.id} className="group/link flex items-center gap-2 rounded-lg border border-border bg-bg-raised px-3 py-2 transition-colors hover:border-accent/30">
                    <ExternalLink size={13} className="shrink-0 text-fg-subtle transition-colors group-hover/link:text-accent" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate text-xs text-fg-default hover:text-accent"
                    >
                      {socialLabel(link.platform)}
                    </a>
                    <ChevronRight size={13} className="shrink-0 text-fg-subtle opacity-0 transition-all group-hover/link:opacity-100" />
                    <button
                      onClick={() => link.id != null && handleDeleteSocial(link.id)}
                      className="shrink-0 rounded-md p-0.5 text-fg-subtle opacity-0 transition-all hover:bg-danger-subtle hover:text-danger group-hover/link:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>
      {/* ── Resume + Preferences + Goals (3-col) ─────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Resume */}
        <motion.div variants={fadeUp}>
          <SectionCard
            icon={<FileText size={16} />}
            title="Resume"
            action={
              dashboard.resume_files.length > 0 ? (
                <Button variant="ghost" size="sm" icon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>
                  Upload New
                </Button>
              ) : undefined
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleUploadResume}
            />
            {dashboard.resume_files.length === 0 ? (
              <EmptyState
                icon={<FileText size={20} />}
                message="Upload your resume to get AI-powered analysis and optimization tips."
                action={
                  <Button variant="secondary" size="sm" icon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>
                    Upload Resume
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {dashboard.resume_files.map((resume) => (
                  <div key={resume.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-raised p-3 transition-colors hover:border-success/20">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-subtle">
                      <FileText size={16} className="text-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg-default">{resume.original_filename}</p>
                      <p className="text-[11px] text-fg-subtle">
                        {(resume.file_size / 1024).toFixed(1)} KB
                        {resume.uploaded_at ? ` \u00b7 ${new Date(resume.uploaded_at).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={() => { const a = document.createElement("a"); a.href = `/api/users/resume/${resume.id}/download`; a.download = resume.original_filename; fetch(a.href, { credentials: "include" }).then(r => r.blob()).then(b => { const url = URL.createObjectURL(b); a.href = url; a.click(); URL.revokeObjectURL(url); }).catch(() => {}); }} />
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-danger-subtle hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={fadeUp}>
          <SectionCard icon={<Settings size={16} />} title="Preferences">
            <div className="space-y-3">
              {[
                { label: "Job Alerts", on: dashboard.preferences.job_alerts },
                { label: "Weekly AI Review", on: dashboard.preferences.weekly_ai_review },
                { label: "Email Notifications", on: dashboard.preferences.email_notifications },
                { label: "Public Profile", on: dashboard.preferences.public_profile },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted">{pref.label}</span>
                  <span className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    pref.on ? "bg-success" : "bg-bg-hover"
                  }`}>
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full bg-bg-surface shadow-sm transition-transform"
                      style={{ transform: `translateX(${pref.on ? "18px" : "2px"})` }}
                    />
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted">Resume Visibility</span>
                  <Badge tone="neutral">{dashboard.preferences.resume_visibility}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-fg-muted">Theme</span>
                  <span className="text-sm font-medium text-fg-default capitalize">{dashboard.preferences.theme_preference}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Goals Snapshot */}
        <motion.div variants={fadeUp}>
          <SectionCard icon={<Target size={16} />} title="Career Goals">
            {dashboard.goals.length === 0 ? (
              <EmptyState
                icon={<Target size={20} />}
                message="Set your first career goal to track progress and stay motivated."
                action={
                  <Link href="/career-profile/wizard">
                    <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
                      Set Goal
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3.5">
                {dashboard.goals.slice(0, 5).map((goal) => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-fg-default">{goal.title}</span>
                      <span className="shrink-0 pl-2 text-xs font-mono text-fg-muted">{goal.progress}%</span>
                    </div>
                    <ProgressBar value={goal.progress} />
                    <div className="flex items-center gap-1.5 text-[10px] text-fg-subtle">
                      {goal.target_role && <span>{goal.target_role}</span>}
                      {goal.target_company && <span>&middot; {goal.target_company}</span>}
                      <Badge tone={goal.status === "completed" ? "success" : goal.status === "in_progress" ? "accent" : "neutral"}>
                        {goal.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
                {dashboard.goals.length > 5 && (
                  <p className="pt-1 text-center text-[11px] text-fg-subtle">
                    +{dashboard.goals.length - 5} more goals
                  </p>
                )}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>
    </motion.div>
  );
}