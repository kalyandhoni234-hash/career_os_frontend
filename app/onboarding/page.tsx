"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, GraduationCap,
  Briefcase, Code, Heart, Link2, Sliders, User,
  X, Plus, Loader2, School, Repeat,
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
  color: string;
}

const CAREER_STAGES: StageInfo[] = [
  { id: "student", icon: GraduationCap, title: "Student", desc: "Currently pursuing a degree", color: "text-accent" },
  { id: "fresher", icon: School, title: "Fresher / Recent Graduate", desc: "Looking for first job", color: "text-success" },
  { id: "professional", icon: Briefcase, title: "Working Professional", desc: "Experienced and career-growing", color: "text-warning" },
  { id: "switcher", icon: Repeat, title: "Career Switcher", desc: "Transitioning to a new field", color: "text-danger" },
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

const STAGE_FIELDS: StageFieldMap = {
  student: [
    { key: "college", label: "College / Institution", type: "text", placeholder: "Massachusetts Institute of Technology" },
    { key: "degree", label: "Degree", type: "text", placeholder: "B.Tech" },
    { key: "branch", label: "Branch / Major", type: "text", placeholder: "Computer Science", halfWidth: true },
    { key: "grad_year", label: "Graduation Year", type: "number", placeholder: "2026", halfWidth: true },
    { key: "current_semester", label: "Current Semester", type: "number", placeholder: "6", optional: true, halfWidth: true },
    { key: "cgpa", label: "CGPA", type: "number", placeholder: "8.5", optional: true, halfWidth: true },
    { key: "dream_role", label: "Dream Role", type: "text", placeholder: "Software Engineer" },
    { key: "preferred_internship", label: "Preferred Internship", type: "text", placeholder: "SWE Intern at Google", optional: true, halfWidth: true },
    { key: "preferred_country", label: "Preferred Country / Location", type: "text", placeholder: "United States", halfWidth: true },
    { key: "github_url", label: "GitHub URL", type: "url", placeholder: "https://github.com/username", optional: true, halfWidth: true },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/username", optional: true, halfWidth: true },
  ],
  fresher: [
    { key: "college", label: "College / Institution", type: "text", placeholder: "MIT" },
    { key: "degree", label: "Degree", type: "text", placeholder: "B.Tech", halfWidth: true },
    { key: "grad_year", label: "Graduation Year", type: "number", placeholder: "2026", halfWidth: true },
    { key: "internship_experience", label: "Internship Experience", type: "text", placeholder: "SWE Intern at Google (optional)", optional: true },
    { key: "projects", label: "Projects", type: "tags", placeholder: "Add a project name", suggestions: [], optional: true },
    { key: "certifications", label: "Certifications", type: "tags", placeholder: "Add a certification", suggestions: [], optional: true },
    { key: "dream_role", label: "Target Role", type: "text", placeholder: "Software Engineer" },
    { key: "preferred_country", label: "Preferred Country", type: "text", placeholder: "United States", halfWidth: true },
    { key: "expected_salary", label: "Expected Salary (optional)", type: "text", placeholder: "$80,000", optional: true, halfWidth: true },
  ],
  professional: [
    { key: "current_company", label: "Current Company", type: "text", placeholder: "Google" },
    { key: "current_role", label: "Current Job Title", type: "text", placeholder: "Software Engineer", halfWidth: true },
    { key: "industry", label: "Industry", type: "text", placeholder: "Technology", halfWidth: true },
    { key: "years_experience", label: "Years of Experience", type: "number", placeholder: "5", halfWidth: true },
    { key: "employment_type", label: "Employment Type", type: "select", placeholder: "Full-time", halfWidth: true, options: [
      { value: "full-time", label: "Full-time" }, { value: "part-time", label: "Part-time" },
      { value: "contract", label: "Contract" }, { value: "freelance", label: "Freelance" },
      { value: "self-employed", label: "Self-employed" },
    ]},
    { key: "current_ctc", label: "Current CTC (optional)", type: "text", placeholder: "$120,000", optional: true, halfWidth: true },
    { key: "expected_ctc", label: "Expected CTC", type: "text", placeholder: "$150,000", halfWidth: true },
    { key: "notice_period", label: "Notice Period", type: "text", placeholder: "30 days", halfWidth: true },
    { key: "work_preference", label: "Work Preference", type: "select", halfWidth: true, options: [
      { value: "remote", label: "Remote" }, { value: "hybrid", label: "Hybrid" }, { value: "onsite", label: "On-site" },
    ]},
    { key: "dream_role", label: "Preferred Role", type: "text", placeholder: "Senior Software Engineer" },
    { key: "preferred_country", label: "Preferred Country", type: "text", placeholder: "United States" },
  ],
  switcher: [
    { key: "current_profession", label: "Current Profession", type: "text", placeholder: "Marketing Manager" },
    { key: "target_profession", label: "Target Profession", type: "text", placeholder: "Software Engineer" },
    { key: "transferable_skills", label: "Transferable Skills", type: "tags", placeholder: "Add a transferable skill", suggestions: ["Communication", "Leadership", "Project Management", "Analytical Thinking", "Problem Solving", "Teamwork", "Client Management"] },
    { key: "learning_progress", label: "Learning Progress", type: "text", placeholder: "Completed CS50, currently learning React", optional: true },
    { key: "career_goals_text", label: "Career Goals", type: "text", placeholder: "Become a full-stack developer within 12 months", optional: true },
    { key: "preferred_country", label: "Preferred Country", type: "text", placeholder: "United States" },
  ],
};

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  { icon: Sparkles, label: "Welcome", subtitle: "Let's set up your career OS" },
  { icon: User, label: "Basic Info", subtitle: "Tell us about yourself" },
  { icon: Briefcase, label: "Career Stage", subtitle: "What best describes you?" },
  { icon: Code, label: "Skills", subtitle: "What you're good at" },
  { icon: Heart, label: "Interests & Goals", subtitle: "What drives you" },
  { icon: Link2, label: "Connect", subtitle: "Link your accounts" },
  { icon: Sliders, label: "AI Preferences", subtitle: "Personalize your experience" },
];

