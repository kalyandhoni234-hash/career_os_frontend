"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Route,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface Milestone {
  type: "experience" | "education" | "achievement" | "certificate" | "application";
  title: string;
  subtitle: string;
  date: string;
  icon: string;
}

interface Overview {
  full_name: string;
  milestones: Milestone[];
  years_active: number;
  total_roles: number;
  skills_gained: string[];
  top_achievement: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const MILESTONE_ICONS: Record<string, typeof Briefcase> = {
  experience: Briefcase,
  education: GraduationCap,
  achievement: Award,
  certificate: Star,
  application: Target,
};

const MILESTONE_COLORS: Record<string, string> = {
  experience: "border-l-accent bg-accent/5",
  education: "border-l-emerald-500 bg-emerald-500/5",
  achievement: "border-l-amber-500 bg-amber-500/5",
  certificate: "border-l-violet-500 bg-violet-500/5",
  application: "border-l-rose-500 bg-rose-500/5",
};

export default function CareerOverviewPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(() => {
      apiFetch("/api/users/career-overview")
        .then((d) => setOverview(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const stats = [
    { label: "Years Active", value: overview?.years_active ?? 0, icon: Calendar },
    { label: "Roles Held", value: overview?.total_roles ?? 0, icon: Briefcase },
    { label: "Skills Gained", value: overview?.skills_gained?.length ?? 0, icon: TrendingUp },
    { label: "Milestones", value: overview?.milestones?.length ?? 0, icon: Star },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        <motion.div variants={fadeUp}>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-fg-default">
            <Route className="text-accent" size={26} />
            Career Overview
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Your professional journey at a glance
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <stat.icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-lg font-semibold text-fg-default">{stat.value}</p>
                <p className="text-xs text-fg-muted">{stat.label}</p>
              </div>
            </Card>
          ))}
        </motion.div>

        {overview?.top_achievement && (
          <motion.div variants={fadeUp}>
            <Card className="border-l-4 border-l-amber-500 p-4">
              <div className="flex items-start gap-3">
                <Award size={20} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-600">
                    Top Achievement
                  </p>
                  <p className="mt-0.5 text-sm text-fg-default">{overview.top_achievement}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {overview?.skills_gained && overview.skills_gained.length > 0 && (
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-fg-default">
                <TrendingUp size={16} className="text-accent" />
                Skills Growth
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {overview.skills_gained.map((skill) => (
                  <Badge key={skill} tone="accent">{skill}</Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-medium text-fg-default">
              <Route size={16} className="text-accent" />
              Career Timeline
            </h3>

            {overview?.milestones && overview.milestones.length > 0 ? (
              <div className="relative space-y-4">
                {overview.milestones.map((ms, i) => {
                  const Icon = MILESTONE_ICONS[ms.type] ?? Star;
                  const color = MILESTONE_COLORS[ms.type] ?? "border-l-gray-400 bg-gray-400/5";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className={`relative flex items-start gap-3 border-l-2 pl-4 ${color}`}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-surface shadow-sm">
                        <Icon size={14} className="text-fg-default" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg-default">{ms.title}</p>
                        <p className="text-xs text-fg-muted">{ms.subtitle}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-fg-subtle">
                          <Calendar size={10} />
                          {ms.date}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Route size={32} className="text-fg-subtle" />
                <p className="text-sm text-fg-muted">No milestones yet</p>
                <p className="text-xs text-fg-subtle">
                  Build your resume and track applications to populate your timeline
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
