"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Lock, Loader2, LogIn } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Attempting login for:", email);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error("Login error:", loginError);
        setError(loginError.message);
      } else {
        console.log("Login success:", data);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError("Neural link failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(`OAuth signal failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#e3e2c3] text-[#1a1a1a] flex flex-col items-center justify-center p-6 font-poppins font-light">
      <Link
        href="/"
        className="absolute top-12 left-12 flex items-center gap-3 group"
      >
        <div className="p-3 rounded-full bg-white border border-black/5 group-hover:scale-110 transition-transform shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-black transition-colors">
          Home
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="w-full max-w-xl url-box-container !p-4"
      >
        <div className="bg-white/90 rounded-[3rem] p-12 md:p-16 space-y-12 shadow-2xl border border-black/[0.03]">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 flex items-center justify-center mx-auto mb-8 transition-transform duration-1000 hover:scale-110">
              <Image
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="scale-[2.8]"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient">
              Luminary
            </h1>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              Welcome back, operative. <br />
              Access your secure portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-5">
                Identity Email
              </label>
              <div className="relative">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-20 rounded-[2.5rem] pl-16 pr-8 bg-black/[0.02] border border-black/[0.05] focus:bg-white focus:border-[#3b83f5]/30 outline-none transition-all text-base font-medium shadow-inner"
                  placeholder="agent@organization.ai"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-5">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-20 rounded-[2.5rem] pl-16 pr-8 bg-black/[0.02] border border-black/[0.05] focus:bg-white focus:border-[#3b83f5]/30 outline-none transition-all text-base font-medium shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500 text-[11px] font-bold text-center bg-red-500/5 py-5 rounded-3xl border border-red-500/10"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-20 glass-3d-button uppercase tracking-[0.3em] text-[11px] font-bold flex items-center justify-center gap-4 !rounded-full shadow-2xl"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Initiate Login
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-black/5"></div>
            <span className="flex-shrink mx-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              Social Hub
            </span>
            <div className="flex-grow border-t border-black/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleOAuthLogin("github")}
              className="h-16 border border-black/5 bg-white/40 rounded-3xl flex items-center justify-center gap-3 hover:bg-white/80 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              <FaGithub className="h-5 w-5 text-black/40" />
              Github
            </button>
            <button
              onClick={() => handleOAuthLogin("google")}
              className="h-16 border border-black/5 bg-white/40 rounded-3xl flex items-center justify-center gap-3 hover:bg-white/80 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              <FaGoogle className="h-5 w-5 text-black/40" />
              Google
            </button>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 pt-6">
            No identity yet?{" "}
            <Link
              href="/signup"
              className="text-black font-black hover:underline underline-offset-4"
            >
              Enroll Now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
