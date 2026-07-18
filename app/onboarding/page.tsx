"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, GraduationCap,
  Briefcase, School, Repeat, X, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type CareerStage = "student" | "fresher" | "professional" | "switcher";

interface StageInfo {
  id: CareerStage;
  icon: React.ElementType;
  title: string;
  desc: string;
}

const CAREER_STAGES: StageInfo[] = [
  { id: "student", icon: GraduationCap, title: "Student", desc: "Currently pursuing a degree" },
  { id: "fresher", icon: School, title: "Fresher / Recent Graduate", desc: "Looking for first job" },
  { id: "professional", icon: Briefcase, title: "Working Professional", desc: "Experienced and career-growing" },
  { id: "switcher", icon: Repeat, title: "Career Switcher", desc: "Transitioning to a new field" },
];

type FieldType = "text" | "number" | "select" | "tags" | "url";

interface StageField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
  halfWidth?: boolean;
  suggestions?: string[];
}

type StageFieldMap = Record<CareerStage, StageField[]>;

// Trimmed to what's actually needed to personalize the dashboard.
// Everything else (CTC, notice period, certifications, etc.) lives in
// Career Profile / Settings, where it's actually used.
const STAGE_FIELDS: StageFieldMap = {
  student: [
    { key: "college", label: "College / Institution", type: "text", placeholder: "Massachusetts Institute of Technology" },
    { key: "branch", label: "Branch / Major", type: "text", placeholder: "Computer Science", halfWidth: true },
    { key: "grad_year", label: "Graduation Year", type: "number", placeholder: "2026", halfWidth: true },
    { key: "dream_role", label: "Dream Role", type: "text", placeholder: "Software Engineer" },
  ],
  fresher: [
    { key: "college", label: "College / Institution", type: "text", placeholder: "MIT" },
    { key: "grad_year", label: "Graduation Year", type: "number", placeholder: "2026", halfWidth: true },
    { key: "dream_role", label: "Target Role", type: "text", placeholder: "Software Engineer", halfWidth: true },
  ],
  professional: [
    { key: "current_company", label: "Current Company", type: "text", placeholder: "Google" },
    { key: "current_role", label: "Current Job Title", type: "text", placeholder: "Software Engineer", halfWidth: true },
    { key: "years_experience", label: "Years of Experience", type: "number", placeholder: "5", halfWidth: true },
    { key: "dream_role", label: "Target Role", type: "text", placeholder: "Senior Software Engineer" },
  ],
  switcher: [
    { key: "current_profession", label: "Current Profession", type: "text", placeholder: "Marketing Manager" },
    { key: "target_profession", label: "Target Profession", type: "text", placeholder: "Software Engineer" },
    { key: "transferable_skills", label: "Transferable Skills", type: "tags", placeholder: "Add a transferable skill", optional: true, suggestions: ["Communication", "Leadership", "Project Management", "Analytical Thinking", "Problem Solving", "Teamwork", "Client Management"] },
  ],
};

// Fields carried over when switching stage cards, so re-picking a card
// doesn't wipe what was already typed.
const SHARED_KEYS = ["dream_role", "target_profession", "college", "grad_year"];

const STEPS = [
  { label: "About you", subtitle: "The basics — takes about a minute" },
  { label: "Skills", subtitle: "What you're good at" },
  { label: "You're set", subtitle: "The rest you can fill in as you go" },
];
const TOTAL_VISUAL_STEPS = STEPS.length;

