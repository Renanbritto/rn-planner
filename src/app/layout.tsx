import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rn-planner.vercel.app"),
  title: "planner | Personal Operating System",
  description:
    "Quadro de execução pessoal com arrastar e soltar, foco diário, prioridades e métricas.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "planner | Personal Operating System",
    description:
      "Quadro de execução pessoal com arrastar e soltar, foco diário, prioridades e métricas.",
    url: "https://rn-planner.vercel.app",
    siteName: "planner",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "planner | Personal Operating System",
    description:
      "Quadro de execução pessoal com arrastar e soltar, foco diário, prioridades e métricas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${comfortaa.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090d16] dark:text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-400 font-sans transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}