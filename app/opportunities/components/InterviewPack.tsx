"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code, MessageSquare, BrainCircuit, Building2,
  CheckSquare, BookOpen, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { InterviewPack as InterviewPackType } from "../types";

interface InterviewPackProps {
  pack: InterviewPackType | null;
  loading: boolean;
}

export function InterviewPackView({ pack, loading }: InterviewPackProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("questions");

  if (loading) {
    return (
      <div className="bg-bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader2 size={16} className="animate-spin" />
          Generating interview preparation...
        </div>
      </div>
    );
  }

  if (!pack) return null;

  const sections = [
    { id: "questions", label: "Likely Questions", icon: MessageSquare, count: pack.likely_questions.length, color: "var(--color-accent)" },
    { id: "coding", label: "Coding Topics", icon: Code, count: pack.coding_topics.length, color: "var(--color-success)" },
    { id: "behavioral", label: "Behavioral Questions", icon: BrainCircuit, count: pack.behavioral_questions.length, color: "var(--color-warning)" },
    { id: "company", label: "Company Questions", icon: Building2, count: pack.company_questions.length, color: "var(--color-danger)" },
    { id: "checklist", label: "Preparation Checklist", icon: CheckSquare, count: pack.preparation_checklist.length, color: "var(--color-success)" },
    { id: "resources", label: "Learning Resources", icon: BookOpen, count: pack.learning_resources.length, color: "var(--color-accent)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl border border-border p-5"
    >
      <h3 className="text-sm font-semibold mb-4">Interview Preparation</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setExpandedSection(expandedSection === s.id ? null : s.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: expandedSection === s.id ? `${s.color}15` : "var(--color-bg-hover)",
              color: expandedSection === s.id ? s.color : "var(--color-fg-muted)",
            }}
          >
            <s.icon size={12} />
            {s.label}
            <span className="opacity-60">({s.count})</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {expandedSection && (
          <motion.div
            key={expandedSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {expandedSection === "questions" && pack.likely_questions.map((q, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-raised">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-mono text-fg-subtle shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-xs font-medium">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone={q.difficulty === "hard" ? "danger" : q.difficulty === "medium" ? "warning" : "success"}>{q.difficulty}</Badge>
                      <span className="text-[10px] text-fg-muted">{q.category}</span>
                    </div>
                    {q.preparation_tip && (
                      <p className="text-[10px] text-fg-muted mt-1 italic">{q.preparation_tip}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {expandedSection === "coding" && pack.coding_topics.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-raised">
                <div>
                  <p className="text-xs font-medium">{t.topic}</p>
                  <p className="text-[10px] text-fg-muted">{t.description}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: j < t.importance ? "var(--color-accent)" : "var(--color-border)" }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {expandedSection === "behavioral" && pack.behavioral_questions.map((b, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-raised">
                <p className="text-xs font-medium mb-1">{b.question}</p>
                <Badge tone="accent" className="mb-1">{b.framework}</Badge>
                <ul className="list-disc list-inside">
                  {b.key_points.map((kp, j) => (
                    <li key={j} className="text-[10px] text-fg-muted">{kp}</li>
                  ))}
                </ul>
              </div>
            ))}

            {expandedSection === "company" && pack.company_questions.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-raised">
                <p className="text-xs font-medium">{c.question}</p>
                <p className="text-[10px] text-fg-muted mt-0.5">Context: {c.context}</p>
              </div>
            ))}

            {expandedSection === "checklist" && (
              <ul className="space-y-1.5">
                {pack.preparation_checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-fg-muted">
                    <input type="checkbox" className="rounded border-border accent-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {expandedSection === "resources" && pack.learning_resources.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-raised">
                <div>
                  <p className="text-xs font-medium">{r.topic}</p>
                  <p className="text-[10px] text-fg-muted">{r.description}</p>
                </div>
                <Badge tone="neutral">{r.resource_type}</Badge>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
