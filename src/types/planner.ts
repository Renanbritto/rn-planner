export type Priority = "critical" | "medium" | "low";
export type TaskCategory = "work" | "study" | "health" | "personal" | "finance";

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: TaskCategory;
  targetDaysPerWeek: number;
  streak: number;
  completedDates: string[]; // ['2026-10-19', ...]
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number; // 0 - 100
  metricLabel: string;
  category: TaskCategory;
}

export interface QuickNote {
  id: string;
  content: string;
  createdAt: string;
}
