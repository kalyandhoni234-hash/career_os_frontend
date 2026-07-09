"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

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
      let data: Record<string, unknown> = { text: context, tone, skills };

      switch (toolId) {
        case "improve-summary":
          data = { summary: context, tone, skills };
          const summaryRes = await apiFetch("/api/resume/ai/improve-summary", { method: "POST", body: JSON.stringify(data) });
          onResult(summaryRes.result);
          break;

        case "ats-optimize":
          data = { text: context };
          const optRes = await apiFetch("/api/resume/ai/ats-optimize", { method: "POST", body: JSON.stringify(data) });
          onResult(optRes.optimized || optRes.result);
          break;

        case "grammar-fix":
        case "shorten":
          data = { text: context, tone };
          const toneRes = await apiFetch("/api/resume/ai/change-tone", { method: "POST", body: JSON.stringify({ ...data, tone: toolId === "grammar-fix" ? "professional" : "concise" }) });
          onResult(toneRes.result);
          break;

        case "professional":
        case "student":
        case "startup":
        case "faang":
          const ctRes = await apiFetch("/api/resume/ai/change-tone", { method: "POST", body: JSON.stringify({ text: context, tone: toolId }) });
          onResult(ctRes.result);
          break;

        default:
          addToast("error", "Unknown tool");
      }
      addToast("success", `${toolId.replace("-", " ")} applied`);
    } catch {
      addToast("error", "AI tool failed");
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
                {loading === tool.id ? (
                  <Loader2 size={12} className="animate-spin text-accent" />
                ) : (
                  <span className="text-[11px]">{tool.icon}</span>
                )}
                <span className="truncate">{tool.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
