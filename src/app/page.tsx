"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlanner } from "@/lib/planner-store";
import { LoginView } from "@/components/auth/login-view";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { WhiteboardWrapper } from "@/components/whiteboard/whiteboard-wrapper";
import { NewCardDialog } from "@/components/kanban/new-card-dialog";
import { NewColumnDialog } from "@/components/kanban/new-column-dialog";
import { NewWorkspaceDialog } from "@/components/workspace/new-workspace-dialog";
import { Code2 } from "lucide-react";

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<"kanban" | "whiteboard">("kanban");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rn_planner_sidebar_collapsed_v1");
      if (saved !== null) {
        return saved === "true";
      }
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSetSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    setIsSidebarCollapsed((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      if (typeof window !== "undefined") {
        localStorage.setItem("rn_planner_sidebar_collapsed_v1", String(next));
      }
      return next;
    });
  };

  const { user, loading: authLoading, isGuestMode } = useAuth();
  const {
    // Workspace state
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    addWorkspace,
    // Column & Task state
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
    applySortToAllColumns,
    // Task operations
    moveTask,
    addTask,
    deleteTask,
    updateTask,
    // Sync
    syncStatus,
    syncLocalToCloud,
  } = usePlanner();

  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  const handleQuickAdd = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsCardDialogOpen(true);
  };

  const handleOpenGeneralAdd = () => {
    setSelectedColumn(columns[0]?.id || "");
    setIsCardDialogOpen(true);
  };

  // 1. Carregando autenticação
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3 bg-white/90 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-slate-700 dark:text-slate-300">
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3 bg-white/90 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-slate-700 dark:text-slate-300">
            Carregando Planner...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-row antialiased transition-colors duration-200">
      {/* Atmospheric Neon Ambient Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#06b6d4]/8 dark:bg-[#06b6d4]/8 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-[#f43f5e]/6 dark:bg-[#f43f5e]/6 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/5 blur-[150px]" />
      </div>

      {/* Menu Retrátil Lateral (Sidebar estilo Linear/Notion com Seletor de Workspace, Card e Excalidraw) */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasksCount={allTasks.length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleSetSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspaceId}
        onOpenNewWorkspace={() => setIsNewWorkspaceDialogOpen(true)}
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
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
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
            onApplySortToAllColumns={applySortToAllColumns}
          />

          {/* Alternância entre Quadro Kanban e Whiteboard Canvas (Excalidraw) */}
          {activeTab === "kanban" ? (
            <div className="flex-1 w-full animate-in fade-in duration-200">
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
                onUpdateTask={updateTask}
              />
            </div>
          ) : (
            <div className="flex-1 w-full animate-in fade-in duration-200">
              <WhiteboardWrapper key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
            </div>
          )}

          {/* Footer Obsidian Glass */}
          <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <span className="font-comfortaa font-medium text-slate-700 dark:text-slate-300">
                RN Planner • {activeWorkspace.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Renanbritto/rn-planner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <Code2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                <span className="font-mono text-[11px]">Renanbritto/rn-planner</span>
              </a>
            </div>
          </footer>
        </main>
      </div>

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

      {/* Modal Novo Workspace */}
      <NewWorkspaceDialog
        open={isNewWorkspaceDialogOpen}
        onOpenChange={setIsNewWorkspaceDialogOpen}
        onCreateWorkspace={addWorkspace}
      />
    </div>
  );
}