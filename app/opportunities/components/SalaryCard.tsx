"use client";

import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, MapPin, BarChart3, Shield } from "lucide-react";
import type { SalaryEstimate } from "../types";

interface SalaryCardProps {
  salary: SalaryEstimate;
}

export function SalaryCard({ salary }: SalaryCardProps) {
  const formatCurrency = (v: number) => {
    return `₹${(v / 100000).toFixed(1)}L`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-5"
    >
      <h3 className="text-sm font-semibold mb-4">Salary Intelligence</h3>

      <div className="text-center mb-4">
        <div className="text-2xl font-bold font-mono">
          {formatCurrency(salary.market_avg)}
        </div>
        <p className="text-[11px] text-fg-muted">Estimated Market Average</p>
      </div>

      <div className="flex justify-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs font-medium">{formatCurrency(salary.salary_min)}</p>
          <p className="text-[10px] text-fg-muted">Min</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-xs font-medium">{formatCurrency(salary.salary_max)}</p>
          <p className="text-[10px] text-fg-muted">Max</p>
        </div>
      </div>

      <div className="space-y-2">
        {salary.location_diff !== 0 && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-fg-muted">
              <MapPin size={12} /> Location Adjustment
            </span>
            <span className={salary.location_diff > 0 ? "text-success" : "text-danger"}>
              {salary.location_diff > 0 ? "+" : ""}{salary.location_diff}%
            </span>
          </div>
        )}

        {salary.experience_diff !== 0 && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-fg-muted">
              <TrendingUp size={12} /> Experience Premium
            </span>
            <span className="text-success">+{salary.experience_diff}%</span>
          </div>
        )}

        {Object.keys(salary.skill_premium).length > 0 && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-fg-muted">
              <BarChart3 size={12} /> Skill Premium
            </span>
            <span className="text-success">
              +{Math.max(...Object.values(salary.skill_premium))}%
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-fg-muted">
            <Shield size={12} /> Confidence
          </span>
          <span>{salary.confidence}%</span>
        </div>
      </div>
    </motion.div>
  );
}
