"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Lock, User, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export function Login({ onLogin, error }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onLogin(username, password);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050810] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        {/* Decorative Border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
        
        <div className="relative bg-[#0a0f1c]/90 border border-cyan-500/20 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-widest font-mono">S.T.A.R. PROTOCOL</h1>
            <p className="text-cyan-400/60 text-xs font-mono mt-1 tracking-tighter uppercase">Secure Terminal Access & Reconnaissance</p>
            <div className="mt-2 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
              <p className="text-[8px] font-mono text-cyan-400/40 uppercase tracking-[0.2em] animate-pulse">System Status: Invisible to Unauthorized Entities</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Access Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#050810]/50 border border-[#2A3459] rounded-xl text-cyan-100 placeholder-cyan-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-mono text-sm"
                  placeholder="USERNAME"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#050810]/50 border border-[#2A3459] rounded-xl text-cyan-100 placeholder-cyan-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-mono text-sm"
                  placeholder="PASSWORD"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-[10px] font-mono text-red-400 uppercase tracking-tight">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-mono text-xs font-bold tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                isSubmitting && "animate-pulse"
              )}
            >
              {isSubmitting ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  SCANNING SIGNATURE...
                </>
              ) : (
                "INITIALIZE SESSION"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2A3459]/30 flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="text-[8px] font-mono text-cyan-400/40 uppercase tracking-widest">System Status</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-green-500/80">ONLINE</span>
                </div>
              </div>
              <div className="w-[1px] h-6 bg-[#2A3459]/30" />
              <div className="flex flex-col items-center">
                <div className="text-[8px] font-mono text-cyan-400/40 uppercase tracking-widest">Encryption</div>
                <div className="text-[9px] font-mono text-cyan-400/80 mt-1">AES-256-GCM</div>
              </div>
            </div>
            <p className="text-[8px] font-mono text-cyan-400/30 text-center leading-relaxed">
              UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.<br />
              THIS INTERFACE IS CLOAKED FROM ALL HUMAN AND SUPERNATURAL BEINGS.<br />
              EXCLUSIVELY ACCESSIBLE BY FILIP ADAMEK.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
