"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Code,
  LogOut, 
  User as UserIcon,
  CreditCard,
  Users,
  Plus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamPage() {
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [activeOrg, setActiveOrg] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchOrganizations(user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchOrganizations = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/orgs/list/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
        if (data.length > 0 && !activeOrg) {
          setActiveOrg(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName || !user) return;
    setIsCreating(true);
    try {
      const res = await fetch('http://localhost:8080/api/orgs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: newOrgName })
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizations([...organizations, { ...data.organization, userRole: 'admin' }]);
        setNewOrgName("");
        if (!activeOrg) setActiveOrg(data.organization);
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !activeOrg) return;
    setIsInviting(true);
    try {
      const res = await fetch('http://localhost:8080/api/orgs/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: activeOrg.id, email: inviteEmail, role: 'viewer' })
      });
      if (res.ok) {
        alert("Member invited successfully!");
        setInviteEmail("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to invite member");
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
           <Link href="/dashboard" className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <LayoutDashboard className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Command Center</span>
           </Link>
           <button className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl bg-black text-white shadow-2xl shadow-black/20 group transition-all">
              <Users className="h-5 w-5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Team Workspace</span>
           </button>
           <Link href="/developer" className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <Code className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Developer API</span>
           </Link>
           <Link href="/pricing" className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <CreditCard className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Pricing</span>
           </Link>
           <Link href="/profile" className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-black/5 transition-all text-muted-foreground hover:text-black group">
              <UserIcon className="h-5 w-5 group-hover:text-black transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Profile</span>
           </Link>
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
      <main className="flex-1 overflow-y-auto relative z-10 p-12 lg:p-20">
        {loading ? (
          <div className="max-w-4xl mx-auto space-y-16 animate-pulse text-center py-20">
             <Users className="h-16 w-16 text-black/5 mx-auto mb-6" />
             <p className="text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Teams...</p>
          </div>
        ) : (
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Top Bar */}
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/50 border border-white shadow-sm mb-2">
                <Users className="h-4 w-4 text-black/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/60">Enterprise Suite</span>
             </div>
             <h1 className="text-5xl font-light tracking-tighter leading-none uppercase">Team Workspace</h1>
             <p className="text-muted-foreground font-light text-lg">Manage multi-tenant organizations and collaborate on accessibility reports.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Organizations List */}
            <div className="lg:col-span-1 space-y-8">
              <div className="glass-3d-panel p-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Your Organizations</h3>
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <button 
                      key={org.id}
                      onClick={() => setActiveOrg(org)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between group ${activeOrg?.id === org.id ? 'bg-black text-white shadow-xl' : 'bg-white/40 border border-black/5 hover:bg-white'}`}
                    >
                      <div>
                        <p className="font-bold text-sm">{org.name}</p>
                        <p className={`text-[9px] uppercase tracking-widest ${activeOrg?.id === org.id ? 'text-white/40' : 'text-muted-foreground/40'}`}>{org.userRole}</p>
                      </div>
                      <Shield className={`h-4 w-4 transition-transform group-hover:scale-110 ${activeOrg?.id === org.id ? 'text-white/20' : 'text-black/5'}`} />
                    </button>
                  ))}
                  
                  <div className="pt-4 border-t border-black/5 mt-4">
                    <input 
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Organization Name"
                      className="w-full h-12 px-4 bg-white/60 border border-black/5 rounded-xl text-xs mb-3 outline-none focus:bg-white transition-all"
                    />
                    <button 
                      onClick={handleCreateOrg}
                      disabled={isCreating || !newOrgName}
                      className="w-full h-12 bg-black/5 hover:bg-black hover:text-white transition-all rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> {isCreating ? 'Creating...' : 'Create Org'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Active Org Details & Members */}
            <div className="lg:col-span-2 space-y-8">
              {activeOrg ? (
                <div className="space-y-8">
                  {/* Org Header */}
                  <div className="glass-3d-panel p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#3b83f5]/10 to-[#2ecac5]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <h2 className="text-3xl font-bold tracking-tight">{activeOrg.name}</h2>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-1">ID: {activeOrg.id}</p>
                       </div>
                       <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl shadow-black/20">
                          <Users className="h-6 w-6" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-black/5 rounded-2xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Your Role</p>
                          <p className="font-bold capitalize">{activeOrg.userRole}</p>
                       </div>
                       <div className="p-4 bg-black/5 rounded-2xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Created</p>
                          <p className="font-bold">{new Date(activeOrg.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>

                  {/* Invite Member */}
                  {activeOrg.userRole === 'admin' && (
                    <div className="glass-3d-panel p-8">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                        <UserPlus className="h-5 w-5 text-black/40" /> Invite Team Member
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                          <input 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full h-14 pl-12 pr-6 bg-white/40 border border-black/5 rounded-2xl text-sm outline-none focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                        <button 
                          onClick={handleInvite}
                          disabled={isInviting || !inviteEmail}
                          className="px-10 h-14 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-xl shadow-black/10 flex items-center gap-3"
                        >
                          {isInviting ? 'Inviting...' : 'Send Invite'}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4">New members will be added as 'Viewer' by default. You can change roles later.</p>
                    </div>
                  )}

                  {/* Placeholder for Members List */}
                  <div className="glass-3d-panel p-8">
                     <h3 className="text-lg font-bold mb-6">Active Members</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-black/5">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
                                 {user?.email?.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-bold">{user?.email} <span className="text-[10px] text-muted-foreground font-normal ml-2">(You)</span></p>
                                 <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{activeOrg.userRole}</p>
                              </div>
                           </div>
                           <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-center py-6 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">More member management coming soon</p>
                     </div>
                  </div>

                </div>
              ) : (
                <div className="h-96 glass-3d-panel flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="h-20 w-20 bg-black/5 rounded-3xl flex items-center justify-center">
                    <Users className="h-10 w-10 text-black/10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">No Organization Selected</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Select an organization from the left or create a new one to start collaborating.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
        )}
      </main>

    </div>
  );
}
