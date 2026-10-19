"use client";

import { Target, TrendingUp } from "lucide-react";
import { Goal } from "@/types/planner";

interface GoalsWidgetProps {
  goals: Goal[];
}

export function GoalsWidget({ goals }: GoalsWidgetProps) {
  return (
    <div className="glass-panel flex flex-col rounded-2xl p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Metas Estratégicas</span>
            <Target className="h-4 w-4 text-cyan-400" />
          </h2>
          <p className="text-xs text-slate-400">
            OKRs e objetivos macro de médio e longo prazo.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-xl border border-white/10 bg-[#0b0f1a]/80 p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-100">{goal.title}</h4>
              <span className="text-xs font-bold text-cyan-400">{goal.progress}%</span>
            </div>

            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>{goal.metricLabel}</span>
              <span className="text-[11px] text-slate-500">Alvo: {goal.targetDate}</span>
            </div>

            {/* Barra de Progresso */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
