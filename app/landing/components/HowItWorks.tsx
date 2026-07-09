"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, Search, MessageSquare, ClipboardList, Award } from "lucide-react";
import { fadeUp, stagger } from "./Section";
import { SectionHeader } from "./Section";

const steps = [
  { number: 1, icon: FileText, title: "Build Resume", desc: "Create a polished resume with AI-guided templates" },
  { number: 2, icon: Sparkles, title: "AI Optimizes", desc: "ATS keyword matching and role-specific tailoring" },
  { number: 3, icon: Search, title: "Find Jobs", desc: "AI discovers opportunities matching your profile" },
  { number: 4, icon: MessageSquare, title: "Prepare Interview", desc: "Role-specific questions with AI feedback" },
  { number: 5, icon: ClipboardList, title: "Track Applications", desc: "Real-time kanban board for every application" },
  { number: 6, icon: Award, title: "Land the Offer", desc: "Negotiation insights and offer comparison tools" },
];

export function HowItWorks() {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <SectionHeader
          label="Process"
          title="How Career OS Works"
          description="From resume to offer in six intelligent steps"
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="relative"
        >
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = step.number % 2 !== 0;

              return (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  className={`relative flex flex-col md:flex-row ${isLeft ? "" : "md:flex-row-reverse"}`}
                >
                  <div className="hidden md:flex md:w-1/2 md:items-center md:justify-center">
                    <div className={`max-w-md ${isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}`}>
                      <div className="rounded-xl border border-border bg-bg-surface p-6 card-hover">
                        <div className="mb-4 flex items-center gap-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-mono text-xs text-white">
                            {step.number}
                          </span>
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                            <Icon className="h-5 w-5" />
                          </span>
                        </div>
                        <h3 className="mb-2 font-serif text-xl font-medium text-fg-default">
                          {step.title}
                        </h3>
                        <p className="text-sm text-fg-muted">{step.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex md:w-1/2 md:items-center md:justify-center">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      <span className="absolute h-3 w-3 rounded-full bg-accent ring-4 ring-bg-default" />
                    </div>
                  </div>

                  <div className="md:hidden">
                    <div className="relative flex items-start gap-4 pl-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs text-white">
                          {step.number}
                        </span>
                        <div className="mt-1 h-full w-px bg-border" />
                      </div>
                      <div className="flex-1 rounded-xl border border-border bg-bg-surface p-5 card-hover">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                            <Icon className="h-4 w-4" />
                          </span>
                          <h3 className="font-serif text-base font-medium text-fg-default">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-fg-muted">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
