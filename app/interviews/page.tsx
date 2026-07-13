"use client";

import { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, Loader2, Building2, Calendar, Clock,
  Brain, Target, Lightbulb, MessageSquare, Trophy, X,
  ChevronDown, ExternalLink, Filter, BarChart3, Star,
  BookOpen, Sparkles, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  listInterviews, createInterview, deleteInterview, getInterviewStats,
  type InterviewRecord,
} from "./api";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", interview_type: "technical", date: "", difficulty_rating: 3, notes: "" });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        listInterviews(),
        getInterviewStats().catch(() => null),
      ]);
      setInterviews(r.interviews || []);
      setStats(s?.stats || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { startTransition(() => { load(); }); }, []);

  const handleCreate = async () => {
    if (!form.company || !form.role) return;
    try {
      await createInterview(form);
      setForm({ company: "", role: "", interview_type: "technical", date: "", difficulty_rating: 3, notes: "" });
      setShowForm(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    await deleteInterview(id);
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" /> Knowledge Vault
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            {stats ? `${stats.total} interviews · ${stats.offer_rate || 0}% offer rate` : "Interview records"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats && (
            <div className="flex items-center gap-3 text-[10px] text-fg-muted bg-surface border border-border rounded-lg px-3 py-1.5">
              <span>{stats.by_type?.technical || 0} Technical</span>
              <span>{stats.by_type?.behavioral || 0} Behavioral</span>
              <span>Avg ⭐ {stats.avg_difficulty?.toFixed(1) || "-"}</span>
            </div>
          )}
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancel" : "Record Interview"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border border-border rounded-xl p-5 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Company *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
              <input placeholder="Role *" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
              <select value={form.interview_type} onChange={(e) => setForm({ ...form, interview_type: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm">
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="mixed">Mixed</option>
                <option value="system_design">System Design</option>
                <option value="coding">Coding</option>
                <option value="phone_screen">Phone Screen</option>
                <option value="onsite">Onsite</option>
                <option value="hr">HR</option>
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-muted">Difficulty:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, difficulty_rating: n })}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      form.difficulty_rating >= n ? "bg-warning/10 text-warning" : "bg-border text-fg-muted"
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <textarea placeholder="Notes about the interview..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm min-h-[60px] resize-y" />
            <Button onClick={handleCreate}>Save Interview Record</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : interviews.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-accent" />
          </div>
          <p className="text-base font-semibold">No interviews recorded yet</p>
          <p className="text-xs text-fg-muted mt-1.5 max-w-md mx-auto">
            Start building your interview knowledge base by recording your first interview
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={() => setShowForm(true)}>Record Interview</Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {interviews.map((iv) => (
            <motion.div
              key={iv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl card-hover"
            >
              <div
                className="p-4 flex items-start gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === iv.id ? null : iv.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold">{iv.role}</h3>
                      <p className="text-xs text-fg-muted">{iv.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone={iv.interview_type === "technical" ? "accent" : iv.interview_type === "behavioral" ? "warning" : "neutral"}>
                        {iv.interview_type}
                      </Badge>
                      {iv.offer_received && <Badge tone="success">Offer</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-fg-muted">
                    {iv.date && <span className="flex items-center gap-1"><Calendar size={9} /> {new Date(iv.date).toLocaleDateString()}</span>}
                    {iv.difficulty_rating && <span className="flex items-center gap-1"><Star size={9} /> {iv.difficulty_rating}/5</span>}
                    {iv.questions_asked?.length > 0 && <span>{iv.questions_asked.length} questions</span>}
                  </div>
                </div>
                <ChevronDown size={14} className={`text-fg-muted transition-transform shrink-0 ${expandedId === iv.id ? "rotate-180" : ""}`} />
              </div>

              <AnimatePresence>
                {expandedId === iv.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border px-4 py-3 space-y-3 overflow-hidden"
                  >
                    {iv.questions_asked?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-fg-muted uppercase tracking-wider mb-1">Questions Asked</p>
                        <div className="flex flex-wrap gap-1.5">
                          {iv.questions_asked.map((q, i) => (
                            <span key={i} className="text-[11px] bg-bg-hover px-2 py-1 rounded-lg">{q}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {iv.lessons_learned?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-fg-muted uppercase tracking-wider mb-1">Lessons Learned</p>
                        <ul className="space-y-0.5">
                          {iv.lessons_learned.map((l, i) => (
                            <li key={i} className="text-[11px] text-fg-muted flex items-start gap-1.5">
                              <Lightbulb size={10} className="text-accent shrink-0 mt-0.5" />
                              {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {iv.notes && (
                      <div>
                        <p className="text-[10px] font-medium text-fg-muted uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-xs text-fg-muted">{iv.notes}</p>
                      </div>
                    )}
                    {iv.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {iv.tags.map((t, i) => <Badge key={i} tone="neutral">{t}</Badge>)}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(iv.id); }}>
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
