"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Wand2, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Experience } from "../types";

interface ExperienceEditorProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export function ExperienceEditor({ experiences, onChange }: ExperienceEditorProps) {
  const { addToast } = useToast();

  const add = () => {
    onChange([
      ...experiences,
      { company: "", role: "", start: "", end: "", bullets: [""], technologies: [] },
    ]);
  };

  const update = (i: number, field: keyof Experience, value: unknown) => {
    const next = [...experiences];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(experiences.filter((_, idx) => idx !== i));
  };

  const addBullet = (i: number) => {
    const next = [...experiences];
    next[i].bullets = [...next[i].bullets, ""];
    onChange(next);
  };

  const updateBullet = (expIdx: number, bIdx: number, value: string) => {
    const next = [...experiences];
    next[expIdx].bullets[bIdx] = value;
    onChange(next);
  };

  const removeBullet = (expIdx: number, bIdx: number) => {
    const next = [...experiences];
    next[expIdx].bullets = next[expIdx].bullets.filter((_, i) => i !== bIdx);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Experience</label>
        <button onClick={add} className="flex items-center gap-1 text-[11px] text-accent transition-colors duration-150 hover:text-accent/80">
          <Plus size={12} /> Add
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {experiences.map((exp, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-border bg-bg-surface p-3 transition-all duration-150 hover:border-accent/20"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] font-medium text-fg-subtle">#{i + 1}</span>
              <button onClick={() => remove(i)} className="rounded-md p-1 text-fg-muted transition-colors duration-150 hover:bg-red-50 hover:text-danger">
                <Trash2 size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={exp.company ?? ""} onChange={(e) => update(i, "company", e.target.value)} placeholder="Company" className="field" />
              <input value={exp.role ?? ""} onChange={(e) => update(i, "role", e.target.value)} placeholder="Role" className="field" />
              <input value={exp.start ?? ""} onChange={(e) => update(i, "start", e.target.value)} placeholder="Start" className="field" />
              <input value={exp.end ?? ""} onChange={(e) => update(i, "end", e.target.value)} placeholder="End" className="field" />
            </div>
            <div className="mt-2">
              <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Bullets</label>
              {(Array.isArray(exp.bullets) ? exp.bullets : []).map((b, bIdx) => (
                <div key={bIdx} className="mt-1 flex items-start gap-1">
                  <span className="mt-2 text-fg-subtle">•</span>
                  <textarea
                    value={b}
                    onChange={(e) => updateBullet(i, bIdx, e.target.value)}
                    placeholder="Describe an achievement..."
                    rows={2}
                    className="field flex-1 resize-none"
                  />
                  <button onClick={() => removeBullet(i, bIdx)} className="mt-1.5 rounded p-0.5 text-fg-muted transition-colors duration-150 hover:text-danger">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              <button onClick={() => addBullet(i)} className="mt-1 text-[11px] text-accent transition-colors duration-150 hover:text-accent/80">
                + Add bullet
              </button>
            </div>
            <div className="mt-2">
              <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Technologies</label>
              <input
                value={Array.isArray(exp.technologies) ? exp.technologies.join(", ") : ""}
                onChange={(e) => update(i, "technologies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="Python, Flask, Docker..."
                className="field mt-1"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {experiences.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-6">
          <p className="text-xs text-fg-subtle">No experience added yet</p>
        </div>
      )}
    </div>
  );
}
