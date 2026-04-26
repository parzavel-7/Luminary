"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code, Info, Sparkles } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";

interface ViolationCardProps {
  violation: any;
  index: number;
}

export function ViolationCard({ violation, index }: ViolationCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="glass-3d-panel overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <SeverityBadge severity={violation.impact} />
          <div>
            <h4 className="font-bold text-sm md:text-base">{violation.help}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{violation.description}</p>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-white/10 space-y-6 mt-4">
              {/* AI Explanation Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#2ecac5]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Analysis</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#2ecac5]/5 border border-[#2ecac5]/20">
                  <p className="text-sm leading-relaxed">
                    {violation.aiExplanation || "Analysis pending..."}
                  </p>
                </div>
              </div>

              {/* Code Fix Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#3b83f5]">
                  <Code className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Suggested Fix</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950/80 font-mono text-xs overflow-x-auto border border-white/10">
                  <pre className="text-zinc-300">
                    {violation.aiFix || "Fix not available."}
                  </pre>
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Rule ID</span>
                  </div>
                  <code className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 block w-fit">
                    {violation.id}
                  </code>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">WCAG Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {violation.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper to avoid duplicate cn import if not already handled
import { cn } from "../lib/utils";
