"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, GraduationCap,
  Briefcase, Code, Heart, Target, Link2, Sliders, User,
  X, Plus, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const TOTAL_STEPS = 8;

const STEP_CONFIG = [
  { icon: Sparkles, label: "Welcome", subtitle: "Let's set up your career OS" },
  { icon: User, label: "Basic Info", subtitle: "Tell us about yourself" },
  { icon: GraduationCap, label: "Education", subtitle: "Your academic background" },
  { icon: Briefcase, label: "Career", subtitle: "Your professional journey" },
  { icon: Code, label: "Skills", subtitle: "What you're good at" },
  { icon: Heart, label: "Interests", subtitle: "What drives you" },
  { icon: Target, label: "Goals", subtitle: "What you want to achieve" },
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

  const stepLabels = ["Welcome", "Basic Info", "Education", "Career", "Skills", "Interests", "Goals", "Connect", "AI Preferences"];
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
      setData((prev) => ({ ...prev, [s]: res.data }));
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (step >= 1 && step <= TOTAL_STEPS && !data[step]) {
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
          <h1 className="mb-2 font-serif text-3xl font-medium text-fg-default">You're all set!</h1>
          <p className="mb-8 text-sm text-fg-muted">Your profile is ready. Let's start building your career.</p>
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

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-accent-subtle">
            <Sparkles className="h-12 w-12 text-accent" />
          </div>
          <h1 className="mb-3 font-serif text-4xl font-medium text-fg-default">Welcome to Career OS</h1>
          <p className="mx-auto mb-8 max-w-md text-sm text-fg-muted">
            Let's personalize your experience. This quick setup will help us tailor recommendations, career insights, and your dashboard.
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
      const d = data[1] || {} as Record<string, string>;
      return (
        <div className="space-y-4">
          <InputField label="Full Name" value={d.full_name as string || ""} onChange={(v) => updateStepData(1, { full_name: v })} placeholder="John Doe" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Date of Birth</label>
              <input type="date" value={d.date_of_birth as string || ""} onChange={(e) => updateStepData(1, { date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Timezone</label>
              <select value={d.timezone as string || ""} onChange={(e) => updateStepData(1, { timezone: e.target.value })}
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
            <InputField label="Country" value={d.country as string || ""} onChange={(v) => updateStepData(1, { country: v })} placeholder="India" />
            <InputField label="State" value={d.state as string || ""} onChange={(v) => updateStepData(1, { state: v })} placeholder="Karnataka" />
            <InputField label="City" value={d.city as string || ""} onChange={(v) => updateStepData(1, { city: v })} placeholder="Bengaluru" />
          </div>
        </div>
      );
    }

    if (step === 2) {
      const d = data[2] || {} as Record<string, unknown>;
      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">Current Status</label>
            <div className="grid grid-cols-3 gap-3">
              {["student", "graduate", "professional"].map((s) => (
                <button key={s} onClick={() => updateStepData(2, { status: s })}
                  className={`btn-press rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    d.status === s ? "border-accent bg-accent-subtle text-accent" : "border-border bg-bg-surface text-fg-muted hover:border-accent/40"
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="College / Institution" value={d.college as string || ""} onChange={(v) => updateStepData(2, { college: v })} placeholder="MIT" />
            <InputField label="Degree" value={d.degree as string || ""} onChange={(v) => updateStepData(2, { degree: v })} placeholder="B.Tech" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Branch / Major" value={d.branch as string || ""} onChange={(v) => updateStepData(2, { branch: v })} placeholder="Computer Science" />
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Graduation Year</label>
              <input type="number" value={d.grad_year as string || ""} onChange={(e) => updateStepData(2, { grad_year: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="2026"
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
            <InputField label="CGPA" value={d.cgpa as string || ""} onChange={(v) => updateStepData(2, { cgpa: v ? parseFloat(v) : null })} placeholder="8.5" type="number" />
          </div>
          {d.status === "student" && (
            <InputField label="Current Semester" value={d.semester as string || ""} onChange={(v) => updateStepData(2, { semester: v ? parseInt(v) : null })} placeholder="6" type="number" />
          )}
        </div>
      );
    }

    if (step === 3) {
      const d = data[3] || {} as Record<string, unknown>;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Current Role / Position" value={d.current_role as string || ""} onChange={(v) => updateStepData(3, { current_role: v })} placeholder="SDE Intern" />
            <InputField label="Dream Role" value={d.dream_role as string || ""} onChange={(v) => updateStepData(3, { dream_role: v })} placeholder="Software Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Years of Experience</label>
              <input type="number" value={d.experience as string || "0"} onChange={(e) => updateStepData(3, { experience: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
            </div>
            <InputField label="Industry" value={d.industry as string || ""} onChange={(v) => updateStepData(3, { industry: v })} placeholder="Technology" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Employment Status</label>
              <select value={d.employment_status as string || ""} onChange={(e) => updateStepData(3, { employment_status: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50">
                <option value="">Select</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="self-employed">Self-employed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">Work Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {["remote", "hybrid", "onsite"].map((w) => (
                  <button key={w} onClick={() => updateStepData(3, { work_preference: w })}
                    className={`btn-press rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      d.work_preference === w ? "border-accent bg-accent-subtle text-accent" : "border-border bg-bg-surface text-fg-muted hover:border-accent/40"
                    }`}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Target Salary" value={d.salary as string || ""} onChange={(v) => updateStepData(3, { salary: v })} placeholder="$100,000" />
            <InputField label="Preferred Country" value={d.country as string || ""} onChange={(v) => updateStepData(3, { country: v })} placeholder="United States" />
          </div>
        </div>
      );
    }

    if (step === 4) {
      const d = data[4] || { skills: [] as Array<{ name: string }> };
      const skills = d.skills as Array<{ name: string }> || [];
      return <TagInput label="Skills" items={skills.map((s: {name: string}) => s.name)} onChange={(names) => updateStepData(4, { skills: names.map((n: string) => ({ name: n })) })} placeholder="Type a skill and press Enter" suggestions={["Python", "JavaScript", "React", "Node.js", "TypeScript", "AWS", "Docker", "SQL", "Machine Learning", "Data Science", "Java", "Go", "Rust", "Kubernetes", "Git", "Linux"]} />;
    }

    if (step === 5) {
      const d = data[5] || { interests: [] as Array<{ name: string }> };
      const interests = d.interests as Array<{ name: string }> || [];
      return <TagInput label="Interests" items={interests.map((i: {name: string}) => i.name)} onChange={(names) => updateStepData(5, { interests: names.map((n: string) => ({ name: n })) })} placeholder="Type an interest and press Enter" suggestions={["AI", "Cybersecurity", "Cloud", "Backend", "Frontend", "Data Science", "Mobile", "Blockchain", "UI/UX", "Open Source", "Startups", "DevOps", "Machine Learning", "AR/VR", "Game Development", "IoT", "Quantum Computing"]} />;
    }

    if (step === 6) {
      const d = data[6] || { goals: [] as Array<{ title: string; target_role: string; target_company: string; category: string }> };
      const goals = d.goals as Array<{ title: string; target_role: string; target_company: string; category: string }> || [];
      return (
        <div className="space-y-4">
          {goals.map((g: {title: string; target_role: string; target_company: string; category: string}, i: number) => (
            <div key={i} className="relative rounded-lg border border-border bg-bg-surface p-4">
              <button onClick={() => {
                const updated = [...goals];
                updated.splice(i, 1);
                updateStepData(6, { goals: updated });
              }} className="absolute right-2 top-2 text-fg-subtle hover:text-danger"><X size={14} /></button>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Goal title" value={g.title} onChange={(e) => {
                  const updated = [...goals];
                  updated[i] = { ...updated[i], title: e.target.value };
                  updateStepData(6, { goals: updated });
                }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
                <input type="text" placeholder="Target role" value={g.target_role} onChange={(e) => {
                  const updated = [...goals];
                  updated[i] = { ...updated[i], target_role: e.target.value };
                  updateStepData(6, { goals: updated });
                }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
                <input type="text" placeholder="Target company" value={g.target_company} onChange={(e) => {
                  const updated = [...goals];
                  updated[i] = { ...updated[i], target_company: e.target.value };
                  updateStepData(6, { goals: updated });
                }} className="rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
                <select value={g.category} onChange={(e) => {
                  const updated = [...goals];
                  updated[i] = { ...updated[i], category: e.target.value };
                  updateStepData(6, { goals: updated });
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
            updateStepData(6, { goals: [...goals, { title: "", target_role: "", target_company: "", category: "career" }] });
          }} className="btn-press flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-fg-muted transition-all hover:border-accent/40 hover:text-accent">
            <Plus size={16} /> Add Goal
          </button>
        </div>
      );
    }

    if (step === 7) {
      const d = data[7] || { connected: {} as Record<string, boolean>, providers: [] as string[] };
      const connected = (d.connected as Record<string, boolean>) || {};
      return (
        <div className="space-y-4">
          <p className="text-sm text-fg-muted">Connect your accounts to unlock AI-powered insights and automatic data syncing.</p>
          <div className="space-y-3">
            {[
              { id: "github", label: "GitHub", desc: "Sync repos, contributions, and code activity" },
              { id: "linkedin", label: "LinkedIn", desc: "Import profile, experience, and recommendations" },
              { id: "google", label: "Google", desc: "Calendar sync and email integration" },
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

    if (step === 8) {
      const d = data[8] || {} as Record<string, unknown>;
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">AI Tone</label>
            <div className="grid grid-cols-3 gap-3">
              {["professional", "friendly", "motivational"].map((t) => (
                <button key={t} onClick={() => updateStepData(8, { ai_tone: t })}
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
                <button key={val} onClick={() => updateStepData(8, { reminder_freq: val })}
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
              <input type="checkbox" checked={!!(d[key] ?? true)} onChange={(e) => updateStepData(8, { [key]: e.target.checked })}
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
                <h2 className="font-serif text-2xl font-medium text-fg-default">{stepLabels[step]}</h2>
                <p className="mt-1 text-sm text-fg-muted">{STEP_CONFIG[step].subtitle}</p>
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

function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-fg-muted">{label}</label>
      {type === "number" ? (
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
      )}
    </div>
  );
}

function TagInput({ label, items, onChange, placeholder, suggestions }: {
  label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string; suggestions: string[];
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
      <label className="mb-1 block text-xs font-medium text-fg-muted">{label}</label>
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
