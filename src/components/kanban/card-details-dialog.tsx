"use client";

import { useState } from "react";
import {
  PlannerTask,
  KanbanColumnDef,
  Priority,
  TaskCategory,
  getColumnColorConfig,
} from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Trash2,
  Copy,
  Check,
  Clock,
  Layers,
  AlertTriangle,
  Tag,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { RichDescriptionEditor } from "./rich-description";

interface CardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: PlannerTask | null;
  columns: KanbanColumnDef[];
  onUpdateTask: (id: string, updates: Partial<PlannerTask>) => void;
  onDeleteTask: (id: string) => void;
}

const CATEGORY_MAP: Record<TaskCategory, { label: string; bg: string; text: string }> = {
  work: { label: "Tech / Trabalho", bg: "bg-[#06b6d4]/10 border-[#06b6d4]/25", text: "text-[#06b6d4]" },
  study: { label: "Estudo", bg: "bg-[#f59e0b]/10 border-[#f59e0b]/25", text: "text-[#f59e0b]" },
  health: { label: "Saúde / Treino", bg: "bg-[#10b981]/10 border-[#10b981]/25", text: "text-[#10b981]" },
  finance: { label: "Finanças", bg: "bg-[#10b981]/10 border-[#10b981]/25", text: "text-[#10b981]" },
  personal: { label: "Pessoal", bg: "bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10", text: "text-slate-600 dark:text-slate-300" },
};

function formatCreationDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function CardDetailsDialog({
  open,
  onOpenChange,
  task,
  columns,
  onUpdateTask,
  onDeleteTask,
}: CardDetailsDialogProps) {
  const [prevTask, setPrevTask] = useState(task);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [column, setColumn] = useState<string>(task?.column || columns[0]?.id || "todo");
  const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
  const [category, setCategory] = useState<TaskCategory>(task?.category || "work");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sincroniza estado quando a task selecionada mudar
  if (task !== prevTask) {
    setPrevTask(task);
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setColumn(task?.column || columns[0]?.id || "todo");
    setPriority(task?.priority || "medium");
    setCategory(task?.category || "work");
    setDueDate(task?.dueDate || "");
    setConfirmDelete(false);
    setCopiedCode(false);
  }

  if (!task) return null;

  const currentColumnDef = columns.find((c) => c.id === column);
  const columnColorConfig = currentColumnDef ? getColumnColorConfig(currentColumnDef.color) : null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(task.code);
      setCopiedCode(true);
      toast.info(`Código ${task.code} copiado!`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("O título do card não pode estar vazio.");
      return;
    }

    onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      column,
      priority,
      category,
      dueDate,
    });

    toast.success(`Card ${task.code} atualizado!`);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDeleteTask(task.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-black/70 rounded-3xl p-6">
        <DialogHeader className="gap-3">
          {/* Top Bar: Código da tarefa & Etapa Atual */}
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="group flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 transition-all cursor-pointer shadow-xs"
                title="Copiar código do card"
              >
                <span>{task.code}</span>
                {copiedCode ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              {columnColorConfig && (
                <div
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-comfortaa font-medium ${columnColorConfig.badgeBg} ${columnColorConfig.badgeText}`}
                >
                  <span className={`h-2 w-2 rounded-full ${columnColorConfig.dotColor}`} />
                  <span>{currentColumnDef?.title}</span>
                </div>
              )}
            </div>

            {/* Prioridade atual em destaque */}
            <div>
              {priority === "critical" && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-[#f43f5e] bg-[#f43f5e]/15 px-2.5 py-1 rounded-xl border border-[#f43f5e]/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                  <span className="h-2 w-2 rounded-full bg-[#f43f5e] animate-pulse" />
                  Prioridade Crítica
                </span>
              )}
              {priority === "medium" && (
                <span className="text-xs font-mono font-extrabold text-[#f59e0b] bg-[#f59e0b]/15 px-2.5 py-1 rounded-xl border border-[#f59e0b]/30">
                  Prioridade Média
                </span>
              )}
              {priority === "low" && (
                <span className="text-xs font-mono font-extrabold text-[#06b6d4] bg-[#06b6d4]/10 px-2.5 py-1 rounded-xl border border-[#06b6d4]/20">
                  Prioridade Baixa
                </span>
              )}
            </div>
          </div>

          <DialogTitle className="sr-only">
            Detalhes do Card {task.code}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Título da Tarefa */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Título da Tarefa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa..."
              maxLength={120}
              className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl h-10 font-comfortaa"
            />
          </div>

          {/* Descrição Detalhada com Suporte a Markdown & Imagens */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descrição da Tarefa & Anexos
            </label>
            <RichDescriptionEditor
              value={description}
              onChange={setDescription}
              placeholder="Descreva os requisitos, checklists, notas técnicas, ou cole/arraste imagens (Ctrl+V)..."
            />
          </div>

          {/* Grid de Metadados / Propriedades */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Etapa / Coluna */}
              <div className="flex flex-col gap-1.5">
                <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Etapa do Quadro</span>
                </label>
                <select
                  value={column}
                  onChange={(e) => setColumn(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer font-comfortaa"
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
                <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Prioridade</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer font-comfortaa"
                >
                  <option value="critical">Crítica (Urgente)</option>
                  <option value="medium">Média (Padrão)</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              {/* Categoria */}
              <div className="flex flex-col gap-1.5">
                <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Categoria</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer font-comfortaa"
                >
                  <option value="work">Tech / Trabalho</option>
                  <option value="study">Estudo</option>
                  <option value="health">Saúde / Treino</option>
                  <option value="finance">Finanças</option>
                  <option value="personal">Pessoal</option>
                </select>
              </div>

              {/* Data Alvo / Prazo */}
              <div className="flex flex-col gap-1.5">
                <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Data de Entrega</span>
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono h-9"
                />
              </div>
            </div>

            {/* Informações de Auditoria / Criação */}
            <div className="flex items-center gap-1.5 border-t border-slate-200/60 dark:border-white/5 pt-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <Clock className="h-3.5 w-3.5" />
              <span>Criado em {formatCreationDate(task.createdAt)}</span>
            </div>
          </div>

          {/* Footer com Ações */}
          <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            {/* Botão de Excluir */}
            <button
              type="button"
              onClick={handleDelete}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer font-comfortaa ${
                confirmDelete
                  ? "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20"
                  : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{confirmDelete ? "Confirmar exclusão?" : "Excluir Card"}</span>
            </button>

            {/* Ações de Cancelar e Salvar */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer font-comfortaa"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-bold font-comfortaa bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
