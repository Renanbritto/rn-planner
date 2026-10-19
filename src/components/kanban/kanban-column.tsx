"use client";

import { useState } from "react";
import { KanbanColumn as ColumnType, PlannerTask } from "@/types/planner";
import { KanbanCard } from "./kanban-card";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  column: {
    id: ColumnType;
    title: string;
    color: string;
    dotColor: string;
    badgeBg: string;
  };
  tasks: PlannerTask[];
  onMoveTask: (taskId: string, targetColumn: ColumnType) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (columnId: ColumnType) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onMoveTask,
  onDeleteTask,
  onQuickAdd,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl border p-4 transition-all duration-200 min-h-[580px] ${
        isOver
          ? "border-cyan-500/60 bg-[#0d1424] shadow-xl shadow-cyan-500/10"
          : "border-white/10 bg-[#0b0f1a]/60"
      }`}
    >
      {/* Column Header (Azure DevOps Style) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            {column.title}
          </h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-mono font-bold ${column.badgeBg} text-white`}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAdd(column.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
          title={`Adicionar item em ${column.title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Cards Stack */}
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center transition-all ${
              isOver ? "border-cyan-400/40 bg-cyan-500/5" : ""
            }`}
          >
            <p className="text-xs text-slate-500 font-medium">Nenhum card aqui</p>
            <p className="text-[11px] text-slate-600 mt-1">Arraste para mover</p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onDragStart={() => {}}
              onDragEnd={() => setIsOver(false)}
            />
          ))
        )}
      </div>
    </div>
  );
}
