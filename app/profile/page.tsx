"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Link,
  Save,
  Camera,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface ProfileData {
  email: string;
  full_name: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  title: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export default function ProfilePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    email: "",
    full_name: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    title: "",
  });

  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((d) => {
        const p = d.profile || d;
        setForm({
          email: p.email || "",
          full_name: p.full_name || "",
          phone: p.phone || "",
          location: p.location || "",
          website: p.website || "",
          linkedin: p.linkedin || "",
          github: p.github || "",
          title: p.title || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof ProfileData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      addToast("success", "Profile saved");
    } catch {
      addToast("error", "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const fields = [
    { key: "full_name" as const, label: "Full Name", icon: User, placeholder: "Jane Doe" },
    { key: "title" as const, label: "Professional Title", icon: User, placeholder: "Software Engineer" },
    { key: "email" as const, label: "Email", icon: Mail, placeholder: "jane@example.com", type: "email" },
    { key: "phone" as const, label: "Phone", icon: Phone, placeholder: "+1 (555) 123-4567" },
    { key: "location" as const, label: "Location", icon: MapPin, placeholder: "San Francisco, CA" },
    { key: "website" as const, label: "Website", icon: Globe, placeholder: "https://janedoe.dev" },
    { key: "linkedin" as const, label: "LinkedIn", icon: ExternalLink, placeholder: "https://linkedin.com/in/janedoe" },
    { key: "github" as const, label: "GitHub", icon: Link, placeholder: "https://github.com/janedoe" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        <motion.div variants={fadeUp}>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-fg-default">
            <User className="text-accent" size={26} />
            Profile
          </h1>
          <p className="mt-1 text-sm text-fg-muted">Manage your personal information and links</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <div className="mb-5 flex items-center gap-4">
              <div className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <span className="text-xl font-semibold text-accent">
                  {form.full_name
                    ? form.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : "U"}
                </span>
                <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <p className="font-medium text-fg-default">{form.full_name || "Your Name"}</p>
                <p className="text-xs text-fg-muted">{form.title || "Add your title"}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-medium text-fg-muted">{field.label}</label>
                  <div className="relative">
                    <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                    <input
                      className="field"
                      style={{ paddingLeft: "2.25rem" }}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
