"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  ChevronRight, 
  BarChart3, 
  Activity,
  ShieldCheck,
  Download,
  ExternalLink,
  Loader2,
  User as UserIcon
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setScans([
          { id: '1', url: 'https://apple.com', score: 94, status: 'Healthy', date: 'Oct 24, 2023', critical: 0, serious: 2 },
          { id: '2', url: 'https://github.com', score: 88, status: 'Healthy', date: 'Oct 23, 2023', critical: 0, serious: 5 },
          { id: '3', url: 'https://stripe.com', score: 76, status: 'Action Required', date: 'Oct 21, 2023', critical: 2, serious: 12 },
          { id: '4', url: 'https://vercel.com', score: 92, status: 'Healthy', date: 'Oct 20, 2023', critical: 0, serious: 3 },
        ]);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e3e2c3] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3b83f5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e3e2c3] text-[#1a1a1a] flex overflow-hidden font-poppins font-light">
      {/* Sidebar */}
      <aside className="w-80 border-r border-black/5 bg-white/60 backdrop-blur-3xl p-10 flex flex-col gap-16 relative z-20 shadow-xl shadow-black/[0.02]">
        <Link href="/" className="flex items-center gap-4 group px-2">
          <div className="h-12 w-12 flex items-center justify-center transition-transform duration-1000 group-hover:scale-110">
             <Image src="/logo.png" alt="Logo" width={60} height={60} className="scale-[2.8]" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gradient">Luminary</span>
        </Link>

        <nav className="flex-1 space-y-3">
           <button className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl bg-black text-white shadow-2xl shadow-black/20 group transition-all">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Command Center</span>
           </button>
           <Link href="/profile" className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <UserIcon className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Profile</span>
           </Link>
           <button className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <History className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Audit Archive</span>
           </button>
           <button className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <Settings className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Settings</span>
           </button>
        </nav>

        <div className="pt-10 border-t border-black/5">
           <div className="flex items-center gap-4 px-5 py-4 mb-8 bg-black/5 rounded-3xl">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#3b83f5] to-[#2ecac5] flex items-center justify-center font-black text-white shadow-md">
                 {(user?.user_metadata?.username || user?.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                 <p className="text-[11px] font-bold uppercase tracking-widest truncate">{user?.user_metadata?.username || user?.email?.split('@')[0]}</p>
                 <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Operative Level 3</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl hover:bg-red-500/5 text-muted-foreground hover:text-red-600 transition-all group"
           >
              <LogOut className="h-5 w-5" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Terminate</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 p-12 lg:p-20 animate-popup">
        <div className="max-w-6xl mx-auto space-y-16">
           {/* Top Bar */}
           <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <h1 className="text-6xl font-light tracking-tighter leading-none uppercase">Command Center</h1>
                 <p className="text-muted-foreground font-light text-lg">Monitoring {scans.length} active audit streams across your estate.</p>
              </div>
              <Link href="/" className="glass-3d-button h-16 px-10 text-[11px] font-bold uppercase tracking-[0.3em] !rounded-full flex items-center gap-3">
                 <Plus className="h-5 w-5" /> Add Audit
              </Link>
           </div>

           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-3d-panel p-10 space-y-6 group hover:translate-y-[-5px] transition-all duration-700">
                 <div className="flex justify-between items-start">
                    <div className="p-4 w-fit rounded-2xl bg-gradient-to-br from-[#3b83f5] to-[#2ecac5] text-white shadow-lg">
                       <BarChart3 className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Optimal +12%</span>
                 </div>
                 <div>
                    <h3 className="text-5xl font-light tracking-tighter">88.4%</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-1">Global Health Index</p>
                 </div>
              </div>
              <div className="glass-3d-panel p-10 space-y-6 group hover:translate-y-[-5px] transition-all duration-700">
                 <div className="p-4 w-fit rounded-2xl bg-gradient-to-br from-[#3b83f5] to-[#2ecac5] text-white shadow-lg">
                    <ShieldCheck className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-5xl font-light tracking-tighter">24</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-1">Active Operations</p>
                 </div>
              </div>
              <div className="glass-3d-panel p-10 space-y-6 group hover:translate-y-[-5px] transition-all duration-700">
                 <div className="p-4 w-fit rounded-2xl bg-gradient-to-br from-[#3b83f5] to-[#2ecac5] text-white shadow-lg">
                    <Activity className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-5xl font-light tracking-tighter">12</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-1">Risks Detected</p>
                 </div>
              </div>
           </div>

           {/* Recent Audits */}
           <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-black/5 pb-10">
                 <h2 className="text-3xl font-light tracking-tighter uppercase flex items-center gap-4">
                    <History className="h-8 w-8 text-black/10" /> Audit Log
                 </h2>
                 <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                    <input className="h-14 w-80 pl-12 pr-6 bg-white/40 border border-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest outline-none focus:bg-white transition-all shadow-sm" placeholder="Search archive..." />
                 </div>
              </div>

              <div className="grid gap-6">
                 {scans.map((scan, i) => (
                    <motion.div 
                      key={scan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="glass-3d-panel !p-8 flex items-center justify-between hover:bg-white transition-all duration-700 shadow-sm group"
                    >
                       <div className="flex items-center gap-10">
                          <div className="h-16 w-24 bg-black/5 rounded-2xl flex items-center justify-center overflow-hidden border border-black/5">
                             <div className="text-[11px] font-bold text-black/20 uppercase">{scan.url.replace('https://', '').split('.')[0]}</div>
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {scan.url}
                                <ExternalLink className="h-4 w-4 text-black/10 group-hover:text-primary transition-colors ml-2" />
                             </h4>
                             <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">{scan.date}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-16">
                          <div className="text-right">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Index</p>
                             <p className={`text-3xl font-bold ${scan.score >= 90 ? 'text-green-600' : 'text-primary'}`}>{scan.score}%</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <button className="h-14 w-14 rounded-full bg-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-sm">
                                <Download className="h-5 w-5" />
                             </button>
                             <Link href={`/scan?url=${encodeURIComponent(scan.url)}`} className="h-14 w-14 rounded-full bg-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-sm">
                                <ChevronRight className="h-5 w-5" />
                             </Link>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
