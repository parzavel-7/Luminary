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
import { motion, AnimatePresence } from "framer-motion";
import TrendChart from "../../components/TrendChart";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [monitoredSites, setMonitoredSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        
        // Fetch real scans
        const { data: scanData } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (scanData) setScans(scanData);

        // Fetch monitored sites
        const { data: monitorData } = await supabase
          .from('monitored_sites')
          .select('*')
          .eq('user_id', user.id);
        
        if (monitorData) setMonitoredSites(monitorData);
        
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleRegisterMonitoring = async () => {
    if (!newUrl) return;
    setIsAdding(true);
    try {
      const response = await fetch('http://localhost:8080/api/monitoring/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl,
          userId: user.id,
          frequency: 'weekly'
        })
      });
      if (response.ok) {
        const { site } = await response.json();
        setMonitoredSites([...monitoredSites, site]);
        setNewUrl("");
      }
    } catch (error) {
      console.error("Failed to register site:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const trendData = scans
    .filter(s => s.created_at && s.score != null) // Guard against null/missing values
    .slice(0, 10)
    .reverse()
    .map(s => ({
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Number(s.score)
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e3e2c3] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3b83f5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e3e2c3] text-[#1a1a1a] flex overflow-hidden font-poppins font-light">
      {/* Sidebar - Same as before but with real data */}
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

           {/* Stats & Trends */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                 <TrendChart data={trendData} />
              </div>
              <div className="glass-3d-panel p-10 flex flex-col justify-between">
                 <div>
                    <div className="p-4 w-fit rounded-2xl bg-gradient-to-br from-[#3b83f5] to-[#2ecac5] text-white shadow-lg mb-6">
                       <Activity className="h-6 w-6" />
                    </div>
                    <h3 className="text-4xl font-light tracking-tighter">
                      {scans.length > 0 ? (scans.reduce((acc, s) => acc + s.score, 0) / scans.length).toFixed(1) : '0'}%
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-1">Average Health Index</p>
                 </div>
                 <div className="pt-8 border-t border-black/5 mt-8">
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-4">Active Operations</p>
                    <div className="flex -space-x-3">
                       {[1,2,3,4].map(i => (
                          <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-[#3b83f5] flex items-center justify-center text-[10px] font-bold text-white">
                             {i}
                          </div>
                       ))}
                       <div className="h-10 w-10 rounded-full border-2 border-white bg-black/5 flex items-center justify-center text-[10px] font-bold">
                          +{scans.length}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Watchlist Section */}
           <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-black/5 pb-10">
                 <h2 className="text-3xl font-light tracking-tighter uppercase flex items-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-black/10" /> Site Watchlist
                 </h2>
                 <div className="flex gap-4">
                    <input 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="h-14 w-80 px-6 bg-white/40 border border-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest outline-none focus:bg-white transition-all shadow-sm" 
                      placeholder="Enter URL to monitor..." 
                    />
                    <button 
                      onClick={handleRegisterMonitoring}
                      disabled={isAdding}
                      className="glass-3d-button h-14 px-8 text-[10px] font-bold uppercase tracking-widest !rounded-full disabled:opacity-50"
                    >
                       {isAdding ? 'Registering...' : 'Monitor Site'}
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {monitoredSites.map((site) => (
                    <motion.div 
                      key={site.id}
                      className="glass-3d-panel p-8 space-y-6 group hover:translate-y-[-5px] transition-all duration-700"
                    >
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <h4 className="font-bold text-lg truncate w-40">{site.url.replace('https://', '')}</h4>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Frequency: {site.frequency}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${site.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {site.active ? 'Live' : 'Paused'}
                          </div>
                       </div>
                       <div className="flex items-end justify-between">
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Last Score</p>
                             <p className="text-3xl font-bold">{site.last_score || 'N/A'}%</p>
                          </div>
                          <Link href={`/scan?url=${encodeURIComponent(site.url)}`} className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                             <ExternalLink className="h-5 w-5" />
                          </Link>
                       </div>
                    </motion.div>
                 ))}
                 {monitoredSites.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-black/5 rounded-3xl">
                       <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">No sites currently in watchlist.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Recent Audits Log */}
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
                             <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">{new Date(scan.created_at).toDateString()}</p>
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
                 {scans.length === 0 && (
                    <div className="py-20 text-center glass-3d-panel border-dashed border-2">
                       <p className="text-muted-foreground uppercase tracking-widest font-bold text-sm">No scan history available.</p>
                       <Link href="/" className="inline-block mt-6 text-[#3b83f5] font-bold uppercase tracking-widest text-[10px] hover:underline underline-offset-8">Run your first audit →</Link>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
