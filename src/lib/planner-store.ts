"use client";

import { useState, useEffect } from "react";
import { PlannerTask, Habit, Goal, QuickNote } from "@/types/planner";
import { supabase, isSupabaseConfigured } from "./supabase";

const DEFAULT_TASKS: PlannerTask[] = [
  {
    id: "task-1",
    title: "Revisar pipeline de inferência & métricas do Sentinel",
    category: "work",
    priority: "critical",
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Otimizar consultas Drizzle & arquitetura do banco",
    category: "work",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Estudo: Deep dive em Causal Inference & Estatística",
    category: "study",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Treino de força & mobilidade (1h)",
    category: "health",
    priority: "low",
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_HABITS: Habit[] = [
  {
    id: "h-1",
    name: "Treino / Academia",
    category: "health",
    targetDaysPerWeek: 5,
    streak: 6,
    completedDates: [new Date().toISOString().split("T")[0]],
  },
  {
    id: "h-2",
    name: "Deep Work (Foco sem distrações > 2h)",
    category: "work",
    targetDaysPerWeek: 6,
    streak: 12,
    completedDates: [new Date().toISOString().split("T")[0]],
  },
  {
    id: "h-3",
    name: "Leitura Técnica ou Paper (30 min)",
    category: "study",
    targetDaysPerWeek: 5,
    streak: 4,
    completedDates: [],
  },
  {
    id: "h-4",
    name: "Hidratação (3 Litros)",
    category: "health",
    targetDaysPerWeek: 7,
    streak: 18,
    completedDates: [new Date().toISOString().split("T")[0]],
  },
];

const DEFAULT_GOALS: Goal[] = [
  {
    id: "g-1",
    title: "Lançamento do ecossistema RN Suite & Portfólio IA",
    targetDate: "2026-12-31",
    progress: 75,
    metricLabel: "3 de 4 projetos finalizados",
    category: "work",
  },
  {
    id: "g-2",
    title: "Consistência de Treino & Saúde",
    targetDate: "2026-11-30",
    progress: 88,
    metricLabel: "22/25 treinos no mês",
    category: "health",
  },
  {
    id: "g-3",
    title: "Reserva de Emergência & Aportes Estratégicos",
    targetDate: "2026-12-31",
    progress: 60,
    metricLabel: "60% da meta anual",
    category: "finance",
  },
];

const DEFAULT_NOTES: QuickNote[] = [
  {
    id: "n-1",
    content: "💡 Ideia: adicionar widget de resumo semanal com taxa de conclusão e heatmap de produtividade.",
    createdAt: "Hoje às 14:20",
  },
  {
    id: "n-2",
    content: "📌 Regra de ouro: Primeiro bloco da manhã sempre reservado para a tarefa de maior alavancagem.",
    createdAt: "Ontem às 09:15",
  },
];

export function usePlanner() {
  const [tasks, setTasks] = useState<PlannerTask[]>(DEFAULT_TASKS);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [notes, setNotes] = useState<QuickNote[]>(DEFAULT_NOTES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega do LocalStorage na inicialização
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem("rn_planner_tasks");
      const storedHabits = localStorage.getItem("rn_planner_habits");
      const storedGoals = localStorage.getItem("rn_planner_goals");
      const storedNotes = localStorage.getItem("rn_planner_notes");

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedHabits) setHabits(JSON.parse(storedHabits));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedNotes) setNotes(JSON.parse(storedNotes));
    } catch (e) {
      console.warn("Erro ao ler localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salva no LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("rn_planner_tasks", JSON.stringify(tasks));
      localStorage.setItem("rn_planner_habits", JSON.stringify(habits));
      localStorage.setItem("rn_planner_goals", JSON.stringify(goals));
      localStorage.setItem("rn_planner_notes", JSON.stringify(notes));
    } catch (e) {
      console.warn("Erro ao salvar localStorage", e);
    }
  }, [tasks, habits, goals, notes, isLoaded]);

  // Ações de Tarefas
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (task: Omit<PlannerTask, "id" | "createdAt">) => {
    const newTask: PlannerTask = {
      ...task,
      id: "task-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Ações de Hábitos
  const toggleHabitToday = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const hasCompletedToday = h.completedDates.includes(today);
        let newDates: string[];
        let newStreak = h.streak;

        if (hasCompletedToday) {
          newDates = h.completedDates.filter((d) => d !== today);
          newStreak = Math.max(0, h.streak - 1);
        } else {
          newDates = [...h.completedDates, today];
          newStreak = h.streak + 1;
        }

        return {
          ...h,
          completedDates: newDates,
          streak: newStreak,
        };
      })
    );
  };

  // Ações de Notas Rápidas
  const addNote = (content: string) => {
    if (!content.trim()) return;
    const newNote: QuickNote = {
      id: "note-" + Date.now(),
      content,
      createdAt: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    tasks,
    habits,
    goals,
    notes,
    isLoaded,
    isCloudConnected: isSupabaseConfigured,
    toggleTask,
    addTask,
    deleteTask,
    toggleHabitToday,
    addNote,
    deleteNote,
  };
}
