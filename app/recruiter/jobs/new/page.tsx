"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { createJobPost } from "../../api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function NewJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", location: "", salary_min: "", salary_max: "",
    experience_required: "", experience_max: "", employment_type: "full-time",
    skills_required: [] as string[], benefits: [] as string[],
    application_deadline: "", is_remote: false,
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills_required.includes(s)) {
      setForm((f) => ({ ...f, skills_required: [...f.skills_required, s] }));
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setForm((f) => ({ ...f, skills_required: f.skills_required.filter((x) => x !== s) }));

  const addBenefit = () => {
    const b = benefitInput.trim();
    if (b && !form.benefits.includes(b)) {
      setForm((f) => ({ ...f, benefits: [...f.benefits, b] }));
      setBenefitInput("");
    }
  };
  const removeBenefit = (b: string) => setForm((f) => ({ ...f, benefits: f.benefits.filter((x) => x !== b) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        salary_min: form.salary_min ? parseInt(form.salary_min) : undefined,
        salary_max: form.salary_max ? parseInt(form.salary_max) : undefined,
        employment_type: form.employment_type,
        skills_required: form.skills_required,
        benefits: form.benefits,
        is_remote: form.is_remote,
        experience_required: form.experience_required || undefined,
        experience_max: form.experience_max || undefined,
        application_deadline: form.application_deadline || undefined,
      };
      const res = await createJobPost(data);
      router.push(`/recruiter/jobs/${res.job_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-press rounded-lg border border-border p-2 text-fg-muted hover:bg-bg-hover">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-medium text-fg-default">Create Job Post</h1>
          <p className="text-sm text-fg-muted">List a new position to attract candidates.</p>
        </div>
      </div>

      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Job Title *</label>
                <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Backend Engineering Intern" className="field" required />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Description *</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={6} placeholder="Describe the role, responsibilities, and requirements..." className="field resize-none" required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Location</label>
                  <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. San Francisco, CA" className="field" />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Employment Type</label>
                  <select value={form.employment_type} onChange={(e) => update("employment_type", e.target.value)} className="field">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Min Salary</label>
                  <input type="number" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} placeholder="e.g. 50000" className="field" />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Max Salary</label>
                  <input type="number" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} placeholder="e.g. 120000" className="field" />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Experience Required</label>
                  <input value={form.experience_required} onChange={(e) => update("experience_required", e.target.value)} placeholder="e.g. 0-2 years" className="field" />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Application Deadline</label>
                  <input type="date" value={form.application_deadline} onChange={(e) => update("application_deadline", e.target.value)} className="field" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_remote} onChange={(e) => update("is_remote", e.target.checked)} className="rounded border-border text-accent focus:ring-accent-ring" />
                <span className="text-xs text-fg-muted">Remote position</span>
              </label>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Skills Required</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.skills_required.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent">
                  {s} <button onClick={() => removeSkill(s)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter" className="field flex-1" />
              <button type="button" onClick={addSkill} className="btn-press shrink-0 rounded-lg border border-border px-3 py-1.5"><Plus size={14} /></button>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Benefits</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.benefits.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/5 px-2 py-0.5 font-mono text-[10px] text-success">
                  {b} <button onClick={() => removeBenefit(b)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())} placeholder="Add a benefit..." className="field flex-1" />
              <button type="button" onClick={addBenefit} className="btn-press shrink-0 rounded-lg border border-border px-3 py-1.5"><Plus size={14} /></button>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="btn-press rounded-lg border border-border px-4 py-2 text-sm text-fg-muted hover:bg-bg-hover">Cancel</button>
            <button type="submit" disabled={saving} className="btn-press rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50">
              {saving ? "Creating..." : "Create Job Post"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
