"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeader, fadeUp, stagger } from "./Section";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Perfect for getting started",
    popular: false,
    features: ["ATS resume builder", "Job tracking board", "Basic career score", "3 agent runs/mo"],
    cta: "Start Free",
    outlined: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For serious job seekers",
    popular: true,
    features: [
      "Everything in Free",
      "AI Career Agent",
      "Unlimited agent runs",
      "Interview prep",
      "Skill gap analysis",
      "Market insights",
      "Priority support",
    ],
    cta: "Start Free Trial",
    outlined: false,
  },
  {
    name: "Team",
    price: "Custom",
    period: "",
    description: "For career centers & universities",
    popular: false,
    features: [
      "Everything in Pro",
      "Team dashboard",
      "Bulk onboarding",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    outlined: true,
  },
];

export function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <SectionHeader label="Pricing" title="Simple, transparent pricing" description="Start free, upgrade when you're ready" />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-8 lg:grid-cols-3"
      >
        {tiers.map((tier) => (
          <motion.div
            key={tier.name}
            variants={fadeUp}
            className={`relative flex flex-col justify-between rounded-xl border bg-bg-surface p-8 ${
              tier.popular
                ? "border-accent/30 glow-accent scale-105 shadow-xl"
                : "border-border"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white">
                Most Popular
              </span>
            )}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-serif text-4xl text-fg-default">{tier.price}</span>
                {tier.period && <span className="text-sm text-fg-muted">{tier.period}</span>}
              </div>
              <p className="mt-2 text-sm text-fg-muted">{tier.description}</p>
              <ul className="mt-8 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-fg-default">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="#"
              className={`btn-press mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                tier.outlined
                  ? "border border-border text-fg-default hover:bg-bg-default"
                  : "bg-accent text-white hover:opacity-90"
              }`}
            >
              {tier.cta}
            </a>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
