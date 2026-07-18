"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { Save, User, MapPin, Globe, Camera, Upload, Palette, Monitor, Moon, Sun, Shield, Key, Trash2, Download, GitBranch, Link, CalendarDays, Mail, Hash, Smartphone, ExternalLink, Package, FileText, HelpCircle, Check, RefreshCw, XCircle, Users, Star, Code2, Activity, AlertTriangle, Building2, GraduationCap, Award, Folder, Puzzle, Briefcase, Target, Heart, Plus, X, BookOpen, Repeat, Zap, type LucideIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/ThemeProvider";

const labelClass = "font-mono text-xs font-medium uppercase tracking-widest text-fg-muted";
const selectClass = "w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50";

function Section({ title, icon: Icon, children }: { title: string; icon?: typeof User; children: React.ReactNode }) {
  return (
    <Card className="mb-6">
      {Icon && (
        <div className="mb-5 flex items-center gap-2">
          <Icon size={14} className="text-fg-muted" />
          <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{title}</h2>
        </div>
      )}
      {!Icon && (
        <h2 className="mb-5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">{title}</h2>
      )}
      {children}
    </Card>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg-default">{label}</p>
        {description && <p className="text-xs text-fg-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent-ring focus-visible:outline-offset-2 ${checked ? "bg-accent" : "bg-border"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-surface shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </label>
  );
}

function Select({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function capitalize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ──────────────── INTEGRATION ICON MAP ──────────────── */

const INTEGRATION_ICONS: Record<string, LucideIcon> = {
  github: GitBranch,
  linkedin: Link,
  google_calendar: CalendarDays,
  google_drive: Globe,
  outlook: Mail,
  slack: Hash,
};

const INTEGRATION_NAMES: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  google_calendar: "Google Calendar",
  google_drive: "Google Drive",
  outlook: "Outlook",
  slack: "Slack",
};

const INTEGRATION_DESCS: Record<string, string> = {
  github: "Sync your repositories, contributions, and profile",
  linkedin: "Import your professional profile and network",
  google_calendar: "Sync interviews, events, and deadlines",
  google_drive: "Import resumes, certificates, and documents",
  outlook: "Calendar sync and email integration",
  slack: "Receive career reminders and AI summaries",
};

interface TokenHealth {
  healthy: boolean;
  reason: string;
  label: string;
  warning?: boolean;
  expires_in_seconds?: number;
}

interface IntegrationData {
  provider: string;
  name: string;
  available: boolean;
  connected: boolean;
  sync_status: string;
  sync_error: string | null;
  provider_username: string | null;
  provider_email: string | null;
  connected_at: string | null;
  last_sync_at: string | null;
  provider_data: Record<string, unknown>;
  setup_guide?: string;
  token_health?: TokenHealth;
  sync_history_count?: number;
  last_sync_status?: string | null;
}

/* ──────────────── INTEGRATIONS TAB ──────────────── */

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const seconds = Math.floor((now - then) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function SyncHealth({ int: _int }: { int: IntegrationData }) {
  const status = _int.last_sync_status;
  const health = _int.token_health;
  const lastSync = _int.last_sync_at;
  const syncError = _int.sync_error;

  const isHealthy = health?.healthy !== false && status !== "failed" && !syncError;

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-accent" : "bg-danger"}`} />
        <span className="text-fg-muted">Last sync:</span>
        <span className="text-fg-default font-medium">{timeAgo(lastSync)}</span>
      </div>
      {status === "failed" && <Badge tone="warning">Last sync failed</Badge>}
      {health?.warning && <Badge tone="warning">Token expiring</Badge>}
    </div>
  );
}

function PinnedRepoCard({ repo }: { repo: { name?: string; description?: string; url?: string; language?: string | null; stars?: number } }) {
  return (
    <a href={repo.url || "#"} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border bg-bg-hover/50 p-2.5 hover:bg-bg-hover transition-colors">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-fg-default truncate">{repo.name || "Untitled"}</p>
        <div className="flex items-center gap-1 shrink-0">
          <Star size={10} className="text-fg-muted" />
          <span className="text-[10px] text-fg-muted">{repo.stars || 0}</span>
        </div>
      </div>
      {repo.description && <p className="text-[10px] text-fg-muted mt-1 line-clamp-2">{repo.description}</p>}
      {repo.language && <span className="inline-block mt-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent font-medium">{repo.language}</span>}
    </a>
  );
}

function GitHubExpandedContent({ int, onSync, onDisconnect, syncing }: { int: IntegrationData; onSync: (p: string) => void; onDisconnect: (p: string) => void; syncing: boolean }) {
  const pd = int.provider_data || {};
  const pinnedRepos = (pd.pinned_repos as Array<{ name?: string; description?: string; url?: string; language?: string | null; stars?: number }>) || [];
  const topLanguages = pd.top_languages as Record<string, number> || {};
  const avatarUrl = pd.avatar_url as string | undefined;
  const bio = pd.bio as string | undefined;
  const company = pd.company as string | undefined;
  const location = pd.location as string | undefined;
  const blog = pd.blog as string | undefined;
  const publicRepos = pd.public_repos as number | undefined;
  const followers = pd.followers as number | undefined;
  const following = pd.following as number | undefined;
  const contributions = pd.contributions as number | undefined;
  const twitter = pd.twitter_username as string | undefined;
  const username = int.provider_username;

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-4">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={username || ""} width={56} height={56} className="h-14 w-14 rounded-full border border-border object-cover shrink-0" unoptimized />
        ) : (
          <div className="h-14 w-14 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
            <User size={18} className="text-fg-muted" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-fg-default">{username || "GitHub User"}</p>
            {username && (
              <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="text-fg-muted hover:text-accent transition-colors">
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          {bio && <p className="text-xs text-fg-muted line-clamp-2">{bio}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {company && <span className="flex items-center gap-1 text-[10px] text-fg-muted"><Building2 size={10} />{company}</span>}
            {location && <span className="flex items-center gap-1 text-[10px] text-fg-muted"><MapPin size={10} />{location}</span>}
            {blog && <a href={blog.startsWith("http") ? blog : `https://${blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-accent hover:underline"><Globe size={10} />{blog.replace(/^https?:\/\//, "")}</a>}
            {twitter && <span className="flex items-center gap-1 text-[10px] text-fg-muted">@{twitter}</span>}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { icon: Folder, label: "Repos", value: publicRepos ?? "-" },
          { icon: Users, label: "Followers", value: followers ?? "-" },
          { icon: Users, label: "Following", value: following ?? "-" },
          { icon: Activity, label: "Contributions", value: contributions ?? "-" },
          { icon: Code2, label: "Languages", value: Object.keys(topLanguages).length || "-" },
          { icon: Star, label: "Pinned", value: pinnedRepos.length || "-" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-bg-hover/50 p-3 sm:p-2.5 text-center">
            <stat.icon size={13} className="mx-auto text-fg-muted mb-1" />
            <p className="text-sm sm:text-xs font-semibold text-fg-default">{stat.value}</p>
            <p className="text-[11px] sm:text-[10px] text-fg-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top languages */}
      {Object.keys(topLanguages).length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-2">Top Languages</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(topLanguages).map(([lang, count]) => (
              <span key={lang} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] text-fg-default font-medium">
                <Code2 size={10} className="text-fg-muted" />
                {lang}
                <span className="text-fg-muted">×{count as number}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pinned repos */}
      {pinnedRepos.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-2">Pinned Repositories</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pinnedRepos.map((repo, i) => (
              <PinnedRepoCard key={repo.name || i} repo={repo} />
            ))}
          </div>
        </div>
      )}

      {/* Sync health */}
      <div className="flex items-center justify-between pt-1">
        <SyncHealth int={int} />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="min-h-[44px]" onClick={() => onSync(int.provider)} disabled={syncing}>
            <RefreshCw size={12} className={`mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </Button>
          <Button variant="ghost" size="sm" className="min-h-[44px] text-danger hover:text-danger hover:bg-danger/10" onClick={() => onDisconnect(int.provider)}>
            <XCircle size={12} className="mr-1" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Error */}
      {int.sync_error && (
        <div className="rounded-lg bg-danger/10 p-2.5 flex items-start gap-2">
          <AlertTriangle size={13} className="text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-danger">{int.sync_error}</p>
        </div>
      )}
    </div>
  );
}

function LinkedInExpandedContent({ int, onSync, onDisconnect, syncing }: { int: IntegrationData; onSync: (p: string) => void; onDisconnect: (p: string) => void; syncing: boolean }) {
  const pd = int.provider_data || {};
  const name = pd.name as string | undefined;
  const headline = pd.headline as string | undefined;
  const picture = pd.picture as string | undefined;
  const vanityName = pd.vanity_name as string | undefined;
  const experience = pd.experience as Array<{ title?: string; companyName?: string; start?: Record<string, unknown>; end?: Record<string, unknown> }> | undefined;
  const education = pd.education as Array<{ institution?: string; degree?: string; fieldOfStudy?: string }> | undefined;
  const skills = pd.skills as string[] | undefined;
  const importedVia = pd.imported_via as string | undefined;

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-4">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        {picture ? (
          <Image src={picture} alt={name || ""} width={56} height={56} className="h-14 w-14 rounded-full border border-border object-cover shrink-0" unoptimized />
        ) : (
          <div className="h-14 w-14 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
            <User size={18} className="text-fg-muted" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg-default">{name || int.provider_username || "LinkedIn User"}</p>
          {headline && <p className="text-xs text-fg-muted mt-0.5">{headline}</p>}
          {vanityName && (
            <a href={`https://linkedin.com/in/${vanityName}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline mt-0.5">
              <ExternalLink size={10} /> linkedin.com/in/{vanityName}
            </a>
          )}
          {importedVia && <Badge tone="neutral" className="mt-1">Imported via URL</Badge>}
        </div>
      </div>

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-2 flex items-center gap-1.5">
            <Building2 size={11} /> Experience
          </p>
          <div className="space-y-2">
            {experience.map((exp, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-bg-hover/50 p-2.5">
                <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-fg-default">{exp.title || "Position"}</p>
                  {exp.companyName && <p className="text-[10px] text-fg-muted">{exp.companyName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-2 flex items-center gap-1.5">
            <GraduationCap size={11} /> Education
          </p>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-bg-hover/50 p-2.5">
                <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                  <GraduationCap size={14} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-fg-default">{edu.institution || "Institution"}</p>
                  {edu.degree && <p className="text-[10px] text-fg-muted">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-2 flex items-center gap-1.5">
            <Award size={11} /> Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] text-fg-default font-medium">
                <Award size={9} className="text-fg-muted" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* No rich data fallback */}
      {!experience?.length && !education?.length && !skills?.length && (
        <div className="rounded-lg bg-bg-hover/50 p-3 text-center">
          <p className="text-xs text-fg-muted">
            {importedVia
              ? "Limited profile data available from URL import. Connect via OAuth for richer details."
              : "No detailed profile data yet. Try syncing again or connect with expanded permissions."}
          </p>
        </div>
      )}

      {/* Sync health */}
      <div className="flex items-center justify-between pt-1">
        <SyncHealth int={int} />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="min-h-[44px]" onClick={() => onSync(int.provider)} disabled={syncing}>
            <RefreshCw size={12} className={`mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </Button>
          <Button variant="ghost" size="sm" className="min-h-[44px] text-danger hover:text-danger hover:bg-danger/10" onClick={() => onDisconnect(int.provider)}>
            <XCircle size={12} className="mr-1" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Error */}
      {int.sync_error && (
        <div className="rounded-lg bg-danger/10 p-2.5 flex items-start gap-2">
          <AlertTriangle size={13} className="text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-danger">{int.sync_error}</p>
        </div>
      )}
    </div>
  );
}

export function IntegrationsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [integrations, setIntegrations] = useState<Record<string, IntegrationData>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [expandedLoading, setExpandedLoading] = useState<Set<string>>(new Set());

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/integrations");
      const github = data.integrations?.github;
      if (github) {
      }
      setIntegrations(data.integrations || {});
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const integration = searchParams.get("integration");
    const status = searchParams.get("status");
    if (integration && status) {
      const name = INTEGRATION_NAMES[integration] || capitalize(integration);
      if (status === "success") {
        addToast("success", `${name} connected successfully`);
      } else {
        addToast("error", `Failed to connect ${name}`);
      }
      router.replace("/settings?tab=integrations", { scroll: false });
    }
    startTransition(() => { fetchIntegrations(); });
  }, [addToast, router, searchParams]);

  const handleConnect = async (provider: string) => {
    try {
      const data = await apiFetch(`/api/integrations/${provider}/connect`, { method: "POST" });
      if (data.redirect_url) {
        window.location.assign(data.redirect_url);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      addToast("error", msg);
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      await apiFetch(`/api/integrations/${provider}/disconnect`, { method: "POST" });
      addToast("success", `${INTEGRATION_NAMES[provider] || capitalize(provider)} disconnected`);
      fetchIntegrations();
    } catch {
      addToast("error", "Failed to disconnect");
    }
  };

  const handleSync = async (provider: string) => {
    setSyncing((prev) => new Set(prev).add(provider));
    try {
      await apiFetch(`/api/integrations/${provider}/sync`, { method: "POST" });
      addToast("success", `${INTEGRATION_NAMES[provider] || capitalize(provider)} synced`);
      fetchIntegrations();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      addToast("error", msg);
      fetchIntegrations();
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev);
        next.delete(provider);
        return next;
      });
    }
  };

  const handleLinkedinImport = async () => {
    if (!linkedinUrl.trim()) return;
    try {
      await apiFetch("/api/integrations/linkedin/import", {
        method: "POST",
        body: JSON.stringify({ profile_url: linkedinUrl.trim() }),
      });
      addToast("success", "LinkedIn profile imported");
      fetchIntegrations();
      setLinkedinUrl("");
    } catch {
      addToast("error", "Failed to import LinkedIn profile");
    }
  };


  const handleToggleExpanded = (provider: string) => {
    if (expanded === provider) {
      setExpanded(null);
    } else {
      setExpanded(provider);
      setExpandedLoading((prev) => {
        return new Set(prev).add(provider);
      });
      setTimeout(() => {
        setExpandedLoading((prev) => {
          const next = new Set(prev);
          next.delete(provider);
          return next;
        });
      }, 400);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  /* ── Render helpers ── */

  const renderStatusBadge = (int: IntegrationData) => {
    switch (int.sync_status) {
      case "connected":
        return <Badge tone="success">Connected</Badge>;
      case "syncing":
        return <Badge tone="neutral">Syncing</Badge>;
      case "sync_failed":
        return <Badge tone="warning">Sync Failed</Badge>;
      case "connection_error":
        return <Badge tone="danger">Connection Error</Badge>;
      default:
        return null;
    }
  };

  const renderProviderIntro = (int: IntegrationData) => {
    const Icon = INTEGRATION_ICONS[int.provider] || Link;
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-hover">
          <Icon size={18} className="text-fg-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-fg-default">{INTEGRATION_NAMES[int.provider] || capitalize(int.provider)}</p>
            {renderStatusBadge(int)}
            {!int.available && <Badge tone="neutral">Coming Soon</Badge>}
          </div>
          <p className="text-xs text-fg-muted mt-0.5">
            {int.connected && int.last_sync_at ? `Last sync: ${formatDate(int.last_sync_at)}` : INTEGRATION_DESCS[int.provider] || ""}
          </p>
        </div>
      </div>
    );
  };

  const renderActions = (int: IntegrationData) => {
    if (!int.available) {
      return null;
    }

    if (int.connected) {
      return (
        <Button variant="secondary" size="sm" className="min-h-[44px]" onClick={() => handleToggleExpanded(int.provider)}>
          {expanded === int.provider ? "Hide" : "Manage"}
        </Button>
      );
    }

    if (int.provider === "linkedin") {
      return null;
    }

    return (
      <Button variant="primary" size="sm" className="min-h-[44px]" onClick={() => handleConnect(int.provider)}>
        Connect
      </Button>
    );
  };

  /* ── Expanded content skeleton ── */

  const renderExpandedSkeleton = () => (
    <div className="border-t border-border pt-4 mt-4 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-bg-hover" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-bg-hover rounded" />
          <div className="h-3 w-56 bg-bg-hover rounded" />
          <div className="h-3 w-40 bg-bg-hover rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-hover/50 p-3 space-y-1.5">
            <div className="h-4 w-6 bg-bg-hover rounded mx-auto" />
            <div className="h-3 w-8 bg-bg-hover rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 w-28 bg-bg-hover rounded" />
        <div className="flex gap-2">
          <div className="h-7 w-16 bg-bg-hover rounded-lg" />
          <div className="h-7 w-20 bg-bg-hover rounded-lg" />
        </div>
      </div>
    </div>
  );

  /* ── Main render ── */

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-serif text-xl font-medium text-fg-default">Integrations</h2>
          <p className="text-sm text-fg-muted mt-0.5">Connect your favorite tools</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-bg-hover animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-bg-hover rounded animate-pulse" />
                  <div className="h-3 w-48 bg-bg-hover rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-bg-hover rounded-lg animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Integrations</h2>
        <p className="text-sm text-fg-muted mt-0.5">Connect your favorite tools</p>
      </div>

      <div className="space-y-3">
        {Object.keys(integrations).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface/50 px-6 py-12 text-center">
            <Puzzle size={32} className="text-fg-subtle mb-3" />
            <p className="text-sm font-medium text-fg-default">No integration data available</p>
            <p className="mt-1 max-w-[280px] text-xs text-fg-muted">Connect your accounts to sync professional data, interviews, and documents.</p>
          </div>
        ) : (
          Object.entries(integrations).map(([key, int]) => (
          <Card key={key}>
            <div className="flex items-center justify-between gap-4">
              {renderProviderIntro(int)}
              {renderActions(int)}
            </div>
            {int.provider === "linkedin" && !int.connected && int.available && expanded !== "linkedin" && (
              <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Button variant="primary" size="sm" className="min-h-[44px]" onClick={() => handleConnect("linkedin")}>
                  Connect with OAuth
                </Button>
                <span className="text-xs text-fg-muted">or</span>
                <button
                  onClick={() => setExpanded(expanded === "linkedin" ? null : "linkedin")}
                  className="min-h-[44px] inline-flex items-center text-xs text-accent hover:underline"
                >
                  Import via profile URL
                </button>
              </div>
            )}
            {int.provider === "linkedin" && expanded === "linkedin" && !int.connected && (
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="flex-1 min-h-[44px]"
                  />
                  <Button variant="primary" size="sm" className="min-h-[44px]" onClick={handleLinkedinImport} disabled={!linkedinUrl.trim()}>
                    Import
                  </Button>
                </div>
                <p className="text-xs text-fg-muted mt-1.5">
                  Paste your public LinkedIn profile URL to import your professional information.
                </p>
              </div>
            )}
            {int.provider === expanded && int.connected && expandedLoading.has(int.provider) && renderExpandedSkeleton()}
            {int.provider === expanded && int.connected && !expandedLoading.has(int.provider) && (
              int.provider === "github" ? (
                <GitHubExpandedContent
                  int={int}
                  onSync={handleSync}
                  onDisconnect={handleDisconnect}
                  syncing={syncing.has(int.provider)}
                />
              ) : int.provider === "linkedin" ? (
                <LinkedInExpandedContent
                  int={int}
                  onSync={handleSync}
                  onDisconnect={handleDisconnect}
                  syncing={syncing.has(int.provider)}
                />
              ) : (
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {int.provider_username && (
                      <div>
                        <span className="text-fg-muted">Connected as:</span>
                        <p className="text-fg-default font-medium">{int.provider_username}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-fg-muted">Last Sync:</span>
                      <p className="text-fg-default font-medium">{formatDate(int.last_sync_at)}</p>
                    </div>
                    {int.sync_error && (
                      <div className="col-span-2 rounded-lg bg-danger/10 p-2.5">
                        <p className="text-xs text-danger font-medium">Error: {int.sync_error}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="secondary" size="sm" className="min-h-[44px]" onClick={() => handleSync(int.provider)} disabled={syncing.has(int.provider)}>
                      <RefreshCw size={12} className={`mr-1 ${syncing.has(int.provider) ? "animate-spin" : ""}`} />
                      {syncing.has(int.provider) ? "Syncing..." : "Sync Now"}
                    </Button>
                    <Button variant="ghost" size="sm" className="min-h-[44px] text-danger hover:text-danger hover:bg-danger/10" onClick={() => handleDisconnect(int.provider)}>
                      <XCircle size={12} className="mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              )
            )}
          </Card>
          ))
        )}
      </div>
    </div>
  );
}

/* ──────────────── GENERAL ──────────────── */

export function GeneralTab() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/api/users/profile").then((d) => {
      const p = d.profile || {};
      setName(p.full_name || "");
      setEmail(p.email || d.email || "");
      setUsername(p.username || "");
      setCountry(p.country || "");
      setState(p.state || "");
      setCity(p.city || "");
      setDateOfBirth(p.date_of_birth || "");
      setLanguage(p.language || "en");
      setTimezone(p.timezone || "");
      setDateFormat(p.date_format || "MM/DD/YYYY");
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await apiFetch("/api/users/profile", {
        method: "POST",
        body: JSON.stringify({ full_name: name, username, country, state, city, date_of_birth: dateOfBirth, language, timezone, date_format: dateFormat }),
      });
      addToast("success", "Settings saved");
    } catch {
      addToast("error", "Failed to save settings");
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await apiFetch("/api/users/profile/avatar", { method: "POST", body: formData });
      addToast("success", "Profile picture updated");
    } catch {
      addToast("error", "Failed to upload profile picture");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await apiFetch("/api/users/profile/avatar", { method: "DELETE" });
      addToast("success", "Profile picture removed");
    } catch {
      addToast("error", "Failed to remove profile picture");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-fg-default">General</h2>
          <p className="text-sm text-fg-muted mt-0.5">Manage your basic profile information</p>
        </div>
        <Button onClick={handleSave} icon={<Save size={14} />} size="sm" className="min-h-[44px]">Save</Button>
      </div>

      <Section title="Profile Picture" icon={Camera}>
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl font-semibold text-accent">
            {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
            <Button variant="secondary" size="sm" className="min-h-[44px]" icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>Upload</Button>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={handleRemoveAvatar}>Remove</Button>
          </div>
        </div>
      </Section>

      <Section title="Basic Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Your country" icon={<MapPin size={13} />} />
          <Input label="State / Province" value={state} onChange={(e) => setState(e.target.value)} placeholder="Your state" />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" />
          <Input label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </div>
      </Section>

      <Section title="Preferences">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Language" options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }]} value={language} onChange={setLanguage} />
          <Select label="Timezone" options={[{ value: "UTC", label: "UTC" }, { value: "US/Eastern", label: "US/Eastern" }, { value: "US/Pacific", label: "US/Pacific" }, { value: "Asia/Kolkata", label: "Asia/Kolkata" }]} value={timezone} onChange={setTimezone} />
          <Select label="Date Format" options={[{ value: "MM/DD/YYYY", label: "MM/DD/YYYY" }, { value: "DD/MM/YYYY", label: "DD/MM/YYYY" }, { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }]} value={dateFormat} onChange={setDateFormat} />
        </div>
      </Section>
    </div>
  );
}

/* ──────────────── APPEARANCE ──────────────── */

export function AppearanceTab() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [sidebar, setSidebar] = useState("expanded");
  const [compact, setCompact] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    startTransition(() => {
      const side = localStorage.getItem("sidebar-collapsed");
      setSidebar(side === "true" ? "collapsed" : "expanded");
      setCompact(localStorage.getItem("app-compact") === "true");
      setFontSize(localStorage.getItem("app-font-size") || "medium");
      setAnimations(localStorage.getItem("app-animations") !== "false");
      setReducedMotion(localStorage.getItem("app-reduced-motion") === "true");
    });
  }, []);

  useEffect(() => { localStorage.setItem("app-compact", String(compact)); }, [compact]);
  useEffect(() => { localStorage.setItem("app-font-size", fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem("app-animations", String(animations)); }, [animations]);
  useEffect(() => { localStorage.setItem("app-reduced-motion", String(reducedMotion)); }, [reducedMotion]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Appearance</h2>
        <p className="text-sm text-fg-muted mt-0.5">Customize how Career OS looks and feels</p>
      </div>

      <Section title="Theme">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { id: "light" as const, label: "Light", icon: Sun },
            { id: "dark" as const, label: "Dark", icon: Moon },
            { id: "system" as const, label: "System", icon: Monitor },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 sm:p-4 min-h-[44px] transition-all duration-150 ${
                theme === t.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/30 hover:bg-bg-hover"
              }`}
            >
              <t.icon size={20} className={theme === t.id ? "text-accent" : "text-fg-muted"} />
              <span className={`text-xs font-medium ${theme === t.id ? "text-accent" : "text-fg-muted"}`}>{t.label}</span>
              {theme === t.id && <Check size={12} className="text-accent" />}
            </button>
          ))}
        </div>
        {theme === "system" && (
          <p className="mt-2 text-xs text-fg-muted">
            Currently using <span className="font-medium text-fg-default capitalize">{resolvedTheme}</span> mode (follows your system preference)
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <Palette size={13} className="text-fg-subtle shrink-0" />
          <p className="text-xs text-fg-muted">Accent color — coming soon</p>
        </div>
      </Section>

      <Section title="Preferences">
        <div className="space-y-1">
          <Select label="Sidebar Mode" options={[{ value: "expanded", label: "Expanded" }, { value: "collapsed", label: "Collapsed by default" }]} value={sidebar} onChange={(v) => { setSidebar(v); localStorage.setItem("sidebar-collapsed", String(v === "collapsed")); }} />
        </div>
        <div className="mt-5 border-t border-border pt-4 space-y-1">
          <Toggle label="Compact Mode" description="Reduce spacing and padding" checked={compact} onChange={setCompact} />
          <Select label="Font Size" options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} value={fontSize} onChange={setFontSize} />
        </div>
        <div className="mt-5 border-t border-border pt-4 space-y-1">
          <Toggle label="Animations" description="Enable UI animations and transitions" checked={animations} onChange={setAnimations} />
          <Toggle label="Reduced Motion" description="Minimize animations for accessibility" checked={reducedMotion} onChange={setReducedMotion} />
        </div>
      </Section>
    </div>
  );
}

/* ──────────────── ACCOUNT ──────────────── */

export function AccountTab() {
  const { addToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((d) => {
        const p = d.profile || {};
        setFullName(p.full_name || "");
        setEmail(p.email || "");
        setPhone(p.phone || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await apiFetch("/api/users/profile", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, email, phone }),
      });
      addToast("success", "Account updated");
    } catch {
      addToast("error", "Failed to update account");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Account</h2>
        <p className="text-sm text-fg-muted mt-0.5">Manage your account details</p>
      </div>
      <Section title="Profile">
        {loading ? (
          <p className="text-sm text-fg-muted">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div className="mt-4">
              <Button icon={<Save size={14} />} size="sm" className="min-h-[44px]" onClick={handleSave}>Save</Button>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

/* ──────────────── NOTIFICATIONS ──────────────── */

export function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    push_notifications: true,
    ai_weekly_review: false,
    career_reminders: true,
    interview_reminders: true,
    goal_reminders: true,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    apiFetch("/api/users/notifications")
      .then((d) => {
        if (d.preferences) setPrefs((p) => ({ ...p, ...d.preferences }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await apiFetch("/api/users/notifications", {
        method: "POST",
        body: JSON.stringify({ preferences: prefs }),
      });
      addToast("success", "Notification preferences saved");
    } catch {
      addToast("error", "Failed to save notification preferences");
    }
  };

  if (loading) return <p className="text-sm text-fg-muted">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Notifications</h2>
        <p className="text-sm text-fg-muted mt-0.5">Control how and when you hear from us</p>
      </div>

      <Section title="Email & Push">
        <Toggle label="Email Notifications" description="Receive notifications via email" checked={prefs.email_notifications} onChange={(v) => setPrefs((p) => ({ ...p, email_notifications: v }))} />
        <Toggle label="Push Notifications" description="Receive notifications in-app" checked={prefs.push_notifications} onChange={(v) => setPrefs((p) => ({ ...p, push_notifications: v }))} />
      </Section>

      <Section title="Digest">
        <Toggle label="AI Weekly Review" description="Weekly summary of your career progress" checked={prefs.ai_weekly_review} onChange={(v) => setPrefs((p) => ({ ...p, ai_weekly_review: v }))} />
      </Section>

      <Section title="Reminders">
        <Toggle label="Career Reminders" description="Nudges to update your profile and activity" checked={prefs.career_reminders} onChange={(v) => setPrefs((p) => ({ ...p, career_reminders: v }))} />
        <Toggle label="Interview Reminders" description="Get reminded before scheduled interviews" checked={prefs.interview_reminders} onChange={(v) => setPrefs((p) => ({ ...p, interview_reminders: v }))} />
        <Toggle label="Goal Reminders" description="Stay on track with your career goals" checked={prefs.goal_reminders} onChange={(v) => setPrefs((p) => ({ ...p, goal_reminders: v }))} />
      </Section>

      <Section title="Marketing">
        <Toggle label="Marketing Emails" description="Tips, product updates, and offers" checked={prefs.marketing_emails} onChange={(v) => setPrefs((p) => ({ ...p, marketing_emails: v }))} />
      </Section>

      <Button icon={<Save size={14} />} size="sm" onClick={handleSave}>Save Preferences</Button>
    </div>
  );
}

/* ──────────────── PRIVACY & SECURITY ──────────────── */

export function PrivacySecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { addToast } = useToast();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast("error", "Passwords do not match");
      return;
    }
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      addToast("success", "Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      addToast("error", "Failed to change password");
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await fetch("/api/users/export", { credentials: "include" }).then((r) => r.blob());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "career_os_export.zip";
      a.click();
      URL.revokeObjectURL(url);
      addToast("success", "Data export started");
    } catch {
      addToast("error", "Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      await apiFetch("/api/auth/delete-account", { method: "POST" });
      addToast("success", "Account deleted");
      window.location.href = "/";
    } catch {
      addToast("error", "Failed to delete account");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Privacy & Security</h2>
        <p className="text-sm text-fg-muted mt-0.5">Protect your account and data</p>
      </div>

      <Section title="Change Password" icon={Key}>
        <div className="space-y-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <Button icon={<Key size={14} />} size="sm" className="min-h-[44px]" onClick={handleChangePassword}>Update Password</Button>
        </div>
      </Section>

      <Section title="Two-Factor Authentication" icon={Shield}>
        <p className="text-sm text-fg-muted mb-3">Add an extra layer of security to your account.</p>
        <Button variant="secondary" size="sm" className="min-h-[44px]" disabled>Enable 2FA (Coming Soon)</Button>
      </Section>

      <Section title="Active Sessions" icon={Smartphone}>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-default p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><Smartphone size={14} /></div>
          <div>
            <p className="text-sm font-medium text-fg-default">Current device</p>
            <p className="text-xs text-fg-muted">Active now · {typeof window !== "undefined" ? window.navigator.userAgent.match(/\((.*?)\)/)?.[1] || "Unknown" : "Unknown"}</p>
          </div>
        </div>
      </Section>

      <Section title="Data">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" className="min-h-[44px]" icon={<Download size={13} />} onClick={handleExportData}>Export Data</Button>
          <Button variant="danger" size="sm" className="min-h-[44px]" icon={<Trash2 size={13} />} onClick={handleDeleteAccount}>Delete Account</Button>
        </div>
      </Section>
    </div>
  );
}

/* ──────────────── AI PREFERENCES ──────────────── */

export function AIPreferencesTab() {
  const [model, setModel] = useState("gpt-4");
  const [style, setStyle] = useState("balanced");
  const [coaching, setCoaching] = useState("encouraging");
  const [difficulty, setDifficulty] = useState("medium");
  const [detail, setDetail] = useState("detailed");
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [aiTone, setAiTone] = useState("professional");
  const [reminderFreq, setReminderFreq] = useState("weekly");
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [roadmapGen, setRoadmapGen] = useState(true);
  const [dailyMotivation, setDailyMotivation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingStep6, setSavingStep6] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([
      apiFetch("/api/users/ai-preferences"),
      apiFetch("/api/onboarding/step/6"),
    ]).then(([aiPrefs, step6]) => {
      if (aiPrefs.preferences) {
        setModel(aiPrefs.preferences.default_model || "gpt-4");
        setStyle(aiPrefs.preferences.response_style || "balanced");
        setCoaching(aiPrefs.preferences.coaching_mode || "encouraging");
        setDifficulty(aiPrefs.preferences.interview_difficulty || "medium");
        setDetail(aiPrefs.preferences.roadmap_detail || "detailed");
        setAutoSuggestions(aiPrefs.preferences.auto_suggestions ?? true);
      }
      const d6 = step6.data || {};
      setAiTone(d6.ai_tone || "professional");
      setReminderFreq(d6.reminder_freq || "weekly");
      setWeeklyReports(d6.weekly_reports ?? true);
      setRoadmapGen(d6.roadmap_gen ?? true);
      setDailyMotivation(d6.daily_motivation ?? true);
    }).catch(() => {
      addToast("error", "Failed to load AI preferences");
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await apiFetch("/api/users/ai-preferences", {
        method: "POST",
        body: JSON.stringify({
          preferences: {
            default_model: model,
            response_style: style,
            coaching_mode: coaching,
            interview_difficulty: difficulty,
            roadmap_detail: detail,
            auto_suggestions: autoSuggestions,
          },
        }),
      });
      addToast("success", "AI preferences saved");
    } catch {
      addToast("error", "Failed to save AI preferences");
    }
  };

  const handleSaveStep6 = async () => {
    setSavingStep6(true);
    try {
      await apiFetch("/api/onboarding/step/6", {
        method: "POST",
        body: JSON.stringify({
          data: {
            ai_tone: aiTone,
            reminder_freq: reminderFreq,
            weekly_reports: weeklyReports,
            roadmap_gen: roadmapGen,
            daily_motivation: dailyMotivation,
          },
        }),
      });
      addToast("success", "Onboarding preferences saved");
    } catch {
      addToast("error", "Failed to save onboarding preferences");
    } finally {
      setSavingStep6(false);
    }
  };

  if (loading) return <p className="text-sm text-fg-muted">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">AI Preferences</h2>
        <p className="text-sm text-fg-muted mt-0.5">Configure your AI copilot experience</p>
      </div>

      <Section title="Model & Style">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Default AI Model" options={[{ value: "gpt-4", label: "GPT-4" }, { value: "gpt-4o", label: "GPT-4o" }, { value: "claude-3", label: "Claude 3" }, { value: "gemini", label: "Gemini" }]} value={model} onChange={setModel} />
          <Select label="Response Style" options={[{ value: "concise", label: "Concise" }, { value: "balanced", label: "Balanced" }, { value: "detailed", label: "Detailed" }]} value={style} onChange={setStyle} />
        </div>
      </Section>

      <Section title="Career Coach">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Coaching Mode" options={[{ value: "encouraging", label: "Encouraging" }, { value: "direct", label: "Direct" }, { value: "challenging", label: "Challenging" }]} value={coaching} onChange={setCoaching} />
          <Select label="Interview Difficulty" options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }]} value={difficulty} onChange={setDifficulty} />
          <Select label="Roadmap Detail Level" options={[{ value: "simple", label: "Simple" }, { value: "detailed", label: "Detailed" }, { value: "comprehensive", label: "Comprehensive" }]} value={detail} onChange={setDetail} />
        </div>
      </Section>

      <Section title="Behavior">
        <Toggle label="Auto Suggestions" description="AI suggests improvements as you work" checked={autoSuggestions} onChange={setAutoSuggestions} />
      </Section>

      <Section title="Onboarding Preferences">
        <p className="text-xs text-fg-muted mb-3">These preferences were set during onboarding and control AI tone, reminders, and content generation.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="AI Tone" options={[{ value: "professional", label: "Professional" }, { value: "casual", label: "Casual" }, { value: "motivational", label: "Motivational" }]} value={aiTone} onChange={setAiTone} />
          <Select label="Reminder Frequency" options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }, { value: "never", label: "Never" }]} value={reminderFreq} onChange={setReminderFreq} />
        </div>
        <div className="mt-4 space-y-1">
          <Toggle label="Weekly Reports" description="Receive a weekly summary of your career progress" checked={weeklyReports} onChange={setWeeklyReports} />
          <Toggle label="Auto Roadmap Generation" description="Automatically generate career roadmaps based on your profile" checked={roadmapGen} onChange={setRoadmapGen} />
          <Toggle label="Daily Motivation" description="Receive daily motivational messages and tips" checked={dailyMotivation} onChange={setDailyMotivation} />
        </div>
        <div className="mt-4">
          <Button icon={<Save size={14} />} size="sm" className="min-h-[44px]" onClick={handleSaveStep6} disabled={savingStep6}>
            {savingStep6 ? "Saving..." : "Save Onboarding Preferences"}
          </Button>
        </div>
      </Section>

      <Button icon={<Save size={14} />} size="sm" className="min-h-[44px]" onClick={handleSave}>Save AI Preferences</Button>
    </div>
  );
}

/* ──────────────── CAREER PROFILE ──────────────── */

const CAREER_STAGES = [
  { id: "student", icon: GraduationCap, title: "Student", desc: "Currently pursuing a degree" },
  { id: "fresher", icon: BookOpen, title: "Fresher / Recent Graduate", desc: "Looking for first job" },
  { id: "professional", icon: Briefcase, title: "Working Professional", desc: "Experienced and career-growing" },
  { id: "switcher", icon: Repeat, title: "Career Switcher", desc: "Transitioning to a new field" },
];

function TagInput({ label, items, onChange, placeholder, suggestions }: {
  label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string; suggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function addItem(name: string) {
    const trimmed = name.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setInput("");
  }

  function removeItem(name: string) {
    onChange(items.filter((i) => i !== name));
  }

  const filtered = (suggestions || []).filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-fg-muted">{label}</label>
      <div className="relative">
        <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-bg-default px-3 py-1.5">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-md bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
              {item}
              <button onClick={() => removeItem(item)} className="text-accent/60 hover:text-accent"><X size={12} /></button>
            </span>
          ))}
          <input type="text" value={input} onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(input); } }}
            onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={items.length === 0 ? placeholder : ""}
            className="min-w-[140px] flex-1 border-0 bg-transparent py-1 text-sm text-fg-default placeholder:text-fg-subtle focus:outline-none" />
        </div>
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-border bg-bg-raised shadow-lg">
            {filtered.map((s) => (
              <button key={s} onMouseDown={(e) => { e.preventDefault(); addItem(s); }}
                className="w-full px-3 py-2 text-left text-sm text-fg-default transition-colors hover:bg-bg-hover">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes",
  "SQL", "Git", "Go", "Rust", "GraphQL", "Kafka", "Machine Learning", "Java", "C++",
  "Data Structures", "Algorithms", "System Design", "HTML", "CSS", "Vue.js", "Angular",
  "PostgreSQL", "MongoDB", "Redis", "CI/CD", "Terraform", "Linux",
];

export function CareerProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const [careerStage, setCareerStage] = useState("student");
  const [stageData, setStageData] = useState<Record<string, any>>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<{ title: string; target_role: string; target_company: string; priority: number; status: string }[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/onboarding/step/2"),
      apiFetch("/api/onboarding/step/3"),
      apiFetch("/api/onboarding/step/4"),
    ]).then(([s2, s3, s4]) => {
      const d2 = s2.data || {};
      setCareerStage(d2.career_stage || "student");
      setStageData(d2);
      const d3 = s3.data || {};
      setSkills((d3.skills || []).map((s: any) => s.name));
      const d4 = s4.data || {};
      setInterests((d4.interests || []).map((i: any) => i.name));
      setGoals(d4.goals || []);
    }).catch(() => {
      addToast("error", "Failed to load career profile");
    }).finally(() => setLoading(false));
  }, []);

  const updateStageField = (fields: Record<string, any>) => {
    setStageData((prev) => ({ ...prev, ...fields }));
  };

  const handleSaveStep2 = async () => {
    setSaving((s) => ({ ...s, step2: true }));
    try {
      await apiFetch("/api/onboarding/step/2", {
        method: "POST",
        body: JSON.stringify({ data: { ...stageData, career_stage: careerStage } }),
      });
      addToast("success", "Career stage saved");
    } catch {
      addToast("error", "Failed to save career stage");
    } finally {
      setSaving((s) => ({ ...s, step2: false }));
    }
  };

  const handleSaveStep3 = async () => {
    setSaving((s) => ({ ...s, step3: true }));
    try {
      await apiFetch("/api/onboarding/step/3", {
        method: "POST",
        body: JSON.stringify({ data: { skills: skills.map((name) => ({ name })) } }),
      });
      addToast("success", "Skills saved");
    } catch {
      addToast("error", "Failed to save skills");
    } finally {
      setSaving((s) => ({ ...s, step3: false }));
    }
  };

  const handleSaveStep4 = async () => {
    setSaving((s) => ({ ...s, step4: true }));
    try {
      await apiFetch("/api/onboarding/step/4", {
        method: "POST",
        body: JSON.stringify({
          data: {
            interests: interests.map((name) => ({ name })),
            goals,
          },
        }),
      });
      addToast("success", "Interests and goals saved");
    } catch {
      addToast("error", "Failed to save interests and goals");
    } finally {
      setSaving((s) => ({ ...s, step4: false }));
    }
  };

  if (loading) return <p className="text-sm text-fg-muted">Loading...</p>;

  const renderStageFields = () => {
    switch (careerStage) {
      case "student":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="College / Institution" value={stageData.college || ""} onChange={(e) => updateStageField({ college: e.target.value })} placeholder="e.g. MIT" />
            <Input label="Degree" value={stageData.degree || ""} onChange={(e) => updateStageField({ degree: e.target.value })} placeholder="e.g. B.Tech" />
            <Input label="Branch / Major" value={stageData.branch || ""} onChange={(e) => updateStageField({ branch: e.target.value })} placeholder="e.g. Computer Science" />
            <Input label="Graduation Year" type="number" value={String(stageData.grad_year || "")} onChange={(e) => updateStageField({ grad_year: e.target.value ? parseInt(e.target.value) : null })} />
            <Input label="Current Semester" value={String(stageData.current_semester || "")} onChange={(e) => updateStageField({ current_semester: e.target.value ? parseInt(e.target.value) : null })} />
            <Input label="CGPA" value={String(stageData.cgpa || "")} onChange={(e) => updateStageField({ cgpa: e.target.value ? parseFloat(e.target.value) : null })} />
            <Input label="Dream Role" value={stageData.dream_role || ""} onChange={(e) => updateStageField({ dream_role: e.target.value })} placeholder="e.g. Software Engineer at Google" />
            <Input label="Preferred Country" value={stageData.preferred_country || ""} onChange={(e) => updateStageField({ preferred_country: e.target.value })} placeholder="e.g. United States" />
            <Input label="Preferred Internship Type" value={stageData.preferred_internship || ""} onChange={(e) => updateStageField({ preferred_internship: e.target.value })} placeholder="e.g. Summer Internship" />
            <Input label="GitHub URL" value={stageData.github_url || ""} onChange={(e) => updateStageField({ github_url: e.target.value })} placeholder="https://github.com/username" />
            <Input label="LinkedIn URL" value={stageData.linkedin_url || ""} onChange={(e) => updateStageField({ linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/username" />
          </div>
        );
      case "fresher":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="College / Institution" value={stageData.college || ""} onChange={(e) => updateStageField({ college: e.target.value })} />
            <Input label="Degree" value={stageData.degree || ""} onChange={(e) => updateStageField({ degree: e.target.value })} />
            <Input label="Graduation Year" type="number" value={String(stageData.grad_year || "")} onChange={(e) => updateStageField({ grad_year: e.target.value ? parseInt(e.target.value) : null })} />
            <Input label="Internship Experience" value={stageData.internship_experience || ""} onChange={(e) => updateStageField({ internship_experience: e.target.value })} placeholder="e.g. 3-month internship at Google" />
            <Input label="Dream Role" value={stageData.dream_role || ""} onChange={(e) => updateStageField({ dream_role: e.target.value })} placeholder="e.g. Software Engineer" />
            <Input label="Preferred Country" value={stageData.preferred_country || ""} onChange={(e) => updateStageField({ preferred_country: e.target.value })} />
            <Input label="Expected Salary" value={stageData.expected_salary || ""} onChange={(e) => updateStageField({ expected_salary: e.target.value })} placeholder="e.g. $100,000" />
            <div className="sm:col-span-2">
              <TagInput label="Projects" items={stageData.projects || []} onChange={(v) => updateStageField({ projects: v })} placeholder="Add a project name" suggestions={[]} />
            </div>
            <div className="sm:col-span-2">
              <TagInput label="Certifications" items={stageData.certifications || []} onChange={(v) => updateStageField({ certifications: v })} placeholder="Add a certification" suggestions={[]} />
            </div>
          </div>
        );
      case "professional":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Current Company" value={stageData.current_company || ""} onChange={(e) => updateStageField({ current_company: e.target.value })} placeholder="e.g. Google" />
            <Input label="Current Role" value={stageData.current_role || ""} onChange={(e) => updateStageField({ current_role: e.target.value })} placeholder="e.g. Senior Engineer" />
            <Input label="Industry" value={stageData.industry || ""} onChange={(e) => updateStageField({ industry: e.target.value })} placeholder="e.g. Technology" />
            <Input label="Years of Experience" type="number" value={String(stageData.years_experience || "0")} onChange={(e) => updateStageField({ years_experience: e.target.value ? parseInt(e.target.value) : 0 })} />
            <Input label="Dream Role" value={stageData.dream_role || ""} onChange={(e) => updateStageField({ dream_role: e.target.value })} placeholder="e.g. Engineering Manager" />
            <Input label="Preferred Country" value={stageData.preferred_country || ""} onChange={(e) => updateStageField({ preferred_country: e.target.value })} />
            <div className="space-y-1.5">
              <label className={labelClass}>Work Preference</label>
              <select value={stageData.work_preference || "remote"} onChange={(e) => updateStageField({ work_preference: e.target.value })} className={selectClass}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Employment Type</label>
              <select value={stageData.employment_type || ""} onChange={(e) => updateStageField({ employment_type: e.target.value })} className={selectClass}>
                <option value="">Select...</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <Input label="Current CTC" value={stageData.current_ctc || ""} onChange={(e) => updateStageField({ current_ctc: e.target.value })} placeholder="e.g. $120,000" />
            <Input label="Expected CTC" value={stageData.expected_ctc || ""} onChange={(e) => updateStageField({ expected_ctc: e.target.value })} placeholder="e.g. $150,000" />
            <Input label="Notice Period" value={stageData.notice_period || ""} onChange={(e) => updateStageField({ notice_period: e.target.value })} placeholder="e.g. 30 days" />
          </div>
        );
      case "switcher":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Current Profession" value={stageData.current_profession || ""} onChange={(e) => updateStageField({ current_profession: e.target.value })} placeholder="e.g. Teacher" />
            <Input label="Target Profession" value={stageData.target_profession || ""} onChange={(e) => updateStageField({ target_profession: e.target.value })} placeholder="e.g. Software Engineer" />
            <Input label="Preferred Country" value={stageData.preferred_country || ""} onChange={(e) => updateStageField({ preferred_country: e.target.value })} />
            <div className="sm:col-span-2">
              <TagInput label="Transferable Skills" items={stageData.transferable_skills || []} onChange={(v) => updateStageField({ transferable_skills: v })} placeholder="Add a skill" suggestions={["Communication", "Problem Solving", "Leadership", "Project Management", "Analytical Thinking", "Teamwork", "Public Speaking", "Writing", "Research", "Customer Service"]} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-fg-muted">Learning Progress</label>
              <textarea value={stageData.learning_progress || ""} onChange={(e) => updateStageField({ learning_progress: e.target.value })} placeholder="What have you learned so far for your transition?"
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 min-h-[80px] resize-y" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-fg-muted">Career Goals</label>
              <textarea value={stageData.career_goals_text || ""} onChange={(e) => updateStageField({ career_goals_text: e.target.value })} placeholder="Describe your career transition goals"
                className="w-full rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 min-h-[80px] resize-y" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Career Profile</h2>
        <p className="text-sm text-fg-muted mt-0.5">Manage your career stage, skills, interests, and goals</p>
      </div>

      <Section title="Career Stage" icon={Briefcase}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CAREER_STAGES.map((s) => {
            const Icon = s.icon;
            const selected = careerStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setCareerStage(s.id)}
                className={`btn-press relative rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                  selected ? "border-accent bg-accent-subtle shadow-sm" : "border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-hover"
                }`}
              >
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${selected ? "bg-accent text-white" : "bg-bg-hover text-fg-muted"}`}>
                  <Icon size={16} />
                </div>
                <p className={`text-xs font-medium ${selected ? "text-accent" : "text-fg-default"}`}>{s.title}</p>
                <p className="mt-0.5 text-[10px] text-fg-muted leading-tight">{s.desc}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-5 space-y-4">
          {renderStageFields()}
        </div>
        <div className="mt-5">
          <Button icon={<Save size={14} />} size="sm" className="min-h-[44px]" onClick={handleSaveStep2} disabled={saving.step2}>
            {saving.step2 ? "Saving..." : "Save Career Stage"}
          </Button>
        </div>
      </Section>

      <Section title="Skills" icon={Zap}>
        <p className="text-xs text-fg-muted mb-3">Skills you list here are used for job matching and personalized recommendations.</p>
        <TagInput label="Your Skills" items={skills} onChange={setSkills} placeholder="Type a skill and press Enter" suggestions={SKILL_SUGGESTIONS} />
        <div className="mt-4">
          <Button icon={<Save size={14} />} size="sm" className="min-h-[44px]" onClick={handleSaveStep3} disabled={saving.step3}>
            {saving.step3 ? "Saving..." : "Save Skills"}
          </Button>
        </div>
      </Section>

      <Section title="Interests & Goals" icon={Target}>
        <div className="mb-5">
          <TagInput label="Interests" items={interests} onChange={setInterests} placeholder="Type an interest and press Enter" suggestions={["Artificial Intelligence", "Web Development", "Mobile Development", "Data Science", "DevOps", "Cloud Computing", "Cybersecurity", "Blockchain", "Machine Learning", "Open Source"]} />
        </div>

        <div className="border-t border-border pt-5">
          <label className="mb-3 block text-xs font-medium text-fg-muted">Career Goals</label>
          <div className="space-y-2">
            {goals.map((g, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-bg-default p-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-fg-default truncate">{g.title}</p>
                  {(g.target_role || g.target_company) && (
                    <p className="text-xs text-fg-muted truncate">{g.target_role}{g.target_role && g.target_company ? " at " : ""}{g.target_company}</p>
                  )}
                </div>
                <button onClick={() => setGoals(goals.filter((_, j) => j !== i))} className="shrink-0 p-1 text-fg-muted hover:text-danger transition-colors">
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newGoalTitle.trim()) {
                  setGoals([...goals, { title: newGoalTitle.trim(), target_role: "", target_company: "", priority: 3, status: "active" }]);
                  setNewGoalTitle("");
                }
              }}
              placeholder="Add a goal (e.g. Get promoted to Staff Engineer)"
              className="flex-1 rounded-lg border border-border bg-bg-default px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 min-h-[44px]"
            />
            <Button variant="primary" size="sm" className="min-h-[44px] shrink-0" icon={<Plus size={14} />}
              onClick={() => {
                if (newGoalTitle.trim()) {
                  setGoals([...goals, { title: newGoalTitle.trim(), target_role: "", target_company: "", priority: 3, status: "active" }]);
                  setNewGoalTitle("");
                }
              }}
            >Add</Button>
          </div>
        </div>

        <div className="mt-5">
          <Button icon={<Save size={14} />} size="sm" className="min-h-[44px]" onClick={handleSaveStep4} disabled={saving.step4}>
            {saving.step4 ? "Saving..." : "Save Interests & Goals"}
          </Button>
        </div>
      </Section>
    </div>
  );
}

