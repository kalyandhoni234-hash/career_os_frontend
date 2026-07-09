"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, MessageCircle, Sparkles, GraduationCap, FileText, Briefcase, BrainCircuit, User, Target, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCareerDashboard } from "@/app/career/api";
import type { CareerDashboardData } from "@/app/career/types";
import { CareerScoreCard } from "@/app/career/components/CareerScoreCard";
import { SkillGapAnalysis } from "@/app/career/components/SkillGapAnalysis";
import { getSkillGaps } from "@/app/career/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const SUGGESTIONS = [
  { icon: FileText, text: "Review my resume and suggest improvements" },
  { icon: Briefcase, text: "What jobs should I apply to with my skills?" },
  { icon: GraduationCap, text: "How should I prepare for technical interviews?" },
  { icon: Sparkles, text: "Help me tailor my resume for a specific role" },
  { icon: Target, text: "What skills should I learn next?" },
  { icon: Award, text: "How can I improve my career score?" },
];

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.1, 0.1, 1] as const } },
};

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [careerData, setCareerData] = useState<CareerDashboardData | null>(null);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<{ target_role: string; coverage: number; matched_skills: string[]; missing_skills: string[]; gaps: { skill: string; priority: number; recommended_project: string | null; estimated_ats_gain: number }[] } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/api/coach/history")
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.message))
      .finally(() => setHistoryLoading(false));

    getCareerDashboard()
      .then((d) => setCareerData(d))
      .catch(() => {});

    getSkillGaps()
      .then((d) => setSkillGapAnalysis(d))
      .catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/coach/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSuggestion(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  async function handleClear() {
    try {
      await apiFetch("/api/coach/history", { method: "DELETE" });
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear history");
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-accent" />
            <h1 className="font-serif text-lg font-medium text-fg-default">Career Coach</h1>
            {careerData?.career_score?.overall_score != null && (
              <span className="rounded bg-accent/10 px-2 py-0.5 text-[11px] font-mono font-medium text-accent">
                Score: {careerData.career_score.overall_score}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-fg-muted transition-all duration-150 hover:bg-bg-hover hover:text-fg-default"
            >
              <BrainCircuit size={13} />
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider">Context</span>
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="btn-press flex items-center gap-1.5 text-sm text-fg-muted transition-all duration-150 hover:text-danger"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline font-mono text-xs uppercase tracking-wider">Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-6">
            {historyLoading ? (
              <div className="flex items-center justify-center py-20">
                <ThinkingDots />
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8 py-8"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-surface transition-all duration-150 hover:border-accent/30 hover:shadow-sm">
                    <MessageCircle size={24} className="text-accent" />
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-fg-default">
                    How can I help you today?
                  </h2>
                  <p className="mt-2 font-sans text-sm text-fg-muted">
                    I remember your resume, skills, applications, goals, and career history. Ask me anything.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(s.text)}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-bg-surface p-4 text-left transition-all duration-150 hover:border-accent/30 hover:shadow-sm active:scale-[0.98]"
                    >
                      <div className="rounded-lg border border-border bg-bg-default p-2 text-accent transition-all duration-200 group-hover:bg-accent-subtle group-hover:border-accent/30 group-hover:scale-105">
                        <s.icon size={16} />
                      </div>
                      <p className="text-sm text-fg-muted group-hover:text-fg-default">{s.text}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={`${i}-${msg.role}`}
                      variants={messageVariants}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i === messages.length - 1 && msg.role === "assistant" ? 0.1 : 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-shadow duration-150 ${
                          msg.role === "user"
                            ? "bg-accent text-white shadow-sm"
                            : "border border-border bg-bg-surface text-fg-default shadow-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="rounded-2xl border border-border bg-bg-surface px-4 py-3 shadow-sm">
                      <ThinkingDots />
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-bg-surface px-6 py-4">
          <div className="mx-auto max-w-2xl">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 font-mono text-xs text-danger"
              >
                {error}
              </motion.p>
            )}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                ref={inputRef}
                className="flex-1 rounded-xl border border-border bg-bg-default px-4 py-2.5 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ask your career coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                icon={<Send size={14} />}
                size="md"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Context sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden overflow-hidden border-l border-border bg-bg-surface lg:block"
          >
            <div className="flex h-full w-[320px] flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={14} className="text-accent" />
                  <h2 className="font-mono text-[11px] font-medium uppercase tracking-widest text-fg-default">
                    AI Memory
                  </h2>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-fg-muted hover:text-fg-default transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {/* Career memory summary */}
                {careerData && (
                  <>
                    {careerData.career_score && (
                      <CareerScoreCard score={careerData.career_score} compact />
                    )}

                    {careerData.career_memory && (
                      <Card className="p-3">
                        <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted mb-1.5 flex items-center gap-1.5">
                          <User size={10} /> Profile
                        </h3>
                        <p className="text-[11px] text-fg-default leading-relaxed">
                          {careerData.career_memory.user_profile?.current_role 
                            ? `${careerData.career_memory.user_profile.current_role} | ${careerData.career_memory.user_profile.years_of_experience}+ yrs`
                            : "No profile data yet"}
                        </p>
                        {careerData.career_memory.user_profile?.top_skills && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {careerData.career_memory.user_profile.top_skills.slice(0, 5).map((s: string) => (
                              <span key={s} className="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] text-accent">{s}</span>
                            ))}
                          </div>
                        )}
                      </Card>
                    )}

                    {careerData.career_memory?.job_search_stats && (
                      <Card className="p-3">
                        <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted mb-1.5 flex items-center gap-1.5">
                          <Briefcase size={10} /> Job Search
                        </h3>
                        <div className="space-y-1 text-[11px] text-fg-default">
                          <p>Applied: {careerData.career_memory.job_search_stats.total_applied}</p>
                          <p>Interviews: {careerData.career_memory.job_search_stats.total_interviews}</p>
                          <p>Offers: {careerData.career_memory.job_search_stats.total_offers}</p>
                          <p>Active: {careerData.career_memory.job_search_stats.active_applications}</p>
                        </div>
                      </Card>
                    )}

                    {careerData.recent_roadmaps && careerData.recent_roadmaps.length > 0 && (
                      <Card className="p-3">
                        <h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted mb-1.5 flex items-center gap-1.5">
                          <Target size={10} /> Learning
                        </h3>
                        {careerData.recent_roadmaps.slice(0, 3).map((r: { id: number; title: string; progress: number }) => (
                          <div key={r.id} className="mb-1.5 last:mb-0">
                            <div className="flex items-center justify-between text-[11px] text-fg-default">
                              <span className="truncate">{r.title}</span>
                              <span className="text-fg-muted">{r.progress}%</span>
                            </div>
                            <div className="mt-0.5 h-1 rounded-full bg-bg-default overflow-hidden">
                              <div className="h-full rounded-full bg-accent" style={{ width: `${r.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </Card>
                    )}
                  </>
                )}

                <SkillGapAnalysis analysis={skillGapAnalysis} />

                {!careerData && (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-xs text-fg-subtle">Loading career context...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
