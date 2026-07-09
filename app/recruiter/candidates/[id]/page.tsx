"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Globe, Award, BookmarkCheck,
  Send, FileText, X, Briefcase, MapPin, GraduationCap, Code2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getCandidateDetail, getCandidateSummary, saveCandidate, createInvite } from "../../api";
import type { CandidateDetail as CandidateData } from "../../types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteType, setInviteType] = useState("phone");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numericId = parseInt(id);
    getCandidateDetail(numericId).then((d) => setCandidate(d.candidate)).catch(() => router.push("/recruiter/candidates")).finally(() => setLoading(false));
    getCandidateSummary(numericId).then((d) => setAiSummary(d.summary)).catch(() => {});
  }, [id, router]);

  const handleSave = async () => {
    if (!candidate) return;
    try {
      await saveCandidate({ candidate_id: candidate.user_id });
    } catch {}
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    setSending(true);
    try {
      await createInvite({ candidate_id: candidate.user_id, message: inviteMessage, interview_type: inviteType });
      setShowInviteForm(false);
      setInviteMessage("");
    } catch {}
    setSending(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!candidate) return null;

  const resume = candidate.resume;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-4xl space-y-6 p-6">
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-press rounded-lg border border-border p-2 text-fg-muted hover:bg-bg-hover">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-fg-default">{resume?.full_name || candidate.email}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
              {candidate.education && <span className="flex items-center gap-1"><GraduationCap size={12} /> {candidate.education}</span>}
              {candidate.degree && <span>{candidate.degree}</span>}
              {resume?.location && <span className="flex items-center gap-1"><MapPin size={12} /> {resume.location}</span>}
              {candidate.graduation_year && <span>Class of {candidate.graduation_year}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="btn-press rounded-lg border border-border px-3 py-2 text-xs font-medium text-fg-muted hover:bg-bg-hover flex items-center gap-1.5">
            <BookmarkCheck size={14} /> Save
          </button>
          <button onClick={() => setShowInviteForm(!showInviteForm)} className="btn-press rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent/90 flex items-center gap-1.5">
            <Send size={14} /> Invite
          </button>
        </div>
      </motion.div>

      {/* AI Summary */}
      {aiSummary && (
        <motion.div variants={fadeUp}>
          <Card glow="accent">
            <div className="mb-2 flex items-center gap-2">
              <Award size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">AI Candidate Summary</span>
            </div>
            <p className="text-sm leading-relaxed text-fg-default">{aiSummary}</p>
          </Card>
        </motion.div>
      )}

      {/* Scores */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {candidate.ats_score !== null && (
          <Card>
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">ATS Score</p>
            <p className={`mt-1 font-serif text-2xl font-medium ${candidate.ats_score >= 80 ? "text-success" : candidate.ats_score >= 60 ? "text-warning" : "text-danger"}`}>{candidate.ats_score}</p>
          </Card>
        )}
        {candidate.career_score && (
          <>
            <Card>
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Career Score</p>
              <p className={`mt-1 font-serif text-2xl font-medium ${candidate.career_score.overall >= 70 ? "text-success" : candidate.career_score.overall >= 50 ? "text-warning" : "text-danger"}`}>{candidate.career_score.overall}</p>
            </Card>
            <Card>
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Projects Score</p>
              <p className="mt-1 font-serif text-2xl font-medium text-fg-default">{candidate.career_score.projects}</p>
            </Card>
          </>
        )}
      </motion.div>

      {/* Resume summary */}
      {resume?.summary && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <FileText size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Professional Summary</span>
            </div>
            <p className="text-sm leading-relaxed text-fg-muted">{resume.summary}</p>
          </Card>
        </motion.div>
      )}

      {/* Skills */}
      {resume?.skills && resume.skills.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Code2 size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 font-mono text-[11px] text-accent">{skill}</span>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* External Links */}
      {(resume?.github || resume?.linkedin || resume?.portfolio || resume?.website) && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <ExternalLink size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Links</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {resume?.github && <a href={resume.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-accent transition-colors"><Code2 size={14} /> GitHub</a>}
              {resume?.linkedin && <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-accent transition-colors"><ExternalLink size={14} /> LinkedIn</a>}
              {resume?.portfolio && <a href={resume.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-accent transition-colors"><Globe size={14} /> Portfolio</a>}
              {resume?.website && <a href={resume.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-accent transition-colors"><Globe size={14} /> Website</a>}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Experience */}
      {resume?.experience && resume.experience.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Briefcase size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Experience</span>
            </div>
            <div className="space-y-3">
              {resume.experience.map((exp, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm font-medium text-fg-default">{exp.role} <span className="text-fg-muted">at {exp.company}</span></p>
                  {(exp.start || exp.end) && <p className="text-xs text-fg-subtle">{exp.start} - {exp.end || "Present"}</p>}
                  {exp.description && <p className="mt-1 text-sm text-fg-muted line-clamp-3">{exp.description}</p>}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {exp.technologies.map((tech) => <span key={tech} className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{tech}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Projects */}
      {resume?.projects && resume.projects.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Code2 size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Projects</span>
            </div>
            <div className="space-y-3">
              {resume.projects.map((proj, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-fg-default">{proj.name}</p>
                    {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-fg-muted hover:text-accent"><ExternalLink size={12} /></a>}
                  </div>
                  {proj.description && <p className="mt-1 text-sm text-fg-muted line-clamp-2">{proj.description}</p>}
                  {proj.technologies && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {proj.technologies.map((tech) => <span key={tech} className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{tech}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Education */}
      {resume?.education && resume.education.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Education</span>
            </div>
            <div className="space-y-2">
              {resume.education.map((edu, i) => (
                <div key={i} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm text-fg-default">{edu.degree} in {edu.field} <span className="text-fg-muted">at {edu.school}</span></p>
                  {(edu.start || edu.end) && <p className="text-xs text-fg-subtle">{edu.start} - {edu.end}</p>}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Certifications */}
      {resume?.certificates && resume.certificates.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Award size={14} className="text-accent" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Certifications</span>
            </div>
            <div className="space-y-1">
              {resume.certificates.map((cert, i) => (
                <p key={i} className="text-sm text-fg-muted">{cert.name} — <span className="text-fg-subtle">{cert.issuer}</span></p>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Invite form modal */}
      {showInviteForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowInviteForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-xl border border-border bg-bg-surface p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-fg-default">Send Interview Invite</h2>
              <button onClick={() => setShowInviteForm(false)} className="text-fg-muted hover:text-fg-default"><X size={16} /></button>
            </div>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Interview Type</label>
                <select value={inviteType} onChange={(e) => setInviteType(e.target.value)} className="field">
                  <option value="phone">Phone Screen</option>
                  <option value="video">Video Interview</option>
                  <option value="onsite">On-site Interview</option>
                  <option value="technical">Technical Interview</option>
                  <option value="hr">HR Interview</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Message</label>
                <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} rows={4} placeholder="Personalize your invitation..." className="field resize-none" />
              </div>
              <button type="submit" disabled={sending} className="btn-press w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50">
                {sending ? "Sending..." : "Send Invite"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
