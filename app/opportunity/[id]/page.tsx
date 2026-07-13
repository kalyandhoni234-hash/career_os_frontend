"use client";

import { useState, useEffect, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, Building2, MapPin, Briefcase, Clock, IndianRupee,
  ExternalLink, BookmarkCheck, Bookmark, ChevronDown, Loader2,
  LayoutDashboard, FileText, Users, Building, GraduationCap,
  MessageSquare, Calendar, FolderOpen, StickyNote, BarChart3,
  Sparkles, HeartHandshake, BookOpen, Settings2, ListChecks,
  Star, Lightbulb, Trophy, Target, Brain, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  MatchScoreCard, SkillGapCard, CompanyInsights,
  ApplicationAssistant, InterviewPackView, ResumeOptimizer,
} from "@/app/opportunities/components";
import {
  getOpportunity, getMatchScore, getSkillGaps, getApplicationReadiness,
  getInterviewPrep, optimizeResume, generateCoverLetter,
  saveOpportunity, unsaveOpportunity,
} from "@/app/opportunities/api";
import { apiFetch } from "@/lib/api";
import type { Opportunity, MatchScore, SkillGap, ApplicationReadiness, InterviewPack } from "@/app/opportunities/types";

type TabId = "overview" | "resume" | "cover-letter" | "company" | "interview" | "prep" | "star" | "networking" | "timeline" | "documents" | "notes" | "analytics" | "settings";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "resume", label: "Resume", icon: FileText },
  { id: "cover-letter", label: "Cover Letter", icon: MessageSquare },
  { id: "company", label: "Company", icon: Building },
  { id: "interview", label: "Interview", icon: GraduationCap },
  { id: "prep", label: "Prep Kit", icon: ListChecks },
  { id: "star", label: "STAR Stories", icon: Star },
  { id: "networking", label: "Networking", icon: HeartHandshake },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "settings", label: "Settings", icon: Settings2 },
];

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
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [agentData, setAgentData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ opportunity, saved }] = await Promise.all([getOpportunity(oppId)]);
        startTransition(() => {
          setOpp(opportunity);
          setIsSaved(!!saved);
        });

        Promise.all([
          getMatchScore(oppId).then((r) => startTransition(() => setMatchScore(r.match_score))).catch(() => {}),
          getSkillGaps(oppId).then((r) => startTransition(() => setSkillGap(r.skill_gaps))).catch(() => {}),
          getApplicationReadiness(oppId).then((r) => startTransition(() => setReadiness(r.readiness))).catch(() => {}),
          apiFetch(`/api/opportunities/agent/actions?opportunity_id=${oppId}`)
            .then((r: any) => setAgentData(r.agent)).catch(() => {}),
        ]);
      } catch {}
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
    } catch {}
    setInterviewLoading(false);
  };

  const handleReadiness = async () => {
    setReadinessLoading(true);
    try {
      const result = await getApplicationReadiness(oppId);
      setReadiness(result.readiness);
    } catch {}
    setReadinessLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-32 shimmer rounded" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-fg-muted">Opportunity not found</p>
        <Button className="mt-4" onClick={() => router.push("/opportunities")}>Back to Jobs</Button>
      </div>
    );
  }

  const salaryDisplay = opp.salary_min && opp.salary_max
    ? `${opp.currency === "INR" ? "₹" : "$"}${(opp.salary_min / 100000).toFixed(1)}–${(opp.salary_max / 100000).toFixed(1)}L`
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-border transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1" />
        {isSaved && (
          <Badge tone="success">
            <BookmarkCheck size={11} className="mr-1" /> Saved
          </Badge>
        )}
        <button
          onClick={handleSave}
          className={`p-2 rounded-lg transition-colors ${isSaved ? "bg-accent/10" : "hover:bg-border"}`}
        >
          {isSaved ? <BookmarkCheck size={18} className="text-accent" /> : <Bookmark size={18} className="text-fg-muted" />}
        </button>
      </div>

      {/* Agent Priority Banner */}
      {agentData?.top_recommendation && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent/10 to-success/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3"
        >
          <Sparkles size={20} className="text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-fg-default">
              {agentData.top_recommendation.action}
            </p>
            <p className="text-xs text-fg-muted mt-1">
              {agentData.top_recommendation.reason}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-fg-muted">
              {agentData.top_recommendation.estimated_time_minutes && (
                <span>⏱ {agentData.top_recommendation.estimated_time_minutes} min</span>
              )}
              {agentData.top_recommendation.impact && (
                <span className={`font-medium ${agentData.top_recommendation.impact === "very_high" || agentData.top_recommendation.impact === "high" ? "text-accent" : ""}`}>
                  Impact: {agentData.top_recommendation.impact.replace("_", " ")}
                </span>
              )}
              {agentData.top_recommendation.deadline && (
                <span>📅 {agentData.top_recommendation.deadline}</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-0.5 overflow-x-auto bg-surface border border-border rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? "bg-accent/10 text-accent shadow-sm" : "text-fg-muted hover:text-fg-default hover:bg-bg-hover"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {activeTab === "overview" && (
          <OverviewTab
            opp={opp} salaryDisplay={salaryDisplay} showAll={showAll} setShowAll={setShowAll}
            matchScore={matchScore} skillGap={skillGap}
            readiness={readiness} readinessLoading={readinessLoading}
            interviewPack={interviewPack} interviewLoading={interviewLoading}
            handleReadiness={handleReadiness} handleInterviewPrep={handleInterviewPrep}
            oppId={oppId} agentData={agentData}
          />
        )}
        {activeTab === "resume" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Resume Optimization</h2>
            <ResumeOptimizer opportunityId={oppId} onOptimize={optimizeResume} onCoverLetter={generateCoverLetter} />
          </div>
        )}
        {activeTab === "cover-letter" && (
          <CoverLetterTab oppId={oppId} />
        )}
        {activeTab === "company" && opp.company_profile && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Company Research</h2>
            <CompanyInsights company={opp.company_profile} />
          </div>
        )}
        {activeTab === "interview" && (
          <InterviewTab oppId={oppId} />
        )}
        {activeTab === "prep" && (
          <PrepKitTab oppId={oppId} />
        )}
        {activeTab === "star" && (
          <StarStoriesTab oppId={oppId} />
        )}
        {activeTab === "networking" && (
          <NetworkingTab oppId={oppId} companyName={opp.company_name} />
        )}
        {activeTab === "analytics" && (
          <AnalyticsTab oppId={oppId} />
        )}
        {activeTab === "timeline" && (
          <TimelineTab oppId={oppId} />
        )}
        {activeTab === "documents" && (
          <DocumentsTab oppId={oppId} />
        )}
        {activeTab === "notes" && (
          <NotesTab oppId={oppId} />
        )}
        {activeTab === "settings" && (
          <SettingsTab oppId={oppId} />
        )}
      </motion.div>
    </div>
  );
}

