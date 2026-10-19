"use client";

import { useState } from "react";
import { Check, Trash2, Calendar, Tag, AlertCircle } from "lucide-react";
import { PlannerTask, Priority, TaskCategory } from "@/types/planner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TaskListProps {
  tasks: PlannerTask[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
}

const CATEGORY_MAP: Record<TaskCategory, { label: string; color: string }> = {
  work: { label: "Tech / Trabalho", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
  study: { label: "Estudo", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
  health: { label: "Saúde / Treino", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  finance: { label: "Finanças", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  personal: { label: "Pessoal", color: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
};

export function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenNewTask,
}: TaskListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "critical" | "completed">("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "critical") return !task.completed && task.priority === "critical";
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="glass-panel flex flex-col rounded-2xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Planejamento & Execução</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
              {filteredTasks.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Lista de prioridades organizadas por impacto e categoria.
          </p>
        </div>

        {/* Filtros em pílulas */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#090d16] p-1 border border-white/10 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              filter === "all"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              filter === "pending"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              filter === "critical"
                ? "bg-rose-500/20 text-rose-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Críticas
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              filter === "completed"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Concluídas
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="mt-4 flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">Nenhuma tarefa encontrada neste filtro.</p>
            <p className="text-xs text-slate-500 mt-1">Tudo em dia ou pronto para novas metas.</p>
            <Button
              onClick={onOpenNewTask}
              variant="outline"
              size="sm"
              className="mt-4 border-white/10 text-xs text-slate-300 hover:bg-white/5"
            >
              Criar Tarefa
            </Button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  task.completed
                    ? "border-white/5 bg-[#0b0f1a]/40 opacity-60"
                    : "border-white/10 bg-[#0b0f1a]/90 hover:border-white/20 hover:bg-[#101626]"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Botão de Checkbox Customizado */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      task.completed
                        ? "border-emerald-500 bg-emerald-500 text-black"
                        : "border-white/20 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/10"
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0 pr-2">
                    <span
                      className={`text-sm font-medium transition-all truncate ${
                        task.completed
                          ? "line-through text-slate-500"
                          : "text-slate-100 group-hover:text-white"
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      {/* Badge de Prioridade */}
                      {task.priority === "critical" && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Crítica
                        </span>
                      )}
                      {task.priority === "medium" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Média
                        </span>
                      )}
                      {task.priority === "low" && (
                        <span className="text-[11px] text-slate-400">Normal</span>
                      )}

                      <span className="text-slate-600">•</span>

                      {/* Categoria */}
                      <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-rose-500/10"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
