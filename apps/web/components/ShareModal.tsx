"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Copy, 
  CheckCircle2, 
  Share2,
  ExternalLink
} from "lucide-react";
import { 
  FaFacebook, 
  FaLinkedin, 
  FaXTwitter, 
  FaInstagram 
} from "react-icons/fa6";
import { IoMail } from "react-icons/io5";
import React, { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Luminary Accessibility Audit for ${title}`);

  const shareOptions = [
    { 
      name: "Email", 
      icon: <IoMail className="h-5 w-5" />, 
      color: "hover:bg-blue-500", 
      href: `mailto:?subject=${encodedTitle}&body=Check out this accessibility audit: ${encodedUrl}` 
    },
    { 
      name: "X / Twitter", 
      icon: <FaXTwitter className="h-5 w-5" />, 
      color: "hover:bg-black", 
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` 
    },
    { 
      name: "LinkedIn", 
      icon: <FaLinkedin className="h-5 w-5" />, 
      color: "hover:bg-[#0077b5]", 
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` 
    },
    { 
      name: "Facebook", 
      icon: <FaFacebook className="h-5 w-5" />, 
      color: "hover:bg-[#1877f2]", 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` 
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#e3e2c3] rounded-[3rem] !p-0 overflow-hidden shadow-2xl border border-white/40"
          >
            {/* Header */}
            <div className="p-10 border-b border-black/5 flex items-center justify-between bg-white/20">
               <div className="flex items-center gap-5">
                  <div className="p-4 bg-black text-white rounded-[1.5rem] shadow-xl">
                     <Share2 className="h-6 w-6" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold tracking-tight">Share Audit</h2>
                     <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">Neural Link Live</p>
                  </div>
               </div>
               <button 
                 onClick={onClose}
                 className="p-3 hover:bg-black/5 rounded-2xl transition-colors"
               >
                 <X className="h-6 w-6" />
               </button>
            </div>

            {/* Content */}
            <div className="p-12 space-y-12">
               {/* Link Box */}
               <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                     <label className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40">Archive URL</label>
                     <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full">Secure Link</span>
                  </div>
                  <div className="flex gap-2 p-2.5 bg-white/50 backdrop-blur-sm rounded-3xl border border-white focus-within:border-black/10 transition-all shadow-inner">
                     <input 
                       readOnly 
                       value={url} 
                       className="flex-1 bg-transparent px-5 py-3 text-sm font-bold outline-none text-black/60"
                     />
                     <button 
                       onClick={handleCopy}
                       className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-white shadow-lg' : 'bg-black text-white hover:bg-black/80 shadow-xl shadow-black/10'}`}
                     >
                       {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                       {copied ? 'Saved' : 'Copy'}
                     </button>
                  </div>
               </div>

               {/* Social Grid */}
               <div className="space-y-8">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40 px-2">Broadcast Signal</label>
                  <div className="grid grid-cols-4 gap-4">
                     {shareOptions.map((option) => (
                        <a 
                          key={option.name}
                          href={option.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-md border border-white rounded-[2.5rem] gap-4 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 group ${option.color} hover:text-white hover:border-transparent`}
                        >
                           <div className="p-4 bg-black/5 rounded-[1.2rem] group-hover:bg-white/20 transition-colors">
                              {/* Re-rendering icons with bigger size */}
                              {React.cloneElement(option.icon as React.ReactElement, { className: "h-6 w-6" })}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-center">{option.name.split(' ')[0]}</span>
                        </a>
                     ))}
                  </div>
               </div>

               <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                     <ExternalLink className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-900/70 font-medium">
                     This link is permanent and public. Anyone with this URL can view the accessibility health score and code fix recommendations for this target.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
