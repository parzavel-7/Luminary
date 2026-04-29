"use client";

import { Download } from "lucide-react";

interface ExportPDFProps {
  url: string;
  results: any;
}

export default function ExportPDF({ url, results }: ExportPDFProps) {
  const handleExport = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text(`Accessibility Audit: ${url}`, 20, 20);
      doc.setFontSize(12);
      doc.text(`Health Index: ${results.score}%`, 20, 35);
      doc.text(`Violations Detected: ${results.violations.length}`, 20, 45);
      
      results.violations.forEach((v: any, i: number) => {
        const y = 60 + (i * 20);
        if (y < 280) {
          doc.text(`${i + 1}. ${v.help} (${v.impact})`, 20, y);
        }
      });
      
      doc.save(`Luminary_Audit_${url?.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  return (
    <button 
      onClick={handleExport} 
      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
    >
      <Download className="h-3.5 w-3.5" /> Export PDF
    </button>
  );
}
