"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
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
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    apiFetch("/api/onboarding/status").then((res) => {
      router.replace(res.onboarding_completed ? "/dashboard" : "/onboarding");
    }).catch(() => {});
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
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
