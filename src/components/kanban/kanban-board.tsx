"use client";

import { KanbanColumn as ColumnType, PlannerTask } from "@/types/planner";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
  tasks: PlannerTask[];
  onMoveTask: (taskId: string, targetColumn: ColumnType) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (columnId: ColumnType) => void;
}

const COLUMNS: {
  id: ColumnType;
  title: string;
  color: string;
  dotColor: string;
  badgeBg: string;
}[] = [
  {
    id: "todo",
    title: "A Fazer",
    color: "text-slate-300",
    dotColor: "bg-slate-400",
    badgeBg: "bg-white/[0.06] border border-white/10 text-slate-300",
  },
  {
    id: "in_progress",
    title: "Em Andamento",
    color: "text-cyan-400",
    dotColor: "bg-cyan-400",
    badgeBg: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400",
  },
  {
    id: "blocked",
    title: "Atenção / Bloqueado",
    color: "text-rose-400",
    dotColor: "bg-rose-500",
    badgeBg: "bg-rose-500/10 border border-rose-500/20 text-rose-400",
  },
  {
    id: "done",
    title: "Concluído",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    badgeBg: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  },
];

export function KanbanBoard({
  tasks,
  onMoveTask,
  onDeleteTask,
  onQuickAdd,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.column === col.id);

        return (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={columnTasks}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onQuickAdd={onQuickAdd}
          />
        );
      })}
    </div>
  );
}
