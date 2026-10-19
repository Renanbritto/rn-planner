"use client";

import { useState, useEffect } from "react";
import { KanbanColumn, Priority, TaskCategory } from "@/types/planner";
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
  defaultColumn?: KanbanColumn;
  onAddCard: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: Priority;
    column: KanbanColumn;
    dueDate: string;
  }) => void;
}

export function NewCardDialog({
  open,
  onOpenChange,
  defaultColumn = "todo",
  onAddCard,
}: NewCardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [column, setColumn] = useState<KanbanColumn>(defaultColumn);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (defaultColumn) {
      setColumn(defaultColumn);
    }
  }, [defaultColumn, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddCard({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      column,
      dueDate,
    });

    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-[#0b0f1a] backdrop-blur-2xl text-slate-100 sm:max-w-[480px] shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <span>Novo Card</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Título da Tarefa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinar modelo XGBoost ou Refatorar queries"
              className="bg-[#090d16] border-white/10 hover:border-white/20 text-xs text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              autoFocus
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Descrição (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes técnicos ou escopo da tarefa..."
              className="rounded-xl border border-white/10 hover:border-white/20 bg-[#090d16] p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Coluna Inicial */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Coluna Inicial
              </label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value as KanbanColumn)}
                className="h-9 rounded-xl border border-white/10 hover:border-white/20 bg-[#090d16] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="blocked">Atenção / Bloqueado</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            {/* Prioridade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-9 rounded-xl border border-white/10 hover:border-white/20 bg-[#090d16] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
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
              <label className="text-xs font-medium text-slate-300">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="h-9 rounded-xl border border-white/10 hover:border-white/20 bg-[#090d16] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
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
              <label className="text-xs font-medium text-slate-300">
                Data Alvo
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#090d16] border-white/10 hover:border-white/20 text-xs text-white focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              Criar Card
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
