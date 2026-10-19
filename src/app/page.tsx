"use client";

import { useState } from "react";
import { usePlanner } from "@/lib/planner-store";
import { PlannerHeader } from "@/components/planner/header";
import { MetricCards } from "@/components/planner/metric-cards";
import { TaskList } from "@/components/planner/task-list";
import { HabitTracker } from "@/components/planner/habit-tracker";
import { GoalsWidget } from "@/components/planner/goals-widget";
import { QuickNotes } from "@/components/planner/quick-notes";
import { NewTaskDialog } from "@/components/planner/new-task-dialog";
import { Sparkles, Code2 } from "lucide-react";

export default function PlannerPage() {
  const {
    tasks,
    habits,
    goals,
    notes,
    isLoaded,
    isCloudConnected,
    toggleTask,
    addTask,
    deleteTask,
    toggleHabitToday,
    addNote,
    deleteNote,
  } = usePlanner();

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="text-xs uppercase tracking-widest">Carregando RN Planner...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-rose-500/5 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-500/5 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Header */}
        <PlannerHeader
          isCloudConnected={isCloudConnected}
          onOpenNewTask={() => setIsNewTaskOpen(true)}
        />

        {/* Métricas do Dia (Neon Semantics) */}
        <MetricCards tasks={tasks} habits={habits} />

        {/* Layout Principal Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Coluna Esquerda: Tarefas & Metas (7 cols) */}
          <div className="flex flex-col gap-8 lg:col-span-7">
            <TaskList
              tasks={tasks}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onOpenNewTask={() => setIsNewTaskOpen(true)}
            />
            <GoalsWidget goals={goals} />
          </div>

          {/* Coluna Direita: Hábitos & Quick Notes (5 cols) */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            <HabitTracker
              habits={habits}
              onToggleHabitToday={toggleHabitToday}
            />
            <QuickNotes
              notes={notes}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>RN Planner • Obsidian Deep Dark Theme</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Renanbritto/rn-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>GitHub: Renanbritto/rn-planner</span>
            </a>
          </div>
        </footer>
      </div>

      {/* Modal Nova Tarefa */}
      <NewTaskDialog
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        onAddTask={addTask}
      />
    </div>
  );
}
