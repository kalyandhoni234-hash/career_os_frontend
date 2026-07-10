"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, BrainCircuit, LayoutDashboard, BarChart3, Briefcase, Map } from "lucide-react";
import { SectionHeader } from "./Section";

const slides = [
  {
    icon: FileText,
    title: "Resume Studio",
    description: "AI-powered resume builder with live ATS keyword matching against any job description.",
    color: "text-accent",
    bg: "bg-accent-subtle",
    gradient: "from-accent/10 via-bg-surface to-accent/5",
    border: "border-accent/20",
    features: ["Real-time ATS scoring", "Keyword gap analysis", "Multiple templates", "One-click export"],
  },
  {
    icon: BrainCircuit,
    title: "Career Agent",
    description: "24/7 AI agent that works in the background discovering opportunities and optimizing your profile.",
    color: "text-accent",
    bg: "bg-accent-subtle",
    gradient: "from-accent/10 via-bg-surface to-accent/5",
    border: "border-accent/20",
    features: ["Automated job discovery", "Resume optimization", "Interview preparation", "Weekly briefings"],
  },
  {
    icon: LayoutDashboard,
    title: "Command Center",
    description: "Your career headquarters with agent status, health gauges, AI memory, and opportunity feed.",
    color: "text-success",
    bg: "bg-success-subtle",
    gradient: "from-success/10 via-bg-surface to-success/5",
    border: "border-success/20",
    features: ["Live agent monitoring", "Career health metrics", "AI memory dashboard", "Opportunity ranking"],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Understand what's working with pipeline funnels, skill graphs, and career score tracking.",
    color: "text-warning",
    bg: "bg-warning-subtle",
    gradient: "from-warning/10 via-bg-surface to-warning/5",
    border: "border-warning/20",
    features: ["Pipeline visualization", "Skill coverage charts", "Score history", "Market trends"],
  },
  {
    icon: Briefcase,
    title: "Opportunities",
    description: "Discover and track opportunities with AI-powered matching and smart filtering.",
    color: "text-accent",
    bg: "bg-accent-subtle",
    gradient: "from-accent/10 via-bg-surface to-accent/5",
    border: "border-accent/20",
    features: ["AI match scoring", "Smart filters", "Company insights", "Salary estimation"],
  },
  {
    icon: Map,
    title: "Roadmaps",
    description: "Personalized learning roadmaps to close skill gaps and accelerate career growth.",
    color: "text-danger",
    bg: "bg-danger-subtle",
    gradient: "from-danger/10 via-bg-surface to-danger/5",
    border: "border-danger/20",
    features: ["Skill gap analysis", "Curated resources", "Progress tracking", "Project suggestions"],
  },
];

export function Showcase() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  return (
    <section className="bg-bg-surface/50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <SectionHeader
          label="Showcase"
          title="See it in action"
          description="Every tool designed to move your career forward"
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.1, 1] }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-5"
            >
              <div className="lg:col-span-3">
                <div className={`relative overflow-hidden rounded-2xl border ${slide.border} bg-gradient-to-br ${slide.gradient} p-8 sm:p-12`}>
                  <div className={`mb-6 inline-flex rounded-xl ${slide.bg} p-3 ${slide.color}`}>
                    <slide.icon className="h-6 w-6" />
                  </div>
                  <h3 className={`mb-3 font-serif text-2xl font-medium ${slide.color}`}>{slide.title}</h3>
                  <p className="mb-6 max-w-md text-sm leading-relaxed text-fg-muted">{slide.description}</p>
                  <ul className="space-y-2">
                    {slide.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-fg-default">
                        <span className={`h-1.5 w-1.5 rounded-full ${slide.color}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className={`absolute -bottom-10 -right-10 h-40 w-40 rounded-full ${slide.bg} opacity-30 blur-3xl`} />
                </div>
              </div>

              <div className="hidden lg:col-span-2 lg:flex lg:flex-col lg:justify-center lg:gap-4">
                {slides.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setCurrent(i)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                      i === current
                        ? `${s.border} ${s.bg}`
                        : "border-border bg-bg-surface hover:border-accent/20"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${i === current ? s.color : "text-fg-default"}`}>{s.title}</p>
                      <p className="truncate text-xs text-fg-muted">{s.features[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="btn-press flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface text-fg-muted hover:border-accent/30 hover:text-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-accent" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="btn-press flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface text-fg-muted hover:border-accent/30 hover:text-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
