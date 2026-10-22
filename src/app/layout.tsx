import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

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
      <body className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-400 font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster
                position="bottom-right"
                theme="dark"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    background: "rgba(11, 15, 26, 0.95)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#f1f5f9",
                  },
                }}
              />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}