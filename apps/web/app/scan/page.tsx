"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

function ScanResults() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      setLoading(false);
      return;
    }

    const fetchScan = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!res.ok) {
          throw new Error("Failed to scan website");
        }

        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [url]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 flex items-center">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Scan Results</h1>
        {url && <p className="text-muted-foreground break-all">Target URL: {url}</p>}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-border border-dashed">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium">Scanning in progress...</h3>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            Our headless browser is navigating to the site and running the axe-core accessibility audit. This might take 10-30 seconds.
          </p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Error running scan</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-6 bg-background rounded-lg border border-border shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-4xl font-bold text-destructive mb-2">
                {results.violations?.length || 0}
              </span>
              <span className="text-sm font-medium text-muted-foreground">Violations Found</span>
            </div>
            {/* Will add score and other metrics in Phase 2 */}
          </div>

          <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/50 border-b border-border">
              <h3 className="font-medium">Raw JSON Data</h3>
            </div>
            <div className="p-4 overflow-auto max-h-[600px] bg-zinc-950 text-zinc-50">
              <pre className="text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>}>
        <ScanResults />
      </Suspense>
    </div>
  );
}
