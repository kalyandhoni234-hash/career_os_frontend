"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Filter, X, BookmarkCheck, ExternalLink, ChevronDown, SlidersHorizontal,
  MapPin, GraduationCap, Code2, Award, Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { searchCandidates, saveCandidate, getSavedCandidates, listPipelines } from "../api";
import type { CandidatePreview, CandidateSearchResult, Pipeline } from "../types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function CandidatesPage() {
  const router = useRouter();
  const [results, setResults] = useState<CandidateSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  const [filters, setFilters] = useState({
    q: "",
    skills: [] as string[],
    colleges: [] as string[],
    degrees: [] as string[],
    locations: [] as string[],
    min_ats: "",
    graduation_year: "",
    remote: false,
    has_resume: false,
    open_to_work: false,
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    startTransition(() => {
      getSavedCandidates().then((d) => setSavedIds(new Set(d.saved_candidates.map((c) => c.user_id)))).catch(() => {});
      listPipelines().then((d) => setPipelines(d.pipelines)).catch(() => {});
    });
  }, []);

  const doSearch = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | string[]> = { ...filters, page: p, per_page: 20 };
      if (!params.q) delete params.q;
      const res = await searchCandidates(params);
      setResults(res);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { startTransition(() => { doSearch(1); }); }, [doSearch]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !filters.skills.includes(s)) {
      setFilters((f) => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setFilters((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const handleSaveCandidate = async (candidateId: number) => {
    try {
      await saveCandidate({ candidate_id: candidateId });
      setSavedIds((prev) => new Set(prev).add(candidateId));
    } catch {}
  };

  const clearFilters = () => {
    setFilters({ q: "", skills: [], colleges: [], degrees: [], locations: [], min_ats: "", graduation_year: "", remote: false, has_resume: false, open_to_work: false });
    setSkillInput("");
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === "q" && v) return true;
    if (Array.isArray(v) && v.length > 0) return true;
    if (typeof v === "boolean" && v) return true;
    if (typeof v === "string" && v && k !== "q") return true;
    return false;
  });

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-7xl space-y-6 p-6">
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-fg-default">Search Candidates</h1>
          <p className="mt-1 text-sm text-fg-muted">Find and engage with top talent.</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-press flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${showFilters ? "border-accent bg-accent/10 text-accent" : "border-border text-fg-muted hover:bg-bg-hover"}`}>
          <SlidersHorizontal size={14} /> Filters {hasActiveFilters && <span className="flex h-2 w-2 rounded-full bg-accent" />}
        </button>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={fadeUp}>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="Search by name, skills, company, college..." className="w-full rounded-xl border border-border bg-bg-surface py-3 pl-10 pr-4 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
        </div>
      </motion.div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-accent" />
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Advanced Filters</span>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-fg-muted hover:text-danger flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Skills</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filters.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent">
                    {s} <button onClick={() => removeSkill(s)}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add skill..." className="field flex-1" />
                <button onClick={addSkill} className="btn-press shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs text-fg-muted hover:bg-bg-hover">+</button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Min ATS Score</label>
              <input type="number" min="0" max="100" value={filters.min_ats} onChange={(e) => setFilters((f) => ({ ...f, min_ats: e.target.value }))} placeholder="0-100" className="field" />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-wider text-fg-muted">Graduation Year</label>
              <input type="number" value={filters.graduation_year} onChange={(e) => setFilters((f) => ({ ...f, graduation_year: e.target.value }))} placeholder="e.g. 2027" className="field" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.remote} onChange={(e) => setFilters((f) => ({ ...f, remote: e.target.checked }))} className="rounded border-border text-accent focus:ring-accent-ring" />
                <span className="text-xs text-fg-muted">Remote only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.has_resume} onChange={(e) => setFilters((f) => ({ ...f, has_resume: e.target.checked }))} className="rounded border-border text-accent focus:ring-accent-ring" />
                <span className="text-xs text-fg-muted">Has resume</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.open_to_work} onChange={(e) => setFilters((f) => ({ ...f, open_to_work: e.target.checked }))} className="rounded border-border text-accent focus:ring-accent-ring" />
                <span className="text-xs text-fg-muted">Open to work</span>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : results && results.candidates.length > 0 ? (
          <>
            <p className="mb-3 font-mono text-[11px] text-fg-muted">{results.total} candidates found</p>
            <div className="space-y-3">
              {results.candidates.map((candidate) => (
                <CandidateCard key={candidate.user_id} candidate={candidate} isSaved={savedIds.has(candidate.user_id)} onSave={() => handleSaveCandidate(candidate.user_id)} pipelines={pipelines} />
              ))}
            </div>
            {results.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button disabled={page <= 1} onClick={() => doSearch(page - 1)} className="btn-press rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted hover:bg-bg-hover disabled:opacity-40">Previous</button>
                <span className="font-mono text-xs text-fg-muted">Page {results.page} of {results.total_pages}</span>
                <button disabled={page >= results.total_pages} onClick={() => doSearch(page + 1)} className="btn-press rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted hover:bg-bg-hover disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <Search size={32} className="mx-auto text-fg-subtle" />
              <p className="mt-3 font-medium text-fg-default">No candidates found</p>
              <p className="mt-1 text-sm text-fg-muted">Try adjusting your search filters.</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function CandidateCard({ candidate, isSaved, onSave }: {
  candidate: CandidatePreview; isSaved: boolean; onSave: () => void; pipelines: Pipeline[];
}) {
  return (
    <Card hover>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/recruiter/candidates/${candidate.user_id}`} className="font-medium text-fg-default hover:text-accent transition-colors">
              {candidate.full_name}
            </Link>
            {candidate.ats_score !== null && (
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${candidate.ats_score >= 80 ? "bg-success/10 text-success" : candidate.ats_score >= 60 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>
                ATS {candidate.ats_score}
              </span>
            )}
            {isSaved && <BookmarkCheck size={14} className="text-accent" />}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
            {candidate.education && (
              <span className="flex items-center gap-1"><GraduationCap size={12} /> {candidate.education}</span>
            )}
            {candidate.degree && <span>{candidate.degree}</span>}
            {candidate.location && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {candidate.location}</span>
            )}
            {candidate.graduation_year && <span>Class of {candidate.graduation_year}</span>}
          </div>
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 8).map((skill) => (
                <span key={skill} className="rounded-full border border-border bg-bg-raised px-2 py-0.5 font-mono text-[10px] text-fg-muted">{skill}</span>
              ))}
              {candidate.skills.length > 8 && (
                <span className="font-mono text-[10px] text-fg-subtle">+{candidate.skills.length - 8} more</span>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={onSave} disabled={isSaved}
            className={`btn-press rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${isSaved ? "border-accent/20 text-accent bg-accent/5" : "border-border text-fg-muted hover:bg-bg-hover"}`}>
            {isSaved ? "Saved" : "Save"}
          </button>
          <Link href={`/recruiter/candidates/${candidate.user_id}`}
            className="btn-press rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg-muted hover:bg-bg-hover flex items-center gap-1">
            View <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
