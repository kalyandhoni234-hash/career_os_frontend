"use client";

import { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake, Plus, Loader2, Users, Building2,
  Mail, Phone, Calendar, Clock, MessageSquare, X,
  ChevronDown, ArrowRight, Bell, ExternalLink, Filter,
  Search, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  listContacts, createContact, deleteContact, logInteraction,
  getNetworkingHealth, getDueFollowUps,
  type Contact, type NetworkingHealth,
} from "./api";

const relationshipColors: Record<string, string> = {
  recruiter: "bg-accent/10 text-accent",
  hiring_manager: "bg-warning/10 text-warning",
  referral: "bg-success/10 text-success",
  alumni: "bg-accent/10 text-accent",
  mentor: "bg-warning/10 text-warning",
  friend: "bg-accent/10 text-accent",
  linkedin_connection: "bg-border text-fg-muted",
  colleague: "bg-accent/10 text-accent",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [health, setHealth] = useState<NetworkingHealth | null>(null);
  const [followUps, setFollowUps] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", role: "", company: "", relationship: "contact", linkedin_url: "", notes: "" });
  const [loggingInteraction, setLoggingInteraction] = useState<number | null>(null);
  const [interactionForm, setInteractionForm] = useState({ interaction_type: "note", notes: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [c, h, f] = await Promise.all([
        listContacts(),
        getNetworkingHealth().catch(() => null),
        getDueFollowUps().catch(() => ({ follow_ups: [] })),
      ]);
      setContacts(c.contacts || []);
      setHealth(h?.health || null);
      setFollowUps(f.follow_ups || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { startTransition(() => { load(); }); }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      await createContact(form);
      setForm({ name: "", role: "", company: "", relationship: "contact", linkedin_url: "", notes: "" });
      setShowForm(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLogInteraction = async (contactId: number) => {
    if (!interactionForm.interaction_type) return;
    try {
      await logInteraction(contactId, interactionForm);
      setInteractionForm({ interaction_type: "note", notes: "" });
      setLoggingInteraction(null);
      load();
    } catch {}
  };

  const filtered = search.trim()
    ? contacts.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const hasFollowUps = followUps.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <HeartHandshake size={20} className="text-accent" /> Network CRM
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            {health ? `${health.total_contacts} contacts · ${health.health_score}% health score` : "Your professional network"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => load()}>
            <Sparkles size={13} /> Refresh
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancel" : "Add Contact"}
          </Button>
        </div>
      </div>

      {/* Health + Follow-ups bar */}
      <div className="flex items-stretch gap-3">
        {health && (
          <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-mono ${
              health.health_score >= 70 ? "bg-success/10 text-success" :
              health.health_score >= 40 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
            }`}>
              {health.health_score}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Network Health</p>
              <p className="text-[10px] text-fg-muted">
                {health.active_contacts} active · {health.contacted_recently} contacted recently · {health.relationship_diversity} relationship types
              </p>
              <div className="w-full h-1.5 rounded-full bg-border mt-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${health.health_score}%` }} />
              </div>
            </div>
          </div>
        )}
        {hasFollowUps && (
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 flex items-center gap-3 min-w-[200px]">
            <Bell size={18} className="text-warning shrink-0" />
            <div>
              <p className="text-xs font-semibold text-warning">Follow-ups Due</p>
              <p className="text-[10px] text-fg-muted">{followUps.length} contact{followUps.length > 1 ? "s" : ""} need attention</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts by name, company, or role..."
          className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-fg-subtle" />
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border border-border rounded-xl p-5 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
              <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
              <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm">
                <option value="contact">Contact</option>
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="referral">Referral</option>
                <option value="alumni">Alumni</option>
                <option value="mentor">Mentor</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="linkedin_connection">LinkedIn Connection</option>
              </select>
              <input placeholder="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                className="field w-full px-3 py-2 rounded-lg border border-border bg-bg-hover text-sm" />
            </div>
            <Button onClick={handleCreate}>Save Contact</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : contacts.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-accent" />
          </div>
          <p className="text-base font-semibold">No contacts yet</p>
          <p className="text-xs text-fg-muted mt-1.5 max-w-md mx-auto">
            Build your professional network by adding recruiters, hiring managers, referrals, and mentors
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={() => setShowForm(true)}>Add Contact</Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl card-hover"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold">{c.name}</h3>
                        <p className="text-xs text-fg-muted">
                          {c.role || ""}{c.role && c.company ? " at " : ""}{c.company || ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${relationshipColors[c.relationship] || "bg-border text-fg-muted"}`}>
                          {c.relationship?.replace(/_/g, " ") || "contact"}
                        </span>
                        <button onClick={() => handleDelete(c.id)}
                          className="p-1 rounded-lg hover:bg-danger/10 text-fg-muted hover:text-danger transition-colors">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-fg-muted">
                      {c.email && <span className="flex items-center gap-1"><Mail size={9} /> {c.email}</span>}
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent hover:underline">
                          <ExternalLink size={9} /> LinkedIn
                        </a>
                      )}
                      {c.last_contacted_at && (
                        <span className="flex items-center gap-1"><Clock size={9} /> Last: {new Date(c.last_contacted_at).toLocaleDateString()}</span>
                      )}
                      {c.next_follow_up_at && (
                        <span className="flex items-center gap-1 text-warning"><Bell size={9} /> Follow-up: {new Date(c.next_follow_up_at).toLocaleDateString()}</span>
                      )}
                    </div>

                    {c.notes && (
                      <p className="text-[11px] text-fg-muted mt-2 bg-bg-hover rounded-lg px-3 py-1.5">{c.notes}</p>
                    )}

                    {/* Interaction logging */}
                    <div className="flex items-center gap-2 mt-2">
                      {loggingInteraction === c.id ? (
                        <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                          <select value={interactionForm.interaction_type} onChange={(e) => setInteractionForm({ ...interactionForm, interaction_type: e.target.value })}
                            className="field text-[10px] px-2 py-1 rounded-lg border border-border bg-bg-hover">
                            <option value="note">Note</option>
                            <option value="email">Email</option>
                            <option value="call">Call</option>
                            <option value="meeting">Meeting</option>
                            <option value="linkedin_message">LinkedIn Message</option>
                          </select>
                          <input placeholder="Notes..." value={interactionForm.notes} onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                            className="field flex-1 text-[10px] px-2 py-1 rounded-lg border border-border bg-bg-hover" />
                          <button onClick={() => handleLogInteraction(c.id)}
                            className="text-[10px] font-medium text-accent hover:text-accent/80 px-2 py-1">
                            Save
                          </button>
                          <button onClick={() => setLoggingInteraction(null)}
                            className="text-[10px] text-fg-muted px-1">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setLoggingInteraction(c.id); }}
                          className="text-[10px] font-medium text-accent hover:text-accent/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-accent/5 transition-colors">
                          <MessageSquare size={9} /> Log Interaction
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