function OverviewTab({
  opp, salaryDisplay, showAll, setShowAll,
  matchScore, skillGap, readiness, readinessLoading,
  interviewPack, interviewLoading, handleReadiness, handleInterviewPrep, oppId, agentData,
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Company & Title Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
              {opp.company_logo ? (
                <Image src={opp.company_logo} alt={opp.company_name} width={48} height={48} className="w-full h-full object-contain" unoptimized />
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
                  <span className="flex items-center gap-1.5"><Briefcase size={14} /> {opp.experience_required}–{opp.experience_max || "∞"} yrs</span>
                )}
              </div>
              {opp.company_url && (
                <a href={opp.company_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-3">
                  <ExternalLink size={12} /> Company Website
                </a>
              )}
            </div>
          </div>
          {opp.tech_stack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
              {opp.tech_stack.map((tech: string) => <Badge key={tech} tone="accent">{tech}</Badge>)}
            </div>
          )}
        </motion.div>

        {opp.description && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Description</h3>
            <div className="text-xs text-fg-muted leading-relaxed whitespace-pre-line">
              {showAll || opp.description.length < 500 ? opp.description : `${opp.description.slice(0, 500)}...`}
            </div>
            {opp.description.length >= 500 && (
              <button onClick={() => setShowAll(!showAll)}
                className="text-xs text-accent flex items-center gap-1 mt-2 hover:underline">
                {showAll ? "Show less" : "Show more"} <ChevronDown size={12} className={showAll ? "rotate-180" : ""} />
              </button>
            )}
          </motion.div>
        )}

        {opp.requirements?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Requirements</h3>
            <ul className="space-y-1.5">
              {opp.requirements.map((req: string, i: number) => (
                <li key={i} className="text-xs text-fg-muted flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                  {req}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {opp.responsibilities?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Responsibilities</h3>
            <ul className="space-y-1.5">
              {opp.responsibilities.map((resp: string, i: number) => (
                <li key={i} className="text-xs text-fg-muted flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                  {resp}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <div>
          {interviewPack ? (
            <InterviewPackView pack={interviewPack} loading={false} />
          ) : (
            <button onClick={handleInterviewPrep} disabled={interviewLoading}
              className="w-full p-4 rounded-xl border border-border border-dashed bg-surface hover:bg-bg-hover transition-colors text-left">
              <div className="flex items-center gap-3">
                {interviewLoading ? <Loader2 size={18} className="animate-spin text-accent" /> : (
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <GraduationCap size={18} className="text-accent" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{interviewLoading ? "Generating..." : "Generate Interview Preparation"}</p>
                  <p className="text-xs text-fg-muted">Questions, coding topics, behavioral prep</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {matchScore && <MatchScoreCard score={matchScore} />}
        {skillGap && <SkillGapCard gap={skillGap} />}
        <ApplicationAssistant readiness={readiness} loading={readinessLoading} />
        {!readiness && !readinessLoading && (
          <button onClick={handleReadiness}
            className="w-full p-4 rounded-xl border border-border border-dashed bg-surface hover:bg-bg-hover transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">Check Readiness</p>
                <p className="text-xs text-fg-muted">AI analyzes your profile against this job</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function CoverLetterTab({ oppId }: { oppId: number }) {
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await generateCoverLetter(oppId, tone);
      setResult(r.cover_letter);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={tone} onChange={(e) => setTone(e.target.value)}
          className="field text-sm px-3 py-2 rounded-lg border border-border bg-surface">
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="technical">Technical</option>
          <option value="concise">Concise</option>
        </select>
        <Button onClick={generate} disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : null}
          Generate Cover Letter
        </Button>
      </div>
      {result && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          {result.subject && <p className="text-sm font-semibold">Subject: {result.subject}</p>}
          <div className="text-sm text-fg-muted leading-relaxed whitespace-pre-line space-y-2">
            {result.salutation && <p>{result.salutation}</p>}
            <p>{result.body}</p>
            {result.closing && <p>{result.closing}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewTab({ oppId }: { oppId: number }) {
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getInterviewPrep(oppId);
      setPack(r.interview_pack);
    } catch {}
    setLoading(false);
  };

  if (!pack) {
    return (
      <button onClick={load} disabled={loading}
        className="w-full p-6 rounded-xl border border-border border-dashed bg-surface hover:bg-bg-hover text-left">
        <div className="flex items-center gap-3">
          {loading ? <Loader2 size={20} className="animate-spin text-accent" /> : (
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <GraduationCap size={22} className="text-accent" />
            </div>
          )}
          <div>
            <p className="text-base font-semibold">{loading ? "Generating..." : "Generate Interview Pack"}</p>
            <p className="text-sm text-fg-muted">AI creates a tailored preparation plan for this role</p>
          </div>
        </div>
      </button>
    );
  }

  return <InterviewPackView pack={pack} loading={false} />;
}

function NetworkingTab({ oppId, companyName }: { oppId: number; companyName: string }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", relationship: "contact", linkedin_url: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [c, h] = await Promise.all([
        apiFetch(`/api/relationships?opportunity_id=${oppId}`).catch(() => ({ contacts: [] })),
        apiFetch(`/api/relationships/health`).catch(() => ({ health: {} })),
      ]);
      setContacts((c as any).contacts || []);
      setHealth((h as any).health || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [oppId]);

  const addContact = async () => {
    if (!form.name) return;
    try {
      await apiFetch("/api/relationships", {
        method: "POST",
        body: JSON.stringify({ ...form, opportunity_id: oppId, company: companyName }),
      });
      setForm({ name: "", role: "", relationship: "contact", linkedin_url: "" });
      setShowForm(false);
      load();
    } catch {}
  };

  const relationshipColors: Record<string, string> = {
    recruiter: "bg-accent/10 text-accent",
    hiring_manager: "bg-warning/10 text-warning",
    referral: "bg-success/10 text-success",
    alumni: "bg-accent/10 text-accent",
    mentor: "bg-warning/10 text-warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Networking</h2>
          <p className="text-xs text-fg-muted">Track relationships at {companyName}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Contact"}
        </Button>
      </div>

      {health && (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-mono ${
            health.health_score >= 70 ? "bg-success/10 text-success" :
            health.health_score >= 40 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
          }`}>
            {health.health_score}
          </div>
          <div>
            <p className="text-sm font-semibold">Networking Health</p>
            <p className="text-xs text-fg-muted">{health.total_contacts} contacts · {health.contacted_recently} contacted recently · {health.with_upcoming_follow_up} follow-ups scheduled</p>
          </div>
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
          <input placeholder="Role (e.g., Recruiter)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
          <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm">
            <option value="contact">Contact</option>
            <option value="recruiter">Recruiter</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="referral">Referral</option>
            <option value="alumni">Alumni</option>
            <option value="mentor">Mentor</option>
            <option value="friend">Friend</option>
            <option value="linkedin_connection">LinkedIn Connection</option>
          </select>
          <input placeholder="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
          <Button onClick={addContact}>Save Contact</Button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <HeartHandshake size={36} className="mx-auto text-fg-muted mb-3" />
          <p className="text-sm text-fg-muted">No contacts yet</p>
          <p className="text-xs text-fg-muted mt-1">Add recruiters, hiring managers, or referrals</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c: any) => (
            <div key={c.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-fg-muted">{c.role || ""}{c.company ? ` at ${c.company}` : ""}</p>
                {c.last_contacted_at && <p className="text-[10px] text-fg-muted mt-0.5">Last contact: {new Date(c.last_contacted_at).toLocaleDateString()}</p>}
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${relationshipColors[c.relationship] || "bg-border text-fg-muted"}`}>
                {c.relationship?.replace("_", " ") || "contact"}
              </span>
              {c.linkedin_url && (
                <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-fg-muted hover:text-accent transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ oppId }: { oppId: number }) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/opportunities/${oppId}/health`)
      .then((r: any) => setHealth(r.health))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [oppId]);

  if (loading) return <CardSkeleton />;
  if (!health) return <p className="text-sm text-fg-muted">Failed to load analytics</p>;

  const factors = health.factors || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-mono ${
          health.overall_score >= 80 ? "bg-success/10 text-success" :
          health.overall_score >= 60 ? "bg-warning/10 text-warning" :
          health.overall_score >= 40 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
        }`}>
          {health.overall_score}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Application Health</h2>
          <p className="text-sm text-fg-muted">{health.summary}</p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(factors).map(([key, f]: [string, any]) => (
          <div key={key} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
              <span className="text-xs text-fg-muted">{f.weight}% weight</span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${f.score}%`,
                backgroundColor: f.score >= 70 ? "#22c55e" : f.score >= 40 ? "#f59e0b" : "#ef4444",
              }} />
            </div>
            {f.reasons?.map((r: string, i: number) => (
              <p key={i} className="text-[11px] text-fg-muted flex items-start gap-1">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${
                  r.toLowerCase().includes("add") || r.toLowerCase().includes("no") || r.toLowerCase().includes("limited") || r.toLowerCase().includes("consider")
                    ? "bg-warning" : "bg-success"
                }`} />
                {r}
              </p>
            ))}
          </div>
        ))}
      </div>

      {health.top_improvements?.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-warning mb-2">Top Improvements</h3>
          <ul className="space-y-1">
            {health.top_improvements.map((imp: string, i: number) => (
              <li key={i} className="text-xs text-fg-muted flex items-start gap-2">
                <span className="text-warning">•</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ oppId }: { oppId: number }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/timeline/events`)
      .then((r: any) => {
        const events = r.events || r || [];
        const filtered = Array.isArray(events)
          ? events.filter((e: any) => e.metadata_json?.opportunity_id == oppId || e.description?.includes(String(oppId)))
          : [];
        setActivities(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [oppId]);

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Timeline</h2>
      {activities.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={36} className="mx-auto text-fg-muted mb-3" />
          <p className="text-sm text-fg-muted">No timeline events yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((a: any, i: number) => (
            <div key={a.id || i} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
              <div>
                <p className="text-sm font-medium">{a.title || "Event"}</p>
                {a.description && <p className="text-xs text-fg-muted">{a.description}</p>}
                {a.event_date && <p className="text-[10px] text-fg-muted mt-1">{new Date(a.event_date).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrepKitTab({ oppId }: { oppId: number }) {
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getInterviewPrep(oppId);
      setPack(r.interview_pack);
      if (r.interview_pack?.preparation_checklist) {
        setChecklist(
          r.interview_pack.preparation_checklist.map((item: string, i: number) => ({
            id: `check-${i}`,
            label: item,
            done: false,
          }))
        );
      }
    } catch {}
    setLoading(false);
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  if (!pack) {
    return (
      <button onClick={load} disabled={loading}
        className="w-full p-6 rounded-xl border border-border border-dashed bg-surface hover:bg-bg-hover text-left">
        <div className="flex items-center gap-3">
          {loading ? <Loader2 size={20} className="animate-spin text-accent" /> : (
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <ListChecks size={22} className="text-accent" />
            </div>
          )}
          <div>
            <p className="text-base font-semibold">{loading ? "Generating..." : "Generate Prep Kit"}</p>
            <p className="text-sm text-fg-muted">AI creates a tailored preparation plan with checklist</p>
          </div>
        </div>
      </button>
    );
  }

  const progress = checklist.length > 0 ? Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Preparation Kit</h2>
        {checklist.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <span>{checklist.filter((c) => c.done).length}/{checklist.length} done</span>
            <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Checklist</p>
          {checklist.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleCheck(c.id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors ${
                c.done ? "text-fg-muted line-through" : "text-fg-default hover:bg-bg-hover"
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                c.done ? "bg-accent border-accent" : "border-border"
              }`}>
                {c.done && <Check size={10} className="text-white" />}
              </div>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {pack.likely_questions?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">Likely Questions</p>
          <div className="space-y-2">
            {pack.likely_questions.map((q: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-bg-hover transition-colors">
                <Brain size={14} className="text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{q.question}</p>
                  <p className="text-[10px] text-fg-muted">{q.category} · {q.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pack.coding_topics?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">Coding Topics</p>
          <div className="flex flex-wrap gap-2">
            {pack.coding_topics.map((t: any, i: number) => (
              <div key={i} className="bg-accent/5 border border-accent/10 rounded-lg px-3 py-2 text-xs">
                <p className="font-medium">{t.topic}</p>
                <p className="text-[10px] text-fg-muted">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pack.learning_resources?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">Learning Resources</p>
          <div className="space-y-2">
            {pack.learning_resources.map((r: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-bg-hover transition-colors">
                <BookOpen size={14} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">{r.topic}</p>
                  <p className="text-[10px] text-fg-muted">{r.resource_type} · {r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarStoriesTab({ oppId }: { oppId: number }) {
  const [stories, setStories] = useState<{ id: string; title: string; situation: string; task: string; action: string; result: string; category: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", situation: "", task: "", action: "", result: "", category: "leadership" });

  const addStory = () => {
    if (!form.title || !form.situation) return;
    setStories((prev) => [...prev, { ...form, id: Math.random().toString(36).slice(2) }]);
    setForm({ title: "", situation: "", task: "", action: "", result: "", category: "leadership" });
    setShowForm(false);
  };

  const CATEGORIES = [
    { value: "leadership", label: "Leadership", icon: Trophy },
    { value: "conflict", label: "Conflict", icon: Target },
    { value: "failure", label: "Failure", icon: Lightbulb },
    { value: "achievement", label: "Achievement", icon: Star },
    { value: "teamwork", label: "Teamwork", icon: HeartHandshake },
    { value: "learning", label: "Learning", icon: BookOpen },
    { value: "pressure", label: "Pressure", icon: Brain },
    { value: "communication", label: "Communication", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">STAR Stories</h2>
          <p className="text-xs text-fg-muted">Build reusable interview stories using the STAR method</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Story"}
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-surface border border-border rounded-xl p-4 space-y-3"
        >
          <input placeholder="Story title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = form.category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isActive ? "bg-accent/10 text-accent ring-1 ring-accent/30" : "bg-border text-fg-muted hover:text-fg-default"
                  }`}
                >
                  <CatIcon size={12} /> {cat.label}
                </button>
              );
            })}
          </div>
          <textarea placeholder="Situation — Describe the context..." value={form.situation} onChange={(e) => setForm({ ...form, situation: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm min-h-[60px] resize-y" />
          <textarea placeholder="Task — What was your responsibility?" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm min-h-[60px] resize-y" />
          <textarea placeholder="Action — What steps did you take?" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm min-h-[60px] resize-y" />
          <textarea placeholder="Result — What was the outcome?" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}
            className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm min-h-[60px] resize-y" />
          <Button onClick={addStory}>Save Story</Button>
        </motion.div>
      )}

      {stories.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <Star size={36} className="mx-auto text-fg-muted mb-3" />
          <p className="text-sm text-fg-muted">No STAR stories yet</p>
          <p className="text-xs text-fg-muted mt-1">Create reusable stories for your interviews</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stories.map((s) => {
            const cat = CATEGORIES.find((c) => c.value === s.category);
            const CatIcon = cat?.icon || Star;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CatIcon size={14} className="text-accent" />
                    <p className="text-sm font-semibold">{s.title}</p>
                  </div>
                  <Badge tone="accent">{s.category}</Badge>
                </div>
                <div className="space-y-1 text-xs text-fg-muted">
                  {s.situation && <p><span className="font-medium text-fg-default">S:</span> {s.situation}</p>}
                  {s.task && <p><span className="font-medium text-fg-default">T:</span> {s.task}</p>}
                  {s.action && <p><span className="font-medium text-fg-default">A:</span> {s.action}</p>}
                  {s.result && <p><span className="font-medium text-fg-default">R:</span> {s.result}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ oppId }: { oppId: number }) {
  const [docs, setDocs] = useState<{ id: string; type: string; title: string; content: string; created: string }[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  const generateDoc = async (type: string) => {
    setGenerating(type);
    try {
      if (type === "resume") {
        const r = await optimizeResume(oppId);
        const doc = r.optimization;
        setDocs((prev) => [...prev, {
          id: Math.random().toString(36).slice(2),
          type: "resume",
          title: `Optimized Resume — ${doc.company_name}`,
          content: doc.optimized_summary,
          created: new Date().toISOString(),
        }]);
      } else if (type === "cover-letter") {
        const r = await generateCoverLetter(oppId, "professional");
        const doc = r.cover_letter;
        setDocs((prev) => [...prev, {
          id: Math.random().toString(36).slice(2),
          type: "cover-letter",
          title: `Cover Letter — ${doc.subject || "Professional"}`,
          content: `${doc.salutation || ""}\n\n${doc.body}\n\n${doc.closing || ""}`,
          created: new Date().toISOString(),
        }]);
      }
    } catch {}
    setGenerating(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => generateDoc("resume")} disabled={generating === "resume"}>
            {generating === "resume" ? <Loader2 size={13} className="animate-spin" /> : null}
            Generate Resume
          </Button>
          <Button variant="ghost" onClick={() => generateDoc("cover-letter")} disabled={generating === "cover-letter"}>
            {generating === "cover-letter" ? <Loader2 size={13} className="animate-spin" /> : null}
            Generate Cover Letter
          </Button>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen size={36} className="mx-auto text-fg-muted mb-3" />
          <p className="text-sm text-fg-muted">No documents yet</p>
          <p className="text-xs text-fg-muted mt-1">Generate resumes and cover letters for this opportunity</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {d.type === "resume" ? <FileText size={14} className="text-accent" /> : <MessageSquare size={14} className="text-accent" />}
                  <p className="text-sm font-semibold">{d.title}</p>
                </div>
                <Badge tone={d.type === "resume" ? "success" : "accent"}>{d.type}</Badge>
              </div>
              <p className="text-xs text-fg-muted whitespace-pre-line line-clamp-3">{d.content}</p>
              <p className="text-[10px] text-fg-muted mt-2">Created {new Date(d.created).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ oppId }: { oppId: number }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Mission Settings</h2>
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-medium">Reminders</p>
          <p className="text-xs text-fg-muted mt-0.5">Receive proactive notifications for this application</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Follow-up reminders</p>
            <p className="text-[10px] text-fg-muted">Get reminded when it&apos;s time to follow up</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-accent cursor-pointer relative">
            <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Interview prep reminders</p>
            <p className="text-[10px] text-fg-muted">Get reminded to prepare before interviews</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-accent cursor-pointer relative">
            <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Networking nudges</p>
            <p className="text-[10px] text-fg-muted">Remind you to connect with contacts at this company</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-border cursor-pointer relative">
            <div className="w-4 h-4 rounded-full bg-white absolute top-1 left-1 shadow-sm" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <p className="text-sm font-medium">Danger Zone</p>
        <p className="text-xs text-fg-muted">Permanently remove this application from your missions</p>
        <Button variant="danger">Unsave Opportunity</Button>
      </div>
    </div>
  );
}

function NotesTab({ oppId }: { oppId: number }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    apiFetch(`/api/opportunities/${oppId}`)
      .then((r: any) => {
        if (r.saved?.notes) setNotes(r.saved.notes);
      })
      .catch(() => {});
  }, [oppId]);

  const saveNotes = async () => {
    try {
      await apiFetch(`/api/opportunities/${oppId}/save`, {
        method: "PUT",
        body: JSON.stringify({ notes }),
      });
    } catch {}
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notes</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add your notes about this opportunity..."
        className="field w-full min-h-[200px] px-4 py-3 rounded-xl border border-border bg-surface text-sm resize-y"
      />
      <div className="flex gap-2">
        <Button onClick={saveNotes}>Save Notes</Button>
      </div>
    </div>
  );
}
