"use client";

interface ResumeHealthProps {
  hasResume: boolean;
  hasSummary: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
}

export function ResumeHealth({ hasResume, hasSummary, hasSkills, hasExperience }: ResumeHealthProps) {
  const items = [
    { label: "Resume created", done: hasResume },
    { label: "Professional summary", done: hasSummary },
    { label: "Skills listed", done: hasSkills },
    { label: "Experience added", done: hasExperience },
  ];

  const completed = items.filter(i => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-serif text-2xl font-medium text-fg-default">{pct}%</span>
        <span className="font-mono text-xs text-fg-muted">{completed}/{items.length} complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct >= 80 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-danger"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${item.done ? "bg-success" : "bg-danger"}`} />
            <span className="text-xs text-fg-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
