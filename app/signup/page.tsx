"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-default px-6 overflow-hidden">
      <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl -top-20 -right-20 animate-blob" />
      <div className="absolute w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -bottom-20 -left-20 animate-blob-slow" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative w-full max-w-sm"
      >
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo />
          </Link>
          <h1 className="mt-6 font-serif text-2xl font-medium text-fg-default">Create your account</h1>
          <p className="mt-2 font-sans text-sm text-fg-muted">
            Start tracking applications and building your resume.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-bg-surface px-8 py-8 shadow-sm">
          <button
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login`;
            }}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-fg-default transition-all duration-150 hover:border-accent/30 hover:bg-bg-hover hover:shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 000 24c0 3.86.92 7.51 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 rounded-lg border border-danger/20 bg-danger-subtle px-3 py-2 font-mono text-xs text-danger"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors duration-150 peer-focus:text-accent" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 pl-9 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70"
                required
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors duration-150 peer-focus:text-accent" />
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 pl-9 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70"
                required
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors duration-150 peer-focus:text-accent" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="peer w-full rounded-lg border border-border bg-bg-default px-3 py-2.5 pl-9 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-press flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent/90 hover:shadow-md disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign up <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-fg-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent transition-colors hover:text-accent/80 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
