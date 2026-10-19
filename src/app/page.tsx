"use client";

import { useState } from "react";
import { usePlanner } from "@/lib/planner-store";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { NewCardDialog } from "@/components/kanban/new-card-dialog";
import { KanbanColumn } from "@/types/planner";
import { Code2, Sparkles } from "lucide-react";

export default function PlannerPage() {
  const {
    tasks,
    allTasks,
    isLoaded,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    moveTask,
    addTask,
    deleteTask,
  } = usePlanner();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn>("todo");

  const handleQuickAdd = (columnId: KanbanColumn) => {
    setSelectedColumn(columnId);
    setIsDialogOpen(true);
  };

  const handleOpenGeneralAdd = () => {
    setSelectedColumn("todo");
    setIsDialogOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest font-mono">
            Carregando Azure Board...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-rose-500/5 blur-[140px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6 flex-1">
        {/* Header Azure DevOps */}
        <KanbanHeader
          tasks={allTasks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onOpenNewCard={handleOpenGeneralAdd}
        />

        {/* Quadro Kanban Drag & Drop */}
        <div className="flex-1">
          <KanbanBoard
            tasks={tasks}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onQuickAdd={handleQuickAdd}
          />
        </div>

        {/* Footer */}
        <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>RN Planner • Azure DevOps Agile Board</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Renanbritto/rn-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>GitHub: Renanbritto/rn-planner</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Modal Novo Card */}
      <NewCardDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultColumn={selectedColumn}
        onAddCard={addTask}
      />
    </div>
  );
}
