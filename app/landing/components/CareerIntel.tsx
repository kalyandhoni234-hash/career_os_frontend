"use client";

import { motion } from "framer-motion";
import { Award, Search, TrendingUp, BarChart3, Target, ArrowRight } from "lucide-react";
import { fadeUp, stagger } from "./Section";

const metrics = [
  { icon: Award, title: "Career Score", desc: "Your overall career health score — computed from resume strength, skill coverage, and market fit." },
  { icon: Search, title: "ATS Match", desc: "See how your resume scores against any job description with real ATS algorithms." },
  { icon: TrendingUp, title: "Skill Graph", desc: "Visualize your skill coverage and identify gaps to close for your next role." },
  { icon: BarChart3, title: "Market Trends", desc: "Salary benchmarks, hiring demand, and skill premiums for your target roles." },
  { icon: Target, title: "Opportunity Rank", desc: "Every job listing scored and ranked by how well it fits your profile." },
];

export function CareerIntel() {
  return (
    <section className="overflow-hidden bg-bg-surface/50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid items-center gap-16 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <span className="inline-block rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent">
                Intelligence
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-3xl font-medium text-fg-default sm:text-4xl"
            >
              Know your career metrics
            </motion.h2>

            <motion.p variants={fadeUp} className="text-lg text-fg-muted">
              Your career score, ATS match rate, skill graph, market trends, and opportunity ranking — all in one dashboard.
            </motion.p>

            <motion.div variants={stagger} className="space-y-3 pt-4">
              {metrics.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="flex items-center gap-4 rounded-xl border border-border bg-bg-surface px-5 py-4 card-hover"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="font-medium text-fg-default">{item.title}</span>
                      <p className="text-sm text-fg-muted">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="glass rounded-2xl border border-border p-8 text-center card-hover">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-medium text-fg-default">
                  Complete Your Profile
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  No data available yet. Connect your resume and start tracking
                  to unlock personalized career intelligence.
                </p>
                <a
                  href="/signup"
                  className="group btn-press mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md active:scale-[0.98]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
