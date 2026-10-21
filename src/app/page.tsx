"use client";

import { useState } from "react";
import { usePlanner } from "@/lib/planner-store";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { NewCardDialog } from "@/components/kanban/new-card-dialog";
import { NewColumnDialog } from "@/components/kanban/new-column-dialog";
import { Code2 } from "lucide-react";

export default function PlannerPage() {
  const {
    columns,
    tasks,
    allTasks,
    isLoaded,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    // Column operations
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
    clearColumnTasks,
    // Task operations
    moveTask,
    addTask,
    deleteTask,
  } = usePlanner();

  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("todo");

  const handleQuickAdd = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsCardDialogOpen(true);
  };

  const handleOpenGeneralAdd = () => {
    setSelectedColumn(columns[0]?.id || "todo");
    setIsCardDialogOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#090d16] text-slate-500">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest font-mono text-slate-600 dark:text-slate-400">
            Carregando Planner...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090d16] dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30 dark:opacity-100">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-rose-500/5 blur-[140px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6 flex-1">
        {/* Header do Board */}
        <KanbanHeader
          tasks={allTasks}
          columnsCount={columns.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onOpenNewCard={handleOpenGeneralAdd}
          onOpenNewColumn={() => setIsColumnDialogOpen(true)}
        />

        {/* Quadro Kanban Dinâmico com Drag & Drop */}
        <div className="flex-1 w-full">
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onQuickAdd={handleQuickAdd}
            onAddColumn={addColumn}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
            onMoveColumn={moveColumn}
            onClearColumnTasks={clearColumnTasks}
          />
        </div>

        {/* Footer */}
        <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-4 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            <span>planner • Personal Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Renanbritto/rn-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <Code2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>GitHub: Renanbritto/rn-planner</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Modal Novo Card com Colunas Dinâmicas */}
      <NewCardDialog
        open={isCardDialogOpen}
        onOpenChange={setIsCardDialogOpen}
        columns={columns}
        defaultColumn={selectedColumn}
        onAddCard={addTask}
      />

      {/* Modal Nova Etapa */}
      <NewColumnDialog
        open={isColumnDialogOpen}
        onOpenChange={setIsColumnDialogOpen}
        onAddColumn={addColumn}
      />
    </div>
  );
}