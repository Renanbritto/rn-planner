"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PlannerTask,
  KanbanColumnDef,
  ColumnColor,
  Priority,
  TaskCategory,
} from "@/types/planner";
import { useAuth } from "./auth-context";
import {
  PlannerService,
  DEFAULT_COLUMNS,
  INITIAL_TASKS,
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

function getStoredLocalColumns(): KanbanColumnDef[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS;
  try {
    const storedCols = localStorage.getItem("rn_planner_board_columns");
    if (storedCols) {
      const parsedCols: KanbanColumnDef[] = JSON.parse(storedCols);
      if (Array.isArray(parsedCols) && parsedCols.length > 0) {
        return parsedCols.sort((a, b) => a.order - b.order);
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar colunas do LocalStorage", e);
  }
  return DEFAULT_COLUMNS;
}

function getStoredLocalTasks(validColumns: KanbanColumnDef[]): PlannerTask[] {
  if (typeof window === "undefined") return INITIAL_TASKS;
  try {
    const storedTasks = localStorage.getItem("rn_planner_board_tasks");
    if (storedTasks) {
      const parsedTasks: PlannerTask[] = JSON.parse(storedTasks);
      if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
        const validColIds = new Set(validColumns.map((c) => c.id));
        const firstColId = validColumns[0]?.id || "todo";
        return parsedTasks.map((t) => ({
          ...t,
          column: validColIds.has(t.column) ? t.column : firstColId,
        }));
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar tarefas do LocalStorage", e);
  }
  return INITIAL_TASKS;
}

export function usePlanner() {
  const { user, loading: authLoading } = useAuth();

  const [columns, setColumns] = useState<KanbanColumnDef[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<PlannerTask[]>(INITIAL_TASKS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  // Filtros de busca
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

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
        setColumns(result.columns);
        setTasks(result.tasks);
        setSyncStatus("synced");
        setSyncErrorMessage(null);
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
      localStorage.setItem("rn_planner_board_columns", JSON.stringify(columns));
      localStorage.setItem("rn_planner_board_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Erro ao salvar cache local", e);
    }
  }, [columns, tasks, isLoaded]);

  // -------------------------------------------------------------
  // MÉTODOS DE COLUNAS / ETAPAS
  // -------------------------------------------------------------

  // Adicionar nova etapa
  const addColumn = async (title: string, color: ColumnColor = "cyan") => {
    const cleanTitle = sanitizeString(title, 40);
    if (!cleanTitle) return null;

    const newId = `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newCol: KanbanColumnDef = {
      id: newId,
      title: cleanTitle,
      color,
      order: columns.length,
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
  };

  // Editar etapa (nome e/ou cor)
  const updateColumn = async (
    columnId: string,
    updates: { title?: string; color?: ColumnColor }
  ) => {
    let updatedTargetCol: KanbanColumnDef | null = null;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        const updated = {
          ...col,
          title: updates.title !== undefined ? sanitizeString(updates.title, 40) || col.title : col.title,
          color: updates.color !== undefined ? updates.color : col.color,
        };
        updatedTargetCol = updated;
        return updated;
      })
    );

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

  // Excluir etapa com proteção de integridade
  const deleteColumn = async (
    columnId: string,
    options?: { moveTasksToColumnId?: string }
  ) => {
    if (columns.length <= 1) {
      return { success: false, message: "O quadro precisa ter pelo menos uma etapa." };
    }

    // 1. Tratar as tarefas da coluna deletada
    if (options?.moveTasksToColumnId) {
      const targetColId = options.moveTasksToColumnId;
      setTasks((prev) =>
        prev.map((t) => (t.column === columnId ? { ...t, column: targetColId } : t))
      );
    } else {
      setTasks((prev) => prev.filter((t) => t.column !== columnId));
    }

    // 2. Remover a coluna e reordenar as remanescentes
    const updatedCols = columns
      .filter((c) => c.id !== columnId)
      .map((c, idx) => ({ ...c, order: idx }));

    setColumns(updatedCols);

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

  // Mover etapa para a esquerda ou direita
  const moveColumn = async (columnId: string, direction: "left" | "right") => {
    const idx = columns.findIndex((c) => c.id === columnId);
    if (idx === -1) return;
    if (direction === "left" && idx === 0) return;
    if (direction === "right" && idx === columns.length - 1) return;

    const newCols = [...columns];
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    const [removed] = newCols.splice(idx, 1);
    newCols.splice(targetIdx, 0, removed);

    const reordered = newCols.map((col, i) => ({ ...col, order: i }));
    setColumns(reordered);

    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      for (const col of reordered) {
        await PlannerService.upsertColumn(user.id, col);
      }
      setSyncStatus("synced");
    }
  };

  // Limpar todas as tarefas de uma etapa específica
  const clearColumnTasks = async (columnId: string) => {
    const tasksToRemove = tasks.filter((t) => t.column === columnId);
    setTasks((prev) => prev.filter((t) => t.column !== columnId));

    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      for (const t of tasksToRemove) {
        await PlannerService.deleteTask(user.id, t.id);
      }
      setSyncStatus("synced");
    }
    toast.success("Etapa esvaziada");
  };

  // Resetar colunas para o padrão de fábrica
  const resetToDefaultColumns = async () => {
    setColumns(DEFAULT_COLUMNS);
    const validIds = new Set(DEFAULT_COLUMNS.map((c) => c.id));
    setTasks((prev) =>
      prev.map((t) => (validIds.has(t.column) ? t : { ...t, column: "todo" }))
    );

    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
      await PlannerService.initializeUserBoard(user.id, DEFAULT_COLUMNS, tasks);
      setSyncStatus("synced");
    }
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

  // Adicionar nova tarefa
  const addTask = async (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: Priority;
    column: string;
    dueDate: string;
  }) => {
    const nextNumber = tasks.length + 101;
    const newTask: PlannerTask = {
      ...data,
      title: sanitizeString(data.title, 120),
      description: data.description ? sanitizeDescription(data.description) : undefined,
      id: "t-" + Date.now(),
      code: `RN-${nextNumber}`,
      createdAt: new Date().toISOString(),
      order: tasks.filter((t) => t.column === data.column).length,
    };

    // Otimista
    setTasks((prev) => [newTask, ...prev]);

    // Supabase
    if (user && syncStatus !== "needs_schema") {
      setSyncStatus("syncing");
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

    toast.success(`Card ${newTask.code} criado!`);
  };

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

    toast.success(taskToDelete ? `Card ${taskToDelete.code} removido` : "Card removido");
  };

  // Atualizar tarefa
  const updateTask = async (id: string, updates: Partial<PlannerTask>) => {
    let updatedTargetTask: PlannerTask | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = {
          ...t,
          ...updates,
          title: updates.title !== undefined ? sanitizeString(updates.title, 120) : t.title,
          description:
            updates.description !== undefined
              ? updates.description
                ? sanitizeDescription(updates.description)
                : undefined
              : t.description,
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

  // Tarefas filtradas por busca e tags
  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      task.code.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  return {
    columns,
    tasks: filteredTasks,
    allTasks: tasks,
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
    // Task operations
    moveTask,
    addTask,
    deleteTask,
    updateTask,
    // Sync operations
    syncLocalToCloud,
    refreshData: loadData,
  };
}
