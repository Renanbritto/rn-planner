"use client";

import { AlertTriangle, Clock, Zap, CheckCircle } from "lucide-react";
import { PlannerTask, Habit } from "@/types/planner";

interface MetricCardsProps {
  tasks: PlannerTask[];
  habits: Habit[];
}

export function MetricCards({ tasks, habits }: MetricCardsProps) {
  const criticalCount = tasks.filter(
    (t) => !t.completed && t.priority === "critical"
  ).length;

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const today = new Date().toISOString().split("T")[0];
  const completedHabitsToday = habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;
  const habitsRate = habits.length > 0
    ? Math.round((completedHabitsToday / habits.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Rose / Magenta - Métricas Críticas / Alertas */}
      <div className="glass-panel group relative overflow-hidden rounded-2xl p-5 hover:border-rose-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Atenção Crítica
          </span>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 transition-colors group-hover:bg-rose-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {criticalCount}
          </span>
          <span className="text-xs text-rose-400/80">
            {criticalCount === 1 ? "tarefa urgente" : "tarefas urgentes"}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Alta prioridade que requer foco imediato hoje.
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
      </div>

      {/* Amber / Dourado - Em Andamento / Atenção Moderada */}
      <div className="glass-panel group relative overflow-hidden rounded-2xl p-5 hover:border-amber-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Em Andamento
          </span>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400 transition-colors group-hover:bg-amber-500/20">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {pendingCount}
          </span>
          <span className="text-xs text-amber-400/80">
            {pendingCount === 1 ? "pendente" : "pendentes"}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Tarefas na esteira aguardando execução.
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      </div>

      {/* Cyan / Azul Elétrico - Deep Work / Tech / Foco */}
      <div className="glass-panel group relative overflow-hidden rounded-2xl p-5 hover:border-cyan-500/30 glow-cyan-subtle">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Deep Work & Tech
          </span>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            12
          </span>
          <span className="text-xs text-cyan-400/80">dias streak foco</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Blocos ininterruptos de código e arquitetura.
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </div>

      {/* Emerald / Verde Menta - Precisão, Hábitos & Sucesso */}
      <div className="glass-panel group relative overflow-hidden rounded-2xl p-5 hover:border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Hábitos do Dia
          </span>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {habitsRate}%
          </span>
          <span className="text-xs text-emerald-400/80">
            {completedHabitsToday}/{habits.length} cumpridos
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Rotina diária com {completedCount} tarefas finalizadas.
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>
    </div>
  );
}
