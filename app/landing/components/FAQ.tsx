"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeader, fadeUp } from "./Section";

const questions = [
  {
    q: "What is Career OS?",
    a: "Career OS is an AI-powered career platform that helps you build resumes, discover opportunities, prepare for interviews, and track your job search — all in one place.",
  },
  {
    q: "How does the AI Career Agent work?",
    a: "Your agent runs 24/7 in the background, scanning for matching opportunities, optimizing your resume for each role, and preparing interview materials. You get a weekly briefing with everything you need.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The Free plan includes our core features forever. Upgrade to Pro when you want unlimited AI agent runs and advanced analytics.",
  },
  {
    q: "Can I export my resume?",
    a: "Absolutely. You can export your resume as PDF or DOCX anytime. Your data is yours.",
  },
  {
    q: "How accurate is the ATS scoring?",
    a: "Our ATS engine analyzes your resume against real applicant tracking system algorithms used by major companies. It's been validated against 50K+ job descriptions.",
  },
  {
    q: "Does Career OS work for any industry?",
    a: "Yes. Career OS supports all industries including tech, finance, healthcare, consulting, and more. Our AI adapts to your specific domain.",
  },
  {
    q: "How is my data protected?",
    a: "Your data is encrypted at rest and in transit. We never share your information with third parties. You can delete your account and all associated data at any time.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
      <SectionHeader label="FAQ" title="Frequently asked questions" />
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="divide-y divide-border"
      >
        {questions.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between py-5 text-left text-base font-medium text-fg-default transition-colors hover:text-accent"
              >
                <span>{item.q}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-fg-muted" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed text-fg-muted">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
