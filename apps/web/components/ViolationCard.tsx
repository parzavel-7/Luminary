"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, Code2, Lightbulb, Zap, Copy } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import RemediationWorkspace from "./RemediationWorkspace";

interface ViolationCardProps {
  violation: any;
  index: number;
}

export function ViolationCard({ violation, index }: ViolationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical": return "text-red-600 bg-red-500/5 border-red-500/10";
      case "serious": return "text-orange-600 bg-orange-500/5 border-orange-500/10";
      default: return "text-primary bg-primary/5 border-primary/10";
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-3d-panel border-white/60 overflow-hidden hover:shadow-2xl transition-all duration-700 group shadow-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-10 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-8">
          <div className={`p-4 rounded-[1.5rem] border ${getImpactColor(violation.impact)} group-hover:scale-110 transition-transform duration-500`}>
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">{violation.help}</h4>
            <div className="flex items-center gap-4 mt-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${getImpactColor(violation.impact)}`}>
                {violation.impact}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/20">{violation.id}</span>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-2xl bg-black/5 text-black/20 transition-all duration-500 ${isOpen ? "rotate-180 bg-black text-white" : "group-hover:bg-black/10 group-hover:text-black"}`}>
          <ChevronDown className="h-6 w-6" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-12 pt-0 space-y-12 border-t border-black/[0.02] bg-white/20">
              <div className="grid md:grid-cols-2 gap-12 pt-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-black/40">
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Violation Logic</span>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed font-light">
                    {violation.ai_explanation || violation.description}
                  </p>
                  
                  <button 
                    onClick={() => setIsWorkspaceOpen(true)}
                    className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-xl shadow-black/10 mt-6"
                  >
                    <Zap className="h-4 w-4 text-yellow-400" /> Fix in Workspace
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-black/40">
                    <Zap className="h-5 w-5" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em]">AI Recovery Code</span>
                  </div>
                  <div className="relative group/code">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#3b83f5] to-[#2ecac5] opacity-0 group-hover/code:opacity-20 blur-2xl transition-opacity duration-700"></div>
                    <div className="absolute top-4 right-4 z-10">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(violation.ai_fix || "");
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all shadow-xl backdrop-blur-md"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <pre className="relative p-8 bg-[#0e0e0f] border border-white/10 rounded-3xl overflow-x-auto text-sm font-mono shadow-2xl">
                      <code className="text-[#3b83f5]">{violation.ai_fix || "// Reference element attributes below"}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {violation.nodes && violation.nodes.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-black/40">
                    <Code2 className="h-5 w-5" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Target Elements</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {violation.nodes.map((node: any, i: number) => (
                      <code key={i} className="px-4 py-2 bg-black/[0.03] border border-black/5 rounded-xl text-xs font-mono text-black/60 shadow-sm">
                        {node.target[0]}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>

    {/* Render workspace as a portal so it overlays the full page */}
    {typeof window !== 'undefined' && isWorkspaceOpen && createPortal(
      <RemediationWorkspace 
        isOpen={isWorkspaceOpen} 
        onClose={() => setIsWorkspaceOpen(false)} 
        violation={violation} 
      />,
      document.body
    )}
    </>
  );
}
