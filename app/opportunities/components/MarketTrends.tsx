"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Award, GraduationCap } from "lucide-react";
import type { MarketTrends } from "../types";

interface MarketTrendsViewProps {
  trends: MarketTrends | null;
  loading: boolean;
}

const trendIcons: Record<string, React.ReactNode> = {
  requested_skills: <Award size={14} />,
  highest_paying: <BarChart3 size={14} />,
  trending: <TrendingUp size={14} />,
  hiring_growth: <TrendingUp size={14} />,
  internship_trends: <GraduationCap size={14} />,
};

const trendLabels: Record<string, string> = {
  requested_skills: "Most Requested Skills",
  highest_paying: "Highest Paying Skills",
  trending: "Trending Technologies",
  hiring_growth: "Hiring Growth",
  internship_trends: "Internship Trends",
};

export function MarketTrendsView({ trends, loading }: MarketTrendsViewProps) {
  if (loading) {
    return (
      <div className="bg-bg-surface rounded-xl border border-border p-5">
        <div className="h-4 w-32 shimmer rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 shimmer rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!trends) return null;

  const sortedTypes = Object.keys(trends).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl border border-border p-5"
    >
      <h3 className="text-sm font-semibold mb-4">Market Intelligence</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTypes.map((type) => {
          const items = trends[type] || [];
          return (
            <div key={type}>
              <p className="text-[11px] font-medium text-fg-muted mb-2 flex items-center gap-1">
                {trendIcons[type] || <BarChart3 size={14} />}
                {trendLabels[type] || type}
              </p>
              <div className="space-y-1.5">
                {items.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-bg-raised">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium">{item.title}</span>
                      {item.category && (
                        <span className="text-[9px] text-fg-subtle px-1.5 py-0.5 rounded-full bg-bg-hover">{item.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-fg-muted">{item.value}</span>
                      {item.growth_pct != null && (
                        <span className={`text-[10px] font-mono flex items-center gap-0.5 ${item.growth_pct >= 0 ? "text-success" : "text-danger"}`}>
                          {item.growth_pct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {item.growth_pct >= 0 ? "+" : ""}{item.growth_pct}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
