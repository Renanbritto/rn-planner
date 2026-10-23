"use client";

import { useState } from "react";
import { KanbanColumnDef, PlannerTask, ColumnColor } from "@/types/planner";
import { KanbanColumn } from "./kanban-column";
import { ColumnActionsDialog } from "./column-actions-dialog";
import { DeleteColumnDialog } from "./delete-column-dialog";
import { NewColumnDialog } from "./new-column-dialog";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
  columns: KanbanColumnDef[];
  tasks: PlannerTask[];
  onMoveTask: (taskId: string, targetColumn: string) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (columnId: string) => void;
  onAddColumn: (title: string, color?: ColumnColor) => void;
  onUpdateColumn: (columnId: string, updates: { title?: string; color?: ColumnColor }) => void;
  onDeleteColumn: (columnId: string, options?: { moveTasksToColumnId?: string }) => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  onClearColumnTasks: (columnId: string) => void;
}

export function KanbanBoard({
  columns,
  tasks,
  onMoveTask,
  onDeleteTask,
  onQuickAdd,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumn,
  onClearColumnTasks,
}: KanbanBoardProps) {
  const [editingColumn, setEditingColumn] = useState<KanbanColumnDef | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<KanbanColumnDef | null>(null);
  const [isNewColDialogOpen, setIsNewColDialogOpen] = useState(false);

  const deletingColumnTasksCount = deletingColumn
    ? tasks.filter((t) => t.column === deletingColumn.id).length
    : 0;

  return (
    <div className="w-full">
      {/* Container flex com scroll horizontal responsivo para qualquer quantidade de etapas */}
      <div className="flex items-start gap-5 overflow-x-auto pb-6 pt-1 px-1 scrollbar-thin scrollbar-thumb-white/10">
        {columns.map((col, index) => {
          const columnTasks = tasks.filter((t) => t.column === col.id);

          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columnTasks}
              isFirst={index === 0}
              isLast={index === columns.length - 1}
              totalColumns={columns.length}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
              onQuickAdd={onQuickAdd}
              onOpenEditColumn={(c) => setEditingColumn(c)}
              onOpenDeleteColumn={(c) => setDeletingColumn(c)}
              onMoveColumn={onMoveColumn}
              onClearTasks={onClearColumnTasks}
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
