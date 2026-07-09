"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, BookmarkCheck, TrendingUp, Zap, Sparkles, Cpu,
  ChevronRight, ArrowRight, SearchCode, Clock, Loader2,
} from "lucide-react";
import { JobCard } from "./components/JobCard";
import { JobFilters } from "./components/JobFilters";
import { MarketTrendsView } from "./components/MarketTrends";
import { CompanyDrawer } from "./components/CompanyDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  searchOpportunities, getMarketTrends, saveOpportunity,
  unsaveOpportunity, getSavedOpportunities, getOpportunityRecommendations,
} from "./api";
import { getAgentDashboard } from "@/app/agents/api";
import type { Opportunity, SearchFilters, MarketTrends, CardMatchData, SmartFilterConfig } from "./types";

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [trends, setTrends] = useState<MarketTrends | null>(null);
  const [recommendations, setRecommendations] = useState<{ opp: Opportunity; match: CardMatchData }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [recoLoading, setRecoLoading] = useState(true);
  const [agentDash, setAgentDash] = useState<{ running_count: number; completed_today: number } | null>(null);
  const [companyDrawerName, setCompanyDrawerName] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    q: "", location: "", remote_type: "", employment_type: "",
    salary_min: "", salary_max: "", experience_min: "", experience_max: "",
    company: "", tech_stack: "", sort_by: "posted_at", sort_order: "desc",
  });

  const [smartFilters, setSmartFilters] = useState<SmartFilterConfig>({
    minMatchScore: 0, atsReady: false, interviewReady: false,
  });

  const load = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      params.page = String(pageNum);
      params.per_page = "20";
      const result = await searchOpportunities(params);
      setOpportunities(result.opportunities);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.total_pages);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getMarketTrends().then((r) => { setTrends(r.trends); setTrendsLoading(false); }).catch(() => setTrendsLoading(false));
    getSavedOpportunities().then((r) => setSavedIds(new Set(r.saved.map((s) => s.opportunity.id)))).catch(() => {});
    getOpportunityRecommendations().then((r) => {
      setRecommendations(r.recommendations.map((rec) => ({
        opp: rec.opportunity,
        match: {
          overall_score: rec.match_score.overall_score,
          ats_match: rec.match_score.ats_match,
          skill_match: rec.match_score.skill_match,
          experience_match: rec.match_score.experience_match,
          explanation: rec.match_score.explanation,
        },
      })));
      setRecoLoading(false);
    }).catch(() => setRecoLoading(false));
    getAgentDashboard().then((d) => setAgentDash({ running_count: d.running_count, completed_today: d.completed_today })).catch(() => {});
  }, []);

  const handleSave = async (id: number) => {
    await saveOpportunity(id);
    setSavedIds((prev) => new Set(prev).add(id));
  };

  const handleUnsave = async (id: number) => {
    await unsaveOpportunity(id);
    setSavedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const isSavedOpportunity = useCallback((id: number) => savedIds.has(id), [savedIds]);

  // Build a lookup of match data from recommendations for search results
  const matchDataMap = useMemo(() => {
    const map = new Map<number, CardMatchData>();
    recommendations.forEach((r) => map.set(r.opp.id, r.match));
    return map;
  }, [recommendations]);

  // Client-side smart filtering
  const filteredOpportunities = useMemo(() => {
    let result = opportunities;
    if (smartFilters.minMatchScore > 0) {
      result = result.filter((o) => (matchDataMap.get(o.id)?.overall_score ?? 0) >= smartFilters.minMatchScore);
    }
    if (smartFilters.atsReady) {
      result = result.filter((o) => (matchDataMap.get(o.id)?.ats_match ?? 0) >= 70);
    }
    if (smartFilters.interviewReady) {
      result = result.filter((o) => (matchDataMap.get(o.id)?.overall_score ?? 0) >= 60);
    }
    return result;
  }, [opportunities, smartFilters, matchDataMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase size={20} className="text-accent" /> Opportunity Intelligence
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            AI-powered discovery — find and prepare for your next role
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/agents")}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <Cpu size={14} /> Command Center
          </button>
          <button
            onClick={() => router.push("/saved-jobs")}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <BookmarkCheck size={14} /> Saved Jobs
          </button>
        </div>
      </div>

      {/* Filters */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        onSearch={() => load(1)}
        smartFilters={smartFilters}
        onSmartFiltersChange={setSmartFilters}
      />

      {/* AI Recommendations Section */}
      {!recoLoading && recommendations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles size={15} className="text-accent" /> AI Picks for You
            </h2>
            <button
              onClick={() => { load(1); }}
              className="text-[10px] text-accent flex items-center gap-0.5 hover:underline"
            >
              View all <ChevronRight size={11} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {recommendations.slice(0, 6).map((rec) => (
              <motion.div
                key={rec.opp.id}
                whileHover={{ y: -3 }}
                className="min-w-[260px] max-w-[260px] shrink-0 bg-bg-raised rounded-xl border border-border p-4 cursor-pointer group"
                onClick={() => router.push(`/opportunity/${rec.opp.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border">
                    {rec.opp.company_logo ? (
                      <img src={rec.opp.company_logo} alt={rec.opp.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <Briefcase size={16} className="text-accent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{rec.opp.title}</p>
                    <p className="text-[10px] text-fg-muted truncate">{rec.opp.company_name}</p>
                    {rec.opp.location && (
                      <p className="text-[9px] text-fg-subtle mt-0.5">{rec.opp.location}</p>
                    )}
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 border-2"
                    style={{
                      borderColor: `var(--color-${rec.match.overall_score >= 80 ? "success" : rec.match.overall_score >= 60 ? "accent" : "warning"})20`,
                      color: `var(--color-${rec.match.overall_score >= 80 ? "success" : rec.match.overall_score >= 60 ? "accent" : "warning"})`,
                    }}
                  >
                    {rec.match.overall_score}
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {rec.match.matched_skills?.slice(0, 3).map((s) => (
                    <span key={s} className="rounded bg-success/10 px-1.5 py-0.5 text-[9px] text-success">{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Market Trends */}
      {trends && Object.keys(trends).length > 0 && (
        <MarketTrendsView trends={trends} loading={trendsLoading} />
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-fg-muted">
          {loading ? (
            <span className="flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Searching...</span>
          ) : (
            `${filteredOpportunities.length} opportunity${filteredOpportunities.length !== 1 ? "ies" : "y"} found${smartFilters.minMatchScore > 0 ? ` (≥${smartFilters.minMatchScore}% match)` : ""}`
          )}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            className="field h-8 text-xs w-32"
          >
            <option value="posted_at">Latest</option>
            <option value="salary_max">Salary (High)</option>
            <option value="salary_min">Salary (Low)</option>
          </select>
        </div>
      </div>

      {/* Results / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          {filters.q || smartFilters.minMatchScore > 0 ? (
            <>
              <SearchCode size={40} className="mx-auto text-fg-subtle mb-3" />
              <p className="text-sm font-medium">No matching opportunities</p>
              <p className="text-xs text-fg-muted mt-1">
                {smartFilters.minMatchScore > 0
                  ? "Try lowering the minimum match score"
                  : "Try adjusting your search or filters"}
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => { setSmartFilters({ minMatchScore: 0, atsReady: false, interviewReady: false }); }}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-border hover:bg-bg-hover text-fg-muted transition-colors"
                >
                  Clear AI Filters
                </button>
                <button
                  onClick={() => router.push("/agents")}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-accent/20 bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors flex items-center gap-1"
                >
                  <Cpu size={11} /> Ask Career Agent
                </button>
              </div>
            </>
          ) : (
            <>
              <Cpu size={40} className="mx-auto text-fg-subtle mb-3" />
              <p className="text-sm font-medium">Your Career Agent is scanning</p>
              <p className="text-xs text-fg-muted mt-1">Analyzing your profile and matching with live opportunities...</p>
              <div className="flex justify-center gap-2 mt-5">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent"
                >
                  <Loader2 size={10} className="animate-spin" /> Job Discovery Agent
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent"
                >
                  <Loader2 size={10} className="animate-spin" /> ATS Intelligence
                </motion.span>
              </div>
              <button
                onClick={() => load(1)}
                className="mt-6 text-[11px] px-4 py-1.5 rounded-lg border border-accent/20 bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors"
              >
                Scan Now
              </button>
            </>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((o) => (
            <JobCard
              key={o.id}
              opportunity={o}
              matchData={matchDataMap.get(o.id)}
              isSaved={isSavedOpportunity(o.id)}
              onSave={handleSave}
              onUnsave={handleUnsave}
              onSelect={(id) => router.push(`/opportunity/${id}`)}
              onCompanyClick={setCompanyDrawerName}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && filteredOpportunities.length > 0 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-fg-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Company Preview Drawer */}
      <CompanyDrawer companyName={companyDrawerName} onClose={() => setCompanyDrawerName(null)} />

      {/* Floating Agent Widget */}
      <AnimatePresence>
        {agentDash && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-40"
          >
            <div
              className="bg-white rounded-xl border border-border shadow-xl p-3 w-56 cursor-pointer hover:shadow-2xl transition-shadow group"
              onClick={() => router.push("/agents")}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
                    <Cpu size={14} className="text-accent" />
                  </div>
                  {agentDash.running_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success animate-pulse ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold flex items-center gap-1">
                    Career Agent
                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                  </p>
                  <p className="text-[9px] text-fg-muted truncate">
                    {agentDash.running_count > 0
                      ? `${agentDash.running_count} agent${agentDash.running_count > 1 ? "s" : ""} running`
                      : `Today: ${agentDash.completed_today} tasks`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <Clock size={9} className="text-fg-subtle" />
                <span className="text-[8px] text-fg-subtle">Auto-scans every 6h</span>
                {agentDash.completed_today > 0 && (
                  <span className="text-[8px] text-success ml-auto">{agentDash.completed_today} done</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
