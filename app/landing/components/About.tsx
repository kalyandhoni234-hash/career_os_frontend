"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Search, BrainCircuit, GraduationCap, ClipboardList, BarChart3, Globe, Sparkles } from "lucide-react";
import { fadeUp, stagger } from "./Section";

const modules = [
  { icon: FileText, label: "Resume Studio", color: "text-accent" },
  { icon: Search, label: "ATS Intelligence", color: "text-success" },
  { icon: BrainCircuit, label: "AI Career Coach", color: "text-accent" },
  { icon: Globe, label: "Job Discovery", color: "text-accent" },
  { icon: GraduationCap, label: "Learning", color: "text-success" },
  { icon: ClipboardList, label: "Applications", color: "text-warning" },
  { icon: BarChart3, label: "Analytics", color: "text-accent" },
  { icon: Sparkles, label: "AI Command Center", color: "text-warning" },
];

const floatingCards = [
  { label: "Resume Score", value: "92", trend: "+14", x: "0%", y: "0%", color: "border-accent/30" },
  { label: "ATS Match", value: "87", trend: "+22", x: "60%", y: "15%", color: "border-success/30" },
  { label: "Job Match", value: "94", trend: "+8", x: "10%", y: "55%", color: "border-accent/30" },
  { label: "Career Growth", value: "76", trend: "+31", x: "55%", y: "60%", color: "border-accent/30" },
  { label: "Learning", value: "68", trend: "+45", x: "30%", y: "75%", color: "border-warning/30" },
];

export function About() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="grid items-center gap-16 lg:grid-cols-2"
      >
        <motion.div variants={fadeUp} className="space-y-6">
          <span className="inline-block rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent">
            Platform
          </span>
          <h2 className="font-serif text-3xl font-medium leading-tight text-fg-default sm:text-4xl lg:text-5xl">
            Your Career.
            <br />
            <span className="text-accent">One Intelligent System.</span>
          </h2>
          <p className="text-lg leading-relaxed text-fg-muted">
            Career OS is not another resume builder. It is a unified career intelligence platform where every module communicates with every other module.
          </p>
          <p className="text-base leading-relaxed text-fg-muted">
            Improving your resume updates your ATS score. Your ATS score informs your learning path. Your learning path unlocks better job matches. Everything works together.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-fg-muted transition-all duration-200 hover:scale-105 hover:bg-bg-hover"
                >
                  <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                  {m.label}
                </span>
              );
            })}
          </div>

          <div className="pt-4">
            <a
              href="/signup"
              className="btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-fg-default shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md"
            >
              Explore the Platform
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="relative mx-auto h-[400px] w-full max-w-md sm:h-[500px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-bg-surface to-accent/10" />
          <div className="absolute inset-0 rounded-2xl border border-border" />
          <div className="absolute -left-10 -top-10 h-40 w-40 animate-blob rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 animate-float rounded-full bg-accent/5 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/20 mx-auto">
              <Sparkles className="h-7 w-7 text-fg-default" />
            </div>
            <p className="mt-3 font-serif text-lg font-medium text-fg-default">Career OS</p>
            <p className="text-sm text-fg-muted">AI-Powered Career Platform</p>
          </div>

          {floatingCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className={`absolute glass rounded-xl border ${card.color} px-4 py-3 shadow-sm`}
              style={{ left: card.x, top: card.y }}
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">{card.label}</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-serif text-lg font-medium text-fg-default">{card.value}</span>
                <span className="text-[10px] font-medium text-success">{card.trend}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
