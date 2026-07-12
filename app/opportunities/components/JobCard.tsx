"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Building2, Briefcase, Clock, IndianRupee, Star,
  Bookmark, BookmarkCheck, ChevronDown, TrendingUp,
  Zap, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Opportunity, CardMatchData } from "../types";

interface JobCardProps {
  opportunity: Opportunity;
  matchData?: CardMatchData;
  isSaved?: boolean;
  onSave?: (id: number) => void;
  onUnsave?: (id: number) => void;
  onSelect?: (id: number) => void;
  onCompare?: (id: number) => void;
  onCompanyClick?: (name: string) => void;
}

function getMatchColor(s: number): string {
  if (s >= 80) return "#16a34a";
  if (s >= 60) return "#2563eb";
  if (s >= 40) return "#d97706";
  return "#dc2626";
}

function getMatchLabel(s: number): string {
  if (s >= 90) return "Excellent Fit";
  if (s >= 80) return "Strong Match";
  if (s >= 60) return "Good Match";
  if (s >= 40) return "Fair Match";
  return "Low Match";
}

function getBadges(matchData?: CardMatchData): { label: string; tone: "success" | "accent" | "warning" | "danger" | "neutral"; icon: typeof Zap }[] {
  const badges: { label: string; tone: "success" | "accent" | "warning" | "danger" | "neutral"; icon: typeof Zap }[] = [];
  if (!matchData) return badges;

  if (matchData.overall_score >= 85) badges.push({ label: "Best Match", tone: "success", icon: Zap });
  if (matchData.overall_score >= 70 && matchData.overall_score < 85) badges.push({ label: "Strong Match", tone: "accent", icon: TrendingUp });
  const atsGain = Object.values(matchData.ats_gain_estimates || {}).reduce((a, b) => a + b, 0);
  if (atsGain >= 10) badges.push({ label: "High Growth", tone: "warning", icon: TrendingUp });
  if (badges.length === 0 && matchData.overall_score >= 50) badges.push({ label: "Potential", tone: "neutral", icon: Star });
  return badges.slice(0, 2);
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) { const h = Math.floor(diff / 3600000); return h === 0 ? "Just now" : `${h}h ago`; }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ opportunity: o, matchData, isSaved, onSave, onUnsave, onSelect, onCompare, onCompanyClick }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const score = matchData?.overall_score;
  const matchColor = score !== undefined ? getMatchColor(score) : undefined;
  const badges = getBadges(matchData);
  const atsGain = Object.values(matchData?.ats_gain_estimates || {}).reduce((a, b) => a + b, 0);

  const salaryDisplay = o.salary_min && o.salary_max
    ? `${o.currency === "INR" ? "₹" : "$"}${(o.salary_min / 100000).toFixed(1)}–${(o.salary_max / 100000).toFixed(1)}L`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.1, 1] }}
      className="bg-bg-surface rounded-xl border border-border p-5 card-hover cursor-pointer relative group"
      onClick={() => onSelect?.(o.id)}
    >
      {/* AI Match Score Badge - top right */}
      {score !== undefined && (
        <div className="absolute top-4 right-4 flex flex-col items-center" style={{ color: matchColor }}>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-mono border-2 transition-transform duration-200 group-hover:scale-110"
            style={{
              borderColor: `${matchColor}30`,
              backgroundColor: `${matchColor}0d`,
              color: matchColor,
            }}
          >
            {score}
          </div>
          <span className="text-[9px] font-medium mt-0.5 uppercase tracking-wider" style={{ color: matchColor }}>
            {getMatchLabel(score)}
          </span>
        </div>
      )}

      {/* Company + Title */}
      <div className="flex items-start gap-4 pr-20">
        <div
          className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border group-hover:ring-accent/30 transition-all cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onCompanyClick?.(o.company_name); }}
        >
          {o.company_logo ? (
            <Image src={o.company_logo} alt={o.company_name} width={48} height={48} className="w-full h-full object-contain" unoptimized />
          ) : (
            <Building2 size={22} className="text-accent" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate pr-2">{o.title}</h3>
          <p
            className="text-xs text-fg-muted mt-0.5 hover:text-accent cursor-pointer transition-colors"
            onClick={(e) => { e.stopPropagation(); onCompanyClick?.(o.company_name); }}
          >
            {o.company_name}
          </p>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    b.tone === "success" ? "border-success/20 bg-success-subtle text-success" :
                    b.tone === "accent" ? "border-accent/20 bg-accent-subtle text-accent" :
                    b.tone === "warning" ? "border-warning/20 bg-warning-subtle text-warning" :
                    "border-border bg-bg-hover text-fg-muted"
                  }`}
                >
                  <b.icon size={10} /> {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-fg-muted">
        {o.location && <span className="flex items-center gap-1"><MapPin size={11} /> {o.location}</span>}
        {o.remote_type && <span className="flex items-center gap-1"><Briefcase size={11} /> {o.remote_type}</span>}
        {salaryDisplay && <span className="flex items-center gap-1"><IndianRupee size={11} /> {salaryDisplay}</span>}
        {o.employment_type && <span className="flex items-center gap-1"><Clock size={11} /> {o.employment_type}</span>}
        {o.posted_at && <span className="flex items-center gap-1"><Clock size={11} /> {formatTimeAgo(o.posted_at)}</span>}
      </div>

      {/* Tech Stack */}
      {o.tech_stack && o.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {o.tech_stack.slice(0, 6).map((tech) => {
            const matched = matchData?.matched_skills?.includes(tech.toLowerCase());
            const missing = matchData?.missing_skills?.includes(tech.toLowerCase());
            const tone = matched ? "success" : missing ? "danger" : "accent" as const;
            return <Badge key={tech} tone={tone}>{tech}</Badge>;
          })}
          {o.tech_stack.length > 6 && (
            <Badge tone="neutral">+{o.tech_stack.length - 6}</Badge>
          )}
        </div>
      )}

      {/* AI Match Bars */}
      {matchData && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex gap-3">
            <MiniBar label="ATS" value={matchData.ats_match ?? matchData.overall_score} />
            <MiniBar label="Skills" value={matchData.skill_match ?? matchData.overall_score} />
            <MiniBar label="Exp" value={matchData.experience_match ?? matchData.overall_score} />
          </div>

          {/* Expandable AI Explanation */}
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex items-center gap-1 mt-2 text-[10px] font-medium text-accent hover:underline"
          >
            <Sparkles size={10} />
            {expanded ? "Hide AI analysis" : "Why this match?"}
            <ChevronDown size={10} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-2 border-t border-border space-y-1.5">
                  {matchData.matched_skills && matchData.matched_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-success font-medium w-full mb-0.5">✓ Matching</span>
                      {matchData.matched_skills.slice(0, 6).map((s) => (
                        <span key={s} className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] text-success">{s}</span>
                      ))}
                    </div>
                  )}
                  {matchData.missing_skills && matchData.missing_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-danger font-medium w-full mb-0.5">✗ Missing</span>
                      {matchData.missing_skills.slice(0, 6).map((s) => (
                        <span key={s} className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] text-danger">{s}</span>
                      ))}
                    </div>
                  )}
                  {atsGain > 0 && (
                    <p className="text-[10px] text-accent flex items-center gap-1 mt-1">
                      <TrendingUp size={10} /> Fill gaps to boost ATS by <strong>+{atsGain}%</strong>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        {onCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(o.id); }}
            className="btn-press flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-border bg-bg-default hover:bg-bg-hover text-fg-muted transition-all"
          >
            Compare
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onSelect?.(o.id); }}
          className="btn-press flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-accent/20 bg-accent-subtle text-accent hover:bg-accent hover:text-fg-default transition-all"
        >
          <Sparkles size={10} /> AI Prep
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (isSaved) { onUnsave?.(o.id); } else { onSave?.(o.id); } }}
          className={`btn-press p-1.5 rounded-lg transition-all ${isSaved ? "text-accent" : "text-fg-subtle hover:text-fg-default hover:bg-bg-hover"}`}
        >
          {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </div>
    </motion.div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "var(--color-success)" : value >= 60 ? "var(--color-accent)" : value >= 40 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-0.5">
        <span className="text-[10px] text-fg-muted">{label}</span>
        <span className="text-[10px] font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-bg-hover overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
