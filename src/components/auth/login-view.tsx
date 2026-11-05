"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function LoginView() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || "Erro ao conectar com Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setErrorMessage("Por favor, digite seu e-mail.");
      return;
    }

    if (!password) {
      setErrorMessage("Por favor, digite sua senha.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        }
      } else {
        const res = await signUpWithEmail(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.message) {
          setInfoMessage(res.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Digite seu e-mail no campo acima para recuperar a senha.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await resetPassword(email);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.message) {
        setInfoMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-500">
      {/* ========================================================= */}
      {/* COLUNA ESQUERDA: Hero de Marca & Manifesto (Estilo Dividido) */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[380px] lg:min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50/40 to-blue-50/50 dark:from-[#06182c] dark:via-[#090d16] dark:to-[#030712] p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 shrink-0 transition-colors duration-200">
        {/* Glow Orbs Atmosféricos Neon */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-[120px]" />
          <div className="absolute top-1/2 -right-24 h-[380px] w-[380px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-[130px]" />
          <div className="absolute -bottom-24 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-[140px]" />
          {/* Subtle grid pattern adaptável ao tema */}
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Topo: Logo da Marca */}
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo size={42} showText={true} />
        </div>

        {/* Manifesto / Hero Copy */}
        <div className="relative z-10 my-auto py-10 lg:py-0 flex flex-col gap-5 max-w-xl">
          <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 dark:border-cyan-500/20">
            FOCO • EXECUÇÃO • PRODUTIVIDADE
          </div>

          <h1 className="font-comfortaa text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
            Sua rotina organizada em um s&oacute; lugar
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300/90 font-sans leading-relaxed">
            Separe seus projetos, acompanhe suas tarefas e produza com clareza todos os dias.
          </p>
        </div>

        {/* Rodapé esquerdo */}
        <div className="relative z-10 flex items-center text-xs text-slate-500 dark:text-slate-400 font-mono pt-4 border-t border-slate-200/80 dark:border-white/5">
          <span>RN Planner &bull; Personal OS</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COLUNA DIREITA: Formulário Autenticação (Tabs Criar/Entrar) */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white dark:bg-[#090d16] transition-colors duration-200">
        {/* Barra Superior Direita: Alternador de Tema */}
        <div className="flex items-center justify-between lg:justify-end gap-3 w-full pb-6">
          <div className="lg:hidden">
            <BrandLogo size={32} showText={false} />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Container Central do Formulário (exatamente no estilo da imagem) */}
        <div className="w-full max-w-[420px] mx-auto my-auto flex flex-col gap-6 py-6 animate-in fade-in duration-300">
          {/* Seletor Pill (Tabs: Criar conta | Entrar) */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-comfortaa font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Criar conta
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-comfortaa font-bold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Cabeçalho da Seção */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-comfortaa text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {mode === "login" ? "Bem-vindo de volta." : "Crie sua conta."}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans">
              {mode === "login"
                ? "Continue de onde parou."
                : "Comece a organizar suas metas com foco e método."}
            </p>
          </div>

          {/* Botões de Acesso Rápido (Google + Convidado) */}
          <div className="flex flex-col gap-2.5">
            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-3 w-full h-11 sm:h-12 px-4 rounded-2xl bg-white dark:bg-[#0b0f1a] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200 font-comfortaa text-xs sm:text-sm font-bold shadow-xs hover:shadow-cyan-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
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
              <span>Continuar com Google</span>
            </button>

            {/* Botão Convidado (Rápido e sem barreira) */}
            <button
              type="button"
              onClick={continueAsGuest}
              className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl border border-dashed border-slate-300 dark:border-white/15 hover:border-cyan-500/50 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 text-xs font-comfortaa font-semibold transition-all hover:bg-cyan-500/5 cursor-pointer"
              title="Acesse instantaneamente sem precisar criar conta"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-500" />
              <span>Acessar sem login (Modo Convidado)</span>
            </button>
          </div>

          {/* Divisor "ou com e-mail" */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-slate-200 dark:border-white/10" />
            <span className="absolute px-3 bg-white dark:bg-[#090d16] text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              ou com e-mail
            </span>
          </div>

          {/* Banners de Erro / Informação */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-comfortaa animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-comfortaa animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Formulário com E-mail e Senha */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Campo E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
                maxLength={255}
                className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0b0f1a] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
              />
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-comfortaa text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  maxLength={128}
                  className="h-11 w-full pl-3.5 pr-10 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0b0f1a] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Ação Primário (Entrar / Criar Conta) */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-comfortaa font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{mode === "login" ? "Entrar" : "Criar conta"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Termos e Condições */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-sans leading-relaxed pt-2">
            Ao continuar, voc&ecirc; concorda com os{" "}
            <span className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">
              Termos de Uso
            </span>{" "}
            e a{" "}
            <span className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">
              Pol&iacute;tica de Privacidade
            </span>
            .
          </p>
        </div>

        {/* Rodapé Direita */}
        <div className="py-2" />
      </div>
    </div>
  );
}
