"use client";

import { useState } from "react";
import { ColumnColor, COLUMN_COLOR_OPTIONS } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Check } from "lucide-react";

interface NewColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddColumn: (title: string, color: ColumnColor) => void;
}

export function NewColumnDialog({
  open,
  onOpenChange,
  onAddColumn,
}: NewColumnDialogProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<ColumnColor>("cyan");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddColumn(title.trim(), color);
    setTitle("");
    setColor("cyan");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a] backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[440px] shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <PlusCircle className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Nova Etapa do Quadro
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Crie uma nova coluna no seu fluxo Kanban.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Nome da Etapa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Nome da Etapa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Em Validação, Ideias, Backlog..."
              maxLength={40}
              autoFocus
              className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs h-9 rounded-xl focus-visible:ring-cyan-500"
            />
            <span className="text-[10px] text-slate-400 self-end">
              {title.length}/40 caracteres
            </span>
          </div>

          {/* Paleta de Cores */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Cor da Etapa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLUMN_COLOR_OPTIONS.map((item) => {
                const isSelected = color === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColor(item.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-xs"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dotColor}`} />
                    <span className="truncate flex-1 text-left">{item.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-cyan-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-3.5 py-2 text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              Criar Etapa
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
