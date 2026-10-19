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
import { Button } from "@/components/ui/button";

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
      <DialogContent className="border-white/10 bg-[#0b0f1a] text-slate-100 sm:max-w-[480px] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
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
              className="bg-[#090d16] border-white/10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
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
              className="rounded-md border border-white/10 bg-[#090d16] p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
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
                className="h-9 rounded-md border border-white/10 bg-[#090d16] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                className="h-9 rounded-md border border-white/10 bg-[#090d16] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                className="h-9 rounded-md border border-white/10 bg-[#090d16] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                className="bg-[#090d16] border-white/10 text-xs text-white focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold"
            >
              Criar Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
