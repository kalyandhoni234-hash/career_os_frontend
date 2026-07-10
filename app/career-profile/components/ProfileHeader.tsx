"use client";

import { motion } from "framer-motion";
import { MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BasicInfo, CareerInfo, DreamCareer } from "@/app/career-profile/types";

interface ProfileHeaderProps {
  basicInfo: BasicInfo;
  careerInfo: CareerInfo;
  dreamCareer: DreamCareer | null;
  readinessScore?: number;
  stats?: {
    skills: number;
    goals: number;
    applications: number;
    timelineEvents: number;
  };
  onEdit: () => void;
}

export function ProfileHeader({ basicInfo, careerInfo, dreamCareer, readinessScore, stats, onEdit }: ProfileHeaderProps) {
  const initials = `${basicInfo.first_name?.charAt(0) ?? ""}${basicInfo.last_name?.charAt(0) ?? ""}`.toUpperCase() || "?";
  const fullName = [basicInfo.first_name, basicInfo.last_name].filter(Boolean).join(" ");
  const location = [basicInfo.city, basicInfo.state, basicInfo.country].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-bg-surface p-6 sm:flex-row sm:items-start sm:gap-8">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-2xl font-bold text-white shadow-md sm:h-24 sm:w-24">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-fg-default">{fullName}</h1>
            {careerInfo.position && (
              <p className="text-sm text-fg-muted">
                {careerInfo.position}
                {careerInfo.company ? ` at ${careerInfo.company}` : ""}
              </p>
            )}
            {location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-subtle">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
          </div>
          <Button variant="secondary" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={onEdit} className="mt-2 sm:mt-0">
            Edit Profile
          </Button>
        </div>

        {dreamCareer?.dream_role && (
          <div className="mt-3 rounded-lg border border-border bg-bg-default px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">Dream Role</p>
            <p className="text-sm font-medium text-fg-default">
              {dreamCareer.dream_role}
              {dreamCareer.dream_company ? ` @ ${dreamCareer.dream_company}` : ""}
            </p>
          </div>
        )}

        {stats && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Stat label="Skills" value={stats.skills} />
            <Stat label="Goals" value={stats.goals} />
            <Stat label="Applications" value={stats.applications} />
            <Stat label="Events" value={stats.timelineEvents} />
          </div>
        )}
      </div>

      {readinessScore !== undefined && (
        <div className="flex shrink-0 flex-col items-center">
          <AnimatedScore score={readinessScore} />
          <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fg-muted">Readiness</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg-default px-3 py-2">
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-fg-muted">{label}</p>
      <p className="text-center text-lg font-medium text-fg-default">{value}</p>
    </div>
  );
}

function AnimatedScore({ score }: { score: number }) {
  return (
    <motion.div
      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/5"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.span
        className="text-lg font-bold text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {score}
      </motion.span>
    </motion.div>
  );
}
