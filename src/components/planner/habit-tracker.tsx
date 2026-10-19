"use client";

import { Flame, CheckCircle2, Circle } from "lucide-react";
import { Habit } from "@/types/planner";

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabitToday: (id: string) => void;
}

export function HabitTracker({ habits, onToggleHabitToday }: HabitTrackerProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="glass-panel flex flex-col rounded-2xl p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Matriz de Hábitos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
              Consistência
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe a sua disciplina diária e mantenha suas sequências ativas.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {habits.map((habit) => {
          const isDoneToday = habit.completedDates.includes(today);

          return (
            <div
              key={habit.id}
              className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                isDoneToday
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-white/10 bg-[#0b0f1a]/80 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleHabitToday(habit.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                    isDoneToday
                      ? "border-emerald-500 bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                      : "border-white/20 bg-white/5 text-slate-400 hover:border-emerald-400 hover:text-emerald-400"
                  }`}
                  title={isDoneToday ? "Concluído hoje" : "Marcar como feito hoje"}
                >
                  {isDoneToday ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>

                <div>
                  <h4
                    className={`text-sm font-medium ${
                      isDoneToday ? "text-emerald-300" : "text-white"
                    }`}
                  >
                    {habit.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>Meta: {habit.targetDaysPerWeek}x / semana</span>
                  </div>
                </div>
              </div>

              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
                <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                <span>{habit.streak} dias</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
