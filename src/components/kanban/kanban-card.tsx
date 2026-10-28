"use client";

import { useState, useRef } from "react";
import {
  PlannerTask,
  TaskCategory,
  KanbanColumnDef,
  getColumnColorConfig,
  StatusBadge,
  DEFAULT_STATUS_BADGES,
  getStatusBadgeColorConfig,
  formatCardCode,
} from "@/types/planner";
import {
  Calendar,
  Trash2,
  GripVertical,
  Maximize2,
  Image as ImageIcon,
  ArrowRightLeft,
  X,
  Check,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { extractImagesFromMarkdown, getCleanSnippet } from "./rich-description";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanCardProps {
  task: PlannerTask;
  columns?: KanbanColumnDef[];
  statusBadges?: StatusBadge[];
  isDragging?: boolean;
  isSelectedToMove?: boolean;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onClick?: (task: PlannerTask) => void;
  onSelectToMove?: (task: PlannerTask) => void;
  onMoveToColumn?: (taskId: string, targetColumn: string) => void;
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
  columns = [],
  statusBadges = [],
  isDragging = false,
  isSelectedToMove = false,
  onDelete,
  onDragStart,
  onDragEnd,
  onClick,
  onSelectToMove,
  onMoveToColumn,
}: KanbanCardProps) {
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const didDragRef = useRef(false);
  const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

  const statusBadge = task.statusBadgeId
    ? (statusBadges.length > 0 ? statusBadges : DEFAULT_STATUS_BADGES).find(
        (b) => b.id === task.statusBadgeId
      )
    : null;
  const badgeConfig = statusBadge ? getStatusBadgeColorConfig(statusBadge.color) : null;

  const attachedImages = task.description ? extractImagesFromMarkdown(task.description) : [];
  const cleanDescription = task.description ? getCleanSnippet(task.description) : "";

  // Borda lateral com a semântica Neon Obsidian
  const borderStripeColor =
    task.priority === "critical"
      ? "border-l-[#f43f5e]"
      : task.priority === "medium"
      ? "border-l-[#f59e0b]"
      : "border-l-[#06b6d4]";

  const isMoving = isDragging || isLocalDragging || isSelectedToMove;

  const handleDragStart = (e: React.DragEvent) => {
    didDragRef.current = true;
    setIsLocalDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(e, task.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsLocalDragging(false);
    onDragEnd(e);
    setTimeout(() => {
      didDragRef.current = false;
    }, 120);
  };

  const handleCardClick = () => {
    if (didDragRef.current) return;
    onClick?.(task);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 backdrop-blur-2xl transition-all duration-200 cursor-pointer active:cursor-grabbing border-l-4 ${borderStripeColor} ${
        isMoving
          ? "border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-50/90 dark:bg-[#0c1829]/95 shadow-[0_0_24px_rgba(6,182,212,0.35)] scale-[1.02] z-20"
          : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 shadow-sm dark:shadow-lg dark:shadow-black/20 hover:border-cyan-500/30 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-[#101626]/95 hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-0.5"
      }`}
    >
      {/* Banner Sinalizador quando o card está Selecionado para Mover */}
      {isMoving && (
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/20 text-cyan-700 dark:text-cyan-300">
          <div className="flex items-center gap-1.5 font-comfortaa text-[11px] font-bold">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-500" />
            <span>Selecionado para mover</span>
          </div>

          {isSelectedToMove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectToMove?.(task); // toggle off
              }}
              className="text-xs font-mono text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-white px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      )}

      {/* Header do Card: Código & Ações */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSelectToMove?.(task);
            }}
            className={`p-1 rounded-lg transition-all cursor-pointer ${
              isSelectedToMove
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"
                : "text-slate-400 dark:text-slate-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
            }`}
            title={isSelectedToMove ? "Cancelar seleção de movimentação" : "Clique para selecionar e mover este card"}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          <span className="font-mono font-extrabold text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {formatCardCode(task.code)}
          </span>

          {/* Botão Rápido de Mover para Outra Etapa */}
          {columns.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-slate-50 dark:bg-white/[0.04] hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-[10px] font-comfortaa font-semibold cursor-pointer"
                title="Mover card para outra etapa"
              >
                <ArrowRightLeft className="h-3 w-3 text-cyan-500" />
                <span className="hidden sm:inline">Mover</span>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/98 backdrop-blur-2xl p-1.5 text-xs shadow-2xl z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1 text-[10px] font-comfortaa font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
                  Mover para etapa:
                </div>

                {columns.map((col) => {
                  const isCurrent = col.id === task.column;
                  const colColor = getColumnColorConfig(col.color);
                  return (
                    <DropdownMenuItem
                      key={col.id}
                      disabled={isCurrent}
                      onClick={() => {
                        onMoveToColumn?.(task.id, col.id);
                        toast.success(`Card ${formatCardCode(task.code)} movido para "${col.title}"!`);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer font-comfortaa text-xs transition-colors ${
                        isCurrent
                          ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-white/[0.02]"
                          : "hover:bg-cyan-500/10 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${colColor.dotColor}`} />
                        <span>{col.title}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-mono text-slate-400">Atual</span>
                      ) : (
                        <Check className="h-3 w-3 opacity-0 group-hover:opacity-100 text-cyan-500" />
                      )}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator className="bg-slate-200 dark:border-white/10 my-1" />

                <DropdownMenuItem
                  onClick={() => onSelectToMove?.(task)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 font-comfortaa text-xs font-semibold"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  <span>Selecionar no quadro</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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

      {/* Selo de Status Personalizável */}
      {statusBadge && badgeConfig && (
        <div className="mt-1 mb-1.5 flex items-center">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-comfortaa font-bold uppercase tracking-wider ${badgeConfig.badgeBg} ${badgeConfig.badgeText} ${badgeConfig.borderColor} shadow-xs`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${badgeConfig.dotColor} shadow-[0_0_6px_currentColor]`}
            />
            <span>{statusBadge.label}</span>
          </span>
        </div>
      )}

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

      {/* Rodapé do Card: Categoria, Responsável, Imagens, Comentários & Data */}
      <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-white/5 pt-2 text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span
            className={`font-comfortaa rounded-lg border px-2 py-0.5 font-medium ${categoryInfo.bg} ${categoryInfo.text}`}
          >
            {categoryInfo.label}
          </span>

          {task.assignee ? (
            <div
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-[10.5px] font-comfortaa font-medium text-slate-700 dark:text-slate-300 shadow-2xs max-w-[120px]"
              title={`Responsável: ${task.assignee}`}
            >
              <span className="h-3.5 w-3.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold text-[8.5px] flex items-center justify-center uppercase font-mono border border-cyan-500/30 shrink-0">
                {task.assignee.trim().charAt(0)}
              </span>
              <span className="truncate">{task.assignee}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(task);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[10px] font-comfortaa text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 px-1.5 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-white/10 hover:border-cyan-500/40 cursor-pointer"
              title="Definir responsável da tarefa"
            >
              <User className="h-2.5 w-2.5" />
              <span>+ Resp.</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Contador de Comentários */}
          {task.comments && task.comments.length > 0 && (
            <div
              className="flex items-center gap-1 font-mono text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20"
              title={`${task.comments.length} comentário(s)`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

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
