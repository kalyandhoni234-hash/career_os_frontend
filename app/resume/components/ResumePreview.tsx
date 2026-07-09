"use client";

import type { ResumeData } from "../types";

interface ResumePreviewProps {
  resume: ResumeData | null;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  if (!resume) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-border p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl border-2 border-dashed border-border bg-bg-default" />
          <p className="mt-3 text-sm text-fg-muted">Your resume preview will appear here</p>
          <p className="mt-1 text-xs text-fg-subtle">Start editing to see a live preview</p>
        </div>
      </div>
    );
  }

  const contact = [
    resume.email,
    resume.phone,
    resume.location,
    resume.website,
    resume.linkedin && `linkedin.com/in/${resume.linkedin.replace(/^https?:\/\//, "").replace(/^linkedin\.com\/in\//, "")}`,
    resume.github && `github.com/${resume.github.replace(/^https?:\/\//, "").replace(/^github\.com\//, "")}`,
    resume.portfolio,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-gray-900">
            {resume.full_name || "Your Name"}
          </h1>
          {resume.title && (
            <p className="mt-0.5 text-sm font-medium text-gray-600">{resume.title}</p>
          )}
          {contact.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
              {contact.map((c, i) => c && <span key={i}>{c}</span>)}
            </div>
          )}
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mt-4">
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-700">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {Array.isArray(resume.experience) && resume.experience.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Experience</SectionTitle>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mt-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{exp.role}</p>
                    <p className="text-[11px] text-gray-600">{exp.company}</p>
                  </div>
                  <p className="shrink-0 text-[10px] text-gray-400">{exp.start} - {exp.end}</p>
                </div>
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-3.5">
                    {exp.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} className="list-disc text-[11px] leading-relaxed text-gray-700">{b}</li>
                    ))}
                  </ul>
                )}
                {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                  <p className="mt-1 text-[10px] text-gray-400">
                    <span className="font-medium">Technologies:</span> {exp.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {Array.isArray(resume.education) && resume.education.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Education</SectionTitle>
            {resume.education.map((edu, i) => (
              <div key={i} className="mt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                    <p className="text-[11px] text-gray-600">{edu.school}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-gray-400">{edu.start} - {edu.end}</p>
                    {edu.gpa && <p className="text-[10px] text-gray-400">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {Array.isArray(resume.projects) && resume.projects.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Projects</SectionTitle>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mt-2">
                <p className="text-[12px] font-semibold text-gray-900">{proj.name}</p>
                {proj.description && <p className="mt-0.5 text-[11px] text-gray-700">{proj.description}</p>}
                {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    <span className="font-medium">Technologies:</span> {proj.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {Array.isArray(resume.skills) && resume.skills.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Skills</SectionTitle>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {resume.skills.map((skill, i) => (
                <span key={i} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {Array.isArray(resume.certificates) && resume.certificates.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Certificates</SectionTitle>
            {resume.certificates.map((cert, i) => (
              <p key={i} className="mt-1 text-[11px] text-gray-700">
                {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ""}{cert.date ? ` (${cert.date})` : ""}
              </p>
            ))}
          </div>
        )}

        {/* Languages */}
        {Array.isArray(resume.languages) && resume.languages.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Languages</SectionTitle>
            <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-gray-700">
              {resume.languages.map((lang, i) => (
                <span key={i}>{lang.name} ({lang.level})</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="border-b border-gray-300 pb-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
      {children}
    </h2>
  );
}
