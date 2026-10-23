"use client";

import { useState } from "react";
import { PlannerTask, TaskCategory } from "@/types/planner";
import { Calendar, Trash2, GripVertical } from "lucide-react";

interface KanbanCardProps {
  task: PlannerTask;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const CATEGORY_MAP: Record<TaskCategory, { label: string; bg: string; text: string }> = {
  work: { label: "Tech / Trabalho", bg: "bg-[#06b6d4]/10 border-[#06b6d4]/25", text: "text-[#06b6d4]" },
  study: { label: "Estudo", bg: "bg-[#f59e0b]/10 border-[#f59e0b]/25", text: "text-[#f59e0b]" },
  health: { label: "Saúde / Treino", bg: "bg-[#10b981]/10 border-[#10b981]/25", text: "text-[#10b981]" },
  finance: { label: "Finanças", bg: "bg-[#10b981]/10 border-[#10b981]/25", text: "text-[#10b981]" },
  personal: { label: "Pessoal", bg: "bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10", text: "text-slate-600 dark:text-slate-300" },
};

export function KanbanCard({
  task,
  onDelete,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

  // Borda lateral com a semântica Neon Obsidian
  const borderStripeColor =
    task.priority === "critical"
      ? "border-l-[#f43f5e]"
      : task.priority === "medium"
      ? "border-l-[#f59e0b]"
      : "border-l-[#06b6d4]";

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(e, task.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-3.5 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-200 cursor-grab active:cursor-grabbing border-l-4 ${borderStripeColor} ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-cyan-500/50"
          : "hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-[#101626]/95 hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-0.5"
      }`}
    >
      {/* Header do Card: Código & Ações */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
          <span className="font-mono font-extrabold text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {task.code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.priority === "critical" && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-extrabold text-[#f43f5e] bg-[#f43f5e]/15 px-2 py-0.5 rounded-lg border border-[#f43f5e]/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e] animate-pulse" />
              Crítico
            </span>
          )}
          {task.priority === "medium" && (
            <span className="text-[10px] font-mono font-extrabold text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded-lg border border-[#f59e0b]/30">
              Média
            </span>
          )}
          {task.priority === "low" && (
            <span className="text-[10px] font-mono font-extrabold text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded-lg border border-[#06b6d4]/20">
              Baixa
            </span>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1 rounded-lg transition-all cursor-pointer"
            title="Excluir card"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Título Principal com Tipografia Comfortaa */}
      <h3 className="font-comfortaa text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors">
        {task.title}
      </h3>

      {/* Descrição Opcional */}
      {task.description && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Rodapé do Card: Categoria & Data */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-[11px]">
        <span
          className={`font-comfortaa rounded-lg border px-2 py-0.5 font-medium ${categoryInfo.bg} ${categoryInfo.text}`}
        >
          {categoryInfo.label}
        </span>

        {task.dueDate && (
          <div className="flex items-center gap-1 font-mono font-bold text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" />
            <span>{task.dueDate.split("-").reverse().slice(0, 2).join("/")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
