"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Plus, MapPin, Users, MoreHorizontal, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { listJobPosts, deleteJobPost } from "../api";
import type { JobPostItem } from "../types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => listJobPosts().then((d) => setJobs(d.jobs)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job post?")) return;
    await deleteJobPost(id);
    load();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-bg-hover" />
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-4xl space-y-6 p-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-fg-default">Job Posts</h1>
          <p className="mt-1 text-sm text-fg-muted">Manage your job listings.</p>
        </div>
        <Link href="/recruiter/jobs/new" className="btn-press flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
          <Plus size={16} /> New Job
        </Link>
      </motion.div>

      {jobs.length === 0 ? (
        <motion.div variants={fadeUp} className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Briefcase size={32} className="mx-auto text-fg-subtle" />
            <p className="mt-3 font-medium text-fg-default">No job posts yet</p>
            <p className="mt-1 text-sm text-fg-muted">Create your first job listing to start attracting candidates.</p>
            <Link href="/recruiter/jobs/new" className="btn-press mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
              <Plus size={16} /> Create Job Post
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <motion.div key={job.id} variants={fadeUp}>
              <Card hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/recruiter/jobs/${job.id}`} className="font-medium text-fg-default hover:text-accent transition-colors">{job.title}</Link>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${job.status === "active" ? "bg-success/10 text-success" : "bg-bg-hover text-fg-muted"}`}>{job.status}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                      {job.location && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
                      {job.employment_type && <span>{job.employment_type}</span>}
                      {job.salary_min && <span>${job.salary_min.toLocaleString()} - ${(job.salary_max || 0).toLocaleString()}</span>}
                      {job.is_remote && <span className="text-accent">Remote</span>}
                      <span className="flex items-center gap-1"><Users size={12} /> {job.candidate_count} candidates</span>
                    </div>
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.skills_required.slice(0, 5).map((s) => <span key={s} className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{s}</span>)}
                        {job.skills_required.length > 5 && <span className="font-mono text-[10px] text-fg-subtle">+{job.skills_required.length - 5}</span>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(job.id)} className="btn-press shrink-0 rounded-lg p-1.5 text-fg-subtle hover:bg-danger/5 hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
