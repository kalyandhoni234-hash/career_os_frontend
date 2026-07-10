"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle } from "lucide-react";
import type { ResumeData } from "../types";

interface ResumeHealthProps {
  resume: ResumeData | null;
}

const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certificates: "Certificates",
  achievements: "Achievements",
  languages: "Languages",
};

export function ResumeHealth({ resume }: ResumeHealthProps) {
  if (!resume) {
    const emptyScore = 0;
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Resume Health</h3>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
            </svg>
          </div>
          <div>
            <p className="font-serif text-2xl font-medium text-fg-muted">{emptyScore}%</p>
            <p className="text-xs text-fg-subtle">No resume data</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-muted">Start building your resume to see health score.</p>
      </div>
    );
  }

  const sections = {
    summary: !!resume.summary,
    experience: Array.isArray(resume.experience) && resume.experience.length > 0,
    education: Array.isArray(resume.education) && resume.education.length > 0,
    projects: Array.isArray(resume.projects) && resume.projects.length > 0,
    skills: Array.isArray(resume.skills) && resume.skills.length > 0,
    certificates: Array.isArray(resume.certificates) && resume.certificates.length > 0,
    achievements: Array.isArray(resume.achievements) && resume.achievements.length > 0,
    languages: Array.isArray(resume.languages) && resume.languages.length > 0,
  };

  const completed = Object.values(sections).filter(Boolean).length;
  const total = Object.keys(sections).length;
  const score = Math.round((completed / total) * 100);

  const scoreColor = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-danger";
  const strokeColor = score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Resume Health</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-16 w-16">
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
      <div className="mt-3 space-y-1.5">
        {Object.entries(sections).map(([key, done]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            {done ? (
              <CheckCircle2 size={13} className="shrink-0 text-success" />
            ) : (
              <MinusCircle size={13} className="shrink-0 text-fg-subtle" />
            )}
            <span className={done ? "text-fg-default" : "text-fg-muted"}>{SECTION_LABELS[key] || key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
