"use client";

import { motion } from "framer-motion";
import { FileText, Search, BrainCircuit, MessageSquare } from "lucide-react";
import { fadeUp, stagger } from "./Section";

const items = [
  { icon: FileText, title: "Resume Builder", desc: "AI-powered templates with live ATS scoring" },
  { icon: Search, title: "Job Discovery", desc: "Smart matching against millions of opportunities" },
  { icon: BrainCircuit, title: "Career Agent", desc: "24/7 AI that works in the background for you" },
  { icon: MessageSquare, title: "Interview Prep", desc: "Role-specific questions with AI-driven feedback" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 gap-8 lg:grid-cols-4"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="group text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-subtle text-accent transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-medium text-fg-default">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
