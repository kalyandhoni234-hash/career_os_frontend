"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Wand2 } from "lucide-react";

const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Flask", "Django", "SQL", "PostgreSQL", "MongoDB", "Docker",
  "Kubernetes", "AWS", "GCP", "Git", "CI/CD", "REST APIs",
  "GraphQL", "Machine Learning", "Data Structures", "Algorithms",
  "System Design", "Agile", "Leadership", "Communication",
];

interface SkillTagsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  onAIOptimize: () => void;
  aiLoading: boolean;
}

export function SkillTags({ skills, onChange, onAIOptimize, aiLoading }: SkillTagsProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Skills</label>
        <button
          onClick={onAIOptimize}
          disabled={aiLoading}
          className="flex items-center gap-1 text-[11px] text-accent transition-colors duration-150 hover:text-accent/80 disabled:opacity-50"
        >
          <Wand2 size={12} />
          {aiLoading ? "Suggesting..." : "AI Suggest"}
        </button>
      </div>

      <div className="relative">
        <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-2.5 py-2 transition-all duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-ring/50">
          <AnimatePresence mode="popLayout">
            {skills.map((skill) => (
              <motion.span
                key={skill}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent-subtle px-2 py-0.5 text-[11px] font-medium text-accent transition-all duration-150 hover:bg-accent/15"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="rounded-sm p-0.5 transition-colors duration-150 hover:bg-accent/20"
                >
                  <X size={10} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
            className="min-w-[80px] flex-1 border-0 bg-transparent p-0 text-xs text-fg-default outline-none placeholder:text-fg-subtle"
          />
        </div>

        <AnimatePresence>
          {showSuggestions && input && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-border bg-bg-surface p-1.5 shadow-lg"
            >
              <p className="mb-1 px-1.5 font-mono text-[10px] text-fg-subtle">Suggestions</p>
              <div className="flex flex-wrap gap-1">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] text-fg-muted transition-all duration-150 hover:border-accent/30 hover:text-fg-default"
                  >
                    <Plus size={10} />
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
