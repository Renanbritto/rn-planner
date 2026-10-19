import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RN Planner | Personal Operating System",
  description: "Custom personal planner for daily execution, habits, goals and focus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
