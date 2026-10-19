"use client";

import { useState } from "react";
import { PlannerTask, Priority, TaskCategory } from "@/types/planner";
import { Calendar, Trash2, AlertCircle, GripVertical } from "lucide-react";

interface KanbanCardProps {
  task: PlannerTask;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const CATEGORY_MAP: Record<TaskCategory, { label: string; bg: string; text: string }> = {
  work: { label: "Tech / Trabalho", bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400" },
  study: { label: "Estudo", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-400" },
  health: { label: "Saúde / Treino", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
  finance: { label: "Finanças", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  personal: { label: "Pessoal", bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
};

export function KanbanCard({
  task,
  onDelete,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

  // Cor do Stripe Lateral (estilo Azure DevOps)
  const borderStripeColor =
    task.priority === "critical"
      ? "border-l-rose-500"
      : task.priority === "medium"
      ? "border-l-amber-500"
      : "border-l-cyan-500";

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
      className={`group relative flex flex-col justify-between rounded-xl border border-white/10 bg-[#0b0f1a] p-3.5 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing border-l-4 ${borderStripeColor} ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-cyan-500/50"
          : "hover:border-white/20 hover:bg-[#101626] hover:shadow-lg hover:shadow-black/40"
      }`}
    >
      {/* Header do Card: Código & Ações */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          <span className="font-mono text-[11px] font-semibold text-cyan-400">
            {task.code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.priority === "critical" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              Crítico
            </span>
          )}
          {task.priority === "medium" && (
            <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Média
            </span>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-all"
            title="Excluir card"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Título Principal */}
      <h3 className="text-sm font-medium leading-snug text-slate-100 group-hover:text-white transition-colors">
        {task.title}
      </h3>

      {/* Descrição Opcional */}
      {task.description && (
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Rodapé do Card: Categoria & Data */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
        <span
          className={`rounded-md border px-2 py-0.5 font-medium ${categoryInfo.bg} ${categoryInfo.text}`}
        >
          {categoryInfo.label}
        </span>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{task.dueDate.split("-").reverse().slice(0, 2).join("/")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
