"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Save } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getCompany, updateCompany } from "../api";
import type { CompanyData } from "../types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCompany().then(setCompany).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      await updateCompany(company as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const update = (field: string, value: string | number) => setCompany((prev) => prev ? { ...prev, [field]: value } : prev);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!company) return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <p className="text-fg-muted">Company profile not found. Create one to get started.</p>
    </div>
  );

  const fields = [
    { label: "Company Name", key: "name", type: "text" },
    { label: "Website", key: "website", type: "url" },
    { label: "Industry", key: "industry", type: "text" },
    { label: "Company Size", key: "company_size", type: "text" },
    { label: "Headquarters", key: "headquarters", type: "text" },
    { label: "Founded Year", key: "founded_year", type: "number" },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-3xl space-y-6 p-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-medium text-fg-default">{company.name}</h1>
            <p className="text-sm text-fg-muted">Company profile</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-press flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50">
          <Save size={14} /> {saved ? "Saved!" : saving ? "Saving..." : "Save"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">{f.label}</label>
            <input type={f.type} value={String(company[f.key as keyof typeof company] ?? "")} onChange={(e) => update(f.key, e.target.value)} className="field" />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Description</label>
          <textarea value={company.description ?? ""} onChange={(e) => update("description", e.target.value)} rows={4} className="field resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Culture Description</label>
          <textarea value={company.culture_description ?? ""} onChange={(e) => update("culture_description", e.target.value)} rows={3} className="field resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Benefits Description</label>
          <textarea value={company.benefits_description ?? ""} onChange={(e) => update("benefits_description", e.target.value)} rows={3} className="field resize-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}
