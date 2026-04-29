import type { Metadata } from "next";
import { Inter, Manrope, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Luminary",
  description:
    "Crawl any website, detect WCAG 2.2 violations, and get plain-language explanations with exact code fixes in seconds.",
  icons: {
    icon: "/logo-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-poppins antialiased bg-[#e3e2c3] text-[#1a1a1a] font-light`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
