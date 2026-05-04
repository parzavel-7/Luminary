"use client";

import { motion } from "framer-motion";

interface UsageIndicatorProps {
  current: number;
  limit: number;
  label: string;
}

export default function UsageIndicator({ current, limit, label }: UsageIndicatorProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage > 80;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{current}</span>
            <span className="text-sm text-muted-foreground">/ {limit}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isNearLimit ? 'text-red-500' : 'text-muted-foreground/40'}`}>
          {percentage.toFixed(0)}% Used
        </span>
      </div>
      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden relative shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${
            isNearLimit 
              ? 'from-red-500 to-orange-400' 
              : 'from-[#3b83f5] to-[#2ecac5]'
          }`}
        />
      </div>
      {isNearLimit && (
        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
          Approaching usage limit. Upgrade to maintain access.
        </p>
      )}
    </div>
  );
}
