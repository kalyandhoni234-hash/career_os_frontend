"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Navbar } from "@/app/landing/components/Navbar";
import { Hero } from "@/app/landing/components/Hero";
import { About } from "@/app/landing/components/About";
import { Stats } from "@/app/landing/components/Stats";
import { Features } from "@/app/landing/components/Features";
import { AIAgent } from "@/app/landing/components/AIAgent";
import { HowItWorks } from "@/app/landing/components/HowItWorks";
import { CareerIntel } from "@/app/landing/components/CareerIntel";
import { Testimonials } from "@/app/landing/components/Testimonials";
import { Pricing } from "@/app/landing/components/Pricing";
import { FAQ } from "@/app/landing/components/FAQ";
import { Showcase } from "@/app/landing/components/Showcase";
import { CTA } from "@/app/landing/components/CTA";
import { Footer } from "@/app/landing/components/Footer";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-default px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo size="lg" showText={false} />
          <h1 className="font-serif text-3xl font-medium text-fg-default sm:text-4xl">
            Welcome back
          </h1>
          <p className="max-w-sm text-fg-muted">
            Your career workspace is ready. Pick up where you left off.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Continue to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-default text-fg-default">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Features />
        <AIAgent />
        <HowItWorks />
        <Showcase />
        <CareerIntel />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
