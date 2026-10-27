"use client";

import { useState, useMemo } from "react";
import {
  KanbanColumnDef,
  PlannerTask,
  ColumnSortOption,
  getColumnColorConfig,
  getColumnSortConfig,
  sortTasks,
} from "@/types/planner";
import { KanbanCard } from "./kanban-card";
import {
  Plus,
  MoreHorizontal,
  Sliders,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Eraser,
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  AlertCircle,
  Calendar,
  GripVertical,
  Check,
  X,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
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
  allColumns?: KanbanColumnDef[];
  isFirst: boolean;
  isLast: boolean;
  totalColumns: number;
  activeMoveTaskId?: string | null;
  activeMoveTask?: PlannerTask | null;
  selectedTaskToMove?: PlannerTask | null;
  onSelectTaskToMove?: (task: PlannerTask) => void;
  onMoveTask: (taskId: string, targetColumn: string) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (columnId: string) => void;
  onOpenEditColumn: (column: KanbanColumnDef) => void;
  onOpenDeleteColumn: (column: KanbanColumnDef) => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  onClearTasks: (columnId: string) => void;
  onCardClick: (task: PlannerTask) => void;
  onUpdateColumnSort?: (columnId: string, sortBy: ColumnSortOption) => void;
  onDragStartTask?: (taskId: string) => void;
  onDragEndTask?: () => void;
}

