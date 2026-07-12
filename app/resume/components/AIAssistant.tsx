"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { improveSummary, changeTone, atsOptimize, AiError } from "../api";

interface AIAssistantProps {
  context: string;
  tone: string;
  skills: string[];
  onResult: (text: string) => void;
}

const tools = [
  { id: "improve-summary", label: "Improve Summary", icon: "✨" },
  { id: "ats-optimize", label: "ATS Optimize", icon: "🎯" },
  { id: "grammar-fix", label: "Grammar Fix", icon: "📝" },
  { id: "professional", label: "Professional Tone", icon: "💼" },
  { id: "student", label: "Student Tone", icon: "🎓" },
  { id: "startup", label: "Startup Tone", icon: "🚀" },
  { id: "faang", label: "FAANG Tone", icon: "⚡" },
  { id: "shorten", label: "Shorten Text", icon: "📏" },
];

export function AIAssistant({ context, tone, skills, onResult }: AIAssistantProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const { addToast } = useToast();

  const handleTool = async (toolId: string) => {
    setLoading(toolId);
    try {
      switch (toolId) {
        case "improve-summary": {
          const res = await improveSummary(context, tone, skills);
          onResult(res.result);
          break;
        }
        case "ats-optimize": {
          const res = await atsOptimize(context);
          if (res.optimized) onResult(res.optimized);
          break;
        }
        case "grammar-fix":
        case "shorten": {
          const targetTone = toolId === "grammar-fix" ? "professional" : "concise";
          const res = await changeTone(context, targetTone);
          onResult(res.result);
          break;
        }
        case "professional":
        case "student":
        case "startup":
        case "faang": {
          const res = await changeTone(context, toolId);
          onResult(res.result);
          break;
        }
        default:
          addToast("error", "Unknown tool");
          setLoading(null);
          return;
      }
      addToast("success", `${toolId.replace("-", " ")} applied`);
    } catch (err) {
      const message = err instanceof AiError ? err.message : "AI tool failed";
      addToast("error", message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">AI Assistant</h3>
        </div>
        {expanded ? <ChevronUp size={14} className="text-fg-muted" /> : <ChevronDown size={14} className="text-fg-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 grid grid-cols-2 gap-1.5 overflow-hidden"
          >
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleTool(tool.id)}
                disabled={loading !== null}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-left text-xs text-fg-muted transition-all duration-150 hover:border-accent/30 hover:text-fg-default active:scale-[0.97] disabled:opacity-50"
              >
                <span aria-hidden="true" className="text-[11px]">
                  {loading === tool.id ? <Loader2 size={12} className="animate-spin text-accent" /> : tool.icon}
                </span>
                <span className="truncate">{tool.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
