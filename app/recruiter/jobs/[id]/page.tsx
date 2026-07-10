"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, MapPin, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getJobPost, updateJobPost, deleteJobPost } from "../../api";
import type { JobPostDetail } from "../../types";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getJobPost(parseInt(id)).then((d) => setJob(d.job)).catch(() => router.push("/recruiter/jobs")).finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    if (!job) return;
    setSaving(true);
    try {
      await updateJobPost(parseInt(id), job as unknown as Record<string, unknown>);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this job post?")) return;
    await deleteJobPost(parseInt(id));
    router.push("/recruiter/jobs");
  };

  const update = (field: string, value: unknown) => setJob((prev) => prev ? { ...prev, [field]: value } : prev);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!job) return null;

  return (
    <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/recruiter/jobs")} className="btn-press rounded-lg border border-border p-2 text-fg-muted hover:bg-bg-hover">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-fg-default">{job.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
              {job.location && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
              {job.employment_type && <span>{job.employment_type}</span>}
              {job.is_remote && <span className="text-accent">Remote</span>}
              <span className="flex items-center gap-1"><Users size={12} /> {job.candidate_count} candidates</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="btn-press rounded-lg border border-danger/20 px-3 py-2 text-xs text-danger hover:bg-danger/5">Delete</button>
          <button onClick={handleSave} disabled={saving} className="btn-press flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Title</label>
              <input value={job.title} onChange={(e) => update("title", e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Description</label>
              <textarea value={job.description} onChange={(e) => update("description", e.target.value)} rows={6} className="field resize-none" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Location</label>
                <input value={job.location ?? ""} onChange={(e) => update("location", e.target.value)} className="field" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Employment Type</label>
                <select value={job.employment_type ?? ""} onChange={(e) => update("employment_type", e.target.value)} className="field">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Min Salary</label>
                <input type="number" value={job.salary_min ?? ""} onChange={(e) => update("salary_min", e.target.value ? parseInt(e.target.value) : null)} className="field" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Max Salary</label>
                <input type="number" value={job.salary_max ?? ""} onChange={(e) => update("salary_max", e.target.value ? parseInt(e.target.value) : null)} className="field" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Status</label>
                <select value={job.status} onChange={(e) => update("status", e.target.value)} className="field">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Deadline</label>
                <input type="date" value={job.application_deadline ?? ""} onChange={(e) => update("application_deadline", e.target.value)} className="field" />
              </div>
            </div>
          </div>
        </Card>

        {job.skills_required && job.skills_required.length > 0 && (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Skills Required</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.map((s) => (
                <span key={s} className="rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent">{s}</span>
              ))}
            </div>
          </Card>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Benefits</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.benefits.map((b) => (
                <span key={b} className="rounded-full border border-success/20 bg-success/5 px-2 py-0.5 font-mono text-[10px] text-success">{b}</span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
