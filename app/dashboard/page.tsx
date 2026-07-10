"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Activity,
  FileText,
  MessageCircle,
  ListChecks,
  Goal,
  BrainCircuit,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/useDashboard";
import { Widget } from "@/components/dashboard/Widget";
import { StatCard } from "@/components/dashboard/StatCard";
import { CareerScore } from "@/components/dashboard/CareerScore";
import { ApplicationFunnel } from "@/components/dashboard/ApplicationFunnel";
import { ResumeHealth } from "@/components/dashboard/ResumeHealth";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SkillProgress } from "@/components/dashboard/SkillProgress";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ActionCenter } from "@/app/career/components/ActionCenter";
import { GoalTracker } from "@/app/career/components/GoalTracker";
import { AIInsightCard } from "@/app/career/components/AIInsightCard";
import { SkillGraph } from "@/app/career/components/SkillGraph";
import { CareerScoreCard } from "@/app/career/components/CareerScoreCard";
import {
  getActionPlan, getGoals, getSkillGraph, getCareerScore, getRecommendations,
} from "@/app/career/api";
import type { ActionPlanItem, CareerGoalData, CareerScoreResult, RecommendationData } from "@/app/career/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error, careerScore } = useDashboard();
  const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>([]);
  const [goals, setGoals] = useState<CareerGoalData[]>([]);
  const [skillCategories, setSkillCategories] = useState<{ name: string; skills: { name: string; level: number }[] }[]>([]);
  const [careerScoreData, setCareerScoreData] = useState<CareerScoreResult | null>(null);
  const [aiInsights, setAiInsights] = useState<RecommendationData[]>([]);
  const [careerLoading, setCareerLoading] = useState(true);

  useEffect(() => {
    if (!data) return;
    Promise.allSettled([
      getActionPlan(),
      getGoals(),
      getSkillGraph(),
      getCareerScore(),
      getRecommendations(),
    ]).then(([ap, g, sg, cs, ri]) => {
      if (ap.status === "fulfilled") setActionPlan(ap.value.action_plan || []);
      if (g.status === "fulfilled") setGoals(g.value.goals || []);
      if (sg.status === "fulfilled") setSkillCategories(sg.value.categories || []);
      if (cs.status === "fulfilled") setCareerScoreData(cs.value);
      if (ri.status === "fulfilled") setAiInsights((ri.value.recommendations || []).slice(0, 3));
    }).finally(() => setCareerLoading(false));
  }, [data]);

  useEffect(() => {
    if (error && error.toLowerCase().includes("unauthorized")) {
      router.push("/login");
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-bg-hover" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-danger/20 bg-danger-subtle">
            <Award size={20} className="text-danger" />
          </div>
          <p className="font-medium text-fg-default">Failed to load dashboard</p>
          <p className="mt-1 text-sm text-fg-muted">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalInPipeline = (data.jobs_by_status.applied || 0) +
    (data.jobs_by_status.oa || 0) +
    (data.jobs_by_status.interview || 0);

  const hasProfileSkills = data.resume_skills && data.resume_skills.length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto max-w-6xl space-y-6 p-6"
    >
      <motion.div variants={fadeUp}>
        <CareerScore score={careerScore} name={data.name} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active applications"
          value={data.active_applications}
          icon={<Briefcase size={18} />}
          sublabel={`${totalInPipeline} in pipeline`}
        />
        <StatCard
          label="Total applied"
          value={data.total_applications}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Interviews"
          value={data.jobs_by_status.interview || 0}
          icon={<Target size={18} />}
        />
        <StatCard
          label="Offers"
          value={data.offers}
          icon={<Award size={18} />}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="space-y-4 lg:col-span-2">
          <Widget title="Application Pipeline" icon={<BarChart3 size={14} />}>
            <ApplicationFunnel jobsByStatus={data.jobs_by_status} totalJobs={data.total_applications} />
          </Widget>

          <Widget title="Quick Actions" icon={<Activity size={14} />}>
            <QuickActions hasResume={data.has_resume} totalApplications={data.total_applications} />
          </Widget>

          <Widget title="Recent Activity" icon={<Activity size={14} />}>
            <RecentActivity activities={data.recent_activity} />
          </Widget>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <Widget title="Resume Health" icon={<FileText size={14} />}>
            <ResumeHealth
              hasResume={data.has_resume}
              hasSummary={data.resume_summary_set}
              hasSkills={hasProfileSkills}
              hasExperience={data.has_resume}
            />
          </Widget>

          <Widget title="Upcoming Deadlines" icon={<Briefcase size={14} />}>
            <UpcomingDeadlines deadlines={data.upcoming_deadlines} />
          </Widget>

          <Widget title="Skills" icon={<Award size={14} />}>
            <SkillProgress skills={data.resume_skills} />
          </Widget>

          {data.last_coach_message && (
            <Widget title="Latest Coach Note" icon={<MessageCircle size={14} />} glow="accent">
              <p className="text-sm leading-relaxed text-fg-default line-clamp-3">
                {data.last_coach_message}
              </p>
              <Link
                href="/coach"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Continue conversation
              </Link>
            </Widget>
          )}
        </motion.div>
      </div>

      {/* Career OS Widgets */}
      <motion.div variants={fadeUp} className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <BrainCircuit size={16} className="text-accent" />
          <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">Career Intelligence</h2>
        </div>

        {careerLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {careerScoreData && (
              <Widget title="Career Score" icon={<Award size={14} />}>
                <CareerScoreCard score={careerScoreData} />
              </Widget>
            )}

            {actionPlan.length > 0 && (
              <Widget title="Action Center" icon={<ListChecks size={14} />}>
                <ActionCenter items={actionPlan} loading={false} compact />
              </Widget>
            )}

            {skillCategories.length > 0 && (
              <Widget title="Skill Graph" icon={<TrendingUp size={14} />}>
                <SkillGraph categories={skillCategories} loading={false} compact />
              </Widget>
            )}

            {goals.length > 0 && (
              <Widget title="Goals" icon={<Goal size={14} />}>
                <GoalTracker goals={goals} loading={false} compact />
              </Widget>
            )}
          </div>
        )}

        {aiInsights.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AIInsightCard insights={aiInsights.map((r) => r.title)} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
