"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, X, Search, Award, Code2, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { searchCandidates, compareCandidates } from "../../api";
import type { CandidateCompareItem, CandidatePreview } from "../../types";

export default function ComparePage() {
  const [selected, setSelected] = useState<CandidateCompareItem[]>([]);
  const [searchResults, setSearchResults] = useState<CandidatePreview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await searchCandidates({ q, per_page: 10 });
      setSearchResults(res.candidates);
    } catch {}
    setSearching(false);
  };

  const addCandidate = async (candidateId: number) => {
    if (selected.length >= 5) return;
    try {
      const res = await compareCandidates([candidateId]);
      if (res.candidates.length > 0 && !selected.find((s) => s.user_id === candidateId)) {
        setSelected((prev) => [...prev, res.candidates[0]]);
      }
    } catch {}
    setSearchResults([]);
    setSearchQuery("");
  };

  const removeCandidate = (userId: number) => setSelected((prev) => prev.filter((s) => s.user_id !== userId));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-fg-default">Compare Candidates</h1>
        <p className="mt-1 text-sm text-fg-muted">Select 2-5 candidates to compare side by side.</p>
      </div>

      {/* Search to add */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
        <input value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search candidates to compare..." className="w-full rounded-xl border border-border bg-bg-surface py-3 pl-10 pr-4 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-bg-surface shadow-lg">
            {searchResults.map((c) => (
              <button key={c.user_id} onClick={() => addCandidate(c.user_id)} disabled={selected.length >= 5}
                className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-bg-hover last:border-0 disabled:opacity-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">{c.full_name.charAt(0)}</div>
                <div>
                  <p className="font-medium text-fg-default">{c.full_name}</p>
                  <p className="text-xs text-fg-muted">{c.education || ""}{c.ats_score !== null ? ` | ATS ${c.ats_score}` : ""}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      {selected.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-xl border border-border bg-bg-surface">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[160px] border-r border-border bg-bg-raised px-4 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Attribute</th>
                {selected.map((c) => (
                  <th key={c.user_id} className="min-w-[180px] px-4 py-3 text-center">
                    <div className="relative">
                      <p className="font-medium text-fg-default">{c.full_name}</p>
                      <button onClick={() => removeCandidate(c.user_id)} className="absolute -right-1 -top-2 rounded-full p-0.5 text-fg-subtle hover:text-danger"><X size={12} /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="ATS Score" icon={<Award size={14} />}>
                {selected.map((c) => (
                  <td key={c.user_id} className={`px-4 py-3 text-center font-mono text-sm ${c.ats_score === null ? "text-fg-subtle" : c.ats_score >= 80 ? "text-success" : c.ats_score >= 60 ? "text-warning" : "text-danger"}`}>{c.ats_score ?? "—"}</td>
                ))}
              </CompareRow>
              <CompareRow label="Career Score" icon={<Award size={14} />}>
                {selected.map((c) => (
                  <td key={c.user_id} className={`px-4 py-3 text-center font-mono text-sm ${c.career_score === null ? "text-fg-subtle" : c.career_score >= 70 ? "text-success" : c.career_score >= 50 ? "text-warning" : "text-danger"}`}>{c.career_score ?? "—"}</td>
                ))}
              </CompareRow>
              <CompareRow label="Education" icon={<GraduationCap size={14} />}>
                {selected.map((c) => (<td key={c.user_id} className="px-4 py-3 text-center text-sm text-fg-muted">{c.education || "—"}</td>))}
              </CompareRow>
              <CompareRow label="Degree" icon={<GraduationCap size={14} />}>
                {selected.map((c) => (<td key={c.user_id} className="px-4 py-3 text-center text-sm text-fg-muted">{c.degree || "—"}</td>))}
              </CompareRow>
              <CompareRow label="Location" icon={<Code2 size={14} />}>
                {selected.map((c) => (<td key={c.user_id} className="px-4 py-3 text-center text-sm text-fg-muted">{c.location || "—"}</td>))}
              </CompareRow>
              <CompareRow label="Projects" icon={<Code2 size={14} />}>
                {selected.map((c) => (<td key={c.user_id} className="px-4 py-3 text-center font-mono text-sm text-fg-default">{c.projects_count}</td>))}
              </CompareRow>
              <CompareRow label="Certifications" icon={<Award size={14} />}>
                {selected.map((c) => (<td key={c.user_id} className="px-4 py-3 text-center font-mono text-sm text-fg-default">{c.certifications_count}</td>))}
              </CompareRow>
              <CompareRow label="Skills" icon={<Code2 size={14} />}>
                {selected.map((c) => (
                  <td key={c.user_id} className="px-4 py-3 text-center">
                    {c.skills && c.skills.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {c.skills.slice(0, 6).map((s) => <span key={s} className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[9px] text-fg-muted">{s}</span>)}
                        {c.skills.length > 6 && <span className="font-mono text-[9px] text-fg-subtle">+{c.skills.length - 6}</span>}
                      </div>
                    ) : "—"}
                  </td>
                ))}
              </CompareRow>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Users size={32} className="mx-auto text-fg-subtle" />
            <p className="mt-3 font-medium text-fg-default">Search and select candidates to compare</p>
            <p className="mt-1 text-sm text-fg-muted">Add 2-5 candidates to see a side-by-side comparison.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompareRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="sticky left-0 z-10 border-r border-border bg-bg-raised px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-fg-muted">{icon}</span>
          <span className="text-xs font-medium text-fg-muted">{label}</span>
        </div>
      </td>
      {children}
    </tr>
  );
}
