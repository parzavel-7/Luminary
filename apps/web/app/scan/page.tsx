"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Zap, BarChart3, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { ScoreChart } from "../../components/ScoreChart";
import { SeverityBadge } from "../../components/SeverityBadge";
import { ViolationCard } from "../../components/ViolationCard";

function ScanResults() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { label: "Launching Browser", icon: <Search className="h-4 w-4" /> },
    { label: "Injecting Axe-Core", icon: <ShieldCheck className="h-4 w-4" /> },
    { label: "Running Audit", icon: <Zap className="h-4 w-4" /> },
    { label: "AI Analysis", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Finalizing Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      setLoading(false);
      return;
    }

    const fetchScan = async () => {
      try {
        setLoading(true);
        
        // Progress simulation
        const stepInterval = setInterval(() => {
          setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
        }, 4000);

        const res = await fetch("http://localhost:8080/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        clearInterval(stepInterval);
        setLoadingStep(4);

        if (!res.ok) {
          throw new Error("Failed to scan website");
        }

        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchScan();
  }, [url]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3b83f5] to-[#2ecac5] opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <Loader2 className="h-16 w-16 text-[#3b83f5] animate-spin relative z-10" />
        </div>
        
        <div className="w-full max-w-md space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: i <= loadingStep ? 1 : 0.3,
                x: 0,
                scale: i === loadingStep ? 1.05 : 1
              }}
              className="flex items-center gap-4 p-4 glass-3d-panel !rounded-2xl"
            >
              <div className={`p-2 rounded-lg ${i < loadingStep ? "bg-green-500/20 text-green-500" : i === loadingStep ? "bg-[#3b83f5]/20 text-[#3b83f5]" : "bg-white/5 text-muted-foreground"}`}>
                {i < loadingStep ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              </div>
              <span className="font-medium text-sm">{step.label}</span>
              {i === loadingStep && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-[#3b83f5] animate-ping"></span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-destructive/5 backdrop-blur-3xl rounded-3xl border border-destructive/20 flex flex-col items-center text-center max-w-2xl mx-auto mt-20 animate-popup">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-2xl font-bold mb-2">Scan Failed</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/" className="glass-3d-button px-8 py-2 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="mr-2 h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tighter">Audit Report</h1>
          <p className="text-muted-foreground font-medium break-all max-w-2xl">{url}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Last Scanned</p>
          <p className="text-sm font-mono text-foreground/80">{new Date(results?.timestamp).toLocaleString()}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass-3d-panel p-8 flex flex-col items-center justify-center min-h-[400px]"
        >
          <ScoreChart score={results.score} />
          <div className="mt-8 text-center space-y-1">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Compliance Status</p>
            <p className={`text-xl font-black ${results.score >= 90 ? "text-green-500" : results.score >= 70 ? "text-[#3b83f5]" : "text-red-500"}`}>
              {results.score >= 90 ? "Excellent" : results.score >= 70 ? "Good" : "Action Required"}
            </p>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(results.counts).map(([severity, count]: [any, any], i) => (
              <motion.div
                key={severity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-3d-panel p-6 text-center space-y-2"
              >
                <span className="text-3xl font-black">{count}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{severity}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-3d-panel p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-[#2ecac5]/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-[#2ecac5]">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-black text-xl tracking-tight">AI Insights</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                We've analyzed {results.violations.length} issues on your page. Our AI recommends focusing on 
                <span className="text-foreground font-bold"> {results.counts.critical} critical </span> 
                violations first to have the biggest impact on user experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[#3b83f5]" />
            Detailed Findings
          </h3>
          <span className="text-xs font-bold text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {results.violations.length} total issues
          </span>
        </div>
        
        <div className="grid gap-4">
          {results.violations.map((violation: any, i: number) => (
            <ViolationCard key={violation.id + i} violation={violation} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground selection:bg-[#3b83f5]/30">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-[#2ecac5] opacity-[0.03] blur-[150px] rounded-full pointer-events-none -z-10 translate-x-[-30%] translate-y-[-30%]"></div>
      <div className="absolute bottom-0 right-0 w-[1000px] h-[1000px] bg-[#3b83f5] opacity-[0.03] blur-[150px] rounded-full pointer-events-none -z-10 translate-x-[30%] translate-y-[30%]"></div>
      
      <div className="container mx-auto py-12 px-4 max-w-6xl relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-10 w-10 animate-spin text-[#3b83f5]" />
          </div>
        }>
          <ScanResults />
        </Suspense>
      </div>
    </div>
  );
}
