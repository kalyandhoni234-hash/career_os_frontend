"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ExternalLink, GitBranch, Globe, Upload, ArrowLeft,
  ArrowRight, Check, ChevronDown, ChevronUp, Plus, X, Loader2,
  LayoutDashboard, FileDown, Bot, BarChart3,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type Step = 1 | 2 | 3 | 4 | 5;
type Source = "resume" | "linkedin" | "github" | "portfolio" | "backup";

interface SourceDef {
  id: Source;
  label: string;
  icon: typeof FileText;
  desc: string;
}

interface ImportResult {
  record_id: string;
  normalized_data: NormalizedData;
  confidence_scores: ConfidenceScores;
}

interface NormalizedData {
  personal_info: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
  };
  skills: string[];
  experience: Entry[];
  education: Entry[];
  projects: Entry[];
}

interface Entry {
  title: string;
  organization?: string;
  description: string;
  date_range?: string;
}

interface ConfidenceScores {
  personal_info: "high" | "medium" | "low";
  skills: "high" | "medium" | "low";
  experience: "high" | "medium" | "low";
  education: "high" | "medium" | "low";
  projects: "high" | "medium" | "low";
}

const SOURCES: SourceDef[] = [
  { id: "resume", label: "Resume / CV", icon: FileText, desc: "Upload .pdf, .docx, or .txt" },
  { id: "linkedin", label: "LinkedIn", icon: ExternalLink, desc: "Paste profile content or URL" },
  { id: "github", label: "GitHub", icon: GitBranch, desc: "Import from a GitHub username" },
  { id: "portfolio", label: "Portfolio", icon: Globe, desc: "Link to your personal website" },
  { id: "backup", label: "Career OS Backup", icon: Upload, desc: "Restore from a JSON backup" },
];

