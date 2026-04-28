"use client";

import { motion } from "framer-motion";

interface ScoreChartProps {
  score: number;
}

export function ScoreChart({ score }: ScoreChartProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 90) return "#16a34a"; // green-600
    if (s >= 70) return "#3b83f5"; // primary/blue
    return "#dc2626"; // red-600
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-64 h-64 -rotate-90" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-black/[0.03]"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_15px_rgba(59,131,245,0.1)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl font-light tracking-tighter"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/20 mt-2">Compliance</span>
      </div>
    </div>
  );
}
