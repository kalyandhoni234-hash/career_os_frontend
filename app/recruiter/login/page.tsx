"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { recruiterLogin } from "../api";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.1, 1] as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function RecruiterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await recruiterLogin({ email, password });
      router.push("/recruiter/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-default px-6 overflow-hidden">
      <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl -top-20 -left-20 animate-blob" />
      <div className="absolute w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl -bottom-20 -right-20 animate-blob-slow" />

      <motion.div initial="hidden" animate="show" variants={stagger} className="relative w-full max-w-sm">
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <Logo />
          <div className="mt-4 flex items-center justify-center gap-2 text-accent">
            <Building2 size={18} />
            <span className="font-mono text-xs font-medium uppercase tracking-widest">Recruiter Portal</span>
          </div>
          <h1 className="mt-4 font-serif text-2xl font-medium text-fg-default">Welcome back</h1>
          <p className="mt-2 font-sans text-sm text-fg-muted">Log in to your recruiter account.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface px-8 py-8 shadow-sm">
          {error && (
            <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="mb-4 rounded-lg border border-danger/20 bg-danger-subtle px-3 py-2 font-mono text-xs text-danger">
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle peer-focus:text-accent" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 pl-9 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" required />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle peer-focus:text-accent" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 pl-9 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-press flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent/90 hover:shadow-md disabled:opacity-50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">Log in <ArrowRight size={14} /></span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-fg-muted">
            No recruiter account?{" "}
            <Link href="/recruiter/signup" className="font-medium text-accent transition-colors hover:text-accent/80 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center font-mono text-[10px] text-fg-subtle">
            <Link href="/login" className="hover:underline">Student login</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
