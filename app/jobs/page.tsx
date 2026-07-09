"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Briefcase, SendHorizontal, X, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ApplicationStats } from "./components/ApplicationStats";
import { KanbanColumn } from "./components/KanbanColumn";
import { ApplicationCard } from "./components/ApplicationCard";
import { AISuggestions } from "./components/AISuggestions";
import { QuickActions } from "./components/QuickActions";
import { EmptyState } from "./components/EmptyState";
import type { Job, DashboardSummary, Status } from "./types";
import { STATUSES, STATUS_LABELS, STATUS_COLORS } from "./types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

interface FormData {
  company: string;
  role: string;
  status: string;
  salary: string;
  deadline: string;
  job_link: string;
  priority: string;
  next_action: string;
  resume_version: string;
  location: string;
}

const defaultForm: FormData = {
  company: "", role: "", status: "applied", salary: "", deadline: "",
  job_link: "", priority: "medium", next_action: "", resume_version: "", location: "",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestionsKey, setSuggestionsKey] = useState(0);
  const [activeDragJob, setActiveDragJob] = useState<Job | null>(null);

  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadJobs = useCallback(async () => {
    try {
      const [jobsData, summaryData] = await Promise.all([
        apiFetch("/api/jobs"),
        apiFetch("/api/users/dashboard-summary"),
      ]);
      setJobs((jobsData.jobs || []) as Job[]);
      setSummary(summaryData as DashboardSummary);
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const grouped = jobs.reduce<Record<string, Job[]>>((acc, job) => {
    const s = job.status || "applied";
    if (!acc[s]) acc[s] = [];
    acc[s].push(job);
    return acc;
  }, {});

  STATUSES.forEach((s) => { if (!grouped[s]) grouped[s] = []; });

  const handleSubmit = async () => {
    if (!formData.company.trim() || !formData.role.trim()) {
      addToast("error", "Company and role are required");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...formData };
      if (editingId) {
        const updated = await apiFetch(`/api/jobs/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
        setJobs((prev) => prev.map((j) => (j.id === editingId ? updated.job as Job : j)));
        addToast("success", "Application updated");
      } else {
        await apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(body) });
        addToast("success", "Application added");
        setSuggestionsKey((k) => k + 1);
      }
      setShowForm(false);
      setFormData(defaultForm);
      setEditingId(null);
      await loadJobs();
    } catch {
      addToast("error", "Failed to save application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setFormData({
      company: job.company ?? "",
      role: job.role ?? "",
      status: job.status ?? "applied",
      salary: job.salary || "",
      deadline: job.deadline || "",
      job_link: job.job_link || "",
      priority: job.priority || "medium",
      next_action: job.next_action || "",
      resume_version: job.resume_version || "",
      location: job.location || "",
    });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/jobs/${id}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      addToast("success", "Application deleted");
      setSuggestionsKey((k) => k + 1);
    } catch {
      addToast("error", "Failed to delete application");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await apiFetch(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      setJobs((prev) => prev.map((j) => (j.id === id ? updated.job as Job : j)));
    } catch {
      addToast("error", "Failed to update status");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id.toString() === event.active.id);
    if (job) setActiveDragJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragJob(null);
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id.toString();
    const targetColumnId = over.data?.current?.type === "column" ? over.data.current.status : null;
    const overJobId = over.data?.current?.type === "job" ? over.data.current.job?.id?.toString() : null;

    let targetStatus: string | null = targetColumnId;
    if (!targetStatus && overJobId) {
      const overJob = jobs.find((j) => j.id.toString() === overJobId);
      if (overJob) targetStatus = overJob.status;
    }

    if (targetStatus && jobId !== overJobId) {
      handleStatusChange(parseInt(jobId), targetStatus);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="h-8 w-48 shimmer rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-bg-surface p-4">
              <div className="h-3 w-16 shimmer rounded-md" />
              <div className="mt-2 h-6 w-10 shimmer rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-80 w-72 rounded-xl border border-border bg-bg-surface p-3">
              <div className="h-6 w-24 shimmer rounded-md" />
              <div className="mt-3 space-y-2">
                <div className="h-28 shimmer rounded-lg" />
                <div className="h-28 shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="rounded-xl border border-danger/20 bg-danger-subtle p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-danger" />
          <p className="mt-3 text-sm font-medium text-danger">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalApplications = jobs.length;
  const jobsByStatus: Record<string, number> = {};
  STATUSES.forEach((s) => { jobsByStatus[s] = (grouped[s] || []).length; });
  const offers = jobsByStatus.offer || 0;
  const activeApplications = (jobsByStatus.applied || 0) + (jobsByStatus.oa || 0) + (jobsByStatus.interview || 0);

  if (totalApplications === 0 && !showForm) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <EmptyState onAddApplication={() => setShowForm(true)} />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto max-w-7xl space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Briefcase size={20} className="text-accent" />
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg-default">Applications</h1>
          </div>
          <p className="mt-0.5 font-sans text-sm text-fg-muted">Track your internship and job journey</p>
        </div>
        <Button onClick={() => { setFormData(defaultForm); setEditingId(null); setShowForm(!showForm); }} icon={<SendHorizontal size={14} />} size="sm">
          {showForm ? "Cancel" : "Add Application"}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp}>
        <ApplicationStats
          totalApplications={totalApplications}
          jobsByStatus={jobsByStatus}
          offers={offers}
          activeApplications={activeApplications}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <QuickActions onAddApplication={() => { setFormData(defaultForm); setEditingId(null); setShowForm(true); }} />
      </motion.div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.1, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">
                  {editingId ? "Edit Application" : "New Application"}
                </h2>
                {editingId && (
                  <button onClick={() => { setShowForm(false); setEditingId(null); setFormData(defaultForm); }} className="text-xs text-fg-muted hover:text-fg-default">Cancel</button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InputField label="Company" value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} required placeholder="e.g. Google" />
                <InputField label="Role" value={formData.role} onChange={(v) => setFormData({ ...formData, role: v })} required placeholder="e.g. SWE Intern" />
                <InputField label="Location" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} placeholder="e.g. Remote" />
                <InputField label="Salary" value={formData.salary} onChange={(v) => setFormData({ ...formData, salary: v })} placeholder="e.g. ₹12 LPA" />
                <InputField label="Deadline" value={formData.deadline} onChange={(v) => setFormData({ ...formData, deadline: v })} type="date" />
                <InputField label="Job Link" value={formData.job_link} onChange={(v) => setFormData({ ...formData, job_link: v })} placeholder="https://..." />
                <SelectField label="Status" value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })} options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))} />
                <SelectField label="Priority" value={formData.priority} onChange={(v) => setFormData({ ...formData, priority: v })} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
                <InputField label="Next Action" value={formData.next_action} onChange={(v) => setFormData({ ...formData, next_action: v })} placeholder="e.g. Online Assessment" />
                <InputField label="Resume Version" value={formData.resume_version} onChange={(v) => setFormData({ ...formData, resume_version: v })} placeholder="e.g. v3" />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                {editingId && (
                  <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setFormData(defaultForm); }}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSubmit} loading={submitting} icon={<SendHorizontal size={14} />}>
                  {submitting ? "Saving..." : editingId ? "Update" : "Add Application"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board + AI Suggestions */}
      <motion.div variants={fadeUp} className="flex gap-6">
        {/* Kanban */}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-4">
              {STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  label={STATUS_LABELS[status]}
                  color={STATUS_COLORS[status].bg}
                  jobs={grouped[status] || []}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onAddClick={() => { setFormData({ ...defaultForm, status }); setEditingId(null); setShowForm(true); }}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.25, 0.1, 0.1, 1)" }}>
              {activeDragJob ? (
                <div className="w-72 rotate-3 opacity-90">
                  <ApplicationCard job={activeDragJob} onDelete={() => {}} onStatusChange={() => {}} onEdit={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* AI Suggestions sidebar */}
        <div className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-24">
            <AISuggestions refreshKey={suggestionsKey} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, value, onChange, placeholder, type, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
        {label}{required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
