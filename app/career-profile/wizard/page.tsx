"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  Star,
  Code2,
  Heart,
  Globe,
  Link2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Upload,
  GripVertical,
  X,
  AlertTriangle,
  Save,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useMutationRefresh } from "@/hooks/useMutationRefresh";
import {
  getWizardData,
  saveWizardStep,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation,
  createSkill,
  updateSkill,
  deleteSkill,
  batchInterests,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  uploadResume,
  deleteResume,
} from "@/app/career-profile/api";
import {
  CAREER_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_PREFERENCES,
  PRESET_INTERESTS,
  LANGUAGE_PROFICIENCIES,
  SKILL_LEVELS,
  SOCIAL_PLATFORMS,
} from "@/app/career-profile/types";
import type {
  WizardData,
  BasicInfo,
  Education,
  CareerInfo,
  DreamCareer,
  Skill,
  Language,
  SocialLink,
  Preferences,
} from "@/app/career-profile/types";

const STEPS = [
  { label: "Basic Info", icon: User, stepKey: "basic_info" },
  { label: "Education", icon: GraduationCap, stepKey: "education" },
  { label: "Career Info", icon: Briefcase, stepKey: "career_info" },
  { label: "Dream Career", icon: Star, stepKey: "dream_career" },
  { label: "Skills", icon: Code2, stepKey: "skills" },
  { label: "Interests", icon: Heart, stepKey: "interests" },
  { label: "Languages", icon: Globe, stepKey: "languages" },
  { label: "Social Links", icon: Link2, stepKey: "social_links" },
  { label: "Resume", icon: FileText, stepKey: "resume" },
  { label: "Preferences", icon: Settings, stepKey: "preferences" },
];

const AUTOSAVE_DELAY = 30_000;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

const defaultBasicInfo: BasicInfo = {
  first_name: "", last_name: "", email: "", phone_number: "",
  date_of_birth: null, gender: "", country: "", state: "",
  city: "", timezone: "", profile_picture: "",
};

const defaultCareerInfo: CareerInfo = {
  current_status: "", company: "", position: "", experience_years: 0, employment_type: "",
  career_stage: "student", stage_meta: {},
};

const defaultDreamCareer: DreamCareer = {
  dream_role: "", dream_company: "", preferred_industry: "",
  preferred_country: "", work_preference: "", salary_goal: "", target_joining_year: null,
};

const defaultPreferences: Preferences = {
  job_alerts: true, weekly_ai_review: true, email_notifications: true,
  public_profile: false, resume_visibility: "private", theme_preference: "system",
};

function CompletionCircle({ pct }: { pct: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="text-accent transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-fg-default">{pct}%</span>
    </div>
  );
}

