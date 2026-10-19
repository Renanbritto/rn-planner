"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Priority, TaskCategory, PlannerTask } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<PlannerTask, "id" | "createdAt">) => void;
}

export function NewTaskDialog({
  open,
  onOpenChange,
  onAddTask,
}: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      priority,
      dueDate,
      completed: false,
    });

    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b0f1a] text-slate-100 sm:max-w-[440px] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <span>Criar Nova Tarefa</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Título da Tarefa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinar modelo XGBoost ou Fechar relatório"
              className="bg-[#090d16] border-white/10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Data de Execução
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-[#090d16] border-white/10 text-xs text-white focus-visible:ring-cyan-500"
            />
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
              Adicionar Tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
