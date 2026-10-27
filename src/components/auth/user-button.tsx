"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogOut, ArrowLeftRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  const { user, loading, signInWithGoogle, switchAccount, signOut } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl animate-pulse" />
    );
  }

  // Se não estiver logado (modo convidado), exibe botão de entrar
  if (!user) {
    return (
      <button
        onClick={async () => {
          setIsProcessing(true);
          await signInWithGoogle();
          setIsProcessing(false);
        }}
        disabled={isProcessing}
        className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-comfortaa font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        title="Fazer login para sincronizar suas tarefas na nuvem"
      >
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
        <span className="hidden sm:inline">{isProcessing ? "Entrando..." : "Entrar com Google"}</span>
        <span className="sm:hidden">{isProcessing ? "..." : "Entrar"}</span>
      </button>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex items-center gap-1.5">
      {/* Dropdown com Perfil e Ações de Conta */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 sm:gap-2 h-9 px-2 sm:pl-1.5 sm:pr-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50">
          {user.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-6 w-6 rounded-lg object-cover border border-slate-200 dark:border-white/10"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {initials}
            </div>
          )}
          <span className="hidden sm:inline-block font-comfortaa text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
            {user.name}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-400 opacity-70" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-2 text-slate-800 dark:text-slate-200 shadow-2xl"
        >
          {/* Identificação do Usuário */}
          <DropdownMenuLabel className="px-3 py-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
                Conectado
              </span>
            </div>
            <p className="font-comfortaa font-bold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="font-mono text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1.5" />

          {/* Opção: Trocar de Conta */}
          <DropdownMenuItem
            onClick={async () => {
              setIsProcessing(true);
              await switchAccount();
              setIsProcessing(false);
            }}
            disabled={isProcessing}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-comfortaa text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cyan-500/10 rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <div className="flex flex-col">
              <span className="font-medium">Trocar de conta</span>
              <span className="text-[10px] font-sans text-slate-400 dark:text-slate-500">Alternar usuário do Google</span>
            </div>
          </DropdownMenuItem>

          {/* Opção: Logout */}
          <DropdownMenuItem
            onClick={async () => {
              setIsProcessing(true);
              await signOut();
              setIsProcessing(false);
            }}
            disabled={isProcessing}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-comfortaa text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors mt-1"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <div className="flex flex-col">
              <span className="font-medium">Sair da conta</span>
              <span className="text-[10px] font-sans text-slate-400 dark:text-slate-500">Encerrar sessão neste aparelho</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Botão de Logout Rápido (Apenas Desktop - no mobile fica no menu do perfil) */}
      <button
        onClick={async () => {
          setIsProcessing(true);
          await signOut();
          setIsProcessing(false);
        }}
        disabled={isProcessing}
        className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 hover:border-rose-500/40 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        title="Sair da conta"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}