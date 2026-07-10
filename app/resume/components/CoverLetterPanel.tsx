"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function CoverLetterPanel() {
  const [expanded, setExpanded] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const { addToast } = useToast();

  const generate = async () => {
    if (!company.trim() || !role.trim()) {
      addToast("error", "Company and role are required");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/resume/cover-letter", {
        method: "POST",
        body: JSON.stringify({ company, role, job_description: jobDescription, tone }),
      });
      setCoverLetter(data.cover_letter);
      addToast("success", "Cover letter generated");
    } catch {
      addToast("error", "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    addToast("success", "Copied to clipboard");
  };

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-accent" />
          <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-default">Cover Letter</h3>
        </div>
        {expanded ? <ChevronUp size={14} className="text-fg-muted" /> : <ChevronDown size={14} className="text-fg-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            <form onSubmit={(e) => { e.preventDefault(); generate(); }}>
              <div className="grid grid-cols-2 gap-2">
                <input id="cover-letter-company" aria-label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="field" />
                <input id="cover-letter-role" aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="field" />
              </div>
              <div className="mt-3">
                <label htmlFor="cover-letter-jd" className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Job Description (optional)</label>
                <textarea id="cover-letter-jd" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={3} className="field mt-1 w-full resize-none" placeholder="Paste the job description here..." />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label htmlFor="cover-letter-tone" className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Tone</label>
                <select id="cover-letter-tone" value={tone} onChange={(e) => setTone(e.target.value)} className="field flex-1">
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="concise">Concise</option>
                </select>
              </div>
              <Button type="submit" loading={loading} size="sm" className="mt-3 w-full" icon={<FileText size={12} />}>
                {loading ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </form>

            <AnimatePresence>
              {coverLetter && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border bg-bg-default p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-medium text-fg-muted">Generated</span>
                    <button onClick={copyToClipboard} className="flex items-center gap-1 text-[11px] text-accent transition-colors duration-150 hover:text-accent/80">
                      <Copy size={10} /> Copy
                    </button>
                  </div>
                  <div className="prose prose-xs max-h-80 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-fg-default">
                    {coverLetter}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