export function KanbanColumn({
  column,
  tasks,
  allColumns = [],
  isFirst,
  isLast,
  totalColumns,
  activeMoveTaskId,
  activeMoveTask,
  selectedTaskToMove,
  onSelectTaskToMove,
  onMoveTask,
  onDeleteTask,
  onQuickAdd,
  onOpenEditColumn,
  onOpenDeleteColumn,
  onMoveColumn,
  onClearTasks,
  onCardClick,
  onUpdateColumnSort,
  onDragStartTask,
  onDragEndTask,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const colorConfig = getColumnColorConfig(column.color);
  const isSorted = Boolean(column.sortBy && column.sortBy !== "manual");
  const sortConfig = getColumnSortConfig(column.sortBy);

  // Verifica se há movimentação ativa e se esta coluna é o destino (não a origem)
  const isMoveActive = Boolean(activeMoveTaskId);
  const isSourceColumn = Boolean(
    activeMoveTaskId && tasks.some((t) => t.id === activeMoveTaskId)
  );
  const isTargetColumn = isMoveActive && !isSourceColumn;

  const sortedTasks = useMemo(() => {
    return sortTasks(tasks, column.sortBy || "manual");
  }, [tasks, column.sortBy]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain") || activeMoveTaskId;
    if (taskId) {
      onMoveTask(taskId, column.id);
      onDragEndTask?.();
      toast.success(`Card movido para "${column.title}"!`);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl border p-4 transition-all duration-200 min-h-[580px] w-full min-w-[280px] max-w-[360px] backdrop-blur-2xl shadow-xl select-none relative ${
        isOver
          ? "border-cyan-400 bg-cyan-500/10 dark:bg-[#0e1c33]/95 shadow-2xl shadow-cyan-500/20 scale-[1.01]"
          : isTargetColumn
          ? "border-cyan-500/40 border-dashed bg-slate-50/90 dark:bg-[#0b1220]/95 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20"
          : isSourceColumn
          ? "border-slate-300 dark:border-white/10 bg-slate-100/70 dark:bg-[#0b0f1a]/95 opacity-90"
          : "border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100/80 dark:bg-[#0b0f1a]/95"
      }`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-3">
        <div
          onClick={() => onOpenEditColumn(column)}
          className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0 mr-1"
          title="Clique para editar etapa"
        >
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${colorConfig.dotColor} shadow-[0_0_6px_currentColor]`} />
          <h2 className="font-comfortaa text-sm font-bold text-slate-800 dark:text-white tracking-wide truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {column.title}
          </h2>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-mono font-extrabold shrink-0 border ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
          >
            {tasks.length}
          </span>
          {isSourceColumn && (
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              origem
            </span>
          )}
        </div>

        {/* Ações da Coluna */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onQuickAdd(column.id)}
            className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/30 transition-all cursor-pointer shadow-xs"
            title={`Adicionar card em ${column.title}`}
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Botão de Ordenar Cards */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex h-7 w-7 items-center justify-center rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSorted
                  ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                  : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20"
              }`}
              title={isSorted ? `Ordenado: ${sortConfig.label}` : `Ordenar cards em ${column.title}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/98 backdrop-blur-2xl p-1.5 text-xs shadow-2xl"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-comfortaa font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
                <span>Ordenar Cards</span>
                {isSorted && (
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono lowercase">ativo</span>
                )}
              </div>

              {/* Ordem Manual */}
              <DropdownMenuItem
                onClick={() => onUpdateColumnSort?.(column.id, "manual")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ordem manual (Padrão)</span>
                </div>
                {(!column.sortBy || column.sortBy === "manual") && (
                  <Check className="h-3.5 w-3.5 text-cyan-500" />
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />

              <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                Por Prioridade
              </div>
              <DropdownMenuItem
                onClick={() => onUpdateColumnSort?.(column.id, "priority-desc")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Maior prioridade (Crítica → Baixa)</span>
                </div>
                {column.sortBy === "priority-desc" && (
                  <Check className="h-3.5 w-3.5 text-cyan-500" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateColumnSort?.(column.id, "priority-asc")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Menor prioridade (Baixa → Crítica)</span>
                </div>
                {column.sortBy === "priority-asc" && (
                  <Check className="h-3.5 w-3.5 text-cyan-500" />
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />

              <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                Por Data de Criação
              </div>
              <DropdownMenuItem
                onClick={() => onUpdateColumnSort?.(column.id, "date-desc")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownWideNarrow className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Mais novo para o mais antigo</span>
                </div>
                {column.sortBy === "date-desc" && (
                  <Check className="h-3.5 w-3.5 text-cyan-500" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateColumnSort?.(column.id, "date-asc")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpNarrowWide className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Mais antigo para o mais novo</span>
                </div>
                {column.sortBy === "date-asc" && (
                  <Check className="h-3.5 w-3.5 text-cyan-500" />
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />

              <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                Por Prazo de Entrega
              </div>
              <DropdownMenuItem
                onClick={() => onUpdateColumnSort?.(column.id, "due-asc")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  <span>Prazo mais próximo (Urgente)</span>
                </div>
                {column.sortBy === "due-asc" && (
                  <Check className="h-3.5 w-3.5 text-cyan-500" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer shadow-xs">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-1.5 text-xs shadow-2xl"
            >
              <DropdownMenuItem
                onClick={() => onOpenEditColumn(column)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium"
              >
                <Sliders className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                <span>Personalizar Etapa</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={isFirst}
                onClick={() => onMoveColumn(column.id, "left")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Mover para Esquerda</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={isLast}
                onClick={() => onMoveColumn(column.id, "right")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] font-comfortaa font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Mover para Direita</span>
              </DropdownMenuItem>

              {isSorted && (
                <DropdownMenuItem
                  onClick={() => onUpdateColumnSort?.(column.id, "manual")}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 font-comfortaa font-medium"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  <span>Redefinir para Manual</span>
                </DropdownMenuItem>
              )}

              {tasks.length > 0 && (
                <DropdownMenuItem
                  onClick={() => onClearTasks(column.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-comfortaa font-medium"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  <span>Limpar {tasks.length} cards</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />

              <DropdownMenuItem
                disabled={totalColumns <= 1}
                onClick={() => onOpenDeleteColumn(column)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-comfortaa font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Etapa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pill Informativa de Ordenação Ativa */}
      {isSorted && (
        <div className="flex items-center justify-between px-2.5 py-1.5 mb-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-comfortaa animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <ArrowUpDown className="h-3 w-3 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span className="font-semibold text-[11px] truncate">
              {sortConfig.label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onUpdateColumnSort?.(column.id, "manual")}
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-white p-0.5 rounded-md hover:bg-cyan-500/20 transition-colors ml-1 cursor-pointer shrink-0"
            title="Restaurar ordem manual"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Botão/Área de Destino Sinalizada quando um Card está selecionado para mover */}
      {isTargetColumn && (
        <button
          type="button"
          onClick={() => {
            if (activeMoveTaskId) {
              onMoveTask(activeMoveTaskId, column.id);
              onDragEndTask?.();
              toast.success(`Card movido para "${column.title}"!`);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 mb-3 rounded-xl border-2 border-dashed transition-all cursor-pointer font-comfortaa font-bold text-xs ${
            isOver
              ? "border-cyan-400 bg-cyan-500/25 text-cyan-950 dark:text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02] animate-pulse"
              : "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-[1.01]"
          }`}
          title={`Clique para soltar o card em ${column.title}`}
        >
          <ArrowDown className={`h-4 w-4 ${isOver ? "animate-bounce text-cyan-400" : "text-cyan-500"}`} />
          <span>
            {isOver
              ? `Soltar agora em "${column.title}"`
              : `Mover card para ${column.title}`}
          </span>
        </button>
      )}

      {/* Cards Stack */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
        {sortedTasks.length === 0 ? (
          <div
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 dark:border-white/10 p-6 text-center transition-all ${
              isOver
                ? "border-cyan-500/50 bg-cyan-500/10 scale-[0.98]"
                : "bg-white/40 dark:bg-white/[0.01]"
            }`}
          >
            <p className="font-comfortaa text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhum card nesta etapa
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              {isTargetColumn ? "Toque acima para mover para cá" : "Arraste para cá ou use o botão +"}
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              columns={allColumns}
              isDragging={activeMoveTaskId === task.id}
              isSelectedToMove={selectedTaskToMove?.id === task.id}
              onDelete={onDeleteTask}
              onDragStart={() => {
                onDragStartTask?.(task.id);
              }}
              onDragEnd={() => {
                setIsOver(false);
                onDragEndTask?.();
              }}
              onClick={onCardClick}
              onSelectToMove={onSelectTaskToMove}
              onMoveToColumn={onMoveTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
