"use client";

import { useEffect, useState, useCallback, useRef, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Save, RotateCcw, Download, Eye, User,
  GraduationCap, Briefcase, Code2, Wand2, Award, Trophy, Globe, BookOpen,
  ChevronRight, History,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ResumePreview } from "./components/ResumePreview";
import { ResumeHealth } from "./components/ResumeHealth";
import { ATSPanel } from "./components/ATSPanel";
import { AIAssistant } from "./components/AIAssistant";
import { SkillTags } from "./components/SkillTags";
import { ExperienceEditor } from "./components/ExperienceEditor";
import { CoverLetterPanel } from "./components/CoverLetterPanel";
import type { ResumeData, Education, Project, Certificate, Language, VersionInfo } from "./types";
import { RESUME_SECTIONS, TONES } from "./types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const emptyResume: ResumeData = {
  id: 0, full_name: "", email: "", phone: "", location: "", summary: "", title: "",
  website: "", linkedin: "", github: "", portfolio: "",
  experience: [], education: [], projects: [], skills: [],
  certificates: [], achievements: [], languages: [], publications: [],
  tone: "professional", target_job_description: "",
  created_at: null, updated_at: null,
};

export default function ResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const { addToast } = useToast();
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadResume = useCallback(async () => {
    try {
      const data = await apiFetch("/api/resume");
      if (data.resume) {
        setResume({
          ...emptyResume,
          ...data.resume,
          experience: (data.resume.experience || []).map((e: Record<string, unknown>) => ({
            company: "", role: "", start: "", end: "", ...e,
            bullets: Array.isArray(e.bullets) ? e.bullets : (typeof e.bullets === "string" ? e.bullets.split("\n") : [""]),
            technologies: Array.isArray(e.technologies) ? e.technologies : [],
          })),
          education: (data.resume.education || []).map((e: Record<string, unknown>) => ({
            school: "", degree: "", field: "", start: "", end: "", gpa: "", ...e,
          })),
          projects: (data.resume.projects || []).map((p: Record<string, unknown>) => ({
            name: "", description: "", url: "", github: "", ...p,
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
          })),
          certificates: (data.resume.certificates || []).map((c: Record<string, unknown>) => ({
            name: "", issuer: "", date: "", url: "", ...c,
          })),
          languages: (data.resume.languages || []).map((l: Record<string, unknown>) => ({
            name: "", level: "Intermediate", ...l,
          })),
          achievements: (data.resume.achievements || []).map((a: unknown) => (typeof a === "string" ? a : "")),
          publications: (data.resume.publications || []).map((p: unknown) => (typeof p === "string" ? p : "")),
          skills: data.resume.skills || [],
          target_job_description: data.resume.target_job_description || "",
        });
        if (data.resume.target_job_description) setJobDescription(data.resume.target_job_description);
      } else {
        setResume({ ...emptyResume });
      }
    } catch {
      addToast("error", "Failed to load resume");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const saveResume = useCallback(async (showToast = true) => {
    if (!resume) return;
    setSaving(true);
    try {
      await apiFetch("/api/resume", { method: "POST", body: JSON.stringify(resume) });
      if (showToast) addToast("success", "Resume saved");
    } catch {
      if (showToast) addToast("error", "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [resume, addToast]);

  // Autosave with debounce
  useEffect(() => {
    if (!resume || resume.id === 0) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveResume(false), 2000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [resume, saveResume]);

  useEffect(() => { startTransition(() => { loadResume(); }); }, [loadResume]);

  const updateResume = (field: keyof ResumeData, value: unknown) => {
    setResume((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleAtsScore = async () => {
    if (!jobDescription.trim()) { addToast("error", "Paste a job description first"); return; }
    setAtsLoading(true);
    try {
      const result = await apiFetch("/api/resume/ats-score", { method: "POST", body: JSON.stringify({ job_description: jobDescription }) });
      setAtsResult(result);
    } catch {
      addToast("error", "ATS scoring failed");
    } finally {
      setAtsLoading(false);
    }
  };

  const handleAIOptimizeSkills = async () => {
    if (!resume) return;
    setAiLoading(true);
    try {
      const data = await apiFetch("/api/resume/ai/improve-summary", {
        method: "POST",
        body: JSON.stringify({ summary: (resume.skills || []).join(", "), tone: resume.tone, skills: resume.skills || [] }),
      });
      const suggested = data.result.split(",").map((s: string) => s.trim()).filter(Boolean);
      const merged = [...new Set([...(resume.skills || []), ...suggested])];
      updateResume("skills", merged);
      addToast("success", `AI suggested ${suggested.length} skills`);
    } catch {
      addToast("error", "AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const data = await apiFetch("/api/resume/versions");
      setVersions(data.versions || []);
      setShowVersions(true);
    } catch {
      addToast("error", "Failed to load versions");
    }
  };

  const restoreVersion = async (versionId: number) => {
    try {
      const data = await apiFetch(`/api/resume/versions/${versionId}/restore`, { method: "POST" });
      setResume(data.resume);
      addToast("success", "Version restored");
      setShowVersions(false);
    } catch {
      addToast("error", "Failed to restore version");
    }
  };

  const activeContent = () => {
    if (!resume) return null;
    switch (activeSection) {
      case "personal":
        return <PersonalEditor resume={resume} onChange={updateResume} />;
      case "summary":
        return <SummaryEditor resume={resume} onChange={updateResume} />;
      case "education":
        return <EducationEditor education={resume.education || []} onChange={(v) => updateResume("education", v)} />;
      case "experience":
        return <ExperienceEditor experiences={resume.experience || []} onChange={(v) => updateResume("experience", v)} />;
      case "projects":
        return <ProjectsEditor projects={resume.projects || []} onChange={(v) => updateResume("projects", v)} />;
      case "skills":
        return (
          <SkillTags
            skills={resume.skills || []}
            onChange={(v) => updateResume("skills", v)}
            onAIOptimize={handleAIOptimizeSkills}
            aiLoading={aiLoading}
          />
        );
      case "certificates":
        return <CertificatesEditor certificates={resume.certificates || []} onChange={(v) => updateResume("certificates", v)} />;
      case "achievements":
        return <AchievementsEditor achievements={resume.achievements || []} onChange={(v) => updateResume("achievements", v)} />;
      case "languages":
        return <LanguagesEditor languages={resume.languages || []} onChange={(v) => updateResume("languages", v)} />;
      case "publications":
        return <PublicationsEditor publications={resume.publications || []} onChange={(v) => updateResume("publications", v)} />;
      default:
        return null;
    }
  };

  const sectionIcons: Record<string, React.ReactNode> = {
    personal: <User size={14} />, summary: <FileText size={14} />,
    education: <GraduationCap size={14} />, experience: <Briefcase size={14} />,
    projects: <Code2 size={14} />, skills: <Wand2 size={14} />,
    certificates: <Award size={14} />, achievements: <Trophy size={14} />,
    languages: <Globe size={14} />, publications: <BookOpen size={14} />,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex gap-6">
          <div className="w-52 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-9 shimmer rounded-lg" />)}
          </div>
          <div className="flex-1 space-y-3">
            <div className="h-10 shimmer rounded-lg" />
            <div className="h-64 shimmer rounded-xl" />
          </div>
          <div className="w-80 space-y-4">
            <div className="h-48 shimmer rounded-xl" />
            <div className="h-64 shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      className="mx-auto max-w-7xl p-4 sm:p-6"
    >
      {/* Top bar */}
      <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-accent" />
          <h1 className="font-serif text-2xl font-medium tracking-tight text-fg-default">Resume Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<History size={13} />} onClick={loadVersions}>History</Button>
          <Button variant="ghost" size="sm" icon={<FileText size={13} />} onClick={() => setShowCoverLetter(!showCoverLetter)}>
            {showCoverLetter ? "Close Letter" : "Cover Letter"}
          </Button>
          <a href="/api/resume/export" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>Export PDF</Button>
          </a>
          <Button size="sm" icon={<Save size={13} />} onClick={() => saveResume(true)} loading={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-4 lg:gap-6">
        {/* Left sidebar - sections */}
        <motion.div variants={fadeUp} className="hidden w-44 shrink-0 md:block">
          <div className="space-y-1">
            {RESUME_SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all duration-150 ${
                  activeSection === s.key
                    ? "bg-accent text-white font-medium"
                    : "text-fg-muted hover:bg-bg-hover hover:text-fg-default"
                }`}
              >
                {sectionIcons[s.key]}
                <span>{s.label}</span>
                {activeSection === s.key && <ChevronRight size={12} className="ml-auto" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Center - editor */}
        <motion.div variants={fadeUp} className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-bg-surface p-4 sm:p-5">
            {/* Mobile section selector */}
            <div className="mb-4 md:hidden">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="field"
              >
                {RESUME_SECTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            {activeContent()}

            {/* AI Assistant */}
            {resume && ["summary", "experience", "skills"].includes(activeSection) && (
              <div className="mt-4">
                <AIAssistant
                  context={resume.summary || ""}
                  tone={resume.tone || "professional"}
                  skills={resume.skills || []}
                  onResult={(text) => {
                    if (activeSection === "summary") updateResume("summary", text);
                  }}
                />
              </div>
            )}
          </div>

          {/* Cover letter panel */}
          <AnimatePresence>
            {showCoverLetter && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4"
              >
                <CoverLetterPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right panel - preview + ATS */}
        <motion.div variants={fadeUp} className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-24 space-y-4">
            {/* Resume Health */}
            <ResumeHealth resume={resume} />

            {/* ATS Panel */}
            <ATSPanel
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              atsResult={atsResult}
              loading={atsLoading}
              onScore={handleAtsScore}
            />
          </div>
        </motion.div>
      </div>

      {/* Version history modal */}
      <AnimatePresence>
        {showVersions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-xl border border-border bg-bg-surface p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Version History</h2>
                <button onClick={() => setShowVersions(false)} className="text-xs text-fg-muted hover:text-fg-default">Close</button>
              </div>
              {versions.length === 0 ? (
                <p className="py-6 text-center text-sm text-fg-muted">No versions yet. Save your resume to create versions.</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3 transition-all duration-150 hover:border-accent/30">
                      <div>
                        <p className="text-sm font-medium text-fg-default">{v.version_name}</p>
                        <p className="text-xs text-fg-muted">{v.created_at ? new Date(v.created_at).toLocaleString() : ""}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => restoreVersion(v.id)} icon={<RotateCcw size={11} />}>Restore</Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live preview modal for smaller screens */}
      <AnimatePresence>
        {resume && !showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-40 xl:hidden"
          >
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white shadow-lg transition-all duration-150 hover:bg-accent/90 active:scale-95"
            >
              <Eye size={14} /> Preview
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview drawer - mobile/tablet */}
      <AnimatePresence>
        {resume && showPreview && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-bg-default p-4 shadow-xl xl:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Live Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-xs text-fg-muted hover:text-fg-default">Close</button>
            </div>
            <ResumePreview resume={resume} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Inline section editors ──────────────────────────────

function PersonalEditor({ resume, onChange }: { resume: ResumeData; onChange: (f: keyof ResumeData, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Personal Information</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Full Name</label>
          <input value={resume.full_name ?? ""} onChange={(e) => onChange("full_name", e.target.value)} placeholder="John Doe" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Title</label>
          <input value={resume.title ?? ""} onChange={(e) => onChange("title", e.target.value)} placeholder="Software Engineer" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Email</label>
          <input value={resume.email ?? ""} onChange={(e) => onChange("email", e.target.value)} placeholder="john@example.com" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Phone</label>
          <input value={resume.phone ?? ""} onChange={(e) => onChange("phone", e.target.value)} placeholder="+1 234 567 890" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Location</label>
          <input value={resume.location ?? ""} onChange={(e) => onChange("location", e.target.value)} placeholder="San Francisco, CA" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Website</label>
          <input value={resume.website ?? ""} onChange={(e) => onChange("website", e.target.value)} placeholder="https://johndoe.com" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">LinkedIn</label>
          <input value={resume.linkedin ?? ""} onChange={(e) => onChange("linkedin", e.target.value)} placeholder="https://linkedin.com/in/johndoe" className="field" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">GitHub</label>
          <input value={resume.github ?? ""} onChange={(e) => onChange("github", e.target.value)} placeholder="https://github.com/johndoe" className="field" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Portfolio</label>
          <input value={resume.portfolio ?? ""} onChange={(e) => onChange("portfolio", e.target.value)} placeholder="https://johndoe.dev" className="field" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Resume Tone</label>
          <select value={resume.tone ?? "professional"} onChange={(e) => onChange("tone", e.target.value)} className="field">
            {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function SummaryEditor({ resume, onChange }: { resume: ResumeData; onChange: (f: keyof ResumeData, v: unknown) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Professional Summary</h2>
      </div>
      <textarea
        value={resume.summary ?? ""}
        onChange={(e) => onChange("summary", e.target.value)}
        placeholder="Write a compelling professional summary..."
        rows={6}
        className="field w-full resize-y"
      />
      <p className="text-[10px] text-fg-subtle">
        {resume.summary?.length || 0} characters. Aim for 100-200 characters for best ATS results.
      </p>
    </div>
  );
}

function EducationEditor({ education, onChange }: { education: Education[]; onChange: (v: Education[]) => void }) {
  const add = () => onChange([...education, { school: "", degree: "", field: "", start: "", end: "", gpa: "" }]);
  const update = (i: number, field: keyof Education, value: string) => {
    const next = [...education];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i: number) => onChange(education.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Education</h2>
        <button onClick={add} className="text-[11px] text-accent hover:text-accent/80">+ Add</button>
      </div>
      {education.map((edu, i) => (
        <div key={i} className="rounded-lg border border-border bg-bg-default p-3 transition-all duration-150 hover:border-accent/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-fg-subtle">#{i + 1}</span>
            <button onClick={() => remove(i)} className="text-[11px] text-fg-muted hover:text-danger">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={edu.school ?? ""} onChange={(e) => update(i, "school", e.target.value)} placeholder="School" className="field" />
            <input value={edu.degree ?? ""} onChange={(e) => update(i, "degree", e.target.value)} placeholder="Degree" className="field" />
            <input value={edu.field ?? ""} onChange={(e) => update(i, "field", e.target.value)} placeholder="Field of study" className="field" />
            <div className="flex gap-2">
              <input value={edu.start ?? ""} onChange={(e) => update(i, "start", e.target.value)} placeholder="Start" className="field" />
              <input value={edu.end ?? ""} onChange={(e) => update(i, "end", e.target.value)} placeholder="End" className="field" />
            </div>
            <input value={edu.gpa ?? ""} onChange={(e) => update(i, "gpa", e.target.value)} placeholder="GPA (optional)" className="field" />
          </div>
        </div>
      ))}
      {education.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No education added yet</p>
        </div>
      )}
    </div>
  );
}

function ProjectsEditor({ projects, onChange }: { projects: Project[]; onChange: (v: Project[]) => void }) {
  const add = () => onChange([...projects, { name: "", description: "", technologies: [], url: "", github: "" }]);
  const update = (i: number, field: keyof Project, value: unknown) => {
    const next = [...projects];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i: number) => onChange(projects.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Projects</h2>
        <button onClick={add} className="text-[11px] text-accent hover:text-accent/80">+ Add</button>
      </div>
      {projects.map((proj, i) => (
        <div key={i} className="rounded-lg border border-border bg-bg-default p-3 transition-all duration-150 hover:border-accent/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-fg-subtle">#{i + 1}</span>
            <button onClick={() => remove(i)} className="text-[11px] text-fg-muted hover:text-danger">Remove</button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <input value={proj.name ?? ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="Project name" className="field" />
            <textarea value={proj.description ?? ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description..." rows={2} className="field resize-none" />
            <input value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : ""} onChange={(e) => update(i, "technologies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Technologies (comma separated)" className="field" />
            <div className="grid grid-cols-2 gap-2">
              <input value={proj.url ?? ""} onChange={(e) => update(i, "url", e.target.value)} placeholder="Live URL" className="field" />
              <input value={proj.github ?? ""} onChange={(e) => update(i, "github", e.target.value)} placeholder="GitHub URL" className="field" />
            </div>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No projects added yet</p>
        </div>
      )}
    </div>
  );
}

function CertificatesEditor({ certificates, onChange }: { certificates: Certificate[]; onChange: (v: Certificate[]) => void }) {
  const add = () => onChange([...certificates, { name: "", issuer: "", date: "", url: "" }]);
  const update = (i: number, field: keyof Certificate, value: string) => {
    const next = [...certificates];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i: number) => onChange(certificates.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Certificates</h2>
        <button onClick={add} className="text-[11px] text-accent hover:text-accent/80">+ Add</button>
      </div>
      {certificates.map((cert, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-bg-default p-3 transition-all duration-150 hover:border-accent/20">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <input value={cert.name ?? ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="Certificate name" className="field" />
            <input value={cert.issuer ?? ""} onChange={(e) => update(i, "issuer", e.target.value)} placeholder="Issuer" className="field" />
            <input value={cert.date ?? ""} onChange={(e) => update(i, "date", e.target.value)} placeholder="Date" className="field" />
            <input value={cert.url ?? ""} onChange={(e) => update(i, "url", e.target.value)} placeholder="URL (optional)" className="field" />
          </div>
          <button onClick={() => remove(i)} className="text-fg-muted hover:text-danger"><span className="text-xs">✕</span></button>
        </div>
      ))}
      {certificates.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No certificates added yet</p>
        </div>
      )}
    </div>
  );
}

function AchievementsEditor({ achievements, onChange }: { achievements: string[]; onChange: (v: string[]) => void }) {
  const add = () => onChange([...achievements, ""]);
  const update = (i: number, value: string) => {
    const next = [...achievements];
    next[i] = value;
    onChange(next);
  };
  const remove = (i: number) => onChange(achievements.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Achievements</h2>
        <button onClick={add} className="text-[11px] text-accent hover:text-accent/80">+ Add</button>
      </div>
      {achievements.map((a, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 text-accent">•</span>
          <textarea value={a} onChange={(e) => update(i, e.target.value)} placeholder="Describe your achievement..." rows={2} className="field flex-1 resize-none" />
          <button onClick={() => remove(i)} className="mt-1.5 text-fg-muted hover:text-danger"><span className="text-xs">✕</span></button>
        </div>
      ))}
      {achievements.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No achievements added yet</p>
        </div>
      )}
    </div>
  );
}

function LanguagesEditor({ languages, onChange }: { languages: Language[]; onChange: (v: Language[]) => void }) {
  const add = () => onChange([...languages, { name: "", level: "Intermediate" }]);
  const update = (i: number, field: keyof Language, value: string) => {
    const next = [...languages];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i: number) => onChange(languages.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Languages</h2>
        <button onClick={add} className="text-[11px] text-accent hover:text-accent/80">+ Add</button>
      </div>
      {languages.map((lang, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={lang.name ?? ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="Language" className="field flex-1" />
          <select value={lang.level ?? "Intermediate"} onChange={(e) => update(i, "level", e.target.value)} className="field w-32">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Native">Native</option>
          </select>
          <button onClick={() => remove(i)} className="text-fg-muted hover:text-danger"><span className="text-xs">✕</span></button>
        </div>
      ))}
      {languages.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No languages added yet</p>
        </div>
      )}
    </div>
  );
}

function PublicationsEditor({ publications, onChange }: { publications: string[]; onChange: (v: string[]) => void }) {
  const add = () => onChange([...publications, ""]);
  const update = (i: number, value: string) => {
    const next = [...publications];
    next[i] = value;
    onChange(next);
  };
  const remove = (i: number) => onChange(publications.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Publications</h2>
        <button onClick={add} className="text-[11px] text-accent hover:text-accent/80">+ Add</button>
      </div>
      {publications.map((pub, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea value={pub} onChange={(e) => update(i, e.target.value)} placeholder="Publication details..." rows={2} className="field flex-1 resize-none" />
          <button onClick={() => remove(i)} className="mt-1.5 text-fg-muted hover:text-danger"><span className="text-xs">✕</span></button>
        </div>
      ))}
      {publications.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No publications added yet</p>
        </div>
      )}
    </div>
  );
}
