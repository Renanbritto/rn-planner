"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (loading) {
    return (
      <div className="h-9 w-20 rounded-xl border border-white/10 bg-[#0b0f1a]/95 backdrop-blur-2xl animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={async () => {
          setIsSigningIn(true);
          await signInWithGoogle();
          setIsSigningIn(false);
        }}
        disabled={isSigningIn}
        className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-xs font-comfortaa font-medium text-slate-200 hover:text-white bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-xs disabled:opacity-50"
      >
        {/* Google G Logo Minimalista */}
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
        <span>{isSigningIn ? "Entrando..." : "Entrar"}</span>
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
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-xl border border-white/10 hover:border-white/20 bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-white/[0.08] transition-all cursor-pointer shadow-xs">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-6 w-6 rounded-lg object-cover border border-white/10"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-[11px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
            {initials}
          </div>
        )}
        <span className="font-comfortaa text-xs font-medium text-slate-200 max-w-[100px] truncate">
          {user.name}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border-white/10 bg-[#0b0f1a]/95 backdrop-blur-2xl p-1.5 text-slate-200 shadow-2xl"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs">
          <p className="font-comfortaa font-bold text-white truncate">{user.name}</p>
          <p className="font-mono text-[11px] font-normal text-slate-400 truncate mt-0.5">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10 my-1" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-comfortaa text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sair da conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}