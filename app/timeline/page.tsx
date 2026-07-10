"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Star,
  Copy,
  Edit3,
  Trash2,
  MoreHorizontal,
  X,
  Calendar,
  ArrowUpDown,
  Route,
  ChevronDown,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  Paperclip,
  GraduationCap,
  BookOpen,
  FolderGit2,
  Briefcase,
  Code2,
  Trophy,
  Target,
  Award,
  Users,
  Send,
  Sparkles,
  FileText,
  BadgeCheck,
  Building2,
  CalendarPlus,
  Zap,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import {
  getGroupedTimeline,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  duplicateTimelineEvent,
  togglePinEvent,
  toggleFavoriteEvent,
  getTimelineStats,
} from "@/app/career-profile/api";
import { TIMELINE_CATEGORIES, EVENT_STATUSES } from "@/app/career-profile/types";
import type {
  TimelineEvent,
  TimelineEventFormData,
  GroupedTimeline,
  TimelineStats,
} from "@/app/career-profile/types";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  GraduationCap, BookOpen, FolderGit2, Briefcase, Code2, Trophy,
  Target, Award, Users, Send, Sparkles, FileText, BadgeCheck,
  Building2, CalendarPlus,
};

function resolveIcon(name: string, size = 16, cls?: string) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon size={size} className={cls} /> : null;
}

const STATUS_TONE: Record<string, "accent" | "success" | "warning" | "danger" | "neutral"> = {
  planned: "warning", in_progress: "accent", completed: "success", archived: "neutral",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const DATE_RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
] as const;

type DateRangeKey = (typeof DATE_RANGES)[number]["key"];

