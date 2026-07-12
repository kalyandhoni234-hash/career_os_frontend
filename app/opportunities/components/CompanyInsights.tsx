"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Building2, Globe, MapPin, Users, Calendar, Star, Trophy,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { CompanyProfile } from "../types";

interface CompanyInsightsProps {
  company: CompanyProfile;
}

export function CompanyInsights({ company: c }: CompanyInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl border border-border p-5"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-accent-subtle flex items-center justify-center overflow-hidden">
          {c.logo_url ? (
            <Image src={c.logo_url} alt={c.name} width={48} height={48} className="w-full h-full object-contain" unoptimized />
          ) : (
            <Building2 size={24} className="text-accent" />
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold">{c.name}</h3>
          {c.website && (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent flex items-center gap-1 hover:underline">
              <ExternalLink size={11} /> {c.website.replace("https://", "")}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {c.industry && (
          <InfoRow icon={<Building2 size={12} />} label="Industry" value={c.industry} />
        )}
        {c.headquarters && (
          <InfoRow icon={<MapPin size={12} />} label="Headquarters" value={c.headquarters} />
        )}
        {c.company_size && (
          <InfoRow icon={<Users size={12} />} label="Size" value={c.company_size} />
        )}
        {c.founded_year && (
          <InfoRow icon={<Calendar size={12} />} label="Founded" value={String(c.founded_year)} />
        )}
        {c.glassdoor_rating && (
          <InfoRow icon={<Star size={12} />} label="Glassdoor" value={`${c.glassdoor_rating}/5`} />
        )}
        {c.active_jobs_count !== undefined && (
          <InfoRow icon={<Trophy size={12} />} label="Active Jobs" value={String(c.active_jobs_count)} />
        )}
      </div>

      {c.description && (
        <div className="mb-4">
          <p className="text-[11px] text-fg-muted leading-relaxed">{c.description}</p>
        </div>
      )}

      {c.tech_stack && c.tech_stack.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-fg-muted mb-1.5">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {c.tech_stack.map((tech) => (
              <Badge key={tech} tone="accent">{tech}</Badge>
            ))}
          </div>
        </div>
      )}

      {c.interview_difficulty && (
        <div className="flex items-center gap-2 text-[11px] text-fg-muted">
          <span>Interview Difficulty:</span>
          <Badge tone={c.interview_difficulty === "hard" ? "danger" : c.interview_difficulty === "medium" ? "warning" : "success"}>
            {c.interview_difficulty}
          </Badge>
        </div>
      )}

      {c.linkedin_url && (
        <a
          href={c.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1 text-[11px] text-accent hover:underline"
        >
          <Globe size={12} /> View on LinkedIn
        </a>
      )}
    </motion.div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-fg-subtle">{icon}</span>
      <span className="text-fg-muted">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
