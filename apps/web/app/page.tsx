"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TbWorldSearch } from "react-icons/tb";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdOutlineGppGood } from "react-icons/md";
import { useState } from "react";
import { ScrollReveal } from "../components/ScrollReveal";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/scan?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-[#3b83f5]/30">
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-popup">
        <header className="px-6 h-16 w-full max-w-4xl flex items-center justify-between glass-3d-nav pointer-events-auto">
          <Link href="/" className="flex items-center justify-center gap-1">
            <div className="relative h-8 w-8 flex items-center justify-center overflow-hidden rounded-sm">
              <Image
                src="/logo.png"
                alt="Luminary Logo"
                width={100}
                height={100}
                className="scale-[2.5] object-contain mix-blend-multiply dark:mix-blend-screen"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">Luminary</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#"
            >
              Features
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#"
            >
              Pricing
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#"
            >
              Docs
            </Link>
          </nav>
        </header>
      </div>
      <main className="flex-1 flex flex-col pt-16">
        <section className="w-full relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pb-20 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#3b83f5] to-[#2ecac5] opacity-[0.25] blur-[120px] rounded-full pointer-events-none -z-10 animate-popup"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-popup delay-100">
                  Accessibility audits, <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b83f5] to-[#2ecac5]">
                    explained by AI.
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-popup delay-200">
                  Crawl any website, detect WCAG 2.2 violations, and get
                  plain-language explanations with exact code fixes in seconds.
                </p>
              </div>
              <div className="w-full max-w-lg space-y-2">
                <form
                  onSubmit={handleScan}
                  className="flex flex-col sm:flex-row gap-2 relative p-2 glass-3d-panel animate-popup delay-300"
                >
                  <input
                    className="flex h-12 w-full rounded-xl px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-all glass-3d-input"
                    placeholder="Enter website URL (e.g. https://example.com)"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 py-2 glass-3d-button"
                  >
                    Scan Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4 animate-popup delay-400">
                  Free forever for basic scans. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 relative flex justify-center overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#2ecac5] opacity-10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#3b83f5] opacity-10 blur-[100px] rounded-full pointer-events-none -z-10 animate-popup"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <ScrollReveal delayClass="delay-100" className="h-full">
                <div className="flex flex-col items-center text-center space-y-4 p-8 hover:-translate-y-1 glass-3d-panel h-full">
                  <div className="p-4 glass-3d-icon-wrapper">
                    <TbWorldSearch className="h-6 w-6 text-[#3b83f5]" />
                  </div>
                  <h3 className="text-xl font-bold">Deep Crawling</h3>
                  <p className="text-muted-foreground">
                    Our headless browsers render your site exactly like a real
                    user, finding issues static analyzers miss.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delayClass="delay-300" className="h-full">
                <div className="flex flex-col items-center text-center space-y-4 p-8 hover:-translate-y-1 glass-3d-panel h-full">
                  <div className="p-4 glass-3d-icon-wrapper">
                    <HiOutlineSparkles className="h-6 w-6 text-[#2ecac5]" />
                  </div>
                  <h3 className="text-xl font-bold">AI Explanations</h3>
                  <p className="text-muted-foreground">
                    Stop Googling rule IDs. We use advanced LLMs to explain
                    exactly what is wrong and how to fix it in plain English.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delayClass="delay-500" className="h-full">
                <div className="flex flex-col items-center text-center space-y-4 p-8 hover:-translate-y-1 glass-3d-panel h-full">
                  <div className="p-4 glass-3d-icon-wrapper">
                    <MdOutlineGppGood className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">WCAG 2.2 Ready</h3>
                  <p className="text-muted-foreground">
                    Always up-to-date with the latest accessibility standards to
                    keep your business compliant and inclusive.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-6 mx-auto">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Luminary. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              className="text-sm text-muted-foreground hover:text-foreground"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-sm text-muted-foreground hover:text-foreground"
              href="#"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
