"use client";

import { useState } from "react";
import { KanbanColumnDef, PlannerTask, getColumnColorConfig } from "@/types/planner";
import { KanbanCard } from "./kanban-card";
import {
  Plus,
  MoreHorizontal,
  Sliders,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Eraser,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumnProps {
  column: KanbanColumnDef;
  tasks: PlannerTask[];
  isFirst: boolean;
  isLast: boolean;
  totalColumns: number;
  onMoveTask: (taskId: string, targetColumn: string) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (columnId: string) => void;
  onOpenEditColumn: (column: KanbanColumnDef) => void;
  onOpenDeleteColumn: (column: KanbanColumnDef) => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  onClearTasks: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  isFirst,
  isLast,
  totalColumns,
  onMoveTask,
  onDeleteTask,
  onQuickAdd,
  onOpenEditColumn,
  onOpenDeleteColumn,
  onMoveColumn,
  onClearTasks,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const colorConfig = getColumnColorConfig(column.color);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only cancel if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl border p-4 transition-all duration-200 min-h-[580px] w-full min-w-[280px] max-w-[360px] backdrop-blur-2xl shadow-xs select-none ${
        isOver
          ? "border-cyan-500/50 bg-cyan-50/70 dark:bg-[#0e1628] shadow-lg shadow-cyan-500/10 scale-[1.01]"
          : "border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100/70 dark:bg-[#0b0f1a]"
      }`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-3">
        <div
          onClick={() => onOpenEditColumn(column)}
          className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0 mr-1"
          title="Clique para editar etapa"
        >
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${colorConfig.dotColor}`} />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-wide truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {column.title}
          </h2>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold shrink-0 border ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Ações da Coluna */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onQuickAdd(column.id)}
            className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer shadow-xs"
            title={`Adicionar card em ${column.title}`}
          >
            <Plus className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer shadow-xs">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1424] backdrop-blur-2xl p-1.5 text-xs shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => onOpenEditColumn(column)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              >
                <Sliders className="h-3.5 w-3.5 text-cyan-500" />
                <span>Personalizar Etapa</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={isFirst}
                onClick={() => onMoveColumn(column.id, "left")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Mover para Esquerda</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={isLast}
                onClick={() => onMoveColumn(column.id, "right")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Mover para Direita</span>
              </DropdownMenuItem>

              {tasks.length > 0 && (
                <DropdownMenuItem
                  onClick={() => onClearTasks(column.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  <span>Limpar {tasks.length} cards</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10 my-1" />

              <DropdownMenuItem
                disabled={totalColumns <= 1}
                onClick={() => onOpenDeleteColumn(column)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Etapa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards Stack */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 dark:border-white/10 p-6 text-center transition-all ${
              isOver ? "border-cyan-500/50 bg-cyan-500/10 scale-[0.98]" : ""
            }`}
          >
            <p className="text-xs text-slate-500 font-medium">Nenhum card aqui</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">
              Arraste para cá ou use o + acima
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onDragStart={() => {}}
              onDragEnd={() => setIsOver(false)}
            />
          ))
        )}
      </div>
    </div>
  );
}
