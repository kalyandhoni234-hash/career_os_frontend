"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, Save, User, GraduationCap, MapPin, Globe, Briefcase, DollarSign, Heart, Languages, Star } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Profile {
  education: string | null;
  degree: string | null;
  graduation_year: number | null;
  country: string | null;
  preferred_roles: string | null;
  skills: string | null;
  experience: string | null;
  languages: string | null;
  interests: string | null;
  preferred_locations: string | null;
  salary_expectation: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const inputClass =
  "w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70";
const labelClass = "font-mono text-xs font-medium uppercase tracking-widest text-fg-muted";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setProfile({
            education: null, degree: null, graduation_year: null, country: null,
            preferred_roles: null, skills: null, experience: null, languages: null,
            interests: null, preferred_locations: null, salary_expectation: null,
          });
        }
      })
      .catch((err) => {
        if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const update = (field: keyof Profile, value: string | number | null) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      addToast("success", "Profile saved");
    } catch {
      addToast("error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto max-w-3xl space-y-8 p-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <SettingsIcon size={20} className="text-accent" />
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg-default">Settings</h1>
          </div>
          <p className="mt-0.5 font-sans text-sm text-fg-muted">Manage your career profile and preferences</p>
        </div>
        <Button onClick={handleSave} loading={saving} icon={<Save size={14} />} size="sm">
          {saving ? "Saving..." : "Save"}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <User size={14} className="text-fg-muted" />
            <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Education</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Institution</label>
              <input className={inputClass} placeholder="e.g. Indian Institute of Technology" value={profile?.education ?? ""} onChange={(e) => update("education", e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Degree</label>
              <input className={inputClass} placeholder="e.g. B.Tech" value={profile?.degree ?? ""} onChange={(e) => update("degree", e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Graduation year</label>
              <input className={inputClass} type="number" placeholder="e.g. 2026" value={profile?.graduation_year ?? ""} onChange={(e) => update("graduation_year", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Briefcase size={14} className="text-fg-muted" />
            <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Career</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Preferred roles</label>
              <input className={inputClass} placeholder="e.g. SWE Intern, Full Stack Developer" value={profile?.preferred_roles ?? ""} onChange={(e) => update("preferred_roles", e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Experience</label>
              <textarea className={`${inputClass} min-h-[80px] resize-y`} placeholder="Describe your experience..." rows={3} value={profile?.experience ?? ""} onChange={(e) => update("experience", e.target.value || null)} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Star size={14} className="text-fg-muted" />
            <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Skills &amp; Interests</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>Skills</label>
              <input className={inputClass} placeholder="Python, Flask, SQL..." value={profile?.skills ?? ""} onChange={(e) => update("skills", e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Languages</label>
              <input className={inputClass} placeholder="English, Hindi..." value={profile?.languages ?? ""} onChange={(e) => update("languages", e.target.value || null)} />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <label className={labelClass}>Interests</label>
            <input className={inputClass} placeholder="e.g. AI, Systems Design, Open Source" value={profile?.interests ?? ""} onChange={(e) => update("interests", e.target.value || null)} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <MapPin size={14} className="text-fg-muted" />
            <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Location &amp; Preferences</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>Country</label>
              <input className={inputClass} placeholder="e.g. India" value={profile?.country ?? ""} onChange={(e) => update("country", e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Preferred locations</label>
              <input className={inputClass} placeholder="e.g. Bangalore, Remote" value={profile?.preferred_locations ?? ""} onChange={(e) => update("preferred_locations", e.target.value || null)} />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <label className={labelClass}>Salary expectation</label>
            <input className={inputClass} placeholder="e.g. ₹12 LPA or $80,000" value={profile?.salary_expectation ?? ""} onChange={(e) => update("salary_expectation", e.target.value || null)} />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