/* ──────────────── BILLING ──────────────── */

export function BillingTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Billing</h2>
        <p className="text-sm text-fg-muted mt-0.5">Manage your subscription and payment methods</p>
      </div>

      <Section title="Current Plan">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-default">Free Plan</p>
            <p className="text-xs text-fg-muted">Basic career tracking features</p>
          </div>
          <Badge tone="neutral">Active</Badge>
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-muted">Payment method</span>
            <span className="text-sm font-medium text-fg-subtle">Not added yet</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-muted">Billing history</span>
            <span className="text-sm font-medium text-fg-subtle">No history yet</span>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ──────────────── KEYBOARD SHORTCUTS ──────────────── */

export function KeyboardTab() {
  const shortcuts = [
    { keys: ["Ctrl", "K"], desc: "Command palette" },
    { keys: ["Ctrl", "B"], desc: "Toggle sidebar" },
    { keys: ["Ctrl", "L"], desc: "Focus search" },
    { keys: ["Ctrl", "D"], desc: "Go to Dashboard" },
    { keys: ["Ctrl", ","], desc: "Open Settings" },
    { keys: ["Ctrl", "S"], desc: "Save current form" },
    { keys: ["Ctrl", "E"], desc: "Go to Resume Studio" },
    { keys: ["Ctrl", "O"], desc: "Go to Opportunities" },
    { keys: ["Ctrl", "J"], desc: "Go to Applications" },
    { keys: ["G", "then", "C"], desc: "Go to Career Coach" },
    { keys: ["G", "then", "A"], desc: "Go to Analytics" },
    { keys: ["?"], desc: "Show keyboard shortcuts" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">Keyboard Shortcuts</h2>
        <p className="text-sm text-fg-muted mt-0.5">Navigate faster with keyboard shortcuts</p>
      </div>

      <Card>
        <div className="space-y-1">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-fg-default">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j} className="inline-flex items-center rounded-md border border-border bg-bg-hover px-2 py-0.5 font-mono text-[11px] font-medium text-fg-muted shadow-xs">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ──────────────── ABOUT ──────────────── */

export function AboutTab() {
  const [version, setVersion] = useState("0.1.0");
  const [build, setBuild] = useState("");

  useEffect(() => {
    apiFetch("/api/system/version")
      .then((d) => {
        if (d.version) setVersion(d.version);
        if (d.build) setBuild(d.build);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-medium text-fg-default">About</h2>
        <p className="text-sm text-fg-muted mt-0.5">Version information and resources</p>
      </div>

      <Section title="Application">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted">Version</span>
            <span className="text-sm font-medium text-fg-default">{version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted">Build Number</span>
            <span className="text-sm font-medium text-fg-default">{build || "N/A"}</span>
          </div>
        </div>
      </Section>

      <Section title="Resources">
        <div className="space-y-2">
          {[
            { label: "Release Notes", icon: FileText, href: "https://github.com/gurupratap-matharu/career-os/releases" },
            { label: "Documentation", icon: Package, href: "https://docs.careeros.ai" },
            { label: "Contact Support", icon: HelpCircle, href: "mailto:support@careeros.ai" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg-default hover:bg-bg-hover transition-colors duration-100"
            >
              <div className="flex items-center gap-2.5">
                <item.icon size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{item.label}</span>
              </div>
              <ExternalLink size={13} className="shrink-0 text-fg-subtle" />
            </a>
          ))}
        </div>
      </Section>

      <Section title="Legal">
        <div className="space-y-2">
          {[
            { label: "Privacy Policy", icon: FileText, href: "https://careeros.ai/privacy" },
            { label: "Terms of Service", icon: FileText, href: "https://careeros.ai/terms" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg-default hover:bg-bg-hover transition-colors duration-100"
            >
              <div className="flex items-center gap-2.5">
                <item.icon size={15} strokeWidth={1.5} className="shrink-0" />
                <span>{item.label}</span>
              </div>
              <ExternalLink size={13} className="shrink-0 text-fg-subtle" />
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}