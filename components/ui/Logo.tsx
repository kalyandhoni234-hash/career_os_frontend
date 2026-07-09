"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export function Logo({ href = "/", size = "md", showText = true, animated = true, className = "" }: LogoProps) {
  const box = { sm: "h-7 w-7 text-xs", md: "h-8 w-8 text-sm", lg: "h-10 w-10 text-base" };
  const txt = { sm: "text-base", md: "text-lg", lg: "text-xl" };

  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg bg-accent font-bold text-white transition-all duration-200 ${box[size]} ${animated ? "group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-accent/20" : ""}`}
      >
        C
      </span>
      {showText && (
        <span className={`font-serif font-medium tracking-tight text-fg-default transition-colors duration-200 group-hover:text-fg-default/90 ${txt[size]}`}>
          Career OS
        </span>
      )}
    </>
  );

  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="sr-only">Go to Home</span>
      {content}
    </Link>
  );
}
