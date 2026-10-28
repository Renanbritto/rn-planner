"use client";

import { useState } from "react";
import {
  KanbanColumnDef,
  PlannerTask,
  ColumnColor,
  ColumnSortOption,
  StatusBadge,
  formatCardCode,
} from "@/types/planner";
import { KanbanColumn } from "./kanban-column";
import { ColumnActionsDialog } from "./column-actions-dialog";
import { DeleteColumnDialog } from "./delete-column-dialog";
import { NewColumnDialog } from "./new-column-dialog";
import { CardDetailsDialog } from "./card-details-dialog";
import { Plus, X } from "lucide-react";

interface KanbanBoardProps {
  columns: KanbanColumnDef[];
  tasks: PlannerTask[];
  statusBadges?: StatusBadge[];
  onAddStatusBadge?: (label: string, color: string) => StatusBadge;
  onDeleteStatusBadge?: (id: string) => void;
  onMoveTask: (taskId: string, targetColumn: string) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (columnId: string) => void;
  onAddColumn: (title: string, color?: ColumnColor) => void;
  onUpdateColumn: (
    columnId: string,
    updates: { title?: string; color?: ColumnColor; sortBy?: ColumnSortOption }
  ) => void;
  onDeleteColumn: (columnId: string, options?: { moveTasksToColumnId?: string }) => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  onClearColumnTasks: (columnId: string) => void;
  onUpdateTask: (id: string, updates: Partial<PlannerTask>) => void;
}

export function KanbanBoard({
  columns,
  tasks,
  statusBadges = [],
  onAddStatusBadge,
  onDeleteStatusBadge,
  onMoveTask,
  onDeleteTask,
  onQuickAdd,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumn,
  onClearColumnTasks,
  onUpdateTask,
}: KanbanBoardProps) {
  const [editingColumn, setEditingColumn] = useState<KanbanColumnDef | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<KanbanColumnDef | null>(null);
  const [isNewColDialogOpen, setIsNewColDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlannerTask | null>(null);

  // Estados de movimentação de card (arrastar ou selecionar no mobile)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [selectedTaskToMove, setSelectedTaskToMove] = useState<PlannerTask | null>(null);

  const activeMoveTaskId = draggingTaskId || selectedTaskToMove?.id || null;
  const activeMoveTask = activeMoveTaskId
    ? tasks.find((t) => t.id === activeMoveTaskId) || null
    : null;

  const handleMoveTaskWithFeedback = (taskId: string, targetColumn: string) => {
    onMoveTask(taskId, targetColumn);
    setDraggingTaskId(null);
    setSelectedTaskToMove(null);
  };

  const activeTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  const deletingColumnTasksCount = deletingColumn
    ? tasks.filter((t) => t.column === deletingColumn.id).length
    : 0;

  return (
    <div className="w-full relative">
      {/* Container flex com scroll horizontal responsivo para qualquer quantidade de etapas */}
      <div className="flex items-start gap-5 overflow-x-auto pb-6 pt-1 px-1 scrollbar-thin scrollbar-thumb-white/10">
        {columns.map((col, index) => {
          const columnTasks = tasks.filter((t) => t.column === col.id);

          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columnTasks}
              allColumns={columns}
              statusBadges={statusBadges}
              isFirst={index === 0}
              isLast={index === columns.length - 1}
              totalColumns={columns.length}
              activeMoveTaskId={activeMoveTaskId}
              activeMoveTask={activeMoveTask}
              selectedTaskToMove={selectedTaskToMove}
              onSelectTaskToMove={(task) => {
                setSelectedTaskToMove((prev) => (prev?.id === task.id ? null : task));
              }}
              onMoveTask={handleMoveTaskWithFeedback}
              onDeleteTask={onDeleteTask}
              onQuickAdd={onQuickAdd}
              onOpenEditColumn={(c) => setEditingColumn(c)}
              onOpenDeleteColumn={(c) => setDeletingColumn(c)}
              onMoveColumn={onMoveColumn}
              onClearTasks={onClearColumnTasks}
              onCardClick={(task) => setSelectedTask(task)}
              onUpdateColumnSort={(columnId, sortBy) =>
                onUpdateColumn(columnId, { sortBy })
              }
              onDragStartTask={(id) => setDraggingTaskId(id)}
              onDragEndTask={() => {
                setDraggingTaskId(null);
                setSelectedTaskToMove(null);
              }}
            />
          );
        })}

        {/* Ghost Card para Adicionar Nova Coluna diretamente no Board */}
        <button
          type="button"
          onClick={() => setIsNewColDialogOpen(true)}
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-cyan-500/50 bg-white/60 dark:bg-[#0b0f1a]/60 hover:bg-white dark:hover:bg-[#0b0f1a]/95 backdrop-blur-2xl p-6 min-h-[580px] w-full min-w-[240px] max-w-[280px] shrink-0 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl dark:shadow-xl dark:shadow-black/20 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 group-hover:border-cyan-500/30 bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-all shadow-xs group-hover:scale-110">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-comfortaa mt-3 text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
            Nova Etapa
          </span>
          <span className="text-[11px] text-slate-500 mt-1 text-center font-mono">
            Adicione uma nova etapa ao seu fluxo de trabalho
          </span>
        </button>
      </div>

      {/* Floating Action Bar quando um card está selecionado para mover (Excelente no Mobile) */}
      {selectedTaskToMove && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-[#0b0f1a]/98 backdrop-blur-2xl border border-cyan-500/50 shadow-2xl shadow-cyan-500/30 text-white animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="font-mono font-extrabold text-xs text-cyan-400">
              {formatCardCode(selectedTaskToMove.code)}
            </span>
            <span className="font-comfortaa text-xs font-medium text-slate-200 hidden sm:inline truncate max-w-[180px]">
              {selectedTaskToMove.title}
            </span>
            <span className="text-[11px] text-cyan-300/90 font-sans">
              • Toque na etapa desejada
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTaskToMove(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-comfortaa font-bold text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancelar</span>
          </button>
        </div>
      )}

      {/* Modal de Detalhes e Edição do Card */}
      <CardDetailsDialog
        open={Boolean(selectedTask)}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={activeTask}
        columns={columns}
        statusBadges={statusBadges}
        onAddStatusBadge={onAddStatusBadge}
        onDeleteStatusBadge={onDeleteStatusBadge}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />

      {/* Modal de Personalizar / Renomear Coluna */}
      <ColumnActionsDialog
        open={Boolean(editingColumn)}
        onOpenChange={(open) => !open && setEditingColumn(null)}
        column={editingColumn}
        onUpdateColumn={onUpdateColumn}
      />

      {/* Modal Seguro de Excluir Coluna */}
      <DeleteColumnDialog
        open={Boolean(deletingColumn)}
        onOpenChange={(open) => !open && setDeletingColumn(null)}
        column={deletingColumn}
        tasksCount={deletingColumnTasksCount}
        availableColumns={columns}
        onConfirmDelete={onDeleteColumn}
      />

      {/* Modal de Criar Nova Coluna */}
      <NewColumnDialog
        open={isNewColDialogOpen}
        onOpenChange={setIsNewColDialogOpen}
        onAddColumn={onAddColumn}
      />
    </div>
  );
}
