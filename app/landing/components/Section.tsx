"use client";

import { motion } from "framer-motion";
import type { Variants, HTMLMotionProps } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.1, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

interface SectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  id?: string;
  className?: string;
  noFade?: boolean;
}

export function Section({ children, id, className = "", noFade = false, ...props }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={noFade ? false : "hidden"}
      whileInView={noFade ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
      variants={noFade ? undefined : fadeUp}
      className={`mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32 ${className}`}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeader({ label, title, description }: { label?: string; title: string; description?: string }) {
  return (
    <motion.div variants={fadeUp} className="mx-auto mb-16 max-w-2xl text-center">
      {label && (
        <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent-subtle px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-accent">
          {label}
        </span>
      )}
      <h2 className="font-serif text-3xl font-medium text-fg-default sm:text-4xl lg:text-5xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg text-fg-muted sm:text-xl">{description}</p>
      )}
    </motion.div>
  );
}

export { fadeUp, stagger };
