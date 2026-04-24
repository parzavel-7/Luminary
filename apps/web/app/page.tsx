"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";
import { useState } from "react";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Luminary</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Docs
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-32">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center text-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Accessibility audits, <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
                    explained by AI.
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Crawl any website, detect WCAG 2.2 violations, and get plain-language explanations with exact code fixes in seconds.
                </p>
              </div>
              <div className="w-full max-w-lg space-y-2">
                <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2 relative shadow-lg rounded-lg bg-background p-2 border border-border">
                  <input
                    className="flex h-12 w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter website URL (e.g. https://example.com)"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 py-2 shadow-md">
                    Scan Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free forever for basic scans. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 bg-muted/50 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-background rounded-full shadow-sm border border-border">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Deep Crawling</h3>
                <p className="text-muted-foreground">Our headless browsers render your site exactly like a real user, finding issues static analyzers miss.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-background rounded-full shadow-sm border border-border">
                  <Zap className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold">AI Explanations</h3>
                <p className="text-muted-foreground">Stop Googling rule IDs. We use advanced LLMs to explain exactly what is wrong and how to fix it in plain English.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-background rounded-full shadow-sm border border-border">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">WCAG 2.2 Ready</h3>
                <p className="text-muted-foreground">Always up-to-date with the latest accessibility standards to keep your business compliant and inclusive.</p>
              </div>
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
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="#">
              Terms
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="#">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
