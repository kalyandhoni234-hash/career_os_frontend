"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const LOGO_BODY = "M19,67 A23,23 0 1 1 61,40 Q70,32 80,21";
const LOGO_ARROW = "M75,26 L86,15 L82,28 Z";

const sizes = { sm: "h-7 w-7", md: "h-8 w-8", lg: "h-10 w-10" };
const txtSizes = { sm: "text-base", md: "text-lg", lg: "text-xl" };

export function Logo({ href = "/", size = "md", showText = true, animated = true, className = "" }: LogoProps) {
  const content = (
    <>
      <svg
        viewBox="0 0 100 100"
        className={`shrink-0 text-accent ${sizes[size]} ${animated ? "transition-transform duration-200 group-hover:scale-105" : ""}`}
        aria-hidden="true"
      >
        <path d={LOGO_BODY} fill="none" stroke="currentColor" strokeWidth={9.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={LOGO_ARROW} fill="currentColor" />
      </svg>
      {showText && (
        <span className={`font-serif font-medium tracking-tight text-fg-default transition-colors duration-200 group-hover:text-fg-default/90 ${txtSizes[size]}`}>
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
