"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Building2, MapPin, Briefcase, Clock, IndianRupee,
  ExternalLink, BookmarkCheck, Bookmark, Share2, ChevronDown, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  MatchScoreCard, SkillGapCard, CompanyInsights, SalaryCard,
  ApplicationAssistant, InterviewPackView, ResumeOptimizer,
} from "@/app/opportunities/components";
import {
  getOpportunity, getMatchScore, getSkillGaps, getApplicationReadiness,
  getInterviewPrep, optimizeResume, generateCoverLetter,
  saveOpportunity, unsaveOpportunity,
} from "@/app/opportunities/api";
import type { Opportunity, MatchScore, SkillGap, ApplicationReadiness, InterviewPack } from "@/app/opportunities/types";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const oppId = parseInt(id);

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [readiness, setReadiness] = useState<ApplicationReadiness | null>(null);
  const [interviewPack, setInterviewPack] = useState<InterviewPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ opportunity, saved }] = await Promise.all([
          getOpportunity(oppId),
        ]);
        setOpp(opportunity);
        setIsSaved(!!saved);

        // Load AI data in parallel
        Promise.all([
          getMatchScore(oppId).then((r) => setMatchScore(r.match_score)).catch(() => {}),
          getSkillGaps(oppId).then((r) => setSkillGap(r.skill_gaps)).catch(() => {}),
          getApplicationReadiness(oppId).then((r) => setReadiness(r.readiness)).catch(() => {}),
        ]);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [oppId]);

  const handleSave = async () => {
    if (isSaved) {
      await unsaveOpportunity(oppId);
      setIsSaved(false);
    } else {
      await saveOpportunity(oppId);
      setIsSaved(true);
    }
  };

  const handleInterviewPrep = async () => {
    setInterviewLoading(true);
    try {
      const result = await getInterviewPrep(oppId);
      setInterviewPack(result.interview_pack);
    } catch { /* ignore */ }
    setInterviewLoading(false);
  };

  const handleReadiness = async () => {
    setReadinessLoading(true);
    try {
      const result = await getApplicationReadiness(oppId);
      setReadiness(result.readiness);
    } catch { /* ignore */ }
    setReadinessLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-32 shimmer rounded" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-fg-muted">Opportunity not found</p>
        <Button className="mt-4" onClick={() => router.push("/opportunities")}>Back to Jobs</Button>
      </div>
    );
  }

  const salaryDisplay = opp.salary_min && opp.salary_max
    ? `${opp.currency === "INR" ? "₹" : "$"}${(opp.salary_min / 100000).toFixed(1)}–${(opp.salary_max / 100000).toFixed(1)}L`
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className={`p-2 rounded-lg transition-colors ${isSaved ? "bg-accent-subtle" : "hover:bg-bg-hover"}`}
        >
          {isSaved ? <BookmarkCheck size={18} className="text-accent" /> : <Bookmark size={18} className="text-fg-muted" />}
        </button>
      </div>

      {/* Company & Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-border p-6"
      >
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden">
            {opp.company_logo ? (
              <img src={opp.company_logo} alt={opp.company_name} className="w-full h-full object-contain" />
            ) : (
              <Building2 size={28} className="text-accent" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold mb-1">{opp.title}</h1>
            <p className="text-sm text-fg-muted mb-3">{opp.company_name}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-fg-muted">
              {opp.location && <span className="flex items-center gap-1.5"><MapPin size={14} /> {opp.location}</span>}
              {opp.remote_type && <span className="flex items-center gap-1.5"><Briefcase size={14} /> {opp.remote_type}</span>}
              {salaryDisplay && <span className="flex items-center gap-1.5"><IndianRupee size={14} /> {salaryDisplay}</span>}
              {opp.employment_type && <span className="flex items-center gap-1.5"><Clock size={14} /> {opp.employment_type}</span>}
              {opp.experience_required != null && (
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} /> {opp.experience_required}–{opp.experience_max || "∞"} yrs
                </span>
              )}
            </div>

            {opp.company_url && (
              <a
                href={opp.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3"
              >
                <ExternalLink size={12} /> Company Website
              </a>
            )}
          </div>
        </div>

        {opp.tech_stack && opp.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
            {opp.tech_stack.map((tech) => (
              <Badge key={tech} tone="accent">{tech}</Badge>
            ))}
          </div>
        )}
      </motion.div>

      {/* Main Content: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {opp.description && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-5"
            >
              <h3 className="text-sm font-semibold mb-3">Description</h3>
              <div className="text-xs text-fg-muted leading-relaxed whitespace-pre-line">
                {showAll || opp.description.length < 500 ? opp.description : `${opp.description.slice(0, 500)}...`}
              </div>
              {opp.description.length >= 500 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-accent flex items-center gap-1 mt-2 hover:underline"
                >
                  {showAll ? "Show less" : "Show more"} <ChevronDown size={12} className={showAll ? "rotate-180" : ""} />
                </button>
              )}
            </motion.div>
          )}

          {opp.requirements && opp.requirements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-5"
            >
              <h3 className="text-sm font-semibold mb-3">Requirements</h3>
              <ul className="space-y-1.5">
                {opp.requirements.map((req, i) => (
                  <li key={i} className="text-xs text-fg-muted flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {opp.responsibilities && opp.responsibilities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-5"
            >
              <h3 className="text-sm font-semibold mb-3">Responsibilities</h3>
              <ul className="space-y-1.5">
                {opp.responsibilities.map((resp, i) => (
                  <li key={i} className="text-xs text-fg-muted flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                    {resp}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Interview Prep */}
          <div>
            {interviewPack ? (
              <InterviewPackView pack={interviewPack} loading={false} />
            ) : (
              <button
                onClick={handleInterviewPrep}
                disabled={interviewLoading}
                className="w-full p-4 rounded-xl border border-border border-dashed bg-white hover:bg-bg-raised transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {interviewLoading ? (
                    <Loader2 size={18} className="animate-spin text-accent" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                      <Briefcase size={18} className="text-accent" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {interviewLoading ? "Generating interview prep..." : "Generate Interview Preparation"}
                    </p>
                    <p className="text-xs text-fg-muted">
                      Likely questions, coding topics, behavioral prep, and more
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Resume Optimizer */}
          <ResumeOptimizer
            opportunityId={oppId}
            onOptimize={optimizeResume}
            onCoverLetter={generateCoverLetter}
          />
        </div>

        {/* Right Sidebar: AI Scores */}
        <div className="space-y-6">
          {/* Application Assistant */}
          <ApplicationAssistant readiness={readiness} loading={readinessLoading} />
          {!readiness && !readinessLoading && (
            <button
              onClick={handleReadiness}
              className="w-full p-4 rounded-xl border border-border border-dashed bg-white hover:bg-bg-raised transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                  <Briefcase size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Check Application Readiness</p>
                  <p className="text-xs text-fg-muted">AI analyzes your profile against this job</p>
                </div>
              </div>
            </button>
          )}

          {matchScore && <MatchScoreCard score={matchScore} />}
          {skillGap && <SkillGapCard gap={skillGap} />}

          {opp.company_profile && <CompanyInsights company={opp.company_profile} />}
        </div>
      </div>
    </div>
  );
}
