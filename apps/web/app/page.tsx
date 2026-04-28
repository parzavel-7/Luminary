"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  Sparkles,
  History,
  BarChart3,
  ChevronRight,
  LayoutGrid,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [url, setUrl] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/scan?url=${encodeURIComponent(url)}`);
    }
  };

  const recentScans = [
    { name: "apple.com", score: 94, status: "Complete", date: "2 mins ago" },
    { name: "github.com", score: 88, status: "Complete", date: "1 hour ago" },
    {
      name: "stripe.com",
      score: 76,
      status: "Action Required",
      date: "3 hours ago",
    },
  ];

  const features = [
    {
      title: "Deep Crawling",
      desc: "Full browser rendering to detect dynamic traps.",
      icon: <Search className="h-6 w-6" />,
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "AI Generated",
      desc: "Instant code fixes for every violation.",
      icon: <Sparkles className="h-6 w-6" />,
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "Global Standards",
      desc: "WCAG 2.2 and ADA compliance automated.",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-green-500/10 text-green-600"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#e3e2c3] text-[#1a1a1a] selection:bg-primary/20 overflow-x-hidden font-poppins font-light">
      {/* Dynamic Floating Navbar */}
      <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
        <header className="px-10 h-16 w-full max-w-5xl flex items-center justify-between glass-3d-nav pointer-events-auto">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 flex items-center justify-center overflow-hidden transition-transform duration-1000 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Luminary Logo"
                width={120}
                height={120}
                className="scale-[2.8] object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-gradient">
              Luminary
            </span>
          </Link>
          <nav className="hidden md:flex gap-12">
            <Link
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 hover:text-black transition-all"
              href="#features"
            >
              Features
            </Link>
            {user && (
              <Link
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 hover:text-black transition-all"
                href="#history"
              >
                History
              </Link>
            )}
            <Link
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 hover:text-black transition-all"
              href="#"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-8">
            {user ? (
              <Link
                href="/dashboard"
                className="glass-3d-button px-8 py-2 text-[10px] font-bold uppercase tracking-widest !rounded-full"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 hover:text-black transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="glass-3d-button px-8 py-3 text-[10px] font-bold uppercase tracking-widest !rounded-full shadow-2xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <main className="flex-1 flex flex-col pt-32 pb-40">
        {/* Hero Section */}
        <section className="w-full relative min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="container max-w-5xl space-y-16">
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white mb-4 shadow-xl"
              >
                <Sparkles className="h-4 w-4 text-black/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/60">
                  Neural Accessibility Audit System
                </span>
              </motion.div>

              <h1 className="text-6xl tracking-tighter sm:text-7xl md:text-8xl animate-popup leading-[1.0] font-light">
                Making the <br />
                <span className="text-gradient font-semibold animate-gradient">
                  invisible visible.
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-muted-foreground md:text-xl font-light leading-relaxed opacity-80">
                Analyze any website, identify violations, and receive
                production-ready code fixes in seconds.
              </p>
            </div>

            {/* URL Box: HIGH VISIBILITY STYLE */}
            <div className="w-full max-w-2xl mx-auto animate-popup delay-500">
              <form
                onSubmit={handleScan}
                className="url-box-container flex items-center gap-3"
              >
                <div className="flex-1 url-box-input-wrapper">
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 font-medium"
                    placeholder="Enter website URL..."
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="glass-3d-button h-16 px-12 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-4 !rounded-full shadow-2xl"
                >
                  Scan Now
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Features as Liquid Glass Containers (Pill Style) */}
        <section id="features" className="w-full py-20 flex justify-center px-6">
          <div className="container max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 1.5 }}
                className="url-box-container !p-3 group hover:scale-[1.02] transition-all duration-700"
              >
                <div className="bg-white/90 rounded-[2.5rem] p-8 h-full flex flex-col gap-6 shadow-xl border border-black/[0.03]">
                  <div className={`p-5 rounded-3xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-700 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* History Preview Section */}
        {user && (
          <section id="history" className="w-full py-32 flex justify-center">
            <div className="container px-4 max-w-5xl space-y-16">
              <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-black/20">
                    <History className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      SAVED OPERATIONS
                    </span>
                  </div>
                  <h2 className="text-5xl tracking-tighter font-light uppercase">
                    Audit Log
                  </h2>
                </div>
                <Link
                  href="/dashboard"
                  className="text-[11px] font-bold uppercase tracking-widest text-black hover:underline decoration-2 underline-offset-8"
                >
                  ARCHIVE
                </Link>
              </div>

              <div className="grid gap-6">
                {recentScans.map((scan, i) => (
                  <motion.div
                    key={scan.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="glass-3d-panel !p-8 flex flex-col md:flex-row items-center justify-between hover:bg-white transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-24 bg-black/5 rounded-2xl flex items-center justify-center font-bold text-[10px] text-black/20 uppercase">
                        {scan.name.split(".")[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold tracking-tight">
                          {scan.name}
                        </h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
                          {scan.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-1">
                          SCORE
                        </p>
                        <p
                          className={`text-2xl font-bold ${scan.score >= 90 ? "text-green-600" : "text-primary"}`}
                        >
                          {scan.score}%
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-black/10" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="py-12 border-t border-black/5">
        <div className="container px-6 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="scale-[2.5]"
              />
            </div>
            <div className="font-bold text-xl tracking-tight text-gradient">
              Luminary
            </div>
          </div>
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Link href="#" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              API
            </Link>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
            © {new Date().getFullYear()} Luminary
          </div>
        </div>
      </footer>
    </div>
  );
}
