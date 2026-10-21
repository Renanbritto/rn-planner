"use client";

import { useState, useEffect } from "react";
import { KanbanColumnDef, Priority, TaskCategory } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface NewCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: KanbanColumnDef[];
  defaultColumn?: string;
  onAddCard: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: Priority;
    column: string;
    dueDate: string;
  }) => void;
}

export function NewCardDialog({
  open,
  onOpenChange,
  columns,
  defaultColumn,
  onAddCard,
}: NewCardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [column, setColumn] = useState<string>(
    defaultColumn || columns[0]?.id || "todo"
  );
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (defaultColumn) {
      setColumn(defaultColumn);
    } else if (columns.length > 0 && !columns.some((c) => c.id === column)) {
      setColumn(columns[0].id);
    }
  }, [defaultColumn, columns, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddCard({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      column: column || columns[0]?.id || "todo",
      dueDate,
    });

    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a] backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[480px] shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Novo Card</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Título da Tarefa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinar modelo XGBoost ou Refatorar queries"
              className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              autoFocus
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Descrição (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes técnicos ou escopo da tarefa..."
              className="rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Coluna / Etapa Dinâmica */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Etapa do Quadro
              </label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="critical">Crítica (Urgente)</option>
                <option value="medium">Média (Padrão)</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Categoria */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="work">Tech / Trabalho</option>
                <option value="study">Estudo</option>
                <option value="health">Saúde / Treino</option>
                <option value="finance">Finanças</option>
                <option value="personal">Pessoal</option>
              </select>
            </div>

            {/* Data de Entrega */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Data Alvo
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8 px-3 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xs transition-all cursor-pointer"
            >
              Criar Card
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
