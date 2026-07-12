"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-default">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.1, 1] }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Image
            src="/logo.svg"
            alt="Career OS"
            width={80}
            height={80}
            className="h-[60px] w-[60px] md:h-20 md:w-20 drop-shadow-[0_0_12px_rgba(108,92,231,0.4)]"
            priority
          />
        </motion.div>
        <span className="font-serif text-2xl font-medium tracking-tight text-fg-default">
          Career OS
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="h-2 w-2 rounded-full bg-accent"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
