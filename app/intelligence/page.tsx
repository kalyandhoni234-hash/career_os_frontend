"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  User, Briefcase, GraduationCap, Code, Target,
  Award, Globe, GitBranch, Link, Sparkles, Check,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface UnifiedProfile {
  basic: Record<string, string>;
  career: Record<string, unknown>;
  skills: SkillItem[];
  education: EduItem[];
  experience: ExpItem[];
  projects: ProjectItem[];
  interests: { id: number; name: string }[];
  goals: GoalItem[];
  certificates: CertItem[];
  languages: { id: number; language: string; proficiency: string }[];
  integrations: Record<string, IntegrationInfo>;
  completion: { score: number; breakdown: Record<string, { done: boolean; weight: number; earned: number }> };
  sources: { skill_sources: Record<string, number>; total_skills: number; projects_count: number; experience_count: number; certificates_count: number };
}

interface SkillItem { id: number; name: string; source: string; confidence: number; experience_level: string }
interface EduItem { id: number; institution: string; degree: string; branch: string; graduation_year: number; source: string; confidence: number }
interface ExpItem { id: number; company: string; role: string; start_date: string; end_date: string; is_current: boolean; source: string; confidence: number }
interface ProjectItem { id: number; name: string; description: string; url: string; stars: number; primary_language: string; is_pinned: boolean; source: string }
interface GoalItem { id: number; title: string; target_role: string; target_company: string; status: string; priority: number; progress: number }
interface CertItem { id: number; name: string; issuer: string; url: string; source: string; confidence: number }
interface IntegrationInfo { connected: boolean; username?: string; avatar_url?: string; bio?: string; last_sync?: string; headline?: string; current_role?: string; repo_count?: number; followers?: number; contributions?: number; experience_count?: number; skill_count?: number; pinned_repos?: { name: string; url: string; stars: number }[] }

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    github: "bg-bg-hover text-fg-muted",
    linkedin: "bg-accent/10 text-accent",
    manual: "bg-accent-subtle text-accent",
    resume: "bg-warning/10 text-warning",
    gmail: "bg-danger/10 text-danger",
  };
  const icons: Record<string, typeof GitBranch | null> = { github: GitBranch, linkedin: Link, manual: null, resume: null, gmail: null };
  const Icon = icons[source] || null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${colors[source] || "bg-bg-hover text-fg-muted"}`}>
      {Icon && <Icon size={10} />}
      {source}
    </span>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, duration: 0.3 } };

export default function IntelligencePage() {
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/intelligence/profile")
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg-default"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>;
  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-default">
      <p className="text-sm text-danger">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg-default transition-all hover:border-accent/40 hover:bg-bg-hover">Try again</button>
    </div>
  );
  if (!profile) return null;

  const { basic, career, skills, education, experience, projects, goals, certificates, integrations, completion, sources } = profile;
  const githubData = integrations.github as IntegrationInfo | undefined;
  const linkedinData = integrations.linkedin as IntegrationInfo | undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex items-center gap-4 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-medium text-fg-default">Career Intelligence</h1>
          <p className="text-sm text-fg-muted">Unified profile built from all connected sources</p>
        </div>
      </motion.div>

      {/* Profile Completion */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-medium text-fg-default">Profile Completion</h2>
            <p className="text-sm text-fg-muted">{completion.score}% complete</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-subtle">
            <span className="font-serif text-2xl font-medium text-accent">{completion.score}%</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(completion.breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-fg-muted">
              <div className={`h-2 w-2 rounded-full ${val.done ? "bg-success" : "bg-danger"}`} />
              <span className="truncate">{key.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Section title="Basic Information" icon={<User size={14} />}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Name" value={basic.full_name} />
              <InfoRow label="Headline" value={basic.headline || career.current_role as string} />
              <InfoRow label="Email" value={basic.email} />
              <InfoRow label="Phone" value={basic.phone} />
              <InfoRow label="Location" value={basic.location} />
              <InfoRow label="Timezone" value={basic.timezone} />
              <InfoRow label="Summary" value={basic.summary} span />
            </div>
          </Section>

          {/* Skills with Sources */}
          <Section title="Skills" icon={<Code size={14} />} action={
            <span className="text-xs text-fg-muted">{sources.skill_sources.github ? `GitHub: ${sources.skill_sources.github}` : ""}{sources.skill_sources.linkedin ? ` | LinkedIn: ${sources.skill_sources.linkedin}` : ""}</span>
          }>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.id} className="group relative inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-default px-3 py-1.5 text-sm">
                  <span>{s.name}</span>
                  <SourceBadge source={s.source} />
                  {s.confidence < 1 && <span className="text-[10px] text-fg-subtle">{Math.round(s.confidence * 100)}%</span>}
                </div>
              ))}
              {skills.length === 0 && <p className="text-sm text-fg-muted">No skills yet — connect GitHub or LinkedIn to auto-import them.</p>}
            </div>
          </Section>

          {/* Experience */}
          <Section title="Experience" icon={<Briefcase size={14} />}>
            {experience.length === 0 && <p className="text-sm text-fg-muted">No experience yet — connect LinkedIn to import.</p>}
            {experience.map((exp) => (
              <div key={exp.id} className="flex items-start gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle text-xs font-bold text-accent">
                  {exp.company.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-fg-default">{exp.role}</p>
                  <p className="text-xs text-fg-muted">{exp.company}</p>
                  <p className="text-xs text-fg-subtle">{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</p>
                </div>
                <SourceBadge source={exp.source} />
              </div>
            ))}
          </Section>

          {/* Education */}
          <Section title="Education" icon={<GraduationCap size={14} />}>
            {education.length === 0 && <p className="text-sm text-fg-muted">No education yet — connect LinkedIn to import.</p>}
            {education.map((edu) => (
              <div key={edu.id} className="flex items-start gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle text-xs font-bold text-accent">
                  {edu.institution.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-fg-default">{edu.degree}</p>
                  <p className="text-xs text-fg-muted">{edu.institution}{edu.branch ? ` · ${edu.branch}` : ""}</p>
                  <p className="text-xs text-fg-subtle">{edu.graduation_year || "Ongoing"}</p>
                </div>
                <SourceBadge source={edu.source} />
              </div>
            ))}
          </Section>

          {/* Projects */}
          <Section title="Projects" icon={<Code size={14} />} action={
            githubData?.pinned_repos ? <span className="text-xs text-fg-muted">Pinned from GitHub</span> : null
          }>
            {projects.length === 0 && <p className="text-sm text-fg-muted">No projects yet — connect GitHub to auto-discover repositories.</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {projects.map((proj) => (
                <a key={proj.id} href={proj.url} target="_blank" rel="noopener noreferrer"
                  className="group rounded-lg border border-border bg-bg-default p-4 transition-all hover:border-accent/40 hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-fg-default group-hover:text-accent">{proj.name}</p>
                    {proj.is_pinned && <Star size={12} className="shrink-0 text-warning" />}
                  </div>
                  {proj.description && <p className="mt-1 text-xs text-fg-muted line-clamp-2">{proj.description}</p>}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-fg-subtle">
                    {proj.primary_language && <span>{proj.primary_language}</span>}
                    {proj.stars > 0 && <span className="flex items-center gap-1">⭐ {proj.stars}</span>}
                    <SourceBadge source={proj.source} />
                  </div>
                </a>
              ))}
            </div>
          </Section>

          {/* Certificates & Goals */}
          {certificates.length > 0 && (
            <Section title="Certificates" icon={<Award size={14} />}>
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 text-sm">
                  <Check size={14} className="shrink-0 text-success" />
                  <span className="text-fg-default">{cert.name}</span>
                  <span className="text-fg-muted">— {cert.issuer}</span>
                  <SourceBadge source={cert.source} />
                </div>
              ))}
            </Section>
          )}
        </div>

        <div className="space-y-6">
          {/* GitHub Card */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <GitBranch size={16} className="text-fg-default" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">GitHub</h3>
            </div>
            {githubData?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {githubData.avatar_url && <Image src={githubData.avatar_url} alt="" width={40} height={40} className="h-10 w-10 rounded-full" unoptimized />}
                  <div>
                    <p className="text-sm font-medium text-fg-default">{githubData.username}</p>
                    <p className="text-xs text-fg-muted">{githubData.followers} followers</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border bg-bg-default p-2">
                    <p className="font-medium text-fg-default">{githubData.repo_count}</p>
                    <p className="text-fg-muted">Repos</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-default p-2">
                    <p className="font-medium text-fg-default">{githubData.contributions}</p>
                    <p className="text-fg-muted">Contributions</p>
                  </div>
                </div>
                <p className="text-xs text-fg-subtle">Last sync: {githubData.last_sync ? new Date(githubData.last_sync).toLocaleDateString() : "Never"}</p>
              </div>
            ) : (
              <p className="text-sm text-fg-muted">Connect GitHub to auto-discover projects, languages, and contributions.</p>
            )}
          </div>

          {/* LinkedIn Card */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link size={16} className="text-fg-default" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">LinkedIn</h3>
            </div>
            {linkedinData?.connected ? (
              <div className="space-y-3">
                {linkedinData.headline && <p className="text-sm text-fg-default">{linkedinData.headline}</p>}
                {linkedinData.current_role && (
                  <div className="rounded-lg border border-border bg-bg-default p-2 text-xs">
                    <span className="text-fg-muted">Current: </span>
                    <span className="font-medium text-fg-default">{linkedinData.current_role}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border bg-bg-default p-2">
                    <p className="font-medium text-fg-default">{linkedinData.experience_count || 0}</p>
                    <p className="text-fg-muted">Experience</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-default p-2">
                    <p className="font-medium text-fg-default">{linkedinData.skill_count || 0}</p>
                    <p className="text-fg-muted">Skills</p>
                  </div>
                </div>
                <p className="text-xs text-fg-subtle">Last sync: {linkedinData.last_sync ? new Date(linkedinData.last_sync).toLocaleDateString() : "Never"}</p>
              </div>
            ) : (
              <p className="text-sm text-fg-muted">Connect LinkedIn to import experience, education, and skills.</p>
            )}
          </div>

          {/* Goals */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target size={16} className="text-fg-default" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Goals</h3>
            </div>
            {goals.length > 0 ? goals.slice(0, 3).map((g) => (
              <div key={g.id} className="mb-2 flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${g.status === "active" ? "bg-success" : g.status === "completed" ? "bg-accent" : "bg-fg-subtle"}`} />
                <span className="text-fg-default">{g.title}</span>
              </div>
            )) : <p className="text-sm text-fg-muted">No goals set yet.</p>}
          </div>

          {/* Source Summary */}
          <div className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe size={16} className="text-fg-default" />
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Data Sources</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-fg-muted">Skills</span><span className="font-medium text-fg-default">{sources.total_skills}</span></div>
              <div className="flex justify-between"><span className="text-fg-muted">Projects</span><span className="font-medium text-fg-default">{sources.projects_count}</span></div>
              <div className="flex justify-between"><span className="text-fg-muted">Experience</span><span className="font-medium text-fg-default">{sources.experience_count}</span></div>
              <div className="flex justify-between"><span className="text-fg-muted">Certificates</span><span className="font-medium text-fg-default">{sources.certificates_count}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-fg-muted">{icon}</span>
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{title}</h3>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, span }: { label: string; value: string; span?: boolean }) {
  if (!value) return null;
  return (
    <div className={span ? "col-span-2" : ""}>
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="text-sm text-fg-default">{value}</p>
    </div>
  );
}
