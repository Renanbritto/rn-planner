"use client";

import { useState, useRef } from "react";
import { PlannerTask, TaskCategory } from "@/types/planner";
import { Calendar, Trash2, GripVertical, Maximize2, Image as ImageIcon } from "lucide-react";
import { extractImagesFromMarkdown, getCleanSnippet } from "./rich-description";

interface KanbanCardProps {
  task: PlannerTask;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onClick?: (task: PlannerTask) => void;
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
  onClick,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const didDragRef = useRef(false);
  const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

  const attachedImages = task.description ? extractImagesFromMarkdown(task.description) : [];
  const cleanDescription = task.description ? getCleanSnippet(task.description) : "";

  // Borda lateral com a semântica Neon Obsidian
  const borderStripeColor =
    task.priority === "critical"
      ? "border-l-[#f43f5e]"
      : task.priority === "medium"
      ? "border-l-[#f59e0b]"
      : "border-l-[#06b6d4]";

  const handleDragStart = (e: React.DragEvent) => {
    didDragRef.current = true;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(e, task.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(e);
    setTimeout(() => {
      didDragRef.current = false;
    }, 120);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (didDragRef.current) return;
    onClick?.(task);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-3.5 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-200 cursor-pointer active:cursor-grabbing border-l-4 ${borderStripeColor} ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-cyan-500/50"
          : "hover:border-cyan-500/30 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-[#101626]/95 hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-0.5"
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

        <div className="flex items-center gap-1.5">
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

          {/* Botão de Abrir Detalhes no Hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(task);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 p-1 rounded-lg transition-all cursor-pointer"
            title="Abrir detalhes e editar card"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* Botão de Excluir */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1 rounded-lg transition-all cursor-pointer"
            title="Excluir card"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Título Principal com Tipografia Comfortaa */}
      <h3 className="font-comfortaa text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
        {task.title}
      </h3>

      {/* Descrição Opcional (Limpa de tags e base64 bruto) */}
      {cleanDescription && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
          {cleanDescription}
        </p>
      )}

      {/* Rodapé do Card: Categoria, Imagens & Data */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-[11px]">
        <span
          className={`font-comfortaa rounded-lg border px-2 py-0.5 font-medium ${categoryInfo.bg} ${categoryInfo.text}`}
        >
          {categoryInfo.label}
        </span>

        <div className="flex items-center gap-2">
          {attachedImages.length > 0 && (
            <div
              className="flex items-center gap-1 font-mono text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20"
              title={`${attachedImages.length} imagem(ns) anexada(s)`}
            >
              <ImageIcon className="h-3 w-3" />
              <span>{attachedImages.length}</span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1 font-mono font-bold text-slate-500 dark:text-slate-400">
              <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <span>{task.dueDate.split("-").reverse().slice(0, 2).join("/")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