const TRACKABLE_ITEMS = [
  { icon: BookOpen, label: "Learning milestones" },
  { icon: FolderGit2, label: "Projects built" },
  { icon: Users, label: "Interviews attended" },
  { icon: Send, label: "Applications submitted" },
  { icon: Award, label: "Certifications earned" },
  { icon: Trophy, label: "Achievements unlocked" },
  { icon: Briefcase, label: "Career promotions" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.1, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMonthKey(monthStr: string): string {
  const num = parseInt(monthStr, 10);
  return num >= 1 && num <= 12 ? MONTHS[num - 1] : monthStr;
}

function isDateInRange(dateStr: string | null, range: DateRangeKey): boolean {
  if (!dateStr || range === "all") return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  if (range === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (range === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }
  if (range === "month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (range === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  status: string;
  tags: string;
  visibility: string;
}

const emptyForm: EventFormData = {
  title: "", description: "", event_type: "custom", event_date: "",
  status: "planned", tags: "", visibility: "public",
};

// ── Stat Counter Animation ──────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = to;
    if (from === to) return;

    const duration = 600;
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      if (spanRef.current) spanRef.current.textContent = String(current);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span ref={spanRef}>{value}</span>;
}

// ── Main Page ───────────────────────────────────────────────

export default function TimelinePage() {
  const { addToast } = useToast();

  const [grouped, setGrouped] = useState<GroupedTimeline | null>(null);
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimelineEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const [groupedData, statsData] = await Promise.all([
        getGroupedTimeline(Object.keys(params).length ? params : undefined),
        getTimelineStats(),
      ]);
      setGrouped(groupedData);
      setStats(statsData);
    } catch {
      addToast("error", "Failed to load timeline");
    }
    setLoading(false);
  }, [categoryFilter, statusFilter, debouncedSearch, addToast]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refresh = useCallback(async () => {
    setMutating(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const [groupedData, statsData] = await Promise.all([
        getGroupedTimeline(Object.keys(params).length ? params : undefined),
        getTimelineStats(),
      ]);
      setGrouped(groupedData);
      setStats(statsData);
    } catch {
      addToast("error", "Failed to refresh");
    }
    setMutating(false);
  }, [categoryFilter, statusFilter, debouncedSearch, addToast]);

  const handleCreate = async (data: EventFormData) => {
    setSaving(true);
    try {
      const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      await createTimelineEvent({
        title: data.title, description: data.description || "",
        event_type: data.event_type, event_date: data.event_date || null,
        status: data.status, tags, visibility: data.visibility,
      } as Partial<TimelineEventFormData>);
      addToast("success", "Event created");
      setFormOpen(false);
      await refresh();
    } catch {
      addToast("error", "Failed to create event");
    }
    setSaving(false);
  };

  const handleUpdate = async (id: number, data: EventFormData) => {
    setSaving(true);
    try {
      const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      await updateTimelineEvent(id, {
        title: data.title, description: data.description || "",
        event_type: data.event_type, event_date: data.event_date || null,
        status: data.status, tags, visibility: data.visibility,
      } as Partial<TimelineEventFormData>);
      addToast("success", "Event updated");
      setEditingEvent(null);
      setFormOpen(false);
      await refresh();
    } catch {
      addToast("error", "Failed to update event");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteTimelineEvent(id);
      addToast("success", "Event deleted");
      setDeleteTarget(null);
      await refresh();
    } catch {
      addToast("error", "Failed to delete event");
    }
    setDeleting(false);
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateTimelineEvent(id);
      addToast("success", "Event duplicated");
      setOpenMenuId(null);
      await refresh();
    } catch {
      addToast("error", "Failed to duplicate event");
    }
  };

  const handleTogglePin = async (id: number, current: boolean) => {
    try {
      await togglePinEvent(id);
      addToast("success", current ? "Unpinned" : "Pinned");
      await refresh();
    } catch {
      addToast("error", "Failed to toggle pin");
    }
  };

  const handleToggleFavorite = async (id: number, current: boolean) => {
    try {
      await toggleFavoriteEvent(id);
      addToast("success", current ? "Removed from favorites" : "Added to favorites");
      await refresh();
    } catch {
      addToast("error", "Failed to toggle favorite");
    }
  };

  const openCreate = () => { setEditingEvent(null); setFormOpen(true); };
  const openEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormOpen(true);
    setOpenMenuId(null);
  };

  // Filter events by date range and sort within groups
  const filteredGrouped = useMemo(() => {
    if (!grouped) return null;
    if (dateRange === "all") return grouped;

    const filtered: GroupedTimeline = { ...grouped, years: {}, year_list: [], total: 0 };
    let totalCount = 0;
    for (const year of grouped.year_list) {
      const months = grouped.years[year];
      const filteredMonths: Record<string, TimelineEvent[]> = {};
      for (const monthKey of Object.keys(months)) {
        const evts = months[monthKey].filter(e => isDateInRange(e.event_date, dateRange));
        if (evts.length > 0) {
          filteredMonths[monthKey] = evts;
          totalCount += evts.length;
        }
      }
      if (Object.keys(filteredMonths).length > 0) {
        filtered.years[year] = filteredMonths;
        filtered.year_list.push(year);
      }
    }
    filtered.total = totalCount;
    return filtered;
  }, [grouped, dateRange]);

  const displayYears = useMemo(() => {
    if (!filteredGrouped) return [];
    let years = [...filteredGrouped.year_list];
    if (!sortAsc) years = years.reverse();
    return years;
  }, [filteredGrouped, sortAsc]);

  const totalVisible = filteredGrouped?.total ?? 0;

  const statCards = useMemo(() => [
    { label: "Total Events", value: stats?.total ?? 0, icon: Route, color: "text-accent" },
    { label: "Pinned", value: stats?.pinned ?? 0, icon: Pin, color: "text-violet-400" },
    { label: "Favorites", value: stats?.favorites ?? 0, icon: Star, color: "text-amber-400" },
    { label: "Planned", value: stats?.planned ?? 0, icon: Clock, color: "text-warning" },
    { label: "In Progress", value: stats?.in_progress ?? 0, icon: Loader2, color: "text-accent" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle2, color: "text-success" },
  ], [stats]);

  const categoryOptions = useMemo(
    () => Object.entries(TIMELINE_CATEGORIES).map(([key, val]) => ({ key, ...val })),
    []
  );

  // ── Loading State ──
  if (loading && !grouped) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-bg-surface p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4 pl-8">
          <Skeleton className="h-10 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty State ──
  const isEmpty = !grouped || grouped.total === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-fg-default">
              <Route className="text-accent" size={26} />
              Career Timeline
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              Your entire career journey, chronologically mapped
            </p>
          </div>
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={openCreate}>
            Add Event
          </Button>
        </div>
      </motion.div>

      {/* ── Stats Bar ── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="flex flex-col items-center gap-1 p-3 text-center sm:flex-row sm:text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <stat.icon size={14} className={stat.color} />
              </div>
              <div>
                <p className="text-base font-semibold text-fg-default">
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="text-[10px] text-fg-muted">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {isEmpty ? (
        /* ── Empty State ── */
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
              <Route size={40} className="text-accent" />
            </div>
            <div className="max-w-md">
              <h2 className="text-xl font-semibold text-fg-default">
                Your career journey starts here.
              </h2>
              <p className="mt-2 text-sm text-fg-muted">
                Track every milestone, achievement, and step in your professional growth.
              </p>
            </div>
            <div className="grid w-full max-w-sm grid-cols-1 gap-2 text-left">
              {TRACKABLE_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-bg-default px-4 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10">
                    <item.icon size={14} className="text-accent" />
                  </div>
                  <span className="text-sm text-fg-muted">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                Create First Event
              </Button>
              <Link href="/import-hub">
                <Button variant="secondary" icon={<Upload size={16} />}>
                  Import Resume
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* ── Filters Bar ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-3 rounded-xl border border-border bg-bg-surface p-4"
          >
            {/* Row 1: Date range + Sort + Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] font-medium uppercase tracking-wider text-fg-subtle">Date:</span>
              {DATE_RANGES.map((dr) => (
                <button
                  key={dr.key}
                  onClick={() => setDateRange(dr.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
                    dateRange === dr.key
                      ? "bg-accent text-white shadow-sm"
                      : "bg-bg-hover text-fg-muted hover:bg-bg-hover hover:text-fg-default"
                  }`}
                >
                  {dr.label}
                </button>
              ))}

              <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

              <button
                onClick={() => setSortAsc(p => !p)}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-fg-muted transition-colors hover:border-accent/40 hover:text-fg-default"
              >
                <ArrowUpDown size={11} />
                {sortAsc ? "Oldest" : "Newest"}
              </button>

              <div className="relative ml-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-full border border-border bg-bg-surface px-3 py-1 pr-7 text-xs text-fg-default transition-colors hover:border-accent/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
                >
                  <option value="">All Status</option>
                  {EVENT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
              </div>
            </div>

            {/* Row 2: Category capsules + Search */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategoryFilter("")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
                  !categoryFilter
                    ? "bg-accent text-white shadow-sm"
                    : "bg-bg-hover text-fg-muted hover:text-fg-default"
                }`}
              >
                All
              </button>
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(categoryFilter === cat.key ? "" : cat.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
                    categoryFilter === cat.key
                      ? "text-white shadow-sm"
                      : "bg-bg-hover text-fg-muted hover:text-fg-default"
                  }`}
                  style={categoryFilter === cat.key ? { backgroundColor: cat.color } : undefined}
                >
                  <span style={categoryFilter !== cat.key ? { color: cat.color } : undefined}>
                    {resolveIcon(cat.icon, 10)}
                  </span>
                  {cat.label}
                </button>
              ))}

              <div className="relative ml-auto min-w-[180px] flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full rounded-lg border border-border bg-bg-surface py-1.5 pl-8 pr-8 text-xs text-fg-default placeholder:text-fg-subtle transition-colors hover:border-accent/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg-muted">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Filtered count ── */}
          {dateRange !== "all" && (
            <motion.p variants={fadeUp} initial="hidden" animate="show" className="text-xs text-fg-subtle">
              Showing {totalVisible} event{totalVisible !== 1 ? "s" : ""} for {DATE_RANGES.find(d => d.key === dateRange)?.label}
            </motion.p>
          )}

          {/* ── Grouped Timeline ── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-0">
            {displayYears.map((year) => {
              const months = filteredGrouped?.years[year];
              if (!months) return null;
              const monthKeys = Object.keys(months).sort((a, b) =>
                sortAsc ? parseInt(a) - parseInt(b) : parseInt(b) - parseInt(a)
              );
              return (
                <motion.div key={year} variants={fadeUp} className="relative pb-8">
                  {/* Year header */}
                  <div className="sticky top-0 z-10 mb-6 -mx-6 bg-bg-surface/90 px-6 py-3 backdrop-blur-md">
                    <h2 className="font-serif text-4xl font-semibold tracking-tight text-fg-default">
                      {year}
                    </h2>
                    <div className="mt-1 h-px bg-gradient-to-r from-accent/40 to-transparent" />
                  </div>

                  {/* Months */}
                  <div className="relative space-y-6 pl-8">
                    <div className="absolute left-[15px] top-0 h-full w-px bg-border" />

                    {monthKeys.map((monthKey) => {
                      const events = months[monthKey];
                      if (!events || events.length === 0) return null;

                      const pinnedEvents = events.filter(e => e.is_pinned);
                      const unpinnedEvents = events.filter(e => !e.is_pinned);
                      const sortedEvents = [...pinnedEvents, ...unpinnedEvents];

                      return (
                        <div key={monthKey} className="relative">
                          <div className="relative mb-4 flex items-center gap-3">
                            <div className="absolute -left-8 flex h-8 w-8 items-center justify-center">
                              <div className="h-3 w-3 rounded-full border-2 border-accent bg-bg-surface" />
                            </div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                              {formatMonthKey(monthKey)}
                            </h3>
                            <div className="h-px flex-1 bg-border/60" />
                            <span className="text-[10px] text-fg-subtle">
                              {events.length} event{events.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                              {sortedEvents.map((event) => (
                                <motion.div
                                  key={event.id}
                                  layout
                                  initial={{ opacity: 0, x: -12, scale: 0.97 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: 12, scale: 0.97 }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                >
                                  <EventCard
                                    event={event}
                                    onEdit={() => openEdit(event)}
                                    onDelete={() => setDeleteTarget(event)}
                                    onDuplicate={() => handleDuplicate(event.id)}
                                    onTogglePin={() => handleTogglePin(event.id, event.is_pinned)}
                                    onToggleFavorite={() => handleToggleFavorite(event.id, event.is_favorite)}
                                    isMenuOpen={openMenuId === event.id}
                                    onMenuToggle={() =>
                                      setOpenMenuId(prev => prev === event.id ? null : event.id)
                                    }
                                  />
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {mutating && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-accent" />
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {formOpen && (
          <EventFormModal
            event={editingEvent}
            saving={saving}
            onSave={(data) => editingEvent ? handleUpdate(editingEvent.id, data) : handleCreate(data)}
            onClose={() => { setFormOpen(false); setEditingEvent(null); }}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            title={deleteTarget.title}
            deleting={deleting}
            onConfirm={() => handleDelete(deleteTarget.id)}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Event Card ──────────────────────────────────────────────

function EventCard({
  event, onEdit, onDelete, onDuplicate, onTogglePin, onToggleFavorite, isMenuOpen, onMenuToggle,
}: {
  event: TimelineEvent;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const catInfo = TIMELINE_CATEGORIES[event.event_type] ?? TIMELINE_CATEGORIES.custom;
  const tone = STATUS_TONE[event.status] ?? "neutral";
  const statusLabel = EVENT_STATUSES.find(s => s.value === event.status)?.label ?? event.status;
  const menuRef = useRef<HTMLDivElement>(null);
  const isAuto = !!(event as unknown as { is_auto?: boolean }).is_auto || event.metadata?.auto === true;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (isMenuOpen) onMenuToggle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onMenuToggle]);

  return (
    <div className="group relative rounded-xl border border-border bg-bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Left colored line */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ backgroundColor: catInfo.color }}
      />

      <div className="flex items-start gap-3 pl-1">
        {/* Colored icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${catInfo.color}18` }}
        >
          {resolveIcon(catInfo.icon, 16)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Title + badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-fg-default">
                  {event.title}
                </h4>
                {event.is_pinned && (
                  <Pin size={11} className="shrink-0 text-accent" />
                )}
                {isAuto && (
                  <Badge tone="neutral" className="text-[9px] gap-0.5">
                    <Zap size={8} /> auto
                  </Badge>
                )}
              </div>

              {/* Badges + Date row */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge tone="accent" className="text-[10px]">
                  {catInfo.label}
                </Badge>
                <Badge tone={tone} className="text-[10px]">
                  {statusLabel}
                </Badge>
                {event.event_date && (
                  <span className="flex items-center gap-1 text-[10px] text-fg-subtle">
                    <Calendar size={10} />
                    {formatDate(event.event_date)}
                  </span>
                )}
                {event.attachment_url && (
                  <Paperclip size={10} className="text-fg-subtle" />
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted line-clamp-2">
                  {event.description}
                </p>
              )}

              {/* Tags row */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-bg-hover px-1.5 py-0.5 font-mono text-[10px] text-fg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={onTogglePin}
                className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-bg-hover hover:text-accent"
                title={event.is_pinned ? "Unpin" : "Pin"}
              >
                {event.is_pinned ? <PinOff size={13} className="text-accent" /> : <Pin size={13} />}
              </button>
              <button
                onClick={onToggleFavorite}
                className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-bg-hover hover:text-amber-500"
                title={event.is_favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star size={13} className={event.is_favorite ? "fill-amber-500 text-amber-500" : ""} />
              </button>

              {/* More menu */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={onMenuToggle}
                  className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-bg-hover hover:text-fg-default"
                >
                  <MoreHorizontal size={13} />
                </button>
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-bg-surface shadow-lg"
                    >
                      <button
                        onClick={onEdit}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-fg-default transition-colors hover:bg-bg-hover"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={onDuplicate}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-fg-default transition-colors hover:bg-bg-hover"
                      >
                        <Copy size={12} /> Duplicate
                      </button>
                      <div className="h-px bg-border" />
                      <button
                        onClick={onDelete}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-danger transition-colors hover:bg-danger/10"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit Event Modal ───────────────────────────────

function EventFormModal({
  event, saving, onSave, onClose,
}: {
  event: TimelineEvent | null;
  saving: boolean;
  onSave: (data: EventFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EventFormData>(() => {
    if (event) {
      return {
        title: event.title,
        description: event.description ?? "",
        event_type: event.event_type,
        event_date: event.event_date ? event.event_date.slice(0, 10) : "",
        status: event.status,
        tags: (event.tags ?? []).join(", "),
        visibility: event.visibility ?? "public",
      };
    }
    return { ...emptyForm };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const categoryOptions = useMemo(
    () => Object.entries(TIMELINE_CATEGORIES).map(([key, val]) => ({ value: key, label: val.label, color: val.color })),
    []
  );

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const set = (field: keyof EventFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const tagChips = form.tags
    ? form.tags.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-fg-default">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg-default"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <Input
            label="Title *"
            placeholder="What happened?"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            error={errors.title}
          />

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe this event..."
              rows={3}
              className="peer w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default placeholder:text-fg-subtle transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 active:border-accent/70"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                Category
              </label>
              <select
                value={form.event_type}
                onChange={(e) => set("event_type", e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                Date
              </label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => set("event_date", e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
              >
                {EVENT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(e) => set("visibility", e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Input
              label="Tags"
              placeholder="comma, separated, tags"
              hint="Separate tags with commas"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
            {tagChips.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tagChips.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-bg-hover px-2 py-0.5 font-mono text-[11px] text-fg-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Delete Confirmation Modal ───────────────────────────────

function DeleteConfirmModal({
  title, deleting, onConfirm, onClose,
}: {
  title: string;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl"
      >
        <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle size={24} className="text-danger" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-fg-default">Delete Event</h2>
            <p className="mt-1 text-xs text-fg-muted">
              Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" loading={deleting} onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
