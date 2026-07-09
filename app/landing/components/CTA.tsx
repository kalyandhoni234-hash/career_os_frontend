"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUp } from "./Section";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-bg-surface px-8 py-20 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-bg-surface to-accent/10" />
        <div className="absolute -left-20 -top-20 h-72 w-72 animate-blob rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 animate-float rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-medium text-fg-default sm:text-4xl">
            Ready to let AI manage your career?
          </h2>
          <p className="mt-4 text-lg text-fg-muted">
            Join thousands of professionals who&rsquo;ve transformed their job search
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/signup"
              className="group btn-press inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md hover:shadow-accent/20 active:scale-[0.98]"
            >
              Start Building Today
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="group btn-press inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-fg-default transition-all duration-200 hover:border-accent/30 hover:bg-bg-default hover:shadow-sm active:scale-[0.98]"
            >
              See the Command Center
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
          <p className="mt-6 text-xs text-fg-subtle">
            No credit card required &bull; 14-day free trial on Pro
          </p>
        </div>
      </motion.div>
    </section>
  );
}