const PROCESSING_STEPS = ["Extracting", "Normalizing", "Building Profile", "Running Analyses"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function confidenceTone(level: string): "accent" | "success" | "warning" | "danger" | "neutral" {
  if (level === "high") return "success";
  if (level === "medium") return "warning";
  return "danger";
}

function ExpandableEntry({ entry, index }: { entry: Entry; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-bg-raised">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-fg-default"
      >
        <span>{entry.title}{entry.organization ? ` — ${entry.organization}` : ""}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 py-2 space-y-1">
              {entry.date_range && <p className="text-[10px] text-fg-muted font-mono">{entry.date_range}</p>}
              <p className="text-[10px] text-fg-muted leading-relaxed">{entry.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIndicator({ current, step, label }: { current: Step; step: Step; label: string }) {
  const isActive = current === step;
  const isDone = current > step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
          isDone ? "bg-success text-white" : isActive ? "bg-accent text-white" : "bg-bg-hover text-fg-subtle"
        }`}
      >
        {isDone ? <Check size={10} /> : step}
      </div>
      <span
        className={`text-xs transition-colors duration-300 ${
          isActive ? "font-medium text-fg-default" : "text-fg-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function ImportHubPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [importData, setImportData] = useState<ImportResult | null>(null);
  const [editableData, setEditableData] = useState<NormalizedData | null>(null);
  const [addSkillInput, setAddSkillInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  const canProceedStep2 = useCallback(() => {
    if (!source) return false;
    switch (source) {
      case "resume": return !!fileInput;
      case "linkedin": return textInput.trim().length > 0;
      case "github": return usernameInput.trim().length > 0;
      case "portfolio": return urlInput.trim().length > 0;
      case "backup": return !!fileInput;
    }
  }, [source, fileInput, textInput, usernameInput, urlInput]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setFileInput(file);
  }, []);

  const handleSourceSelect = (s: Source) => {
    setSource(s);
    setFileInput(null);
    setTextInput("");
    setUrlInput("");
    setUsernameInput("");
    setError(null);
    setStep(2);
  };

  const handleImport = async () => {
    if (!source) return;
    setLoading(true);
    setError(null);
    try {
      let result: ImportResult;
      if (source === "resume") {
        const fd = new FormData();
        fd.append("file", fileInput!);
        const res = await fetch("/api/import/resume/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "Upload failed");
        result = await res.json();
      } else if (source === "backup") {
        const text = await fileInput!.text();
        const data = JSON.parse(text);
        result = await apiFetch("/api/import/backup", {
          method: "POST",
          body: JSON.stringify({ data }),
        });
      } else {
        const body: Record<string, string> = source === "linkedin" ? { raw_text: textInput }
          : source === "github" ? { username: usernameInput }
          : { url: urlInput };
        result = await apiFetch(`/api/import/${source}`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setImportData(result);
      setEditableData(result.normalized_data);
      setStep(3);
      runProcessing();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      addToast("error", e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const runProcessing = () => {
    setProcessing(true);
    setProcessingIndex(0);
    const interval = setInterval(() => {
      setProcessingIndex((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setProcessing(false);
            setStep(4);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const addSkill = () => {
    const s = addSkillInput.trim();
    if (!s || !editableData) return;
    setEditableData((prev) => prev ? { ...prev, skills: [...prev.skills, s] } : prev);
    setAddSkillInput("");
  };

  const removeSkill = (idx: number) => {
    setEditableData((prev) => prev ? { ...prev, skills: prev.skills.filter((_, i) => i !== idx) } : prev);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/import/${importData?.record_id}/confirm`, {
        method: "PUT",
        body: JSON.stringify({ normalized_data: editableData }),
      });
      setStep(5);
      addToast("success", "Career data imported successfully!");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = (key: string, value: string) => {
    setEditableData((prev) => prev ? {
      ...prev,
      personal_info: { ...prev.personal_info, [key]: value },
    } : prev);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Step indicator bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-center gap-1 sm:gap-4"
      >
        {[
          { step: 1 as Step, label: "Source" },
          { step: 2 as Step, label: "Connect" },
          { step: 3 as Step, label: "Process" },
          { step: 4 as Step, label: "Review" },
          { step: 5 as Step, label: "Done" },
        ].map((s) => (
          <StepIndicator key={s.step} current={step} step={s.step} label={s.label} />
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Choose Source ── */}
        {step === 1 && (
          <motion.div key="step1" initial="hidden" animate="show" exit="exit" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-fg-default">
                Import Your Career Data
              </h1>
              <p className="mt-1.5 text-sm text-fg-muted">
                Choose a source to import your professional information
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SOURCES.map((s) => {
                const Icon = s.icon;
                return (
                  <Card
                    key={s.id}
                    hover
                    onClick={() => handleSourceSelect(s.id)}
                    className={`flex cursor-pointer flex-col items-center gap-3 p-6 text-center transition-all duration-200 ${
                      source === s.id ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-default" : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle">
                      <Icon size={24} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-fg-default">{s.label}</p>
                      <p className="mt-0.5 text-[10px] text-fg-muted">{s.desc}</p>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 2: Upload / Connect ── */}
        {step === 2 && (
          <motion.div key="step2" initial="hidden" animate="show" exit="exit" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6">
              <button
                onClick={() => setStep(1)}
                className="mb-4 flex items-center gap-1 text-xs text-fg-muted transition-colors hover:text-fg-default"
              >
                <ArrowLeft size={14} /> Back to sources
              </button>
              <h2 className="text-lg font-semibold text-fg-default">
                {SOURCES.find((s) => s.id === source)?.label}
              </h2>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="p-6">
                {source === "resume" && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all duration-200 ${
                      dragOver ? "border-accent bg-accent-subtle" : "border-border hover:border-accent/50 hover:bg-bg-raised"
                    }`}
                  >
                    <Upload size={32} className={dragOver ? "text-accent" : "text-fg-subtle"} />
                    <div className="text-center">
                      <p className="text-sm font-medium text-fg-default">
                        {fileInput ? fileInput.name : "Drop your resume here or click to browse"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-fg-muted">Supports .pdf, .docx, .txt</p>
                    </div>
                    {fileInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setFileInput(null); }}
                        className="text-danger"
                      >
                        <X size={12} /> Remove
                      </Button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) setFileInput(f); }}
                    />
                  </div>
                )}

                {source === "linkedin" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-fg-muted">
                      Paste LinkedIn profile content or URL
                    </label>
                    <textarea
                      className="field min-h-[160px] resize-y"
                      placeholder="Paste your LinkedIn profile URL or copy-paste the text content here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  </div>
                )}

                {source === "github" && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        label="GitHub Username"
                        placeholder="e.g. janedoe"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleImport}
                      disabled={!usernameInput.trim()}
                    >
                      Fetch
                    </Button>
                  </div>
                )}

                {source === "portfolio" && (
                  <Input
                    label="Portfolio URL"
                    placeholder="https://janedoe.dev"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                )}

                {source === "backup" && (
                  <div
                    onClick={() => backupRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-10 transition-all duration-200 hover:border-accent/50 hover:bg-bg-raised"
                  >
                    <Upload size={32} className="text-fg-subtle" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-fg-default">
                        {fileInput ? fileInput.name : "Upload JSON backup file"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-fg-muted">.json format from Career OS export</p>
                    </div>
                    {fileInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setFileInput(null); }}
                        className="text-danger"
                      >
                        <X size={12} /> Remove
                      </Button>
                    )}
                    <input
                      ref={backupRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) setFileInput(f); }}
                    />
                  </div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-xs text-danger"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleImport} disabled={!canProceedStep2()} loading={loading}>
                    {loading ? "Importing..." : "Import Data"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 3: AI Processing ── */}
        {step === 3 && (
          <motion.div key="step3" initial="hidden" animate="show" exit="exit" variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col items-center py-12">
              <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-accent/40" />
                <div className="absolute inset-2 animate-pulse-ring rounded-full border-2 border-accent/20" style={{ animationDelay: "0.5s" }} />
                <div className="absolute inset-4 rounded-full bg-accent/10" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                  {processing ? (
                    <Loader2 size={28} className="animate-spin text-white" />
                  ) : (
                    <Check size={28} className="text-white" />
                  )}
                </div>
              </div>

              <h2 className="text-lg font-semibold text-fg-default">
                AI is analyzing your data...
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                This should only take a moment
              </p>

              <div className="mt-8 w-full max-w-sm space-y-3">
                {PROCESSING_STEPS.map((label, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-all duration-300 ${
                      i < processingIndex
                        ? "border-success/30 bg-success-subtle"
                        : i === processingIndex
                          ? "border-accent/30 bg-accent-subtle"
                          : "border-border bg-bg-surface"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                        i < processingIndex
                          ? "bg-success text-white"
                          : i === processingIndex
                            ? "bg-accent text-white"
                            : "bg-bg-hover text-fg-subtle"
                      }`}
                    >
                      {i < processingIndex ? <Check size={9} /> : i + 1}
                    </div>
                    <span
                      className={`text-xs transition-colors ${
                        i <= processingIndex ? "font-medium text-fg-default" : "text-fg-muted"
                      }`}
                    >
                      {label}
                    </span>
                    {i === processingIndex && processing && (
                      <Loader2 size={10} className="ml-auto animate-spin text-accent" />
                    )}
                    {i < processingIndex && (
                      <Check size={10} className="ml-auto text-success" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-fg-muted">
                  Estimated time remaining: ~{Math.max(1, 4 - processingIndex)}s
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 4: Review & Edit ── */}
        {step === 4 && editableData && (
          <motion.div key="step4" initial="hidden" animate="show" exit="exit" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6">
              <h2 className="text-lg font-semibold text-fg-default">Review & Edit Your Data</h2>
              <p className="mt-1 text-sm text-fg-muted">
                Verify the imported information before saving
              </p>
            </motion.div>

            {/* Personal Info */}
            <motion.div variants={fadeUp}>
              <Card className="mb-4 p-5">
                <h3 className="mb-4 text-xs font-semibold text-fg-default">Personal Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "full_name", label: "Full Name" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "location", label: "Location" },
                    { key: "title", label: "Title" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="mb-1 block text-[10px] font-medium text-fg-muted">{field.label}</label>
                      <input
                        className="field"
                        value={(editableData.personal_info as any)[field.key]}
                        onChange={(e) => updatePersonalInfo(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                {importData?.confidence_scores.personal_info && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <span className="text-[10px] text-fg-muted">Confidence:</span>
                    <Badge tone={confidenceTone(importData.confidence_scores.personal_info)}>
                      {importData.confidence_scores.personal_info.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div variants={fadeUp}>
              <Card className="mb-4 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-fg-default">Skills</h3>
                  {importData?.confidence_scores.skills && (
                    <Badge tone={confidenceTone(importData.confidence_scores.skills)}>
                      {importData.confidence_scores.skills.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {editableData.skills.map((skill, idx) => (
                    <Badge key={idx} tone="accent" className="gap-1 pr-1">
                      {skill}
                      <button onClick={() => removeSkill(idx)} className="ml-0.5 text-accent/60 hover:text-danger">
                        <X size={10} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="field flex-1"
                    placeholder="Add a skill..."
                    value={addSkillInput}
                    onChange={(e) => setAddSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }}
                  />
                  <Button variant="secondary" size="sm" onClick={addSkill} disabled={!addSkillInput.trim()}>
                    <Plus size={12} /> Add
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Experience */}
            <motion.div variants={fadeUp}>
              <Card className="mb-4 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-fg-default">
                    Experience ({editableData.experience.length})
                  </h3>
                  {importData?.confidence_scores.experience && (
                    <Badge tone={confidenceTone(importData.confidence_scores.experience)}>
                      {importData.confidence_scores.experience.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {editableData.experience.length === 0 ? (
                  <p className="text-xs text-fg-muted">No experience found</p>
                ) : (
                  <div className="space-y-1.5">
                    {editableData.experience.map((entry, i) => (
                      <ExpandableEntry key={i} entry={entry} index={i} />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Education */}
            <motion.div variants={fadeUp}>
              <Card className="mb-4 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-fg-default">
                    Education ({editableData.education.length})
                  </h3>
                  {importData?.confidence_scores.education && (
                    <Badge tone={confidenceTone(importData.confidence_scores.education)}>
                      {importData.confidence_scores.education.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {editableData.education.length === 0 ? (
                  <p className="text-xs text-fg-muted">No education found</p>
                ) : (
                  <div className="space-y-1.5">
                    {editableData.education.map((entry, i) => (
                      <ExpandableEntry key={i} entry={entry} index={i} />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Projects */}
            <motion.div variants={fadeUp}>
              <Card className="mb-4 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-fg-default">
                    Projects ({editableData.projects.length})
                  </h3>
                  {importData?.confidence_scores.projects && (
                    <Badge tone={confidenceTone(importData.confidence_scores.projects)}>
                      {importData.confidence_scores.projects.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {editableData.projects.length === 0 ? (
                  <p className="text-xs text-fg-muted">No projects found</p>
                ) : (
                  <div className="space-y-1.5">
                    {editableData.projects.map((entry, i) => (
                      <ExpandableEntry key={i} entry={entry} index={i} />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeUp} className="flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={handleConfirm} loading={loading}>
                {loading ? "Saving..." : "Confirm & Save"}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 5: Celebration & Next Steps ── */}
        {step === 5 && (
          <motion.div key="step5" initial="hidden" animate="show" exit="exit" variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col items-center py-8 text-center">
              {/* Animated checkmark */}
              <div className="relative mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-success"
                  >
                    <Check size={32} className="text-white" />
                  </motion.div>
                </div>
                {/* Confetti dots */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full"
                    style={{
                      background: ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"][i],
                      left: "50%",
                      top: "50%",
                    }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos((i * 45) * (Math.PI / 180)) * 64,
                      y: Math.sin((i * 45) * (Math.PI / 180)) * 64,
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 1, 0],
                    }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                  />
                ))}
              </div>

              <h2 className="text-xl font-semibold text-fg-default">
                Your career data has been imported!
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                Everything is ready for you to explore
              </p>

              {editableData && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <div className="rounded-lg border border-border bg-bg-raised px-4 py-2 text-center">
                    <p className="text-lg font-bold font-mono text-accent">{editableData.skills.length}</p>
                    <p className="text-[10px] text-fg-muted">Skills</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-raised px-4 py-2 text-center">
                    <p className="text-lg font-bold font-mono text-accent">{editableData.experience.length}</p>
                    <p className="text-[10px] text-fg-muted">Experiences</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-raised px-4 py-2 text-center">
                    <p className="text-lg font-bold font-mono text-accent">{editableData.projects.length}</p>
                    <p className="text-[10px] text-fg-muted">Projects</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-raised px-4 py-2 text-center">
                    <p className="text-lg font-bold font-mono text-accent">{editableData.education.length}</p>
                    <p className="text-[10px] text-fg-muted">Education</p>
                  </div>
                </div>
              )}

              <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
                <Card
                  hover
                  onClick={() => router.push("/dashboard")}
                  className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center"
                >
                  <LayoutDashboard size={20} className="text-accent" />
                  <p className="text-xs font-medium text-fg-default">View Dashboard</p>
                </Card>
                <Card
                  hover
                  onClick={() => router.push("/resume")}
                  className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center"
                >
                  <FileDown size={20} className="text-accent" />
                  <p className="text-xs font-medium text-fg-default">Build Resume</p>
                </Card>
                <Card
                  hover
                  onClick={() => router.push("/coach")}
                  className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center"
                >
                  <Bot size={20} className="text-accent" />
                  <p className="text-xs font-medium text-fg-default">Explore Career Coach</p>
                </Card>
                <Card
                  hover
                  onClick={() => router.push("/analytics")}
                  className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center"
                >
                  <BarChart3 size={20} className="text-accent" />
                  <p className="text-xs font-medium text-fg-default">View Analytics</p>
                </Card>
              </div>

              <Button className="mt-6" onClick={() => router.push("/dashboard")}>
                Finish <ArrowRight size={14} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
