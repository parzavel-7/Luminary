"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

interface ScoreChartProps {
  score: number;
}

export function ScoreChart({ score }: ScoreChartProps) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const getColor = (val: number) => {
    if (val >= 90) return "#2ecac5"; // Green-ish
    if (val >= 70) return "#3b83f5"; // Blue
    if (val >= 50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="relative h-64 w-64 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            startAngle={90}
            endAngle={450}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={getColor(score)} />
            <Cell fill="rgba(255,255,255,0.1)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl font-black tracking-tighter"
        >
          {score}
        </motion.span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Health Score
        </span>
      </div>
    </div>
  );
}
