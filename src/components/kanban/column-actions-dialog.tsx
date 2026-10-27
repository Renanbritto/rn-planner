"use client";

import { useState } from "react";
import {
  KanbanColumnDef,
  ColumnColor,
  ColumnSortOption,
  COLUMN_COLOR_OPTIONS,
  COLUMN_SORT_OPTIONS,
} from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sliders, Check, ArrowUpDown } from "lucide-react";

interface ColumnActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: KanbanColumnDef | null;
  onUpdateColumn: (
    columnId: string,
    updates: { title?: string; color?: ColumnColor; sortBy?: ColumnSortOption }
  ) => void;
}

export function ColumnActionsDialog({
  open,
  onOpenChange,
  column,
  onUpdateColumn,
}: ColumnActionsDialogProps) {
  const [prevColumn, setPrevColumn] = useState(column);
  const [title, setTitle] = useState(column?.title || "");
  const [color, setColor] = useState<ColumnColor>(column?.color || "cyan");
  const [sortBy, setSortBy] = useState<ColumnSortOption>(column?.sortBy || "manual");

  if (column !== prevColumn) {
    setPrevColumn(column);
    setTitle(column?.title || "");
    setColor(column?.color || "cyan");
    setSortBy(column?.sortBy || "manual");
  }

  if (!column) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUpdateColumn(column.id, {
      title: title.trim(),
      color,
      sortBy,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[440px] shadow-2xl dark:shadow-black/60 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="font-comfortaa text-base font-bold text-slate-900 dark:text-white">
                Personalizar Etapa
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Altere o nome e a tonalidade visual da etapa.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Nome da Etapa */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nome da Etapa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Em Revisão, Backlog, Deploy..."
              maxLength={40}
              autoFocus
              className="border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs h-9 rounded-xl focus-visible:ring-cyan-500 font-sans"
            />
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 self-end">
              {title.length}/40 caracteres
            </span>
          </div>

          {/* Paleta de Cores */}
          <div className="flex flex-col gap-2">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cor de Destaque
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLUMN_COLOR_OPTIONS.map((item) => {
                const isSelected = color === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColor(item.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer font-comfortaa ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-md shadow-cyan-500/10"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dotColor} shadow-[0_0_6px_currentColor]`} />
                    <span className="truncate flex-1 text-left">{item.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenação dos Cards na Etapa */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-cyan-500" />
                <span>Ordenação dos Cards</span>
              </label>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                Padrão da etapa
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ColumnSortOption)}
              className="h-9.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-xs font-comfortaa"
            >
              {COLUMN_SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              {COLUMN_SORT_OPTIONS.find((opt) => opt.id === sortBy)?.description}
            </p>
          </div>

          <DialogFooter className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors font-comfortaa cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold px-3.5 py-2 text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 font-comfortaa cursor-pointer"
            >
              Salvar Alterações
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
