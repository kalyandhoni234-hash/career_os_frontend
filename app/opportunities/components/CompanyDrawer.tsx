"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Building2, Globe, MapPin, Calendar, Star,
  TrendingUp, Lightbulb, Award, Briefcase, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getCompany } from "../api";
import type { CompanyProfile } from "../types";

interface CompanyDrawerProps {
  companyName: string | null;
  onClose: () => void;
}

export function CompanyDrawer({ companyName, onClose }: CompanyDrawerProps) {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = !!companyName;

  useEffect(() => {
    if (!companyName) { setCompany(null); setError(null); return; }
    setLoading(true);
    setError(null);
    getCompany(companyName)
      .then((r) => { setCompany(r.company); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [companyName]);

  const rating = company?.glassdoor_rating ?? company?.indeed_rating ?? null;
  const diff = company?.interview_difficulty;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white border-l border-border z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border z-10 px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Company Profile</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="animate-spin text-accent" />
                <p className="text-xs text-fg-muted">Loading company data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Building2 size={32} className="text-danger/50" />
                <p className="text-sm font-medium">Could not load company</p>
                <p className="text-xs text-fg-muted">{error}</p>
              </div>
            ) : company ? (
              <div className="p-5 space-y-5">
                {/* Company Header */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 size={26} className="text-accent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold">{company.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {company.industry && <Badge tone="accent">{company.industry}</Badge>}
                      {company.company_size && <Badge tone="neutral">{company.company_size}</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-fg-muted">
                      {company.headquarters && (
                        <span className="flex items-center gap-1"><MapPin size={10} /> {company.headquarters}</span>
                      )}
                      {company.founded_year && (
                        <span className="flex items-center gap-1"><Calendar size={10} /> Est. {company.founded_year}</span>
                      )}
                      {company.active_jobs_count != null && company.active_jobs_count > 0 && (
                        <span className="flex items-center gap-1"><Briefcase size={10} /> {company.active_jobs_count} open roles</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ratings + Interview Difficulty */}
                <div className="flex gap-3">
                  {rating && (
                    <div className="flex-1 rounded-lg bg-bg-raised border border-border p-3 text-center">
                      <div className="flex items-center justify-center gap-0.5 text-warning">
                        <Star size={12} fill="currentColor" />
                        <span className="text-sm font-bold font-mono">{rating.toFixed(1)}</span>
                      </div>
                      <p className="text-[9px] text-fg-muted mt-0.5">Rating</p>
                    </div>
                  )}
                  {diff && (
                    <div className="flex-1 rounded-lg bg-bg-raised border border-border p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Award size={12} className={diff === "easy" ? "text-success" : diff === "medium" ? "text-warning" : "text-danger"} />
                        <span className="text-sm font-medium capitalize">{diff}</span>
                      </div>
                      <p className="text-[9px] text-fg-muted mt-0.5">Interview</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {company.description && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider">About</h4>
                    <p className="text-xs leading-relaxed">{company.description}</p>
                  </div>
                )}

                {/* Tech Stack */}
                {company.tech_stack && company.tech_stack.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {company.tech_stack.map((t) => <Badge key={t}>{t}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Engineering Culture */}
                {company.engineering_culture && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider">Engineering Culture</h4>
                    <p className="text-xs leading-relaxed">{company.engineering_culture}</p>
                  </div>
                )}

                {/* Hiring Trends */}
                {company.hiring_trends && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp size={11} /> Hiring Trends
                    </h4>
                    <p className="text-xs leading-relaxed">{company.hiring_trends}</p>
                  </div>
                )}

                {/* Expected Salary */}
                {company.expected_salary && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider">Expected Salary</h4>
                    <p className="text-xs font-medium">{company.expected_salary}</p>
                  </div>
                )}

                {/* Interview Process */}
                {company.interview_process && company.interview_process.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider">Interview Process</h4>
                    <ol className="space-y-1.5">
                      {company.interview_process.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-accent-subtle text-accent text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Application Tips */}
                {company.application_tips && (
                  <div className="rounded-lg bg-accent-subtle border border-accent/20 p-3">
                    <h4 className="text-[11px] font-semibold text-accent mb-1 flex items-center gap-1">
                      <Lightbulb size={11} /> AI Application Tip
                    </h4>
                    <p className="text-[11px] leading-relaxed">{company.application_tips}</p>
                  </div>
                )}

                {/* Products */}
                {company.products && company.products.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-fg-muted mb-1.5 uppercase tracking-wider">Products</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {company.products.map((p) => <Badge key={p} tone="neutral">{p}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2 pt-2">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border border-border hover:bg-bg-hover transition-colors"
                    >
                      <Globe size={10} /> Website
                    </a>
                  )}
                  {company.linkedin_url && (
                    <a
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border border-border hover:bg-bg-hover transition-colors"
                    >
                      <Globe size={10} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