type StepData = Record<string, unknown>;

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<Record<number, StepData>>({});
  const [careerStage, setCareerStage] = useState<CareerStage>("student");

  const progressPct = step === 0 ? 0 : Math.round((step / TOTAL_STEPS) * 100);

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
        const savedStep = res.onboarding_step || 0;
        setStep(savedStep > TOTAL_STEPS ? TOTAL_STEPS : savedStep);
        if (res.career_stage) setCareerStage(res.career_stage);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [isAuthenticated, router]);

  const loadStepData = useCallback(async (s: number) => {
    if (s < 1 || s > TOTAL_STEPS) return;
    try {
      const res = await apiFetch(`/api/onboarding/step/${s}`);
      const loaded = res.data as StepData;
      if (s === 2 && loaded.career_stage) {
        setCareerStage(loaded.career_stage as CareerStage);
      }
      setData((prev) => ({ ...prev, [s]: loaded }));
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (step >= 1 && step <= TOTAL_STEPS && !data[step]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStepData(step);
    }
  }, [step, data, loadStepData]);

  function updateStepData(s: number, updates: StepData) {
    setData((prev) => ({ ...prev, [s]: { ...(prev[s] || {}), ...updates } }));
  }

  async function saveStep(advance = true) {
    if (step < 1 || step > TOTAL_STEPS) {
      if (advance) setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/onboarding/step/${step}`, {
        method: "POST",
        body: JSON.stringify({ data: data[step] || {} }),
      });
      if (advance) {
        if (step >= TOTAL_STEPS) {
          await apiFetch("/api/onboarding/complete", { method: "POST" });
          setCompleted(true);
          setStep(TOTAL_STEPS + 1);
        } else {
          setStep((s) => s + 1);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleStageChange(stage: CareerStage) {
    const currentData = data[2] || {};

    const COMMON_FIELDS = ["dream_role", "preferred_country", "college", "degree", "grad_year"];
    const preserved: StepData = {};
    for (const key of COMMON_FIELDS) {
      if (currentData[key] !== undefined && currentData[key] !== "") {
        preserved[key] = currentData[key];
      }
    }

    setCareerStage(stage);
    setData((prev) => ({
      ...prev,
      [2]: { ...preserved, career_stage: stage },
    }));
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

  function renderStageFields(stage: CareerStage) {
    const d = data[2] || {};
    const fields = STAGE_FIELDS[stage];

    if (!fields || fields.length === 0) {
      return <p className="text-sm text-fg-muted">No additional details needed for this profile type.</p>;
    }

    const rows: React.ReactNode[] = [];
    let currentRow: React.ReactNode[] = [];

    fields.forEach((field, i) => {
      const value = d[field.key] as string | number | string[] | undefined;

      if (field.type === "tags") {
        if (currentRow.length > 0) {
          rows.push(<div key={`row-${i}`} className="grid grid-cols-2 gap-4">{currentRow}</div>);
          currentRow = [];
        }
        rows.push(
          <StageTagInput
            key={field.key}
            label={field.label}
            optional={field.optional}
            items={(value as string[]) || []}
            onChange={(items) => updateStepData(2, { [field.key]: items })}
            placeholder={field.placeholder || ""}
            suggestions={field.suggestions || []}
          />
        );
        return;
      }

      if (field.type === "select") {
        const el = (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium text-fg-muted">
              {field.label}{field.optional ? "" : " *"}
            </label>
            <select
              value={(value as string) || ""}
              onChange={(e) => updateStepData(2, { [field.key]: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {(field.options || []).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        );
        currentRow.push(el);
      } else {
        const el = (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium text-fg-muted">
              {field.label}{field.optional ? "" : " *"}
            </label>
            <input
              type={field.type === "number" ? "number" : "text"}
              value={(value as string) || ""}
              onChange={(e) => updateStepData(2, { [field.key]: field.type === "number" ? (e.target.value ? parseFloat(e.target.value) : "") : e.target.value })}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
            />
          </div>
        );
        currentRow.push(el);
      }

      if ((field.halfWidth && currentRow.length >= 2) || (!field.halfWidth && currentRow.length >= (i < fields.length - 1 ? 1 : 0))) {
        const cols = field.halfWidth ? 2 : 1;
        rows.push(
          <div key={`row-${i}`} className={`grid grid-cols-${cols} gap-4`}>
            {currentRow}
          </div>
        );
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      rows.push(<div key="row-end" className="grid grid-cols-2 gap-4">{currentRow}</div>);
    }

    return <div className="space-y-4">{rows}</div>;
  }

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-accent-subtle">
            <Sparkles className="h-12 w-12 text-accent" />
          </div>
          <h1 className="mb-3 font-serif text-4xl font-medium text-fg-default">Welcome to Career OS</h1>
          <p className="mx-auto mb-8 max-w-md text-sm text-fg-muted">
            Let&apos;s personalize your experience. This quick setup will help us tailor recommendations, career insights, and your dashboard.
          </p>
          <div className="mx-auto mb-8 grid max-w-sm grid-cols-2 gap-3 text-left text-sm">
            {["Build your profile", "Set career goals", "Connect accounts", "AI-powered insights"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-3 py-2 text-fg-default">
                <Check size={14} className="shrink-0 text-success" />
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setStep(1); loadStepData(1); }}
            className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      );
    }

    if (step === 1) {
      const d = data[1] || {};
      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">Full Name *</label>
            <input type="text" value={(d.full_name as string) || ""} onChange={(e) => updateStepData(1, { full_name: e.target.value })}
              placeholder="John Doe"
              className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Date of Birth</label>
              <input type="date" value={(d.date_of_birth as string) || ""} onChange={(e) => updateStepData(1, { date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Timezone</label>
              <select value={(d.timezone as string) || ""} onChange={(e) => updateStepData(1, { timezone: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50">
                <option value="">Select timezone</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern (US)</option>
                <option value="America/Chicago">Central (US)</option>
                <option value="America/Denver">Mountain (US)</option>
                <option value="America/Los_Angeles">Pacific (US)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Country</label>
              <input type="text" value={(d.country as string) || ""} onChange={(e) => updateStepData(1, { country: e.target.value })}
                placeholder="India"
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">State</label>
              <input type="text" value={(d.state as string) || ""} onChange={(e) => updateStepData(1, { state: e.target.value })}
                placeholder="Karnataka"
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">City</label>
              <input type="text" value={(d.city as string) || ""} onChange={(e) => updateStepData(1, { city: e.target.value })}
                placeholder="Bengaluru"
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {CAREER_STAGES.map((s) => {
              const Icon = s.icon;
              const selected = careerStage === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStageChange(s.id)}
                  className={`btn-press relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    selected
                      ? "border-accent bg-accent-subtle shadow-sm"
                      : "border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-hover"
                  }`}
                >
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${
                    selected ? "bg-accent text-white" : "bg-bg-hover text-fg-muted"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <p className={`text-sm font-medium ${selected ? "text-accent" : "text-fg-default"}`}>{s.title}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">{s.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-fg-muted">
              {CAREER_STAGES.find((s) => s.id === careerStage)?.title} Details
            </p>
            {renderStageFields(careerStage)}
          </div>
        </div>
      );
    }

    if (step === 3) {
      const d = data[3] || { skills: [] as Array<{ name: string }> };
      const skills = (d.skills as Array<{ name: string }>) || [];
      const stageSuggestions: Record<CareerStage, string[]> = {
        student: ["Python", "JavaScript", "C++", "Java", "Data Structures", "Algorithms", "Machine Learning", "React", "Node.js", "SQL", "Git", "HTML", "CSS", "TypeScript"],
        fresher: ["Python", "JavaScript", "Java", "React", "Node.js", "SQL", "Git", "Docker", "AWS", "TypeScript", "Data Structures", "Algorithms"],
        professional: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "System Design", "Go", "Rust", "GraphQL", "Kafka"],
        switcher: ["Python", "JavaScript", "HTML", "CSS", "SQL", "Git", "React", "Node.js", "Problem Solving", "Communication"],
      };
      return <StageTagInput label="Skills" optional={false} items={skills.map((s: {name: string}) => s.name)} onChange={(names) => updateStepData(3, { skills: names.map((n: string) => ({ name: n })) })} placeholder="Type a skill and press Enter" suggestions={stageSuggestions[careerStage]} />;
    }

    if (step === 4) {
      const d = data[4] || { interests: [] as Array<{ name: string }>, goals: [] as Array<{ title: string; target_role: string; target_company: string; category: string }> };
      const interests = (d.interests as Array<{ name: string }>) || [];
      const goals = (d.goals as Array<{ title: string; target_role: string; target_company: string; category: string }>) || [];
      return (
        <div className="space-y-6">
          <StageTagInput label="Interests" optional={false} items={interests.map((i: {name: string}) => i.name)} onChange={(names) => updateStepData(4, { interests: names.map((n: string) => ({ name: n })) })} placeholder="Type an interest and press Enter" suggestions={["AI", "Cybersecurity", "Cloud", "Backend", "Frontend", "Data Science", "Mobile", "Blockchain", "UI/UX", "Open Source", "Startups", "DevOps", "Machine Learning", "AR/VR", "Game Development", "IoT"]} />

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-fg-muted">Goals</p>
            {goals.map((g: {title: string; target_role: string; target_company: string; category: string}, i: number) => (
              <div key={i} className="relative mb-3 rounded-lg border border-border bg-bg-surface p-4">
                <button onClick={() => {
                  const updated = [...goals];
                  updated.splice(i, 1);
                  updateStepData(4, { goals: updated });
                }} className="absolute right-2 top-2 text-fg-subtle hover:text-danger"><X size={14} /></button>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Goal title" value={g.title ?? ""} onChange={(e) => {
                    const updated = [...goals];
                    updated[i] = { ...updated[i], title: e.target.value };
                    updateStepData(4, { goals: updated });
                  }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
                  <input type="text" placeholder="Target role" value={g.target_role ?? ""} onChange={(e) => {
                    const updated = [...goals];
                    updated[i] = { ...updated[i], target_role: e.target.value };
                    updateStepData(4, { goals: updated });
                  }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
                  <input type="text" placeholder="Target company" value={g.target_company ?? ""} onChange={(e) => {
                    const updated = [...goals];
                    updated[i] = { ...updated[i], target_company: e.target.value };
                    updateStepData(4, { goals: updated });
                  }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
                  <select value={g.category ?? "career"} onChange={(e) => {
                    const updated = [...goals];
                    updated[i] = { ...updated[i], category: e.target.value };
                    updateStepData(4, { goals: updated });
                  }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50">
                    <option value="career">Career</option>
                    <option value="learning">Learning</option>
                    <option value="skill">Skill</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>
              </div>
            ))}
            <button onClick={() => {
              updateStepData(4, { goals: [...goals, { title: "", target_role: "", target_company: "", category: "career" }] });
            }} className="btn-press flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-fg-muted transition-all hover:border-accent/40 hover:text-accent">
              <Plus size={16} /> Add Goal
            </button>
          </div>
        </div>
      );
    }

    if (step === 5) {
      const d = data[5] || { connected: {} as Record<string, boolean>, providers: [] as string[] };
      const connected = (d.connected as Record<string, boolean>) || {};
      return (
        <div className="space-y-4">
          <p className="text-sm text-fg-muted">Connect your accounts to unlock AI-powered insights and automatic data syncing.</p>
          <div className="space-y-3">
              {[
                { id: "github", label: "GitHub", desc: "Sync repos, contributions, and code activity" },
                { id: "linkedin", label: "LinkedIn", desc: "Import profile, experience, and recommendations" },
              ].map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-fg-default">{p.label}</p>
                  <p className="text-xs text-fg-muted">{p.desc}</p>
                </div>
                {connected[p.id] ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-success"><Check size={14} /> Connected</span>
                ) : (
                  <a href={`/api/auth/${p.id}/login`}
                    className="btn-press rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover">
                    Connect
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step === 6) {
      const d = data[6] || {};
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">AI Tone</label>
            <div className="grid grid-cols-3 gap-3">
              {["professional", "friendly", "motivational"].map((t) => (
                <button key={t} onClick={() => updateStepData(6, { ai_tone: t })}
                  className={`btn-press rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    (d.ai_tone as string || "professional") === t ? "border-accent bg-accent-subtle text-accent" : "border-border bg-bg-surface text-fg-muted hover:border-accent/40"
                  }`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">Reminder Frequency</label>
            <div className="grid grid-cols-3 gap-3">
              {[["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"]].map(([val, label]) => (
                <button key={val} onClick={() => updateStepData(6, { reminder_freq: val })}
                  className={`btn-press rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    (d.reminder_freq as string || "weekly") === val ? "border-accent bg-accent-subtle text-accent" : "border-border bg-bg-surface text-fg-muted hover:border-accent/40"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {[
            { key: "weekly_reports", label: "Weekly AI Reports", desc: "Get weekly career insights and progress reports" },
            { key: "roadmap_gen", label: "Auto Roadmap Generation", desc: "AI generates personalized learning roadmaps" },
            { key: "daily_motivation", label: "Daily Motivation", desc: "Receive daily career tips and motivational quotes" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border border-border bg-bg-surface px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={!!(d[key] ?? true)} onChange={(e) => updateStepData(6, { [key]: e.target.checked })}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent-ring" />
              <div>
                <p className="text-sm font-medium text-fg-default">{label}</p>
                <p className="text-xs text-fg-muted">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-default">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <span className="font-serif text-lg font-medium text-fg-default">Career OS</span>
        </div>
        {step > 0 && step <= TOTAL_STEPS && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-fg-muted">Step {step} of {TOTAL_STEPS}</span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-bg-hover">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step > 0 && step <= TOTAL_STEPS && (
              <motion.div key="step-header" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
                <h2 className="font-serif text-2xl font-medium text-fg-default">{STEP_LABELS[step].label}</h2>
                <p className="mt-1 text-sm text-fg-muted">{STEP_LABELS[step].subtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 rounded-lg border border-danger/20 bg-danger-subtle px-3 py-2 text-xs text-danger">{error}</p>
          )}

          {step > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep((s) => Math.max(s - 1, 0))}
                className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg-muted transition-all hover:border-accent/40 hover:text-fg-default">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => saveStep(true)}
                disabled={saving}
                className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {step >= TOTAL_STEPS ? "Finish Setup" : "Continue"}
                {!saving && <ArrowRight size={16} />}
              </button>
            </div>
          )}
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
