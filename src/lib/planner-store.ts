"use client";

import { useState, useEffect } from "react";
import {
  PlannerTask,
  KanbanColumnDef,
  ColumnColor,
  Priority,
  TaskCategory,
} from "@/types/planner";
import { isSupabaseConfigured } from "./supabase";

export const DEFAULT_COLUMNS: KanbanColumnDef[] = [
  { id: "todo", title: "A Fazer", color: "slate", order: 0 },
  { id: "in_progress", title: "Em Andamento", color: "cyan", order: 1 },
  { id: "blocked", title: "Atenção / Bloqueado", color: "rose", order: 2 },
  { id: "done", title: "Concluído", color: "emerald", order: 3 },
];

const INITIAL_TASKS: PlannerTask[] = [
  {
    id: "t-1",
    code: "RN-101",
    title: "Revisar pipeline de inferência & métricas do Sentinel",
    description: "Validar taxa de falso positivos e latência média em produção.",
    category: "work",
    priority: "critical",
    column: "in_progress",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: "t-2",
    code: "RN-102",
    title: "Otimizar consultas Drizzle & índices do banco",
    description: "Adicionar índices parciais nas queries mais lentas.",
    category: "work",
    priority: "medium",
    column: "done",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: "t-3",
    code: "RN-103",
    title: "Estudo: Deep dive em Causal Inference & Estatística",
    description: "Ler capítulo 4 sobre Do-calculus e DAGs causais.",
    category: "study",
    priority: "medium",
    column: "todo",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: "t-4",
    code: "RN-104",
    title: "Treino de Força & Mobilidade (1h)",
    description: "Foco em membros superiores e liberação miofascial.",
    category: "health",
    priority: "low",
    column: "todo",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: "t-5",
    code: "RN-105",
    title: "Ajustar alocação de aportes do mês",
    description: "Transferir reserva estratégica e rebalancear carteira.",
    category: "finance",
    priority: "critical",
    column: "blocked",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
];

// Sanitizador simples para segurança de inputs
function sanitizeString(str: string, maxLength = 50): string {
  return str
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function usePlanner() {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<PlannerTask[]>(INITIAL_TASKS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Carrega do LocalStorage na montagem
  useEffect(() => {
    try {
      // 1. Carregar colunas
      const storedCols = localStorage.getItem("rn_planner_board_columns");
      let loadedColumns = DEFAULT_COLUMNS;
      if (storedCols) {
        const parsedCols: KanbanColumnDef[] = JSON.parse(storedCols);
        if (Array.isArray(parsedCols) && parsedCols.length > 0) {
          loadedColumns = parsedCols.sort((a, b) => a.order - b.order);
          setColumns(loadedColumns);
        }
      }

      // 2. Carregar tarefas
      const storedTasks = localStorage.getItem("rn_planner_board_tasks");
      if (storedTasks) {
        const parsedTasks: PlannerTask[] = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          // Garantir integridade referencial: se a coluna da tarefa não existir, joga na primeira coluna
          const validColIds = new Set(loadedColumns.map((c) => c.id));
          const firstColId = loadedColumns[0]?.id || "todo";
          const sanitizedTasks = parsedTasks.map((t) => ({
            ...t,
            column: validColIds.has(t.column) ? t.column : firstColId,
          }));
          setTasks(sanitizedTasks);
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar estado do LocalStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salva colunas no LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("rn_planner_board_columns", JSON.stringify(columns));
    } catch (e) {
      console.warn("Erro ao salvar colunas no LocalStorage", e);
    }
  }, [columns, isLoaded]);

  // Salva tarefas no LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("rn_planner_board_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Erro ao salvar tarefas no LocalStorage", e);
    }
  }, [tasks, isLoaded]);

  // -------------------------------------------------------------
  // MÉTODOS DE COLUNAS / ETAPAS
  // -------------------------------------------------------------

  // Adicionar nova etapa
  const addColumn = (title: string, color: ColumnColor = "cyan") => {
    const cleanTitle = sanitizeString(title, 40);
    if (!cleanTitle) return null;

    const newId = `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newCol: KanbanColumnDef = {
      id: newId,
      title: cleanTitle,
      color,
      order: columns.length,
    };

    setColumns((prev) => [...prev, newCol]);
    return newCol;
  };

  // Editar etapa (nome e/ou cor)
  const updateColumn = (
    columnId: string,
    updates: { title?: string; color?: ColumnColor }
  ) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          title: updates.title !== undefined ? sanitizeString(updates.title, 40) || col.title : col.title,
          color: updates.color !== undefined ? updates.color : col.color,
        };
      })
    );
  };

  // Excluir etapa com proteção de integridade
  const deleteColumn = (
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
      // Exclui todas as tarefas daquela coluna
      setTasks((prev) => prev.filter((t) => t.column !== columnId));
    }

    // 2. Remover a coluna e reordenar as remanescentes
    setColumns((prev) => {
      const filtered = prev.filter((c) => c.id !== columnId);
      return filtered.map((c, idx) => ({ ...c, order: idx }));
    });

    return { success: true };
  };

  // Mover etapa para a esquerda ou direita
  const moveColumn = (columnId: string, direction: "left" | "right") => {
    setColumns((prev) => {
      const idx = prev.findIndex((c) => c.id === columnId);
      if (idx === -1) return prev;
      if (direction === "left" && idx === 0) return prev;
      if (direction === "right" && idx === prev.length - 1) return prev;

      const newCols = [...prev];
      const targetIdx = direction === "left" ? idx - 1 : idx + 1;
      const [removed] = newCols.splice(idx, 1);
      newCols.splice(targetIdx, 0, removed);

      return newCols.map((col, i) => ({ ...col, order: i }));
    });
  };

  // Limpar todas as tarefas de uma etapa específica
  const clearColumnTasks = (columnId: string) => {
    setTasks((prev) => prev.filter((t) => t.column !== columnId));
  };

  // Resetar colunas para o padrão de fábrica
  const resetToDefaultColumns = () => {
    setColumns(DEFAULT_COLUMNS);
    const validIds = new Set(DEFAULT_COLUMNS.map((c) => c.id));
    setTasks((prev) =>
      prev.map((t) => (validIds.has(t.column) ? t : { ...t, column: "todo" }))
    );
  };

  // -------------------------------------------------------------
  // MÉTODOS DE TAREFAS / CARDS
  // -------------------------------------------------------------

  // Mover tarefa entre colunas (Drag & Drop)
  const moveTask = (taskId: string, targetColumn: string, targetIndex?: number) => {
    setTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev;

      const remaining = prev.filter((t) => t.id !== taskId);
      const updatedTask: PlannerTask = {
        ...targetTask,
        column: targetColumn,
      };

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
  };

  // Adicionar nova tarefa
  const addTask = (data: {
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
      description: data.description ? sanitizeString(data.description, 400) : undefined,
      id: "t-" + Date.now(),
      code: `RN-${nextNumber}`,
      createdAt: new Date().toISOString(),
      order: tasks.filter((t) => t.column === data.column).length,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Excluir tarefa
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Atualizar tarefa
  const updateTask = (id: string, updates: Partial<PlannerTask>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          ...updates,
          title: updates.title !== undefined ? sanitizeString(updates.title, 120) : t.title,
          description:
            updates.description !== undefined
              ? updates.description
                ? sanitizeString(updates.description, 400)
                : undefined
              : t.description,
        };
      })
    );
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
    isCloudConnected: isSupabaseConfigured,
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
  };
}