type StepData = Record<string, unknown>;

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [screen, setScreen] = useState(0); // 0=profile+stage, 1=skills, 2=finish
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [careerStage, setCareerStage] = useState<CareerStage>("student");
  const [stageData, setStageData] = useState<StepData>({});
  const [skills, setSkills] = useState<string[]>([]);

  const progressPct = Math.round((screen / (TOTAL_VISUAL_STEPS - 1)) * 100);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    apiFetch("/api/onboarding/status")
      .then((res) => {
        if (res.onboarding_completed) {
          router.replace("/dashboard");
          return;
        }
        if (res.career_stage) setCareerStage(res.career_stage);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated, router]);

  const loadInitialData = useCallback(async () => {
    try {
      const [s1, s2, s3] = await Promise.all([
        apiFetch("/api/onboarding/step/1"),
        apiFetch("/api/onboarding/step/2"),
        apiFetch("/api/onboarding/step/3"),
      ]);
      if (s1?.data?.full_name) setFullName(s1.data.full_name);
      if (s2?.data) {
        setStageData(s2.data);
        if (s2.data.career_stage) setCareerStage(s2.data.career_stage);
      }
      if (Array.isArray(s3?.data?.skills)) {
        setSkills(s3.data.skills.map((s: { name: string }) => s.name));
      }
    } catch {
      // fine to start blank
    }
  }, []);

  useEffect(() => {
    if (!loading) loadInitialData();
  }, [loading, loadInitialData]);

  function handleStageChange(stage: CareerStage) {
    setCareerStage(stage);
    setStageData((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => SHARED_KEYS.includes(k))));
  }

  function updateStageField(updates: StepData) {
    setStageData((prev) => ({ ...prev, ...updates }));
  }

  function validateScreen(s: number): string {
    if (s === 0) {
      if (!fullName.trim()) return "Enter your name to continue";
      const fields = STAGE_FIELDS[careerStage];
      for (const f of fields) {
        if (!f.optional && f.type !== "tags" && !stageData[f.key]) {
          return `${f.label} is required`;
        }
      }
    }
    if (s === 1 && skills.length === 0) {
      return "Add at least one skill to continue";
    }
    return "";
  }

  async function goNext() {
    const validationError = validateScreen(screen);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (screen === 0) {
        await apiFetch("/api/onboarding/step/1", { method: "POST", body: JSON.stringify({ data: { full_name: fullName } }) });
        await apiFetch("/api/onboarding/step/2", { method: "POST", body: JSON.stringify({ data: { ...stageData, career_stage: careerStage } }) });
        setScreen(1);
      } else if (screen === 1) {
        await apiFetch("/api/onboarding/step/3", { method: "POST", body: JSON.stringify({ data: { skills: skills.map((name) => ({ name })) } }) });
        setScreen(2);
      } else {
        // Steps 4-6 (goals, connected accounts, AI preferences) are left at
        // their backend defaults — those are better collected in-product,
        // contextually, once the user has seen a dashboard to attach them to.
        await apiFetch("/api/onboarding/step/4", { method: "POST", body: JSON.stringify({ data: {} }) });
        await apiFetch("/api/onboarding/step/5", { method: "POST", body: JSON.stringify({ data: {} }) });
        await apiFetch("/api/onboarding/step/6", { method: "POST", body: JSON.stringify({ data: {} }) });
        await apiFetch("/api/onboarding/complete", { method: "POST" });
        apiFetch("/api/career/roadmaps/auto-generate", { method: "POST" }).catch(() => {});
        setCompleted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save — try again");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-default">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-default p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-subtle">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h1 className="mb-2 font-serif text-3xl font-medium text-fg-default">You&apos;re all set!</h1>
          <p className="mb-8 text-sm text-fg-muted">Your profile is ready. Let&apos;s start building your career.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
          >
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  function renderStageField(field: StageField) {
    const value = stageData[field.key];

    if (field.type === "tags") {
      return (
        <StageTagInput
          key={field.key}
          label={field.label}
          optional={field.optional}
          items={(value as string[]) || []}
          onChange={(items) => updateStageField({ [field.key]: items })}
          placeholder={field.placeholder || ""}
          suggestions={field.suggestions || []}
        />
      );
    }

    return (
      <div key={field.key}>
        <label className="mb-1 block text-xs font-medium text-fg-muted">
          {field.label}{field.optional ? "" : " *"}
        </label>
        <input
          type={field.type === "number" ? "number" : "text"}
          value={(value as string) || ""}
          onChange={(e) => updateStageField({ [field.key]: field.type === "number" ? (e.target.value ? parseFloat(e.target.value) : "") : e.target.value })}
          placeholder={field.placeholder}
          className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
        />
      </div>
    );
  }

  function renderScreen() {
    if (screen === 0) {
      const fields = STAGE_FIELDS[careerStage];
      const halfWidthFields = fields.filter((f) => f.halfWidth);
      const fullWidthFields = fields.filter((f) => !f.halfWidth);

      return (
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">Your name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-fg-muted">Which describes you best? *</label>
            <div className="grid grid-cols-2 gap-3">
              {CAREER_STAGES.map((s) => {
                const Icon = s.icon;
                const selected = careerStage === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStageChange(s.id)}
                    className={`btn-press relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      selected ? "border-accent bg-accent-subtle shadow-sm" : "border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-hover"
                    }`}
                  >
                    <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-accent text-white" : "bg-bg-hover text-fg-muted"}`}>
                      <Icon size={18} />
                    </div>
                    <p className={`text-sm font-medium ${selected ? "text-accent" : "text-fg-default"}`}>{s.title}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            {fullWidthFields.map((f) => renderStageField(f))}
            {halfWidthFields.length > 0 && (
              <div className="grid grid-cols-2 gap-4">{halfWidthFields.map((f) => renderStageField(f))}</div>
            )}
          </div>
        </div>
      );
    }

    if (screen === 1) {
      const stageSuggestions: Record<CareerStage, string[]> = {
        student: ["Python", "JavaScript", "C++", "Java", "Data Structures", "Algorithms", "Machine Learning", "React", "Node.js", "SQL", "Git", "HTML", "CSS", "TypeScript"],
        fresher: ["Python", "JavaScript", "Java", "React", "Node.js", "SQL", "Git", "Docker", "AWS", "TypeScript", "Data Structures", "Algorithms"],
        professional: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "System Design", "Go", "Rust", "GraphQL", "Kafka"],
        switcher: ["Python", "JavaScript", "HTML", "CSS", "SQL", "Git", "React", "Node.js", "Problem Solving", "Communication"],
      };
      return (
        <StageTagInput
          label="Skills"
          optional={false}
          items={skills}
          onChange={setSkills}
          placeholder="Type a skill and press Enter"
          suggestions={stageSuggestions[careerStage]}
        />
      );
    }

    // screen === 2 — finish
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-bg-surface p-4">
          <p className="text-sm font-medium text-fg-default">{fullName || "Your profile"}</p>
          <p className="mt-0.5 text-xs text-fg-muted">{CAREER_STAGES.find((s) => s.id === careerStage)?.title}</p>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.slice(0, 8).map((s) => (
                <span key={s} className="rounded-md bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">{s}</span>
              ))}
              {skills.length > 8 && <span className="text-xs text-fg-muted">+{skills.length - 8} more</span>}
            </div>
          )}
        </div>
        <p className="text-sm text-fg-muted">
          Goals, connected accounts (GitHub/LinkedIn), and AI preferences aren&apos;t required up front —
          you&apos;ll be prompted to add those from the dashboard when they&apos;re actually useful.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-default">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <span className="font-serif text-lg font-medium text-fg-default">Career OS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-fg-muted">Step {screen + 1} of {TOTAL_VISUAL_STEPS}</span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-bg-hover">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div key={`header-${screen}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
              <h2 className="font-serif text-2xl font-medium text-fg-default">{STEPS[screen].label}</h2>
              <p className="mt-1 text-sm text-fg-muted">{STEPS[screen].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={screen} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 rounded-lg border border-danger/20 bg-danger-subtle px-3 py-2 text-xs text-danger">{error}</p>
          )}

          <div className="mt-8 flex items-center justify-between">
            {screen > 0 ? (
              <button
                onClick={() => { setError(""); setScreen((s) => s - 1); }}
                className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg-muted transition-all hover:border-accent/40 hover:text-fg-default"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : <span />}
            <button
              onClick={goNext}
              disabled={saving}
              className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {screen >= TOTAL_VISUAL_STEPS - 1 ? "Finish setup" : "Continue"}
              {!saving && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageTagInput({ label, optional, items, onChange, placeholder, suggestions }: {
  label: string; optional?: boolean; items: string[]; onChange: (items: string[]) => void; placeholder: string; suggestions: string[];
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function addItem(name: string) {
    const trimmed = name.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setInput("");
  }

  function removeItem(name: string) {
    onChange(items.filter((i) => i !== name));
  }

  const filtered = suggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-fg-muted">
        {label}{optional ? " (optional)" : " *"}
      </label>
      <div className="relative">
        <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-bg-default px-3 py-1.5">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-md bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
              {item}
              <button onClick={() => removeItem(item)} className="text-accent/60 hover:text-accent"><X size={12} /></button>
            </span>
          ))}
          <input type="text" value={input} onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(input); } }}
            onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={items.length === 0 ? placeholder : ""}
            className="min-w-[140px] flex-1 border-0 bg-transparent py-1 text-sm text-fg-default placeholder:text-fg-subtle focus:outline-none" />
        </div>
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-border bg-bg-raised shadow-lg">
            {filtered.map((s) => (
              <button key={s} onMouseDown={(e) => { e.preventDefault(); addItem(s); }}
                className="w-full px-3 py-2 text-left text-sm text-fg-default transition-colors hover:bg-bg-hover">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}