"use client";

import { CheckCircle2, Cloud, CloudOff, Sparkles, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isCloudConnected: boolean;
  onOpenNewTask: () => void;
}

export function PlannerHeader({ isCloudConnected, onOpenNewTask }: HeaderProps) {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="relative flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                RN Planner
              </h1>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
                v1.0 OS
              </span>
            </div>
            <p className="text-sm capitalize text-slate-400">
              {today}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status de Sincronização */}
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 px-3 py-1 text-xs border ${
            isCloudConnected
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {isCloudConnected ? (
            <>
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
              <span>Nuvem Sincronizada</span>
            </>
          ) : (
            <>
              <CloudOff className="h-3.5 w-3.5 text-amber-400" />
              <span>Armazenamento Local (Offline-Ready)</span>
            </>
          )}
        </Badge>

        {/* Botão de Adicionar Tarefa */}
        <Button
          onClick={onOpenNewTask}
          className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
    </header>
  );
}
