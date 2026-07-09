"use client";

import { motion } from "framer-motion";
import { Search, FileText, MessageSquare, Lightbulb, TrendingUp, ClipboardList, Moon, Sparkles } from "lucide-react";
import { fadeUp, stagger } from "./Section";

const capabilities = [
  { icon: Search, title: "Job Discovery", desc: "Scans thousands of opportunities matching your profile" },
  { icon: FileText, title: "Resume Optimization", desc: "Tailors your resume for each application" },
  { icon: MessageSquare, title: "Interview Preparation", desc: "Generates role-specific questions and answers" },
  { icon: Lightbulb, title: "Career Strategy", desc: "Recommends skill gaps to close and paths to take" },
  { icon: TrendingUp, title: "Market Intelligence", desc: "Tracks salary trends and hiring demand" },
  { icon: ClipboardList, title: "Weekly Reports", desc: "Summarizes progress and next steps every week" },
];

export function AIAgent() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-blob rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-blob rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid items-center gap-16 lg:grid-cols-2"
        >
          <div className="space-y-8">
            <motion.div variants={fadeUp}>
              <span className="inline-block rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent">
                AI Agent
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-3xl font-medium text-fg-default sm:text-4xl"
            >
              Meet Your AI Career Agent
            </motion.h2>

            <motion.p variants={fadeUp} className="text-lg leading-relaxed text-fg-muted">
              Your personal career agent works 24/7 — discovering opportunities, optimizing your resume, preparing interviews, and tracking market trends. Even while you sleep.
            </motion.p>

            <motion.ul variants={stagger} className="space-y-5">
              {capabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.title}
                    variants={fadeUp}
                    className="flex items-start gap-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="font-medium text-fg-default">{item.title}</span>
                      <p className="text-sm text-fg-muted">{item.desc}</p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>

          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 animate-float-slow rounded-2xl bg-accent/5 blur-xl" />

              <div className="glass relative rounded-2xl border border-border p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
                  </span>
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-fg-muted">
                    AI Agent
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface/50 px-6 py-10 text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-accent/60" />
                  <p className="font-serif text-base font-medium text-fg-default">
                    Your agent is ready
                  </p>
                  <p className="mt-1 text-sm text-fg-muted">
                    No activity yet. Create an account to activate your AI Career Agent.
                  </p>
                  <a
                    href="/signup"
                    className="btn-press mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90"
                  >
                    Activate your agent
                  </a>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-fg-subtle"
                >
                  <Moon className="h-4 w-4" />
                  Works 24/7 even while you&apos;re offline
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
