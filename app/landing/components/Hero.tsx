"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Briefcase, FileText, Sparkles, Target, BarChart3, Search, ChevronDown } from "lucide-react";
import { fadeUp } from "./Section";

function Blob({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 ${className}`} style={style} />;
}

interface DecorativeCard {
  icon: React.ElementType;
  color: string;
  borderColor: string;
  position: string;
  delay: number;
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

const cards: DecorativeCard[] = [
  { icon: Briefcase, color: "text-accent", borderColor: "border-accent/30", position: "top-[14%] left-[3%] lg:left-[4%]", delay: 0, desktop: true, tablet: true, mobile: false },
  { icon: FileText, color: "text-success", borderColor: "border-success/30", position: "top-[4%] left-[30%] lg:left-[32%]", delay: 1.5, desktop: true, tablet: false, mobile: false },
  { icon: Sparkles, color: "text-warning", borderColor: "border-warning/30", position: "top-[22%] right-[3%] lg:right-[4%]", delay: 3, desktop: true, tablet: true, mobile: true },
  { icon: Search, color: "text-accent", borderColor: "border-accent/30", position: "top-[48%] right-[1%] lg:right-[2%]", delay: 4.5, desktop: true, tablet: false, mobile: false },
  { icon: Target, color: "text-accent", borderColor: "border-accent/30", position: "bottom-[18%] left-[2%] lg:left-[3%]", delay: 2, desktop: true, tablet: true, mobile: true },
  { icon: BarChart3, color: "text-accent", borderColor: "border-accent/30", position: "bottom-[10%] right-[4%] lg:right-[5%]", delay: 5.5, desktop: true, tablet: true, mobile: false },
];

export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-28 sm:px-10">
      <div className="relative rounded-2xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-accent/5">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <Blob className="bg-accent -left-20 -top-20 h-72 w-72 animate-blob" />
          <Blob className="bg-accent -right-20 -bottom-20 h-72 w-72 animate-blob-slow opacity-15" />
          <Blob className="bg-accent -top-10 right-1/3 h-56 w-56 animate-float opacity-10" />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {cards
            .filter((c) => c.desktop)
            .map((card) => {
              const Icon = card.icon;
              const hideOn = [];
              if (!card.tablet) hideOn.push("md:hidden");
              if (!card.mobile) hideOn.push("sm:hidden");
              return (
                <motion.div
                  key={card.position}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -7, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: card.delay },
                    scale: { duration: 0.6, delay: card.delay },
                    y: {
                      duration: 7,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: card.delay,
                    },
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    boxShadow: "0 8px 30px -8px rgba(37,99,235,0.15)",
                  }}
                  className={`absolute flex h-12 w-12 items-center justify-center rounded-xl border bg-bg-surface shadow-sm backdrop-blur-sm ${card.borderColor} ${card.color} ${card.position} ${hideOn.join(" ")}`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              );
            })}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-surface/50 rounded-2xl" />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center px-8 py-24 sm:px-16 sm:py-32">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-4 inline-block rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent"
          >
            Built for students & professionals
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-serif text-4xl font-medium leading-tight text-fg-default sm:text-5xl lg:text-6xl"
          >
            Your AI Career
            <br />
            <span className="bg-gradient-to-r from-accent via-accent to-accent/50 bg-clip-text text-transparent">Operating System</span>
            .
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-2xl text-lg text-fg-muted"
          >
            One platform to build your resume, discover opportunities, prepare
            interviews, learn in-demand skills, and let AI manage your career.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="/signup"
              className="group btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-fg-default shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md hover:shadow-accent/20 active:scale-[0.98]"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#demo"
              className="btn-press inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-fg-default transition-all duration-200 hover:bg-bg-default hover:border-accent/30 hover:shadow-sm active:scale-[0.98]"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-fg-muted"
          >
            {[
              ["No credit card", CheckCircle2],
              ["Free forever", CheckCircle2],
              ["Export anytime", CheckCircle2],
            ].map(([text, Icon]) => (
              <span key={text as string} className="inline-flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-success" />
                {text as string}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="mt-10 flex justify-center"
      >
        <ChevronDown className="h-6 w-6 animate-float text-fg-subtle" />
      </motion.div>
    </section>
  );
}
