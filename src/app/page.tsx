"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlanner } from "@/lib/planner-store";
import { LoginView } from "@/components/auth/login-view";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { NewCardDialog } from "@/components/kanban/new-card-dialog";
import { NewColumnDialog } from "@/components/kanban/new-column-dialog";
import { Code2 } from "lucide-react";

export default function PlannerPage() {
  const { user, loading: authLoading, isGuestMode } = useAuth();
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
    // Sync
    syncStatus,
    syncLocalToCloud,
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

  // 1. Carregando autenticação
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-400">
        <div className="flex items-center gap-3 bg-[#0b0f1a]/95 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">
            Conectando Workspace...
          </span>
        </div>
      </div>
    );
  }

  // 2. Não autenticado e não convidado: Página Inicial de Login
  if (!user && !isGuestMode) {
    return <LoginView />;
  }

  // 3. Carregando dados do quadro
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-400">
        <div className="flex items-center gap-3 bg-[#0b0f1a]/95 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">
            Carregando Planner...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      {/* Atmospheric Neon Ambient Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#06b6d4]/8 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-[#f43f5e]/6 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#10b981]/5 blur-[150px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6 flex-1">
        {/* Header do Board com Métricas Neon Obsidian */}
        <KanbanHeader
          tasks={allTasks}
          columnsCount={columns.length}
          syncStatus={syncStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onOpenNewCard={handleOpenGeneralAdd}
          onOpenNewColumn={() => setIsColumnDialogOpen(true)}
          onSyncLocalToCloud={syncLocalToCloud}
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

        {/* Footer Obsidian Glass */}
        <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="font-comfortaa font-medium text-slate-300">planner • Personal Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Renanbritto/rn-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span className="font-mono text-[11px]">Renanbritto/rn-planner</span>
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