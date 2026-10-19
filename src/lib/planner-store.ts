"use client";

import { useState, useEffect } from "react";
import { PlannerTask, KanbanColumn, Priority, TaskCategory } from "@/types/planner";
import { isSupabaseConfigured } from "./supabase";

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

export function usePlanner() {
  const [tasks, setTasks] = useState<PlannerTask[]>(INITIAL_TASKS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Carrega do LocalStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rn_planner_board_tasks");
      if (stored) {
        const parsed: PlannerTask[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage do board", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salva no LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("rn_planner_board_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Erro ao salvar localStorage do board", e);
    }
  }, [tasks, isLoaded]);

  // Mover tarefa entre colunas (Drag & Drop)
  const moveTask = (taskId: string, targetColumn: KanbanColumn, targetIndex?: number) => {
    setTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev;

      const remaining = prev.filter((t) => t.id !== taskId);
      const updatedTask: PlannerTask = {
        ...targetTask,
        column: targetColumn,
      };

      if (typeof targetIndex === "number") {
        // Encontra o index absoluto na lista filtrada pela coluna
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
    column: KanbanColumn;
    dueDate: string;
  }) => {
    const nextNumber = tasks.length + 101;
    const newTask: PlannerTask = {
      ...data,
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
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  // Tarefas filtradas
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  return {
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
    moveTask,
    addTask,
    deleteTask,
    updateTask,
  };
}
