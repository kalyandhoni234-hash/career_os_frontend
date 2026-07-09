"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, BarChart3, Lock, UserCheck } from "lucide-react";
import { fadeUp, stagger } from "./Section";

const features = [
  { icon: Shield, title: "Your Data Is Yours", desc: "We never share or sell your personal data. Export anytime." },
  { icon: Zap, title: "AI That Works for You", desc: "Your career agent runs 24/7, even while you sleep." },
  { icon: BarChart3, title: "Real-Time Insights", desc: "See exactly where you stand with live career analytics." },
  { icon: Lock, title: "Enterprise Security", desc: "Encrypted at rest and in transit. SOC 2 compliant infrastructure." },
  { icon: UserCheck, title: "Built for Job Seekers", desc: "Every feature is designed around one goal: landing your next role." },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent">
            <Sparkles className="h-3 w-3" />
            Early Access
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-3xl font-medium text-fg-default sm:text-4xl lg:text-5xl"
        >
          Trusted by Future Professionals
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-lg text-fg-muted"
        >
          Be among the first Career OS users. We are building in public with early adopters who
          share our vision of AI-powered career growth.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Early Access &mdash; Be among the first Career OS users.
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="glass rounded-xl border border-border/50 p-6 card-hover"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-fg-default">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
