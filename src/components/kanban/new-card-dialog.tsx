"use client";

import { useState, useEffect } from "react";
import {
  KanbanColumnDef,
  Priority,
  TaskCategory,
  StatusBadge,
  DEFAULT_STATUS_BADGES,
  getStatusBadgeColorConfig,
} from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichDescriptionEditor } from "./rich-description";
import { Tag, Check, User, X, GitBranch, FolderGit2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NewCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: KanbanColumnDef[];
  defaultColumn?: string;
  statusBadges?: StatusBadge[];
  onAddCard: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: Priority;
    column: string;
    dueDate: string;
    statusBadgeId?: string;
    assignee?: string;
    repositoryUrl?: string;
    branchName?: string;
  }) => void;
}

export function NewCardDialog({
  open,
  onOpenChange,
  columns,
  defaultColumn,
  statusBadges = DEFAULT_STATUS_BADGES,
  onAddCard,
}: NewCardDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [statusBadgeId, setStatusBadgeId] = useState<string | undefined>(undefined);
  const [assignee, setAssignee] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branchName, setBranchName] = useState("");
  const [column, setColumn] = useState<string>(() => {
    const validColIds = new Set(columns.map((c) => c.id));
    if (defaultColumn && validColIds.has(defaultColumn)) return defaultColumn;
    return columns[0]?.id || "todo";
  });
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        const validColIds = new Set(columns.map((c) => c.id));
        if (defaultColumn && validColIds.has(defaultColumn)) {
          setColumn(defaultColumn);
        } else if (columns[0]?.id) {
          setColumn(columns[0].id);
        }
      });
    }
  }, [open, defaultColumn, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validColIds = new Set(columns.map((c) => c.id));
    const finalColumn = validColIds.has(column)
      ? column
      : columns[0]?.id || defaultColumn || "todo";

    onAddCard({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      column: finalColumn,
      dueDate,
      statusBadgeId,
      assignee: assignee.trim() || undefined,
      repositoryUrl: repositoryUrl.trim() || undefined,
      branchName: branchName.trim() || undefined,
    });

    setTitle("");
    setDescription("");
    setStatusBadgeId(undefined);
    setAssignee("");
    setRepositoryUrl("");
    setBranchName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-black/60 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-comfortaa text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Novo Card</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Título da Tarefa
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa..."
              className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              autoFocus
            />
          </div>

          {/* Descrição com Suporte a Markdown & Imagens */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Descrição (opcional) & Anexos
            </label>
            <RichDescriptionEditor
              value={description}
              onChange={setDescription}
              placeholder="Detalhes técnicos, checklists, ou cole/arraste imagens (Ctrl+V)..."
            />
          </div>

          {/* Selo de Status (Opcional) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-cyan-500" />
              <span>Selo de Status (Opcional)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setStatusBadgeId(undefined)}
                className={`px-2.5 py-1 rounded-full text-xs font-comfortaa border transition-all cursor-pointer ${
                  !statusBadgeId
                    ? "bg-slate-800 text-white dark:bg-white/15 dark:text-white border-slate-700 dark:border-white/25 font-bold shadow-xs"
                    : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16]"
                }`}
              >
                Sem selo
              </button>
              {statusBadges.map((badge) => {
                const isSelected = statusBadgeId === badge.id;
                const colorConfig = getStatusBadgeColorConfig(badge.color);
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setStatusBadgeId(isSelected ? undefined : badge.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-comfortaa transition-all cursor-pointer ${
                      isSelected
                        ? `${colorConfig.badgeBg} ${colorConfig.badgeText} ${colorConfig.borderColor} ring-2 ring-cyan-500/50 font-bold shadow-sm scale-105`
                        : `${colorConfig.badgeBg} ${colorConfig.badgeText} ${colorConfig.borderColor} opacity-60 hover:opacity-100`
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${colorConfig.dotColor}`} />
                    <span>{badge.label}</span>
                    {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Coluna / Etapa Dinâmica */}
            <div className="flex flex-col gap-1.5">
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                Etapa do Quadro
              </label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer font-comfortaa"
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
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer font-comfortaa"
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
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer font-comfortaa"
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
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                Data Alvo
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Responsável da Tarefa (Opcional) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-cyan-500" />
                <span>Responsável da Tarefa (Opcional)</span>
              </label>
              {user?.name && assignee !== user.name && (
                <button
                  type="button"
                  onClick={() => setAssignee(user.name || "")}
                  className="text-[11px] font-comfortaa font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Atribuir a mim ({user.name})
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Nome do responsável..."
                maxLength={60}
                className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-comfortaa h-9 pl-9 pr-8"
              />
              {assignee && (
                <button
                  type="button"
                  onClick={() => setAssignee("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Limpar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Vínculo Git (Repositório & Branch - Opcional) */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-3 flex flex-col gap-2">
            <span className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-cyan-500" />
              <span>Vínculo Git (Opcional)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Repositório */}
              <div className="flex flex-col gap-1">
                <span className="text-[10.5px] font-comfortaa font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <FolderGit2 className="h-3 w-3 text-cyan-500" />
                  <span>Repositório</span>
                </span>
                <div className="relative flex items-center">
                  <Input
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="Repositório Git..."
                    maxLength={200}
                    className="h-8.5 bg-white dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-mono pr-7 rounded-xl"
                  />
                  {repositoryUrl && (
                    <button
                      type="button"
                      onClick={() => setRepositoryUrl("")}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                      title="Limpar repositório"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Branch */}
              <div className="flex flex-col gap-1">
                <span className="text-[10.5px] font-comfortaa font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <GitBranch className="h-3 w-3 text-cyan-500" />
                  <span>Branch</span>
                </span>
                <div className="relative flex items-center">
                  <Input
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Nome da branch..."
                    maxLength={100}
                    className="h-8.5 bg-white dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-mono pr-7 rounded-xl"
                  />
                  {branchName && (
                    <button
                      type="button"
                      onClick={() => setBranchName("")}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                      title="Limpar branch"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer font-comfortaa"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-xl text-xs font-bold font-comfortaa bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Criar Card
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
