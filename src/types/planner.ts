export type KanbanColumn = "todo" | "in_progress" | "blocked" | "done";
export type Priority = "critical" | "medium" | "low";
export type TaskCategory = "work" | "study" | "health" | "personal" | "finance";

export interface PlannerTask {
  id: string;
  code: string; // e.g. "RN-101"
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  column: KanbanColumn;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  order: number;
}
