"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Kanban,
  Database,
  Layers,
} from "lucide-react";

export function LoginView() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-500 transition-colors duration-200">
      {/* Glow Orbs Atmosféricos Neon */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full bg-[#06b6d4]/10 dark:bg-[#06b6d4]/10 blur-[150px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-[#f43f5e]/8 dark:bg-[#f43f5e]/8 blur-[160px]" />
        <div className="absolute -bottom-32 left-1/4 h-[550px] w-[550px] rounded-full bg-[#10b981]/8 dark:bg-[#10b981]/8 blur-[160px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top Navbar Minimalista */}
      <header className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
        <BrandLogo size={38} showText={true} />

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0b0f1a]/80 backdrop-blur-xl text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span>OBSIDIAN V2.0</span>
          </div>

          <ThemeToggle />

          <button
            onClick={continueAsGuest}
            className="flex items-center gap-1.5 text-xs font-comfortaa text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Acessar sem login</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-12 my-auto">
        {/* Hero Copy */}
        <div className="flex flex-col items-center text-center max-w-2xl gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-comfortaa font-medium shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Seu Personal Operating System</span>
          </div>

          <h1 className="font-comfortaa text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Execute com foco.{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Conquiste tudo.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-sans max-w-lg leading-relaxed">
            Um quadro Kanban profissional desenhado para alta produtividade,
            com sincronização instantânea em nuvem, métricas semânticas e foco diário.
          </p>
        </div>

        {/* Central Auth Box (Obsidian Glass) */}
        <div className="relative w-full max-w-md">
          {/* Subtle Outer Neon Border Glow */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-rose-500/15 to-emerald-500/20 blur-lg opacity-75" />

          <div className="relative flex flex-col gap-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-7 sm:p-8 shadow-xl dark:shadow-2xl">
            <div className="flex flex-col gap-1 text-center">
              <h2 className="font-comfortaa text-xl font-bold text-slate-900 dark:text-white">
                Entrar no rn-planner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronize suas tarefas em qualquer computador ou dispositivo.
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-3 w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/15 hover:border-cyan-500/50 text-slate-800 dark:text-white font-comfortaa text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-500/10 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLoading ? "Conectando ao Google..." : "Continuar com o Google"}</span>
            </button>

            {/* Divisor */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <span className="relative bg-white dark:bg-[#0b0f1a] px-3 font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                ou
              </span>
            </div>

            {/* Entrar como convidado */}
            <button
              onClick={continueAsGuest}
              className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-comfortaa text-xs font-medium transition-all cursor-pointer"
            >
              <span>Experimentar como Convidado (Modo Local)</span>
              <ArrowRight className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Nuvem Criptografada</span>
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-white/10" />
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                <span>Zero Latência</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
          {/* Feature 1 */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0b0f1a]/80 backdrop-blur-xl p-5 hover:border-cyan-500/30 transition-all shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Kanban className="h-4 w-4" />
            </div>
            <h3 className="font-comfortaa font-bold text-sm text-slate-900 dark:text-white">
              Kanban Flexível
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Arraste, solte e crie novas etapas personalizadas de execução com cores dinâmicas.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0b0f1a]/80 backdrop-blur-xl p-5 hover:border-emerald-500/30 transition-all shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="font-comfortaa font-bold text-sm text-slate-900 dark:text-white">
              Persistência Segura
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tabelas PostgreSQL e Row Level Security garantem que seus dados sejam só seus.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0b0f1a]/80 backdrop-blur-xl p-5 hover:border-rose-500/30 transition-all shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="font-comfortaa font-bold text-sm text-slate-900 dark:text-white">
              Métricas Semânticas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Acompanhe cards críticos, em andamento e taxa de conclusão em tempo real.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span className="font-comfortaa text-slate-600 dark:text-slate-400">rn-planner • Personal Operating System</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Obsidian Glass Architecture
        </div>
      </footer>
    </div>
  );
}