export default function CareerProfileWizardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { notifyMutation } = useMutationRefresh();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [completionPct, setCompletionPct] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmNavigate, setConfirmNavigate] = useState<{ show: boolean; target: number }>({ show: false, target: 0 });
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshot = useRef<string>("");

  const [basicInfo, setBasicInfo] = useState<BasicInfo>(defaultBasicInfo);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null>(null);
  const [showEduModal, setShowEduModal] = useState(false);
  const [careerInfo, setCareerInfo] = useState<CareerInfo>(defaultCareerInfo);
  const [dreamCareer, setDreamCareer] = useState<DreamCareer>(defaultDreamCareer);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [showLangForm, setShowLangForm] = useState(false);
  const [editingLang, setEditingLang] = useState<Partial<Language>>({ language: "", proficiency: "basic" });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [resumeFiles, setResumeFiles] = useState<WizardData["resume_files"]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  const snapshotCurrentState = useCallback(() => {
    return JSON.stringify({ basicInfo, educationList, careerInfo, dreamCareer, skills, interests, languages, socialLinks, preferences });
  }, [basicInfo, educationList, careerInfo, dreamCareer, skills, interests, languages, socialLinks, preferences]);

  useEffect(() => {
    const currentSnapshot = snapshotCurrentState();
    if (lastSavedSnapshot.current && currentSnapshot !== lastSavedSnapshot.current) {
      setHasUnsavedChanges(true);
    }
  }, [snapshotCurrentState]);

  const handleSaveCurrentStep = useCallback(async (silent = false): Promise<boolean> => {
    setSaving(true);
    try {
      let result: { message: string; completion_pct: number };
      switch (currentStep) {
        case 0:
          result = await saveWizardStep("basic_info", basicInfo);
          break;
        case 2:
          result = await saveWizardStep("career_info", careerInfo);
          break;
        case 3:
          result = await saveWizardStep("dream_career", dreamCareer);
          break;
        case 9:
          result = await saveWizardStep("preferences", preferences);
          break;
        default:
          result = { message: "Saved", completion_pct: completionPct };
      }
      setCompletionPct(result.completion_pct);
      notifyMutation("profile");
      setHasUnsavedChanges(false);
      lastSavedSnapshot.current = snapshotCurrentState();
      if (!silent) addToast("success", result.message || "Step saved successfully");
      return true;
    } catch (err) {
      if (!silent) addToast("error", err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  }, [currentStep, basicInfo, careerInfo, dreamCareer, preferences, completionPct, snapshotCurrentState, addToast, notifyMutation]);

  const resetAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const autoSaveableSteps = [0, 2, 3, 9];
    if (autoSaveableSteps.includes(currentStep)) {
      autoSaveTimer.current = setTimeout(() => {
        handleSaveCurrentStep(true);
      }, AUTOSAVE_DELAY);
    }
  }, [currentStep, handleSaveCurrentStep]);

  useEffect(() => {
    resetAutoSave();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [currentStep, resetAutoSave]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges) {
        setShowLeaveWarning(true);
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    getWizardData()
      .then((data) => {
        setBasicInfo(data.basic_info ?? defaultBasicInfo);
        setEducationList(data.education ?? []);
        setCareerInfo(data.career_info ?? defaultCareerInfo);
        setDreamCareer(data.dream_career ?? defaultDreamCareer);
        setSkills(data.skills ?? []);
        setInterests((data.interests ?? []).map((i) => i.name));
        setLanguages(data.languages ?? []);
        setSocialLinks(data.social_links ?? []);
        setResumeFiles(data.resume_files ?? []);
        setPreferences(data.preferences ?? defaultPreferences);
        setCompletionPct(data.completion_pct ?? 0);
        lastSavedSnapshot.current = JSON.stringify({
          basicInfo: data.basic_info ?? defaultBasicInfo,
          educationList: data.education ?? [],
          careerInfo: data.career_info ?? defaultCareerInfo,
          dreamCareer: data.dream_career ?? defaultDreamCareer,
          skills: data.skills ?? [],
          interests: (data.interests ?? []).map((i: { name: string }) => i.name),
          languages: data.languages ?? [],
          socialLinks: data.social_links ?? [],
          preferences: data.preferences ?? defaultPreferences,
        });
      })
      .catch(() => addToast("error", "Failed to load wizard data"))
      .finally(() => setLoading(false));
  }, [addToast]);

  const markDirty = () => setHasUnsavedChanges(true);

  const goToStep = (target: number) => {
    if (target === currentStep) return;
    if (hasUnsavedChanges) {
      setConfirmNavigate({ show: true, target });
      return;
    }
    setDirection(target > currentStep ? 1 : -1);
    setCurrentStep(target);
  };

  const confirmNavigation = (save: boolean) => {
    const target = confirmNavigate.target;
    setConfirmNavigate({ show: false, target: 0 });
    if (save) {
      handleSaveCurrentStep(false).then(() => {
        setDirection(target > currentStep ? 1 : -1);
        setCurrentStep(target);
        setHasUnsavedChanges(false);
      });
    } else {
      setDirection(target > currentStep ? 1 : -1);
      setCurrentStep(target);
      setHasUnsavedChanges(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      addToast("success", "Profile wizard completed!");
      router.push("/career-profile");
      return;
    }
    if ([0, 2, 3, 9].includes(currentStep)) {
      const saved = await handleSaveCurrentStep(false);
      if (!saved) return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const addEducation = async () => {
    try {
      const created = await createEducation({
        ...editingEdu,
        order: educationList.length,
      } as Partial<Education>);
      setEducationList((prev) => [...prev, created]);
      setShowEduModal(false);
      setEditingEdu(null);
      notifyMutation("profile");
      addToast("success", "Education added");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to add education");
    }
  };

  const handleUpdateEducation = async (edu: Education) => {
    if (!edu.id) return;
    try {
      await updateEducation(edu.id, edu);
      setEducationList((prev) => prev.map((e) => (e.id === edu.id ? edu : e)));
      setShowEduModal(false);
      setEditingEdu(null);
      notifyMutation("profile");
      addToast("success", "Education updated");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update education");
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await deleteEducation(id);
      setEducationList((prev) => prev.filter((e) => e.id !== id));
      notifyMutation("profile");
      addToast("success", "Education removed");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete education");
    }
  };

  const handleReorderEducation = async (fromIdx: number, toIdx: number) => {
    const reordered = [...educationList];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((e, i) => ({ ...e, order: i }));
    setEducationList(updated);
    const orderMap: Record<string, number> = {};
    updated.forEach((e) => {
      if (e.id) orderMap[String(e.id)] = e.order;
    });
    try {
      await reorderEducation(orderMap);
      notifyMutation("profile");
    } catch {
      addToast("error", "Failed to reorder");
    }
  };

  const addSkill = async () => {
    const name = skillInput.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      addToast("warning", "Skill already added");
      return;
    }
    try {
      const created = await createSkill({ name, experience_level: "beginner", years_of_experience: 0, confidence_rating: 5 });
      setSkills((prev) => [...prev, created]);
      setSkillInput("");
      notifyMutation("profile");
      addToast("success", `Skill "${name}" added`);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to add skill");
    }
  };

  const handleUpdateSkill = async (skill: Skill) => {
    if (!skill.id) return;
    try {
      await updateSkill(skill.id, skill);
      setSkills((prev) => prev.map((s) => (s.id === skill.id ? skill : s)));
      notifyMutation("profile");
      addToast("success", "Skill updated");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update skill");
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      notifyMutation("profile");
      addToast("success", "Skill removed");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  const handleInterestsSave = async () => {
    try {
      await batchInterests(interests);
      notifyMutation("profile");
      addToast("success", "Interests saved");
      setHasUnsavedChanges(false);
      lastSavedSnapshot.current = snapshotCurrentState();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save interests");
    }
  };

  const addLanguage = async () => {
    if (!editingLang.language?.trim()) return;
    try {
      if (editingLang.id) {
        await updateLanguage(editingLang.id, editingLang as Language);
        setLanguages((prev) => prev.map((l) => (l.id === editingLang.id ? (editingLang as Language) : l)));
      } else {
        const created = await createLanguage(editingLang);
        setLanguages((prev) => [...prev, created]);
      }
      setShowLangForm(false);
      setEditingLang({ language: "", proficiency: "basic" });
      notifyMutation("profile");
      addToast("success", "Language saved");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save language");
    }
  };

  const handleDeleteLanguage = async (id: number) => {
    try {
      await deleteLanguage(id);
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      notifyMutation("profile");
      addToast("success", "Language removed");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete language");
    }
  };

  const saveSocialLink = async (platform: string, url: string) => {
    const existing = socialLinks.find((l) => l.platform === platform);
    if (!url.trim()) {
      if (existing?.id) {
        try {
          await deleteSocialLink(existing.id);
          setSocialLinks((prev) => prev.filter((l) => l.platform !== platform));
          notifyMutation("profile");
          addToast("success", `${platform} link removed`);
        } catch (err) {
          addToast("error", err instanceof Error ? err.message : "Failed");
        }
      }
      return;
    }
    try {
      if (existing?.id) {
        await updateSocialLink(existing.id, { platform, url });
        setSocialLinks((prev) => prev.map((l) => (l.id === existing.id ? { ...l, url } : l)));
      } else {
        const created = await createSocialLink({ platform, url });
        setSocialLinks((prev) => [...prev, created]);
      }
      notifyMutation("profile");
      addToast("success", `${platform} link saved`);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save link");
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    setUploadProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 200);
      const uploaded = await uploadResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setResumeFiles((prev) => [...prev, uploaded]);
      notifyMutation("profile");
      addToast("success", "Resume uploaded");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingResume(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDeleteResume = async (id: number) => {
    try {
      await deleteResume(id);
      setResumeFiles((prev) => prev.filter((f) => f.id !== id));
      notifyMutation("profile");
      addToast("success", "Resume deleted");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete resume");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" value={basicInfo.first_name} placeholder="John"
                onChange={(e) => { setBasicInfo({ ...basicInfo, first_name: e.target.value }); markDirty(); }} />
              <Input label="Last Name" value={basicInfo.last_name} placeholder="Doe"
                onChange={(e) => { setBasicInfo({ ...basicInfo, last_name: e.target.value }); markDirty(); }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" value={basicInfo.email} icon={<User size={14} />} placeholder="john@example.com"
                onChange={(e) => { setBasicInfo({ ...basicInfo, email: e.target.value }); markDirty(); }} />
              <Input label="Phone" type="tel" value={basicInfo.phone_number} placeholder="+1 234 567 890"
                onChange={(e) => { setBasicInfo({ ...basicInfo, phone_number: e.target.value }); markDirty(); }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Date of Birth" type="date" value={basicInfo.date_of_birth ?? ""}
                onChange={(e) => { setBasicInfo({ ...basicInfo, date_of_birth: e.target.value || null }); markDirty(); }} />
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Gender</label>
                <select
                  value={basicInfo.gender}
                  onChange={(e) => { setBasicInfo({ ...basicInfo, gender: e.target.value }); markDirty(); }}
                  className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Country" value={basicInfo.country} placeholder="India"
                onChange={(e) => { setBasicInfo({ ...basicInfo, country: e.target.value }); markDirty(); }} />
              <Input label="State" value={basicInfo.state} placeholder="Karnataka"
                onChange={(e) => { setBasicInfo({ ...basicInfo, state: e.target.value }); markDirty(); }} />
              <Input label="City" value={basicInfo.city} placeholder="Bangalore"
                onChange={(e) => { setBasicInfo({ ...basicInfo, city: e.target.value }); markDirty(); }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Timezone" value={basicInfo.timezone} placeholder="Asia/Kolkata"
                onChange={(e) => { setBasicInfo({ ...basicInfo, timezone: e.target.value }); markDirty(); }} />
              <Input label="Profile Picture URL" value={basicInfo.profile_picture} placeholder="https://..."
                onChange={(e) => { setBasicInfo({ ...basicInfo, profile_picture: e.target.value }); markDirty(); }} />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {educationList.length > 0 && (
              <div className="space-y-3">
                {educationList.map((edu, idx) => (
                  <Card key={edu.id ?? idx} className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {educationList.length > 1 && (
                          <div className="flex flex-col gap-0.5 pt-1">
                            {idx > 0 && (
                              <button onClick={() => handleReorderEducation(idx, idx - 1)} className="text-fg-subtle hover:text-fg-default">
                                <GripVertical size={14} />
                              </button>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-fg-default">{edu.institution || "Untitled Institution"}</p>
                          <p className="text-xs text-fg-muted">
                            {[edu.degree, edu.branch].filter(Boolean).join(" — ")}
                            {edu.graduation_year ? ` • ${edu.graduation_year}` : ""}
                          </p>
                          {edu.cgpa != null && (
                            <p className="mt-1 text-xs text-fg-subtle">CGPA: {edu.cgpa}</p>
                          )}
                          {edu.relevant_coursework?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {edu.relevant_coursework.map((c) => (
                                <Badge key={c} tone="accent">{c}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingEdu(edu); setShowEduModal(true); }}>Edit</Button>
                        {edu.id && (
                          <Button size="sm" variant="ghost" icon={<Trash2 size={14} />}
                            onClick={() => handleDeleteEducation(edu.id!)} className="text-danger hover:text-danger" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <Button variant="secondary" icon={<Plus size={16} />}
              onClick={() => { setEditingEdu({ institution: "", degree: "", branch: "", specialization: "", graduation_year: null, current_semester: null, cgpa: null, relevant_coursework: [], achievements: "" }); setShowEduModal(true); }}>
              Add Education
            </Button>
            {showEduModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <Card className="w-full max-w-lg space-y-4 p-6">
                  <h3 className="text-lg font-semibold text-fg-default">{editingEdu?.id ? "Edit Education" : "Add Education"}</h3>
                  <div className="space-y-3">
                    <Input label="Institution" value={editingEdu?.institution ?? ""} placeholder="MIT"
                      onChange={(e) => setEditingEdu((p) => ({ ...p, institution: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Degree" value={editingEdu?.degree ?? ""} placeholder="B.Tech"
                        onChange={(e) => setEditingEdu((p) => ({ ...p, degree: e.target.value }))} />
                      <Input label="Branch" value={editingEdu?.branch ?? ""} placeholder="Computer Science"
                        onChange={(e) => setEditingEdu((p) => ({ ...p, branch: e.target.value }))} />
                    </div>
                    <Input label="Specialization" value={editingEdu?.specialization ?? ""} placeholder="AI/ML"
                      onChange={(e) => setEditingEdu((p) => ({ ...p, specialization: e.target.value }))} />
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="Graduation Year" type="number" value={editingEdu?.graduation_year ?? ""}
                        onChange={(e) => setEditingEdu((p) => ({ ...p, graduation_year: e.target.value ? Number(e.target.value) : null }))} />
                      <Input label="Current Semester" type="number" value={editingEdu?.current_semester ?? ""}
                        onChange={(e) => setEditingEdu((p) => ({ ...p, current_semester: e.target.value ? Number(e.target.value) : null }))} />
                      <Input label="CGPA" type="number" step="0.01" value={editingEdu?.cgpa ?? ""}
                        onChange={(e) => setEditingEdu((p) => ({ ...p, cgpa: e.target.value ? Number(e.target.value) : null }))} />
                    </div>
                    <Input label="Relevant Coursework (comma-separated)" value={editingEdu?.relevant_coursework?.join(", ") ?? ""}
                      placeholder="DSA, OS, DBMS"
                      onChange={(e) => setEditingEdu((p) => ({ ...p, relevant_coursework: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} />
                    <div className="space-y-1.5">
                      <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Achievements</label>
                      <textarea
                        value={editingEdu?.achievements ?? ""}
                        onChange={(e) => setEditingEdu((p) => ({ ...p, achievements: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50 resize-none"
                        placeholder="Dean's list, scholarships..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => { setShowEduModal(false); setEditingEdu(null); }}>Cancel</Button>
                    <Button onClick={() => {
                      if (editingEdu?.id) handleUpdateEducation(editingEdu as Education);
                      else addEducation();
                    }}>{editingEdu?.id ? "Update" : "Add"}</Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Current Status</label>
              <select
                value={careerInfo.current_status}
                onChange={(e) => { setCareerInfo({ ...careerInfo, current_status: e.target.value }); markDirty(); }}
                className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
              >
                <option value="">Select status</option>
                {CAREER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Company" value={careerInfo.company} placeholder="Google"
                onChange={(e) => { setCareerInfo({ ...careerInfo, company: e.target.value }); markDirty(); }} />
              <Input label="Position" value={careerInfo.position} placeholder="Software Engineer"
                onChange={(e) => { setCareerInfo({ ...careerInfo, position: e.target.value }); markDirty(); }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Years of Experience" type="number" value={careerInfo.experience_years || ""}
                onChange={(e) => { setCareerInfo({ ...careerInfo, experience_years: Number(e.target.value) || 0 }); markDirty(); }} />
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Employment Type</label>
                <select
                  value={careerInfo.employment_type}
                  onChange={(e) => { setCareerInfo({ ...careerInfo, employment_type: e.target.value }); markDirty(); }}
                  className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50"
                >
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Dream Role" value={dreamCareer.dream_role} placeholder="Staff Engineer"
                onChange={(e) => { setDreamCareer({ ...dreamCareer, dream_role: e.target.value }); markDirty(); }} />
              <Input label="Dream Company" value={dreamCareer.dream_company} placeholder="Google"
                onChange={(e) => { setDreamCareer({ ...dreamCareer, dream_company: e.target.value }); markDirty(); }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Preferred Industry" value={dreamCareer.preferred_industry} placeholder="Technology"
                onChange={(e) => { setDreamCareer({ ...dreamCareer, preferred_industry: e.target.value }); markDirty(); }} />
              <Input label="Preferred Country" value={dreamCareer.preferred_country} placeholder="United States"
                onChange={(e) => { setDreamCareer({ ...dreamCareer, preferred_country: e.target.value }); markDirty(); }} />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Work Preference</label>
              <div className="flex flex-wrap gap-2">
                {WORK_PREFERENCES.map((wp) => (
                  <button
                    key={wp}
                    onClick={() => { setDreamCareer({ ...dreamCareer, work_preference: dreamCareer.work_preference === wp ? "" : wp }); markDirty(); }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      dreamCareer.work_preference === wp
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-bg-surface text-fg-muted hover:border-accent/40 hover:text-fg-default"
                    }`}
                  >
                    {wp}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Salary Goal" value={dreamCareer.salary_goal} placeholder="$120,000"
                onChange={(e) => { setDreamCareer({ ...dreamCareer, salary_goal: e.target.value }); markDirty(); }} />
              <Input label="Target Joining Year" type="number" value={dreamCareer.target_joining_year ?? ""}
                placeholder="2026"
                onChange={(e) => { setDreamCareer({ ...dreamCareer, target_joining_year: e.target.value ? Number(e.target.value) : null }); markDirty(); }} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Input label="Skill name" value={skillInput} placeholder="Type a skill and press Enter" className="flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                onChange={(e) => setSkillInput(e.target.value)} />
              <Button icon={<Plus size={16} />} onClick={addSkill} className="mt-0.5">Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="space-y-3">
                {skills.map((skill) => (
                  <Card key={skill.id ?? skill.name} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-fg-default">{skill.name}</p>
                      </div>
                      <button onClick={() => skill.id && handleDeleteSkill(skill.id)}
                        className="text-fg-subtle hover:text-danger transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Level</label>
                        <select value={skill.experience_level}
                          onChange={(e) => { const updated = { ...skill, experience_level: e.target.value }; setSkills((prev) => prev.map((s) => s.id === skill.id ? updated : s)); if (skill.id) handleUpdateSkill(updated); }}
                          className="w-full rounded-lg border border-border bg-bg-surface px-2 py-1.5 text-xs text-fg-default focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent-ring/50">
                          {SKILL_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Years</label>
                        <input type="number" value={skill.years_of_experience}
                          onChange={(e) => { const updated = { ...skill, years_of_experience: Number(e.target.value) || 0 }; setSkills((prev) => prev.map((s) => s.id === skill.id ? updated : s)); if (skill.id) handleUpdateSkill(updated); }}
                          className="w-full rounded-lg border border-border bg-bg-surface px-2 py-1.5 text-xs text-fg-default focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent-ring/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-fg-muted">Confidence ({skill.confidence_rating}/10)</label>
                        <input type="range" min={1} max={10} value={skill.confidence_rating}
                          onChange={(e) => { const updated = { ...skill, confidence_rating: Number(e.target.value) }; setSkills((prev) => prev.map((s) => s.id === skill.id ? updated : s)); if (skill.id) handleUpdateSkill(updated); }}
                          className="w-full accent-accent" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {skills.length === 0 && (
              <p className="text-center text-sm text-fg-subtle py-6">No skills added yet. Type above to get started.</p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <p className="text-sm text-fg-muted">Select your interests from the presets or type a custom one.</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_INTERESTS.map((preset) => {
                const selected = interests.includes(preset);
                return (
                  <button
                    key={preset}
                    onClick={() => {
                      setInterests((prev) => selected ? prev.filter((i) => i !== preset) : [...prev, preset]);
                      markDirty();
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                      selected
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-bg-surface text-fg-muted hover:border-accent/40 hover:text-fg-default"
                    }`}
                  >
                    {selected && <Check size={10} className="mr-1 inline" />}
                    {preset}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Input label="Interest" value={interestInput} placeholder="Add a custom interest" className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = interestInput.trim();
                    if (val && !interests.includes(val)) {
                      setInterests((prev) => [...prev, val]);
                      setInterestInput("");
                      markDirty();
                    }
                  }
                }}
                onChange={(e) => setInterestInput(e.target.value)} />
              <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => {
                const val = interestInput.trim();
                if (val && !interests.includes(val)) {
                  setInterests((prev) => [...prev, val]);
                  setInterestInput("");
                  markDirty();
                }
              }}>Add</Button>
            </div>
            {interests.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Your Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((interest) => (
                    <Badge key={interest} tone="accent" onClick={() => {
                      setInterests((prev) => prev.filter((i) => i !== interest));
                      markDirty();
                    }}>
                      {interest} <X size={10} className="ml-1 inline" />
                    </Badge>
                  ))}
                </div>
                <Button size="sm" variant="secondary" icon={<Save size={14} />} onClick={handleInterestsSave} className="mt-2">
                  Save Interests
                </Button>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            {languages.length > 0 && (
              <div className="space-y-2">
                {languages.map((lang) => (
                  <Card key={lang.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-fg-subtle" />
                      <div>
                        <p className="text-sm font-medium text-fg-default">{lang.language}</p>
                        <p className="text-xs text-fg-muted">{LANGUAGE_PROFICIENCIES.find((p) => p.value === lang.proficiency)?.label ?? lang.proficiency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingLang(lang); setShowLangForm(true); }}>Edit</Button>
                      {lang.id && (
                        <Button size="sm" variant="ghost" icon={<Trash2 size={14} />}
                          onClick={() => handleDeleteLanguage(lang.id!)} className="text-danger hover:text-danger" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {!showLangForm ? (
              <Button variant="secondary" icon={<Plus size={16} />}
                onClick={() => { setEditingLang({ language: "", proficiency: "basic" }); setShowLangForm(true); }}>
                Add Language
              </Button>
            ) : (
              <Card className="p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="Language" value={editingLang.language ?? ""} placeholder="English"
                    onChange={(e) => setEditingLang((p) => ({ ...p, language: e.target.value }))} />
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Proficiency</label>
                    <select value={editingLang.proficiency ?? "basic"}
                      onChange={(e) => setEditingLang((p) => ({ ...p, proficiency: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50">
                      {LANGUAGE_PROFICIENCIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowLangForm(false); setEditingLang({ language: "", proficiency: "basic" }); }}>Cancel</Button>
                  <Button size="sm" onClick={addLanguage}>{editingLang.id ? "Update" : "Add"}</Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 7:
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SOCIAL_PLATFORMS.map((platform) => {
              const existing = socialLinks.find((l) => l.platform === platform.value);
              return (
                <Input
                  key={platform.value}
                  label={platform.label}
                  value={existing?.url ?? ""}
                  placeholder={platform.placeholder}
                  icon={<Link2 size={14} />}
                  onBlur={(e) => saveSocialLink(platform.value, e.target.value)}
                  onChange={(e) => {
                    setSocialLinks((prev) => {
                      const found = prev.find((l) => l.platform === platform.value);
                      if (found) return prev.map((l) => l.platform === platform.value ? { ...l, url: e.target.value } : l);
                      return [...prev, { platform: platform.value, url: e.target.value }];
                    });
                    markDirty();
                  }}
                />
              );
            })}
          </div>
        );

      case 8:
        return (
          <div className="space-y-5">
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-accent/40">
              {uploadingResume ? (
                <div className="space-y-3">
                  <Upload size={32} className="mx-auto animate-bounce text-accent" />
                  <p className="text-sm text-fg-muted">Uploading...</p>
                  <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-bg-hover">
                    <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-fg-subtle">{uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto mb-3 text-fg-subtle" />
                  <p className="text-sm text-fg-muted">Drag and drop your resume here, or click to browse</p>
                  <p className="mt-1 text-xs text-fg-subtle">PDF or DOCX, max 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeUpload(file);
                    }}
                  />
                </>
              )}
            </div>
            {resumeFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Uploaded Resumes</p>
                {resumeFiles.map((file) => (
                  <Card key={file.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-accent" />
                      <div>
                        <p className="text-sm font-medium text-fg-default">{file.original_filename}</p>
                        <p className="text-xs text-fg-subtle">
                          {(file.file_size / 1024).toFixed(1)} KB • {file.file_type}
                          {file.uploaded_at && ` • ${new Date(file.uploaded_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteResume(file.id)} className="text-danger hover:text-danger">
                      Delete
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-5">
            <div className="space-y-4">
              {[
                { key: "job_alerts" as const, label: "Job Alerts", desc: "Receive alerts for matching job opportunities" },
                { key: "weekly_ai_review" as const, label: "Weekly AI Review", desc: "Get an AI-generated weekly profile review" },
                { key: "email_notifications" as const, label: "Email Notifications", desc: "Receive notifications via email" },
                { key: "public_profile" as const, label: "Public Profile", desc: "Make your profile visible to recruiters" },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface p-4">
                  <div>
                    <p className="text-sm font-medium text-fg-default">{toggle.label}</p>
                    <p className="text-xs text-fg-muted">{toggle.desc}</p>
                  </div>
                  <button
                    onClick={() => { setPreferences({ ...preferences, [toggle.key]: !preferences[toggle.key] }); markDirty(); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      preferences[toggle.key] ? "bg-accent" : "bg-bg-hover"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-bg-surface shadow-sm transition-transform duration-200 ${
                      preferences[toggle.key] ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Resume Visibility</label>
                <select value={preferences.resume_visibility}
                  onChange={(e) => { setPreferences({ ...preferences, resume_visibility: e.target.value }); markDirty(); }}
                  className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50">
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Theme Preference</label>
                <select value={preferences.theme_preference}
                  onChange={(e) => { setPreferences({ ...preferences, theme_preference: e.target.value }); markDirty(); }}
                  className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-fg-default focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring/50">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg-default">
              Career Profile Wizard
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              Complete your profile to unlock personalized career insights
            </p>
          </div>
          <CompletionCircle pct={completionPct} />
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-max">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <button
                  key={step.stepKey}
                  onClick={() => {
                    if (idx <= currentStep || isCompleted) goToStep(idx);
                  }}
                  disabled={idx > currentStep && !isCompleted}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isCurrent
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : isCompleted
                        ? "text-success hover:bg-bg-hover cursor-pointer"
                        : "text-fg-subtle cursor-not-allowed"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? "bg-accent text-white"
                      : isCompleted
                        ? "bg-success text-white"
                        : "bg-bg-hover text-fg-subtle"
                  }`}>
                    {isCompleted ? <Check size={10} /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="min-h-[400px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = STEPS[currentStep].icon;
                return <Icon size={18} className="text-accent" />;
              })()}
              <h2 className="text-lg font-semibold text-fg-default">{STEPS[currentStep].label}</h2>
            </div>
            <span className="font-mono text-xs text-fg-subtle">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={handlePrev} disabled={currentStep === 0}>
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 text-xs text-warning">
                <AlertTriangle size={12} /> Unsaved changes
              </span>
            )}
            <Button
              variant="primary"
              icon={saving ? <RotateCw size={16} className="animate-spin" /> : currentStep === STEPS.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
              loading={saving}
              onClick={handleNext}
            >
              {currentStep === STEPS.length - 1 ? "Complete Profile" : "Save & Continue"}
            </Button>
          </div>
        </div>
      </motion.div>

      {confirmNavigate.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm space-y-4 p-6 text-center">
            <AlertTriangle size={32} className="mx-auto text-warning" />
            <h3 className="text-lg font-semibold text-fg-default">Unsaved Changes</h3>
            <p className="text-sm text-fg-muted">You have unsaved changes on this step. What would you like to do?</p>
            <div className="flex justify-center gap-2">
              <Button variant="ghost" onClick={() => confirmNavigation(false)}>
                Discard
              </Button>
              <Button variant="primary" onClick={() => confirmNavigation(true)} loading={saving}>
                Save & Continue
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showLeaveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm space-y-4 p-6 text-center">
            <AlertTriangle size={32} className="mx-auto text-warning" />
            <h3 className="text-lg font-semibold text-fg-default">Leave Page?</h3>
            <p className="text-sm text-fg-muted">You have unsaved changes that may be lost if you navigate away.</p>
            <div className="flex justify-center gap-2">
              <Button variant="ghost" onClick={() => setShowLeaveWarning(false)}>Stay</Button>
              <Button variant="danger" onClick={() => { setShowLeaveWarning(false); setHasUnsavedChanges(false); router.back(); }}>Leave</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
