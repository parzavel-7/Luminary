"use client";

import { Download } from "lucide-react";

interface ExportPDFProps {
  url: string;
  results: {
    score: number;
    violations: any[];
  };
  history?: { date: string; score: number }[];
  iconOnly?: boolean;
}

export default function ExportPDF({
  url,
  results,
  history = [],
  iconOnly = false,
}: ExportPDFProps) {
  const handleExport = async () => {
    if (typeof window === "undefined") return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Constants
      const brandColor: [number, number, number] = [59, 131, 245]; // #3b83f5
      const secondaryColor: [number, number, number] = [46, 202, 197]; // #2ecac5
      const textColor: [number, number, number] = [26, 26, 26]; // #1a1a1a
      const lightGray: [number, number, number] = [220, 220, 220];
      const [brandR, brandG, brandB] = brandColor;
      const [secondaryR, secondaryG, secondaryB] = secondaryColor;
      const [textR, textG, textB] = textColor;
      const [lightR, lightG, lightB] = lightGray;

      // Header Background (Dark Obsidian)
      doc.setFillColor(19, 19, 20); // #131314
      doc.rect(0, 0, 210, 40, "F");

      // Add Logo (Attempt to load logo.png)
      try {
        const logoResponse = await fetch("/logo.png");
        if (logoResponse.ok) {
          const blob = await logoResponse.blob();
          const base64: any = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          const props = doc.getImageProperties(base64);
          const ratio = props.width / props.height;
          const logoWidth = 30;
          const logoHeight = logoWidth / ratio;
          doc.addImage(
            base64,
            "PNG",
            20,
            (40 - logoHeight) / 2,
            logoWidth,
            logoHeight,
          );
        }
      } catch (e) {
        console.warn("Logo could not be loaded for PDF");
      }

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("LUMINARY", 52, 22);

      doc.setFontSize(10);
      doc.setTextColor(secondaryR, secondaryG, secondaryB);
      doc.text("OFFICIAL REPORT", 160, 25);

      // Target URL
      doc.setTextColor(textR, textG, textB);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Neural Audit Target", 20, 55);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(url, 20, 62);

      // Horizontal Accent Line (Gradient simulation)
      doc.setDrawColor(brandR, brandG, brandB);
      doc.setLineWidth(0.5);
      doc.line(20, 68, 190, 68);

      // Stats Section
      doc.setDrawColor(240, 240, 240);
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(20, 75, 80, 40, 4, 4, "FD");
      doc.roundedRect(110, 75, 80, 40, 4, 4, "FD");

      // Health Index Card
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(150, 150, 150);
      doc.text("HEALTH INDEX", 30, 85);

      doc.setFontSize(26);
      doc.setTextColor(secondaryR, secondaryG, secondaryB);
      doc.text(`${results.score}%`, 30, 102);

      // Violations Card
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(150, 150, 150);
      doc.text("TOTAL FINDINGS", 120, 85);

      doc.setFontSize(26);
      const totalViolations = results?.violations?.length || 0;
      doc.setTextColor(
        totalViolations > 0 ? 239 : secondaryR,
        totalViolations > 0 ? 68 : secondaryG,
        totalViolations > 0 ? 68 : secondaryB,
      );
      doc.text(`${totalViolations}`, 120, 102);

      // Violations List
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textR, textG, textB);
      
      // Trend Section
      if (history && history.length > 0) {
        doc.text("Trend Analysis", 20, 130);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Tracking ${history.length} historical audit points for this target.`, 20, 137);
        
        let xPos = 20;
        const chartWidth = 170;
        const chartHeight = 30;
        const startY = 145;
        
        // Simple visual timeline representation
        doc.setDrawColor(lightR, lightG, lightB);
        doc.setLineWidth(0.1);
        doc.line(xPos, startY + chartHeight, xPos + chartWidth, startY + chartHeight);
        
        const step = chartWidth / (history.length - 1 || 1);
        doc.setDrawColor(brandR, brandG, brandB);
        doc.setLineWidth(0.8);
        
        history.forEach((h, i) => {
          const currentScore = h.score ?? 0;
          const x = xPos + (i * step);
          const y = (startY + chartHeight) - (currentScore / 100 * chartHeight);
          
          if (i > 0) {
            const prevX = xPos + ((i - 1) * step);
            const prevScore = history[i - 1]?.score ?? 0;
            const prevY = (startY + chartHeight) - (prevScore / 100 * chartHeight);
            doc.line(prevX, prevY, x, y);
          }
          
          doc.setFillColor(brandR, brandG, brandB);
          doc.circle(x, y, 0.5, "F");
        });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textR, textG, textB);
        doc.text("Neural Diagnostic Log", 20, 190);
      } else {
        doc.text("Neural Diagnostic Log", 20, 135);
      }

      if (results?.violations && results.violations.length > 0) {
        let yPos = (history && history.length > 0) ? 200 : 150;

        results.violations.forEach((v: any, i: number) => {
          // Add new page if getting close to bottom
          if (yPos > 260) {
            doc.addPage();
            // Re-add footer on new page if needed, but we handle in global loop
            yPos = 30;
          }

          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");

          // Impact color coding
          let impactColor: [number, number, number] = [34, 197, 94]; // Green
          if (v.impact === "critical")
            impactColor = [239, 68, 68]; // Red
          else if (v.impact === "serious") impactColor = [249, 115, 22]; // Orange

          const [impactR, impactG, impactB] = impactColor;
          doc.setFillColor(impactR, impactG, impactB);
          doc.roundedRect(20, yPos - 5, 25, 6, 1, 1, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(v.impact.toUpperCase(), 22, yPos - 0.5);

          doc.setTextColor(textR, textG, textB);
          doc.setFontSize(11);
          doc.text(v.help, 50, yPos);

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);

          const desc = doc.splitTextToSize(
            v.description || "No description provided.",
            140,
          );
          doc.text(desc, 50, yPos + 6);

          yPos += 10 + desc.length * 4;

          // Draw subtle separator
          doc.setDrawColor(245, 245, 245);
          doc.line(20, yPos - 2, 190, yPos - 2);

          yPos += 10;
        });
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(34, 197, 94);
        doc.text(
          "Zero Risks Detected. Neural scan confirms target meets all standards.",
          20,
          150,
        );
      }

      // Footer
      const pageCount = doc.internal.pages.length;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Bottom Accent
        doc.setFillColor(brandR, brandG, brandB);
        doc.rect(0, 285, 210, 15, "F");

        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(`LUMINARY ACCESSIBILITY AUDITOR`, 20, 295);
        doc.text(`PAGE ${i} / ${pageCount}`, 170, 295);
      }

      doc.save(`Luminary_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleExport}
        className="h-14 w-14 rounded-full bg-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-sm"
        title="Download PDF Report"
      >
        <Download className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
    >
      <Download className="h-3.5 w-3.5" /> Export PDF
    </button>
  );
}
