"use client";

interface SkillProgressProps {
  skills: string[];
}

export function SkillProgress({ skills }: SkillProgressProps) {
  if (!skills || skills.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-fg-muted">No skills tracked yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center rounded-md border border-accent/20 bg-accent-subtle px-2.5 py-1 font-mono text-[11px] font-medium text-accent transition-all duration-150 hover:bg-accent hover:text-white hover:border-accent hover:scale-105 cursor-default"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
