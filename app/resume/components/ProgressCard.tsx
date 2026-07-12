"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle } from "lucide-react";
import type { ResumeData } from "../types";

interface ProgressCardProps {
  resume: ResumeData | null;
}

const SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certificates: "Certificates",
  achievements: "Achievements",
  languages: "Languages",
  publications: "Publications",
  portfolio: "Portfolio",
};

export function ProgressCard({ resume }: ProgressCardProps) {
  const sections = {
    summary: !!(resume?.summary?.trim()),
    experience: Array.isArray(resume?.experience) && resume.experience.length > 0,
    education: Array.isArray(resume?.education) && resume.education.length > 0,
    projects: Array.isArray(resume?.projects) && resume.projects.length > 0,
    skills: Array.isArray(resume?.skills) && resume.skills.length > 0,
    certificates: Array.isArray(resume?.certificates) && resume.certificates.length > 0,
    achievements: Array.isArray(resume?.achievements) && resume.achievements.length > 0,
    languages: Array.isArray(resume?.languages) && resume.languages.length > 0,
    publications: Array.isArray(resume?.publications) && resume.publications.length > 0,
    portfolio: !!(resume?.portfolio?.trim()),
  };

  const completed = Object.values(sections).filter(Boolean).length;
  const total = Object.keys(sections).length;
  const score = Math.round((completed / total) * 100);

  const scoreColor = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-danger";
  const strokeColor = score >= 80 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  const missing = Object.entries(sections)
    .filter(([, done]) => !done)
    .map(([key]) => SECTION_LABELS[key] || key);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">
          Resume Completion
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
            <motion.circle
              cx="32" cy="32" r="28" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.1, 1] }}
            />
          </svg>
        </div>
        <div>
          <p className={`font-serif text-2xl font-medium ${scoreColor}`}>{score}%</p>
          <p className="text-xs text-fg-muted">{completed} / {total} sections</p>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Missing</p>
          {missing.slice(0, 4).map((label) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-fg-muted">
              <MinusCircle size={11} className="shrink-0 text-fg-subtle" />
              {label}
            </div>
          ))}
          {missing.length > 4 && (
            <p className="text-[10px] text-fg-subtle">+{missing.length - 4} more</p>
          )}
        </div>
      )}

      {completed === total && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-success">
          <CheckCircle2 size={12} />
          Complete
        </div>
      )}
    </div>
  );
}
