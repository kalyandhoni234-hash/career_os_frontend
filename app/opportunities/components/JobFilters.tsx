"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal, X, MapPin, Briefcase, IndianRupee, Sparkles, Zap } from "lucide-react";
import type { SearchFilters } from "../types";

interface JobFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  smartFilters?: {
    minMatchScore: number;
    atsReady: boolean;
    interviewReady: boolean;
  };
  onSmartFiltersChange?: (f: { minMatchScore: number; atsReady: boolean; interviewReady: boolean }) => void;
}

export function JobFilters({ filters, onChange, onSearch, smartFilters, onSmartFiltersChange }: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localQ, setLocalQ] = useState(filters.q || "");

  useEffect(() => {
    setLocalQ(filters.q || "");
  }, [filters.q]);

  const update = useCallback((key: keyof SearchFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  const clearFilters = () => {
    onChange({
      q: "", location: "", remote_type: "", employment_type: "",
      salary_min: "", salary_max: "", experience_min: "", experience_max: "",
      company: "", tech_stack: "", sort_by: "posted_at", sort_order: "desc",
    });
    onSmartFiltersChange?.({ minMatchScore: 0, atsReady: false, interviewReady: false });
    setLocalQ("");
  };

  const hasFilters = Object.entries(filters).some(([k, v]) => v && k !== "sort_by" && k !== "sort_order");

  return (
    <div className="space-y-3">
      {/* AI Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Sparkles size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent transition-all duration-200 group-focus-within:scale-110" />
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Career Agent — e.g. 'remote React jobs paying over 20L'"
            className="field pl-9 pr-3 h-10 text-sm placeholder:text-fg-subtle/60 focus:placeholder:text-fg-subtle/30 transition-all ring-1 ring-transparent focus:ring-accent/20"
          />
        </div>
        <Button onClick={() => { update("q", localQ); onSearch(); }}>Search</Button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-2 rounded-lg border border-border hover:bg-bg-hover transition-colors ${showAdvanced ? "bg-accent-subtle border-accent" : ""}`}
        >
          <SlidersHorizontal size={18} className={showAdvanced ? "text-accent" : "text-fg-muted"} />
        </button>
      </div>

      {/* Smart Filters Chip Row */}
      {onSmartFiltersChange && smartFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-fg-muted font-medium mr-0.5 flex items-center gap-1">
            <Zap size={10} /> AI Filters
          </span>
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-border px-2.5 py-1">
            <span className="text-[10px] text-fg-muted whitespace-nowrap">Min Match</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={smartFilters.minMatchScore}
              onChange={(e) => onSmartFiltersChange({ ...smartFilters, minMatchScore: Number(e.target.value) })}
              className="w-16 h-1 accent-accent cursor-pointer"
            />
            <span className="text-[10px] font-mono font-medium text-accent w-6 text-right">{smartFilters.minMatchScore}%</span>
          </div>
          <button
            onClick={() => onSmartFiltersChange({ ...smartFilters, atsReady: !smartFilters.atsReady })}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all ${
              smartFilters.atsReady
                ? "border-success/30 bg-success-subtle text-success"
                : "border-border bg-white text-fg-muted hover:bg-bg-hover"
            }`}
          >
            <Zap size={10} /> ATS Ready
          </button>
          <button
            onClick={() => onSmartFiltersChange({ ...smartFilters, interviewReady: !smartFilters.interviewReady })}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all ${
              smartFilters.interviewReady
                ? "border-success/30 bg-success-subtle text-success"
                : "border-border bg-white text-fg-muted hover:bg-bg-hover"
            }`}
          >
            <Sparkles size={10} /> Interview Ready
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white rounded-xl border border-border p-4 space-y-3 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Location</label>
              <Input
                placeholder="Bangalore, Remote..."
                value={filters.location}
                onChange={(e) => update("location", e.target.value)}
                onKeyDown={handleKeyDown}
                icon={<MapPin size={14} />}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Remote Type</label>
              <select
                value={filters.remote_type}
                onChange={(e) => update("remote_type", e.target.value)}
                className="field h-9 text-xs"
              >
                <option value="">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Employment Type</label>
              <select
                value={filters.employment_type}
                onChange={(e) => update("employment_type", e.target.value)}
                className="field h-9 text-xs"
              >
                <option value="">Any</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Company</label>
              <Input
                placeholder="Google, Amazon..."
                value={filters.company}
                onChange={(e) => update("company", e.target.value)}
                onKeyDown={handleKeyDown}
                icon={<Briefcase size={14} />}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Min Salary (LPA)</label>
              <Input
                placeholder="10"
                value={filters.salary_min}
                onChange={(e) => update("salary_min", e.target.value)}
                type="number"
                icon={<IndianRupee size={14} />}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Max Salary (LPA)</label>
              <Input
                placeholder="50"
                value={filters.salary_max}
                onChange={(e) => update("salary_max", e.target.value)}
                type="number"
                icon={<IndianRupee size={14} />}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Min Experience</label>
              <select
                value={filters.experience_min}
                onChange={(e) => update("experience_min", e.target.value)}
                className="field h-9 text-xs"
              >
                <option value="">Any</option>
                <option value="0">Fresher</option>
                <option value="1">1+ year</option>
                <option value="2">2+ years</option>
                <option value="4">4+ years</option>
                <option value="6">6+ years</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-fg-muted mb-1 block">Tech Stack</label>
              <Input
                placeholder="Python, React..."
                value={filters.tech_stack}
                onChange={(e) => update("tech_stack", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-fg-muted">Sort by:</label>
              <select
                value={filters.sort_by}
                onChange={(e) => update("sort_by", e.target.value)}
                className="field h-8 text-xs w-32"
              >
                <option value="posted_at">Date Posted</option>
                <option value="salary_max">Salary (High)</option>
                <option value="salary_min">Salary (Low)</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="flex gap-2">
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X size={14} /> Clear
                </Button>
              )}
              <Button onClick={() => { update("q", localQ); onSearch(); }}>Apply Filters</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
