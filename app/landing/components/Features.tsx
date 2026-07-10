"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Search,
  BrainCircuit,
  MessageSquare,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";
import { fadeUp, stagger } from "./Section";

const features = [
  {
    icon: FileText,
    title: "Resume Studio",
    desc: "AI-powered resume builder with real-time ATS keyword matching",
    blobColor: "bg-accent/10",
    glowColor: "text-accent",
  },
  {
    icon: Search,
    title: "ATS Intelligence",
    desc: "Know your score before you submit. Live ATS analysis.",
    blobColor: "bg-success/10",
    glowColor: "text-success",
  },
  {
    icon: BrainCircuit,
    title: "Career Agent",
    desc: "24/7 AI agent that discovers jobs and optimizes your profile",
    blobColor: "bg-accent/10",
    glowColor: "text-accent",
  },
  {
    icon: MessageSquare,
    title: "Interview Hub",
    desc: "Role-specific questions with AI feedback and STAR framework",
    blobColor: "bg-warning/10",
    glowColor: "text-warning",
  },
  {
    icon: GraduationCap,
    title: "Learning Roadmaps",
    desc: "Personalized skill paths to close gaps and level up",
    blobColor: "bg-success/10",
    glowColor: "text-success",
  },
  {
    icon: ClipboardList,
    title: "Applications",
    desc: "Kanban board to track every application end-to-end",
    blobColor: "bg-warning/10",
    glowColor: "text-warning",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Understand what's working with pipeline and funnel metrics",
    blobColor: "bg-accent/10",
    glowColor: "text-accent",
  },
  {
    icon: Globe,
    title: "Portfolio Builder",
    desc: "Showcase your projects with auto-generated portfolio",
    blobColor: "bg-danger/10",
    glowColor: "text-danger",
  },
];

export function Features() {
  return (
    <motion.section
      id="features"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
      className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32"
    >
      <motion.div variants={fadeUp} className="mx-auto mb-16 max-w-2xl text-center">
        <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent">
          Core Features
        </span>
        <h2 className="font-serif text-3xl font-medium text-fg-default sm:text-4xl lg:text-5xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-accent via-accent to-accent/50 bg-clip-text text-transparent">
            land the role
          </span>
        </h2>
        <p className="mt-4 text-lg text-fg-muted sm:text-xl">
          A complete career platform powered by AI
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        className="grid grid-cols-2 gap-6 lg:grid-cols-4"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUp}
            className="group relative rounded-xl border border-border bg-bg-surface p-6 transition-all duration-300 hover:translate-y-[-3px] hover:shadow-lg hover:shadow-black/5"
          >
            <div className={`absolute -inset-px rounded-xl border border-accent/0 transition-all duration-300 pointer-events-none group-hover:border-accent/30 group-hover:shadow-[0_0_20px_-8px_rgba(37,99,235,0.15)]`} />

            <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full ${feature.blobColor} blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

            <div className="relative z-10">
              <div className={`mb-4 inline-flex rounded-lg p-2.5 transition-all duration-300 ${feature.blobColor.replace("/10", "/20")} ${feature.glowColor || "text-accent"}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg text-fg-default group-hover:text-accent transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-12 text-center">
        <a
          href="#"
          className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-fg-default transition-all duration-200 hover:border-accent/30 hover:bg-bg-hover hover:shadow-sm active:scale-[0.98]"
        >
          View all features
          <ArrowRight className="h-4 w-4" />
        </a>
      </motion.div>
    </motion.section>
  );
}
