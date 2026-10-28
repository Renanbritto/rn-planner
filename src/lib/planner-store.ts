"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PlannerTask,
  KanbanColumnDef,
  ColumnColor,
  ColumnSortOption,
  Priority,
  TaskCategory,
  Workspace,
  DEFAULT_WORKSPACE,
  extractWorkspaceIdFromColumnId,
  StatusBadge,
  DEFAULT_STATUS_BADGES,
  CardComment,
  extractTaskMetadata,
  formatCardCode,
} from "@/types/planner";
import { useAuth } from "./auth-context";
import {
  PlannerService,
  DEFAULT_COLUMNS,
  DEMO_TASK_IDS,
} from "./services/planner-service";
import { toast } from "sonner";

export type SyncStatus = "synced" | "syncing" | "local" | "needs_schema" | "error";

// Sanitizador simples para segurança de inputs
function sanitizeString(str: string, maxLength = 50): string {
  return str
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

// Sanitizador para descrições ricas com suporte a imagens em base64/URLs
function sanitizeDescription(str: string, maxLength = 2000000): string {
  return str
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function getStoredLocalWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return [DEFAULT_WORKSPACE];
  try {
    const stored = localStorage.getItem("rn_planner_workspaces");
    if (stored) {
      const parsed: Workspace[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar workspaces do LocalStorage", e);
  }
  return [DEFAULT_WORKSPACE];
}

function getStoredActiveWorkspaceId(): string {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE.id;
  try {
    const stored = localStorage.getItem("rn_planner_active_workspace_id");
    if (stored) return stored;
  } catch (e) {
    console.warn("Erro ao carregar workspace ativo", e);
  }
  return DEFAULT_WORKSPACE.id;
}

function getStoredLocalSorts(): Record<string, ColumnSortOption> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("rn_planner_column_sorts");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Erro ao carregar ordenações do LocalStorage", e);
  }
  return {};
}

function getStoredLocalColumns(): KanbanColumnDef[] {
  const sortsMap = getStoredLocalSorts();
  if (typeof window === "undefined") {
    return DEFAULT_COLUMNS.map((c) => ({
      ...c,
      workspaceId: DEFAULT_WORKSPACE.id,
      sortBy: sortsMap[c.id] || "manual",
    }));
  }
  try {
    const storedCols = localStorage.getItem("rn_planner_board_columns");
    if (storedCols) {
      const parsedCols: KanbanColumnDef[] = JSON.parse(storedCols);
      if (Array.isArray(parsedCols) && parsedCols.length > 0) {
        return parsedCols
          .map((c) => {
            const rawWs = c.workspaceId;
            const isCorrupted =
              rawWs &&
              (rawWs.includes("-todo") ||
                rawWs.includes("-in_progress") ||
                rawWs.includes("-review") ||
                rawWs.includes("-done"));
            const cleanWs = isCorrupted
              ? extractWorkspaceIdFromColumnId(c.id)
              : c.workspaceId || extractWorkspaceIdFromColumnId(c.id);

            return {
              ...c,
              workspaceId: cleanWs || DEFAULT_WORKSPACE.id,
              sortBy: sortsMap[c.id] || c.sortBy || "manual",
            };
          })
          .sort((a, b) => a.order - b.order);
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar colunas do LocalStorage", e);
  }
  return DEFAULT_COLUMNS.map((c) => ({
    ...c,
    workspaceId: DEFAULT_WORKSPACE.id,
    sortBy: sortsMap[c.id] || "manual",
  }));
}

const REMOVED_DEFAULT_BADGE_IDS = new Set([
  "badge-ready-deploy",
  "badge-blocked",
  "badge-validating",
  "badge-backlog",
]);

function getStoredLocalStatusBadges(): StatusBadge[] {
  if (typeof window === "undefined") return DEFAULT_STATUS_BADGES;
  try {
    const stored = localStorage.getItem("rn_planner_status_badges");
    if (stored) {
      const parsed: StatusBadge[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed.filter((b) => !REMOVED_DEFAULT_BADGE_IDS.has(b.id));
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar selos do LocalStorage", e);
  }
  return DEFAULT_STATUS_BADGES;
}

function getStoredLocalTasks(validColumns: KanbanColumnDef[]): PlannerTask[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const storedTasks = localStorage.getItem("rn_planner_board_tasks");
    if (storedTasks) {
      const parsedTasks: PlannerTask[] = JSON.parse(storedTasks);
      if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
        // Ignora tarefas demo legadas (t-1 .. t-5) para garantir quadro limpo
        const userTasks = parsedTasks.filter((t) => !DEMO_TASK_IDS.has(t.id));
        if (userTasks.length > 0) {
          const colToWs = new Map<string, string>();
          validColumns.forEach((c) => {
            const wsId = c.workspaceId || extractWorkspaceIdFromColumnId(c.id);
            colToWs.set(c.id, wsId);
          });

          return userTasks.map((t) => {
            const wsFromCol = colToWs.get(t.column) || extractWorkspaceIdFromColumnId(t.column);
            const rawWs = t.workspaceId;
            const isCorrupted =
              rawWs &&
              (rawWs.includes("-todo") ||
                rawWs.includes("-in_progress") ||
                rawWs.includes("-review") ||
                rawWs.includes("-done"));

            const wsId = isCorrupted ? wsFromCol : wsFromCol || rawWs || DEFAULT_WORKSPACE.id;

            const wsCols = validColumns.filter(
              (c) => (c.workspaceId || DEFAULT_WORKSPACE.id) === wsId
            );
            const wsColIds = new Set(wsCols.map((c) => c.id));
            const fallbackColId = wsCols[0]?.id || `col-${wsId}-todo`;

            const meta = extractTaskMetadata(t.description);
            const comments = t.comments ?? meta.comments ?? [];
            const statusBadgeId = t.statusBadgeId ?? meta.statusBadgeId;
            const assignee = t.assignee ?? meta.assignee;
            const repositoryUrl = t.repositoryUrl ?? meta.repositoryUrl;
            const branchName = t.branchName ?? meta.branchName;
            const cleanDesc =
              meta.cleanDescription !== undefined ? meta.cleanDescription : t.description;

            return {
              ...t,
              description: cleanDesc,
              statusBadgeId,
              comments,
              assignee,
              repositoryUrl,
              branchName,
              workspaceId: wsId,
              column: wsColIds.has(t.column) ? t.column : fallbackColId,
            };
          });
        }
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar tarefas do LocalStorage", e);
  }
  return [];
}

export function usePlanner() {
  const { user, loading: authLoading } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>(getStoredLocalWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(getStoredActiveWorkspaceId);
  const [columns, setColumns] = useState<KanbanColumnDef[]>(getStoredLocalColumns);
  const [tasks, setTasks] = useState<PlannerTask[]>(() =>
    getStoredLocalTasks(getStoredLocalColumns())
  );
  const [statusBadges, setStatusBadges] = useState<StatusBadge[]>(getStoredLocalStatusBadges);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  // Filtros de busca
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Workspace ativo
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ||
    workspaces[0] ||
    DEFAULT_WORKSPACE;

  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("rn_planner_active_workspace_id", id);
    }
  }, []);

  // Colunas do Workspace Ativo
  const activeWorkspaceColumns = columns
    .filter((col) => (col.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId)
    .sort((a, b) => a.order - b.order);

  // Inicializa colunas padrão para o workspace se não houver nenhuma
  useEffect(() => {
    if (!isLoaded) return;
    const hasCols = columns.some(
      (c) => (c.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId
    );
    if (!hasCols) {
      queueMicrotask(() => {
        const generatedCols: KanbanColumnDef[] = DEFAULT_COLUMNS.map((col, idx) => ({
          ...col,
          id: `col-${activeWorkspaceId}-${col.id}`,
          workspaceId: activeWorkspaceId,
          order: idx,
        }));
        setColumns((prev) => [...prev, ...generatedCols]);
        if (user && syncStatus !== "needs_schema") {
          for (const col of generatedCols) {
            PlannerService.upsertColumn(user.id, col);
          }
        }
      });
    }
  }, [activeWorkspaceId, isLoaded, columns, user, syncStatus]);

  // Tarefas do Workspace Ativo
  const activeWorkspaceTasks = tasks.filter(
    (t) => (t.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId
  );

  const activeUserIdRef = useRef<string | null>(null);

  // -------------------------------------------------------------
  // CARREGAMENTO INICIAL (SUPABASE OU LOCALSTORAGE)
  // -------------------------------------------------------------
  const loadData = useCallback(async () => {
    if (authLoading) return;

    if (user) {
      // Usuário autenticado: busca no Supabase
      setSyncStatus("syncing");
      activeUserIdRef.current = user.id;

      const localCols = getStoredLocalColumns();
      const localTasks = getStoredLocalTasks(localCols);
      const result = await PlannerService.fetchUserBoard(user.id, localCols, localTasks);

      if (result.tableMissing) {
        setSyncStatus("needs_schema");
        setSyncErrorMessage(
          "As tabelas 'columns' e 'tasks' não foram criadas no Supabase. Execute o script supabase/schema.sql no painel do Supabase."
        );
        const cols = getStoredLocalColumns();
        setColumns(cols);
        setTasks(getStoredLocalTasks(cols));
        toast.warning(
          "Supabase precisa do schema configurado. Suas tarefas estão sendo salvas localmente enquanto isso.",
          { duration: 6000 }
        );
      } else if (result.error) {
        setSyncStatus("error");
        setSyncErrorMessage(result.error);
        const cols = getStoredLocalColumns();
        setColumns(cols);
        setTasks(getStoredLocalTasks(cols));
        toast.error(`Falha ao conectar na nuvem: ${result.error}`);
      } else {
        const sortsMap = getStoredLocalSorts();
        const colsWithSort = result.columns.map((c) => ({
          ...c,
          sortBy: sortsMap[c.id] || c.sortBy || "manual",
        }));
        setColumns(colsWithSort);
        setTasks(result.tasks);
        setSyncStatus("synced");
        setSyncErrorMessage(null);

        // Auto-descobrir e registrar workspaces que existam nas colunas da nuvem
        setWorkspaces((prevWs) => {
          const knownIds = new Set(prevWs.map((w) => w.id));
          const newWsList: Workspace[] = [];
          colsWithSort.forEach((col) => {
            const wsId = col.workspaceId;
            if (wsId && wsId !== DEFAULT_WORKSPACE.id && !knownIds.has(wsId)) {
              knownIds.add(wsId);
              newWsList.push({
                id: wsId,
                name: "Novo Workspace",
                icon: "🚀",
                color: "cyan",
                createdAt: new Date().toISOString(),
              });
            }
          });
          return newWsList.length > 0 ? [...prevWs, ...newWsList] : prevWs;
        });
      }
    } else {
      // Modo convidado / não logado: busca do LocalStorage
      activeUserIdRef.current = null;
      setSyncStatus("local");
      const cols = getStoredLocalColumns();
      setColumns(cols);
      setTasks(getStoredLocalTasks(cols));
    }

    setIsLoaded(true);
  }, [user, authLoading]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  // Salvar backup no LocalStorage sempre que houver alteração
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("rn_planner_workspaces", JSON.stringify(workspaces));
      localStorage.setItem("rn_planner_active_workspace_id", activeWorkspaceId);
      localStorage.setItem("rn_planner_board_columns", JSON.stringify(columns));
      localStorage.setItem("rn_planner_board_tasks", JSON.stringify(tasks));
      localStorage.setItem("rn_planner_status_badges", JSON.stringify(statusBadges));
    } catch (e) {
      console.warn("Erro ao salvar cache local", e);
    }
  }, [workspaces, activeWorkspaceId, columns, tasks, statusBadges, isLoaded]);

  // -------------------------------------------------------------
  // MÉTODOS DE WORKSPACE
  // -------------------------------------------------------------

  const addWorkspace = async (data: {
    name: string;
    icon?: string;
    avatarUrl?: string;
    color?: ColumnColor;
  }) => {
    const cleanName = sanitizeString(data.name, 40);
    if (!cleanName) return null;

    const newWsId = `ws-${Date.now().toString(36)}`;
    const newWs: Workspace = {
      id: newWsId,
      name: cleanName,
      icon: data.icon || "🚀",
      avatarUrl: data.avatarUrl,
      color: data.color || "cyan",
      createdAt: new Date().toISOString(),
    };

    const newWsCols: KanbanColumnDef[] = DEFAULT_COLUMNS.map((col, idx) => ({
      ...col,
      id: `col-${newWsId}-${col.id}`,
      workspaceId: newWsId,
      order: idx,
    }));

    setWorkspaces((prev) => [...prev, newWs]);
    setColumns((prev) => [...prev, ...newWsCols]);
    setActiveWorkspaceId(newWsId);

    // Persistência das colunas do novo workspace no Supabase
    if (user && syncStatus !== "needs_schema") {
      try {
        await Promise.all(newWsCols.map((col) => PlannerService.upsertColumn(user.id, col)));
      } catch (e) {
        console.warn("Falha ao salvar colunas do novo workspace no Supabase:", e);
      }
    }

    toast.success(`Workspace "${cleanName}" criado!`);
    return newWs;
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const next: Workspace = {
          ...w,
          ...updates,
          name: updates.name ? sanitizeString(updates.name, 40) : w.name,
        };
        if ("avatarUrl" in updates) {
          next.avatarUrl = updates.avatarUrl;
        }
        return next;
      })
    );
    toast.success("Workspace atualizado!");
  };

  const deleteWorkspace = async (id: string) => {
    if (workspaces.length <= 1) {
      toast.error("Você precisa manter pelo menos um workspace.");
      return;
    }

    const wsToDelete = workspaces.find((w) => w.id === id);
    const remaining = workspaces.filter((w) => w.id !== id);
    setWorkspaces(remaining);

    setColumns((prev) => prev.filter((c) => (c.workspaceId || DEFAULT_WORKSPACE.id) !== id));
    setTasks((prev) => prev.filter((t) => (t.workspaceId || DEFAULT_WORKSPACE.id) !== id));

    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(remaining[0].id);
    }

    toast.success(`Workspace "${wsToDelete?.name || ""}" removido.`);
  };

  // -------------------------------------------------------------
  // MÉTODOS DE COLUNAS / ETAPAS
  // -------------------------------------------------------------

  // Adicionar nova etapa no workspace ativo
  const addColumn = useCallback(
    async (title: string, color: ColumnColor = "cyan") => {
      const cleanTitle = sanitizeString(title, 40);
      if (!cleanTitle) return null;

      const newId = `col-${activeWorkspaceId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
      const newCol: KanbanColumnDef = {
        id: newId,
        title: cleanTitle,
        color,
        order: activeWorkspaceColumns.length,
        workspaceId: activeWorkspaceId,
      };

      // Atualização otimista imediata na UI
      setColumns((prev) => [...prev, newCol]);

      // Persistência na nuvem se autenticado
      if (user && syncStatus !== "needs_schema") {
        setSyncStatus("syncing");
        const res = await PlannerService.upsertColumn(user.id, newCol);
        if (res.tableMissing) {
          setSyncStatus("needs_schema");
        } else if (!res.success) {
          toast.error("Falha ao salvar coluna no Supabase");
          setSyncStatus("error");
        } else {
          setSyncStatus("synced");
        }
      }

      toast.success(`Etapa "${cleanTitle}" criada`);
      return newCol;
    },
    [activeWorkspaceId, activeWorkspaceColumns.length, user, syncStatus]
  );

  // Editar etapa (nome, cor e/ou ordenação de cards)
  const updateColumn = async (
    columnId: string,
    updates: { title?: string; color?: ColumnColor; sortBy?: ColumnSortOption }
  ) => {
    let updatedTargetCol: KanbanColumnDef | null = null;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        const updated: KanbanColumnDef = {
          ...col,
          title: updates.title !== undefined ? sanitizeString(updates.title, 40) || col.title : col.title,
          color: updates.color !== undefined ? updates.color : col.color,
          sortBy: updates.sortBy !== undefined ? updates.sortBy : col.sortBy || "manual",
        };
        updatedTargetCol = updated;
        return updated;
      })
    );

    if (updates.sortBy !== undefined && typeof window !== "undefined") {
      try {
        const sortsMap = getStoredLocalSorts();
        sortsMap[columnId] = updates.sortBy;
        localStorage.setItem("rn_planner_column_sorts", JSON.stringify(sortsMap));
      } catch (e) {
        console.warn("Erro ao salvar ordenação da coluna", e);
      }
    }

    if (user && updatedTargetCol && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      const res = await PlannerService.upsertColumn(user.id, updatedTargetCol);
      if (res.tableMissing) {
        setSyncStatus("needs_schema");
      } else if (!res.success) {
        setSyncStatus("error");
      } else {
        setSyncStatus("synced");
      }
    }
  };

  // Aplicar ordenação a todas as etapas do workspace ativo
  const applySortToAllColumns = (sortBy: ColumnSortOption) => {
    setColumns((prev) =>
      prev.map((col) => {
        const isCurrentWorkspace =
          (col.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId;
        if (!isCurrentWorkspace) return col;
        return {
          ...col,
          sortBy,
        };
      })
    );

    if (typeof window !== "undefined") {
      try {
        const sortsMap = getStoredLocalSorts();
        activeWorkspaceColumns.forEach((col) => {
          sortsMap[col.id] = sortBy;
        });
        localStorage.setItem("rn_planner_column_sorts", JSON.stringify(sortsMap));
      } catch (e) {
        console.warn("Erro ao salvar ordenações globais", e);
      }
    }
  };

  // Excluir etapa com proteção de integridade no workspace ativo
  const deleteColumn = async (
    columnId: string,
    options?: { moveTasksToColumnId?: string }
  ) => {
    if (activeWorkspaceColumns.length <= 1) {
      return { success: false, message: "O quadro precisa ter pelo menos uma etapa." };
    }

    // 1. Tratar as tarefas da coluna deletada
    if (options?.moveTasksToColumnId) {
      const targetColId = options.moveTasksToColumnId;
      setTasks((prev) =>
        prev.map((t) =>
          t.column === columnId && (t.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId
            ? { ...t, column: targetColId }
            : t
        )
      );
    } else {
      setTasks((prev) =>
        prev.filter(
          (t) =>
            !(t.column === columnId && (t.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId)
        )
      );
    }

    // 2. Remover a coluna e reordenar apenas as remanescentes do workspace ativo
    setColumns((prev) => {
      const filtered = prev.filter((c) => c.id !== columnId);
      let orderCounter = 0;
      return filtered.map((c) => {
        if ((c.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId) {
          return { ...c, order: orderCounter++ };
        }
        return c;
      });
    });

    // 3. Persistência na nuvem
    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      const res = await PlannerService.deleteColumn(
        user.id,
        columnId,
        options?.moveTasksToColumnId
      );
      if (res.tableMissing) {
        setSyncStatus("needs_schema");
      } else if (!res.success) {
        setSyncStatus("error");
      } else {
        setSyncStatus("synced");
      }
    }

    toast.success("Etapa removida com sucesso");
    return { success: true };
  };

  // Mover etapa para a esquerda ou direita dentro do workspace ativo
  const moveColumn = async (columnId: string, direction: "left" | "right") => {
    const wsCols = [...activeWorkspaceColumns];
    const idx = wsCols.findIndex((c) => c.id === columnId);
    if (idx === -1) return;
    if (direction === "left" && idx === 0) return;
    if (direction === "right" && idx === wsCols.length - 1) return;

    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    const [removed] = wsCols.splice(idx, 1);
    wsCols.splice(targetIdx, 0, removed);

    const reorderedMap = new Map<string, number>();
    wsCols.forEach((col, i) => reorderedMap.set(col.id, i));

    setColumns((prev) =>
      prev.map((col) => {
        if (reorderedMap.has(col.id)) {
          return { ...col, order: reorderedMap.get(col.id)! };
        }
        return col;
      })
    );

    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      for (const [colId, order] of reorderedMap.entries()) {
        const target = wsCols.find((c) => c.id === colId);
        if (target) {
          await PlannerService.upsertColumn(user.id, { ...target, order });
        }
      }
      setSyncStatus("synced");
    }
  };

  // Limpar todas as tarefas de uma etapa específica no workspace ativo
  const clearColumnTasks = async (columnId: string) => {
    const tasksToRemove = tasks.filter(
      (t) =>
        t.column === columnId &&
        (t.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId
    );

    setTasks((prev) =>
      prev.filter(
        (t) =>
          !(
            t.column === columnId &&
            (t.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId
          )
      )
    );

    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      for (const t of tasksToRemove) {
        await PlannerService.deleteTask(user.id, t.id);
      }
      setSyncStatus("synced");
    }
    toast.success("Etapa esvaziada");
  };

  // Resetar colunas para o padrão de fábrica no workspace ativo
  const resetToDefaultColumns = async () => {
    const newWsCols: KanbanColumnDef[] = DEFAULT_COLUMNS.map((col, idx) => ({
      ...col,
      id: `col-${activeWorkspaceId}-${col.id}`,
      workspaceId: activeWorkspaceId,
      order: idx,
    }));

    setColumns((prev) => [
      ...prev.filter((c) => (c.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspaceId),
      ...newWsCols,
    ]);

    const firstColId = newWsCols[0]?.id || "todo";
    setTasks((prev) =>
      prev.map((t) =>
        (t.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspaceId
          ? { ...t, column: firstColId }
          : t
      )
    );

    toast.success("Colunas restauradas para o padrão");
  };

  // -------------------------------------------------------------
  // MÉTODOS DE TAREFAS / CARDS
  // -------------------------------------------------------------

  // Mover tarefa entre colunas (Drag & Drop)
  const moveTask = async (taskId: string, targetColumn: string, targetIndex?: number) => {
    let movedTask: PlannerTask | null = null;

    setTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev;

      const remaining = prev.filter((t) => t.id !== taskId);
      const updatedTask: PlannerTask = {
        ...targetTask,
        column: targetColumn,
      };
      movedTask = updatedTask;

      if (typeof targetIndex === "number") {
        const columnTasks = remaining.filter((t) => t.column === targetColumn);
        const insertBeforeTask = columnTasks[targetIndex];

        if (insertBeforeTask) {
          const insertIdx = remaining.indexOf(insertBeforeTask);
          remaining.splice(insertIdx, 0, updatedTask);
          return [...remaining];
        }
      }

      return [...remaining, updatedTask];
    });

    if (user && movedTask && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      const res = await PlannerService.upsertTask(user.id, movedTask);
      if (res.tableMissing) {
        setSyncStatus("needs_schema");
      } else if (!res.success) {
        setSyncStatus("error");
      } else {
        setSyncStatus("synced");
      }
    }
  };

  // -------------------------------------------------------------
  // MÉTODOS DE SELOS DE STATUS PERSONALIZADOS
  // -------------------------------------------------------------
  const addStatusBadge = (label: string, color: string): StatusBadge => {
    const cleanLabel = sanitizeString(label, 30);
    const newBadge: StatusBadge = {
      id: `badge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: cleanLabel || "Novo Selo",
      color: color || "cyan",
      createdAt: new Date().toISOString(),
    };
    setStatusBadges((prev) => [...prev, newBadge]);
    toast.success(`Selo "${newBadge.label}" criado!`);
    return newBadge;
  };

  const updateStatusBadge = (id: string, updates: Partial<StatusBadge>) => {
    setStatusBadges((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          ...updates,
          label: updates.label !== undefined ? sanitizeString(updates.label, 30) : b.label,
        };
      })
    );
    toast.success("Selo atualizado!");
  };

  const deleteStatusBadge = (id: string) => {
    setStatusBadges((prev) => prev.filter((b) => b.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.statusBadgeId === id ? { ...t, statusBadgeId: undefined } : t))
    );
    toast.success("Selo removido!");
  };

  // Adicionar nova tarefa no workspace ativo
  const addTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      category: TaskCategory;
      priority: Priority;
      column: string;
      dueDate: string;
      statusBadgeId?: string;
      comments?: CardComment[];
      assignee?: string;
      repositoryUrl?: string;
      branchName?: string;
    }) => {
      const nextNumber = tasks.length + 101;
      const validColIds = new Set(activeWorkspaceColumns.map((c) => c.id));
      const resolvedColumn = validColIds.has(data.column)
        ? data.column
        : activeWorkspaceColumns[0]?.id || `col-${activeWorkspaceId}-todo`;

      const newTask: PlannerTask = {
        ...data,
        column: resolvedColumn,
        workspaceId: activeWorkspaceId,
        title: sanitizeString(data.title, 120),
        description: data.description ? sanitizeDescription(data.description) : undefined,
        statusBadgeId: data.statusBadgeId || undefined,
        comments: data.comments || [],
        assignee: data.assignee ? sanitizeString(data.assignee, 60) : undefined,
        repositoryUrl: data.repositoryUrl ? sanitizeString(data.repositoryUrl, 200) : undefined,
        branchName: data.branchName ? sanitizeString(data.branchName, 100) : undefined,
        id: "t-" + Date.now(),
        code: `Task-${nextNumber}`,
        createdAt: new Date().toISOString(),
        order: activeWorkspaceTasks.filter((t) => t.column === resolvedColumn).length,
      };

      // Otimista
      setTasks((prev) => [newTask, ...prev]);

      // Supabase
      if (user && syncStatus !== "needs_schema") {
        setSyncStatus("syncing");
        // Garante que a coluna correspondente está cadastrada no Supabase antes de criar a tarefa (evita erro de chave estrangeira)
        const targetCol =
          columns.find((c) => c.id === resolvedColumn) ||
          activeWorkspaceColumns.find((c) => c.id === resolvedColumn) || {
            id: resolvedColumn,
            title: "A Fazer",
            color: "slate",
            order: 0,
            workspaceId: activeWorkspaceId,
          };
        await PlannerService.upsertColumn(user.id, targetCol);

        const res = await PlannerService.upsertTask(user.id, newTask);
        if (res.tableMissing) {
          setSyncStatus("needs_schema");
        } else if (!res.success) {
          toast.error("Erro ao salvar tarefa no Supabase");
          setSyncStatus("error");
        } else {
          setSyncStatus("synced");
        }
      }

      toast.success(`Card ${formatCardCode(newTask.code)} criado!`);
    },
    [tasks.length, activeWorkspaceColumns, activeWorkspaceId, activeWorkspaceTasks, columns, user, syncStatus]
  );

  // Excluir tarefa
  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      const res = await PlannerService.deleteTask(user.id, id);
      if (res.tableMissing) {
        setSyncStatus("needs_schema");
      } else if (!res.success) {
        toast.error("Erro ao remover tarefa no Supabase");
        setSyncStatus("error");
      } else {
        setSyncStatus("synced");
      }
    }

    toast.success(taskToDelete ? `Card ${formatCardCode(taskToDelete.code)} removido` : "Card removido");
  };

  // Atualizar tarefa
  const updateTask = async (id: string, updates: Partial<PlannerTask>) => {
    let updatedTargetTask: PlannerTask | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated: PlannerTask = {
          ...t,
          ...updates,
          title: updates.title !== undefined ? sanitizeString(updates.title, 120) : t.title,
          description:
            updates.description !== undefined
              ? updates.description
                ? sanitizeDescription(updates.description)
                : undefined
              : t.description,
          statusBadgeId:
            updates.statusBadgeId !== undefined ? updates.statusBadgeId : t.statusBadgeId,
          comments:
            updates.comments !== undefined ? updates.comments : t.comments,
          assignee:
            updates.assignee !== undefined
              ? updates.assignee
                ? sanitizeString(updates.assignee, 60)
                : undefined
              : t.assignee,
          repositoryUrl:
            updates.repositoryUrl !== undefined
              ? updates.repositoryUrl
                ? sanitizeString(updates.repositoryUrl, 200)
                : undefined
              : t.repositoryUrl,
          branchName:
            updates.branchName !== undefined
              ? updates.branchName
                ? sanitizeString(updates.branchName, 100)
                : undefined
              : t.branchName,
        };
        updatedTargetTask = updated;
        return updated;
      })
    );

    if (user && updatedTargetTask && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      const res = await PlannerService.upsertTask(user.id, updatedTargetTask);
      if (res.tableMissing) {
        setSyncStatus("needs_schema");
      } else if (!res.success) {
        setSyncStatus("error");
      } else {
        setSyncStatus("synced");
      }
    }
  };

  // Sincronizar dados locais manualmente para a nuvem
  const syncLocalToCloud = async () => {
    if (!user) {
      toast.info("Faça login com sua conta para salvar seus dados na nuvem.");
      return;
    }
    setSyncStatus("syncing");
    const res = await PlannerService.syncLocalBoardToCloud(user.id, columns, tasks);
    if (res.tableMissing) {
      setSyncStatus("needs_schema");
      toast.warning("Execute supabase/schema.sql no Supabase para habilitar a nuvem.");
    } else if (res.success) {
      setSyncStatus("synced");
      toast.success("Seu quadro foi sincronizado na nuvem com sucesso!");
    } else {
      setSyncStatus("error");
      toast.error(`Falha ao sincronizar: ${res.error}`);
    }
  };

  // Tarefas filtradas por busca e tags DENTRO DO WORKSPACE ATIVO
  const filteredTasks = activeWorkspaceTasks.filter((task) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      task.code.toLowerCase().includes(q) ||
      formatCardCode(task.code).toLowerCase().includes(q) ||
      (task.assignee && task.assignee.toLowerCase().includes(q)) ||
      (task.branchName && task.branchName.toLowerCase().includes(q)) ||
      (task.repositoryUrl && task.repositoryUrl.toLowerCase().includes(q)) ||
      (task.description && task.description.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  return {
    // Workspace state & operations
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    // Columns & Tasks scoped to active workspace
    columns: activeWorkspaceColumns,
    tasks: filteredTasks,
    allTasks: activeWorkspaceTasks,
    allWorkspacesTasks: tasks,
    allWorkspacesColumns: columns,
    isLoaded,
    syncStatus,
    syncErrorMessage,
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
    resetToDefaultColumns,
    applySortToAllColumns,
    // Task operations
    moveTask,
    addTask,
    deleteTask,
    updateTask,
    // Status Badges
    statusBadges,
    addStatusBadge,
    updateStatusBadge,
    deleteStatusBadge,
    // Sync operations
    syncLocalToCloud,
    refreshData: loadData,
  };
}
