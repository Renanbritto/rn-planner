"use client";

import { useState, useEffect } from "react";
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
import { EditWorkspaceDialog } from "@/components/workspace/edit-workspace-dialog";
import { GuidedTour, TourStep } from "@/components/onboarding/guided-tour";
import { Workspace } from "@/types/planner";
import { Code2, Sliders } from "lucide-react";

const TOUR_STORAGE_KEY = "rn_planner_guided_tour_completed_v1";

const isMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

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
    updateWorkspace,
    deleteWorkspace,
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
    // Status Badges
    statusBadges,
    addStatusBadge,
    deleteStatusBadge,
    // Sync
    syncStatus,
    syncLocalToCloud,
  } = usePlanner();

  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Tour guiado automático no primeiro login / primeiro acesso
  useEffect(() => {
    if (!isLoaded) return;
    if (localStorage.getItem(TOUR_STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setIsTourOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [isLoaded]);

  const handleCloseTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsTourOpen(false);
    setIsNewWorkspaceDialogOpen(false);
    setIsCardDialogOpen(false);
  };

  // No mobile a sidebar é um drawer: abre/fecha automaticamente nos passos que a usam
  const openSidebarOnMobile = () => {
    if (isMobileViewport()) setIsMobileSidebarOpen(true);
  };
  const closeSidebarOnMobile = () => {
    if (isMobileViewport()) setIsMobileSidebarOpen(false);
  };

  const tourSteps: TourStep[] = [
    {
      id: "welcome",
      placement: "center",
      title: "Bem-vindo ao RN Planner 👋",
      content: (
        <>
          Eu sou o <strong>RN Guide</strong>. Em menos de 1 minuto vou te mostrar, na prática,
          como se organizar aqui!
        </>
      ),
      onEnter: () => setActiveTab("kanban"),
    },
    {
      id: "workspace",
      target: "workspace-switcher",
      placement: "right",
      title: "Workspaces separados ",
      content: (
        <>
          Cada <strong>workspace</strong> representa uma área diferente da sua vida. Por exemplo: você pode criar um Workspace para suas rotinas diárias e outro, separado, para seus compromissos acadêmicos.
        </>
      ),
      onEnter: openSidebarOnMobile,
      onExit: closeSidebarOnMobile,
    },
    {
      id: "create-workspace",
      target: "new-workspace-dialog",
      placement: "right",
      title: "Criação de Workspace",
      content: (
        <>
          Aqui você cria um novo espaço: escolha o <strong>nome</strong>, um <strong>ícone</strong> ou avatar personalizado e a <strong>cor</strong> temática. Tudo o que você fizer aqui ficará exclusivo desta área.
        </>
      ),
      onEnter: () => {
        closeSidebarOnMobile();
        setIsNewWorkspaceDialogOpen(true);
      },
      onExit: () => setIsNewWorkspaceDialogOpen(false),
    },
    {
      id: "new-card",
      target: "new-card",
      placement: "bottom",
      title: "Crie micro-entregas",
      content: (
        <>
          Toda tarefa começa aqui. Clique para criá-la e preencha todos os dados necessários.
        </>
      ),
    },
    {
      id: "create-card",
      target: "new-card-dialog",
      placement: "right",
      title: "Criação de Card",
      content: (
        <>
          Aqui você cadastra a tarefa: digite o <strong>título</strong>, defina a <strong>etapa inicial</strong>, a <strong>prioridade</strong> (P1 ao P4), a <strong>categoria</strong> e o prazo. Preencha os campos e adicione ao seu quadro!
        </>
      ),
      onEnter: () => {
        setSelectedColumn(columns[0]?.id || "");
        setIsCardDialogOpen(true);
      },
      onExit: () => setIsCardDialogOpen(false),
    },
    {
      id: "metrics",
      target: "metrics",
      optional: true,
      placement: "bottom",
      title: "Seu painel de comando",
      content: (
        <>
          Total, em execução, críticas e concluídas. Se <strong>Em Execução</strong> passar de 3,
          pare de puxar tarefas e termine o que começou.
        </>
      ),
    },
    {
      id: "column",
      target: "kanban-column",
      placement: "right",
      title: "Seu fluxo de trabalho",
      content: (
        <>
          Cada coluna é uma etapa. Clique no título para renomear ou mudar a cor, e use o{" "}
          <strong>[+]</strong> para criar um card direto nela.
        </>
      ),
    },
    {
      id: "card",
      target: "kanban-card",
      optional: true,
      placement: "right",
      title: "Arraste e evolua",
      content: (
        <>
          Clique num card para ver detalhes, checklist e selos de status. Arraste entre as colunas
          para avançar no fluxo.
        </>
      ),
    },
    {
      id: "filters",
      target: "filters",
      placement: "bottom",
      title: "Filtros de tarefas",
      content: <>Filtre por texto, categoria ou prioridade para ver só o que importa agora.</>,
    },
    {
      id: "go-whiteboard",
      target: "nav-whiteboard",
      action: "click",
      placement: "right",
      title: "Rascunha Infinito!",
      content: (
        <>
          Antes de executar, pense visualmente. Abra o <strong>Excalidraw</strong>, o quadro branco
          integrado.
        </>
      ),
      actionHint: "Clique em “Excalidraw” para continuar",
      onEnter: () => {
        setActiveTab("kanban");
        openSidebarOnMobile();
      },
      onExit: closeSidebarOnMobile,
    },
    {
      id: "whiteboard",
      target: "whiteboard",
      padding: 4,
      title: "Rascunhe a vontade",
      content: (
        <>
          Desenhe arquitetura, fluxos e ideias soltas. Cada workspace tem seu próprio quadro, salvo
          automaticamente.
        </>
      ),
      onEnter: () => setActiveTab("whiteboard"),
    },
    {
      id: "go-kanban",
      target: "nav-kanban",
      action: "click",
      placement: "right",
      title: "Do rascunho para a ação",
      content: <>Desenhou? Agora transforme o rascunho em cards. Volte para o quadro.</>,
      actionHint: "Clique em “Card” para voltar ao quadro",
      onEnter: () => {
        setActiveTab("whiteboard");
        openSidebarOnMobile();
      },
      onExit: closeSidebarOnMobile,
    },
    {
      id: "tutorial-button",
      target: "tutorial-button",
      title: "Precisa rever?",
      content: <>Este botão reabre o tour sempre que quiser.</>,
      onEnter: () => setActiveTab("kanban"),
    },
    {
      id: "done",
      placement: "center",
      title: "Turotial cumprido! 🏆",
      content: (
        <div className="flex flex-col gap-2">
          <span>Agora aplique o protocolo diário em 3 passos:</span>
          <ol className="flex flex-col gap-1.5 pl-1">
            <li>
              <strong className="text-cyan-600 dark:text-cyan-400">1.</strong> Escolha 1 ou 2
              tarefas <strong>P1</strong> que destravam o dia.
            </li>
            <li>
              <strong className="text-cyan-600 dark:text-cyan-400">2.</strong> No máximo{" "}
              <strong>3 cards</strong> em andamento ao mesmo tempo.
            </li>
            <li>
              <strong className="text-cyan-600 dark:text-cyan-400">3.</strong> Bloqueou? Marque{" "}
              <em>Aguardando</em>. Terminou? <em>Concluído</em>.
            </li>
          </ol>
        </div>
      ),
    },
  ];

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
        onOpenEditWorkspace={(ws) => setEditingWorkspace(ws)}
        onOpenTutorial={() => setIsTourOpen(true)}
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
            onOpenTutorial={() => setIsTourOpen(true)}
          />

          {/* Alternância entre Quadro Kanban e Whiteboard Canvas (Excalidraw) */}
          {activeTab === "kanban" ? (
            <div className="flex-1 w-full animate-in fade-in duration-200">
              <KanbanBoard
                columns={columns}
                tasks={tasks}
                statusBadges={statusBadges}
                onAddStatusBadge={addStatusBadge}
                onDeleteStatusBadge={deleteStatusBadge}
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
            <div data-tour="whiteboard" className="flex-1 w-full animate-in fade-in duration-200">
              <WhiteboardWrapper key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
            </div>
          )}

          {/* Footer Obsidian Glass */}
          <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <button
                type="button"
                onClick={() => setEditingWorkspace(activeWorkspace)}
                className="font-comfortaa font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Editar este workspace"
              >
                <span>RN Planner • {activeWorkspace.name}</span>
                <Sliders className="h-3 w-3 text-cyan-500/70" />
              </button>
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
        statusBadges={statusBadges}
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

      {/* Modal Editar Workspace */}
      <EditWorkspaceDialog
        open={Boolean(editingWorkspace)}
        onOpenChange={(open) => {
          if (!open) setEditingWorkspace(null);
        }}
        workspace={editingWorkspace}
        totalWorkspaces={workspaces.length}
        onUpdateWorkspace={updateWorkspace}
        onDeleteWorkspace={deleteWorkspace}
      />

      {/* Tour guiado estilo jogo (primeiro acesso ou sob demanda) */}
      {isTourOpen && <GuidedTour steps={tourSteps} onClose={handleCloseTour} />}
    </div>
  );
}