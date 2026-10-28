"use client";

import { useState } from "react";
import {
  PlannerTask,
  KanbanColumnDef,
  Priority,
  TaskCategory,
  getColumnColorConfig,
  StatusBadge,
  DEFAULT_STATUS_BADGES,
  getStatusBadgeColorConfig,
  CardComment,
  formatCardCode,
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
  MessageSquareText,
  Send,
  MessageSquareDashed,
  User,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RichDescriptionEditor } from "./rich-description";
import { CustomStatusBadgeDialog } from "./custom-status-badge-dialog";
import { useAuth } from "@/lib/auth-context";

interface CardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: PlannerTask | null;
  columns: KanbanColumnDef[];
  statusBadges?: StatusBadge[];
  onAddStatusBadge?: (label: string, color: string) => StatusBadge;
  onDeleteStatusBadge?: (id: string) => void;
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
  statusBadges = DEFAULT_STATUS_BADGES,
  onAddStatusBadge,
  onDeleteStatusBadge,
  onUpdateTask,
  onDeleteTask,
}: CardDetailsDialogProps) {
  const { user } = useAuth();
  const [prevTask, setPrevTask] = useState(task);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [column, setColumn] = useState<string>(task?.column || columns[0]?.id || "todo");
  const [priority, setPriority] = useState<Priority>(task?.priority || "medium");
  const [category, setCategory] = useState<TaskCategory>(task?.category || "work");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [statusBadgeId, setStatusBadgeId] = useState<string | undefined>(task?.statusBadgeId);
  const [assignee, setAssignee] = useState(task?.assignee || "");
  const [comments, setComments] = useState<CardComment[]>(task?.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
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
    setStatusBadgeId(task?.statusBadgeId);
    setAssignee(task?.assignee || "");
    setComments(task?.comments || []);
    setNewCommentText("");
    setConfirmDelete(false);
    setCopiedCode(false);
  }

  if (!task) return null;

  const currentColumnDef = columns.find((c) => c.id === column);
  const columnColorConfig = currentColumnDef ? getColumnColorConfig(currentColumnDef.color) : null;

  const activeBadge = statusBadgeId
    ? statusBadges.find((b) => b.id === statusBadgeId)
    : null;
  const activeBadgeConfig = activeBadge ? getStatusBadgeColorConfig(activeBadge.color) : null;

  const formattedCode = formatCardCode(task?.code);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode);
      setCopiedCode(true);
      toast.info(`Código ${formattedCode} copiado!`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const authorName =
      user?.name ||
      user?.email?.split("@")[0] ||
      "Você";

    const newComment: CardComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      authorName,
      authorEmail: user?.email,
    };

    const nextComments = [newComment, ...comments];
    setComments(nextComments);
    setNewCommentText("");

    if (task) {
      onUpdateTask(task.id, { comments: nextComments });
    }
    toast.success("Comentário adicionado!");
  };

  const handleDeleteComment = (commentId: string) => {
    const nextComments = comments.filter((c) => c.id !== commentId);
    setComments(nextComments);
    if (task) {
      onUpdateTask(task.id, { comments: nextComments });
    }
    toast.success("Comentário removido");
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
      statusBadgeId,
      comments,
      assignee: assignee.trim() || undefined,
    });

    toast.success(`Card ${formattedCode} atualizado!`);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[760px] max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-black/70 rounded-3xl p-6">
          <DialogHeader className="gap-3">
            {/* Top Bar: Código da tarefa, Etapa Atual e Selo de Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="group flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 transition-all cursor-pointer shadow-xs"
                  title="Copiar código do card"
                >
                  <span>{formattedCode}</span>
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

                {activeBadge && activeBadgeConfig && (
                  <div
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-comfortaa font-bold uppercase tracking-wider ${activeBadgeConfig.badgeBg} ${activeBadgeConfig.badgeText} ${activeBadgeConfig.borderColor}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${activeBadgeConfig.dotColor} shadow-[0_0_6px_currentColor]`}
                    />
                    <span>{activeBadge.label}</span>
                  </div>
                )}

                {assignee.trim() && (
                  <div
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-white/[0.05] px-2.5 py-1 text-xs font-comfortaa font-medium text-slate-700 dark:text-slate-300"
                    title={`Responsável: ${assignee.trim()}`}
                  >
                    <span className="h-4 w-4 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold text-[9px] flex items-center justify-center uppercase font-mono border border-cyan-500/30">
                      {assignee.trim().charAt(0)}
                    </span>
                    <span className="max-w-[120px] truncate">{assignee.trim()}</span>
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
              Detalhes do Card {formattedCode}
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

            {/* Seção: Selo de Status Personalizável */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Selo de Status Personalizável</span>
                </label>

                {onAddStatusBadge && (
                  <button
                    type="button"
                    onClick={() => setIsBadgeModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-comfortaa font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Criar Selos</span>
                  </button>
                )}
              </div>

              {/* Lista de Selos em Formato de Chips Elegantes */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setStatusBadgeId(undefined)}
                  className={`px-3 py-1 rounded-full text-xs font-comfortaa border transition-all cursor-pointer ${
                    !statusBadgeId
                      ? "bg-slate-800 text-white dark:bg-white/15 dark:text-white border-slate-700 dark:border-white/25 font-bold shadow-xs"
                      : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#090d16]"
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-comfortaa transition-all cursor-pointer ${
                        isSelected
                          ? `${colorConfig.badgeBg} ${colorConfig.badgeText} ${colorConfig.borderColor} ring-2 ring-cyan-500/50 font-bold shadow-md scale-105`
                          : `${colorConfig.badgeBg} ${colorConfig.badgeText} ${colorConfig.borderColor} opacity-60 hover:opacity-100 hover:scale-102`
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${colorConfig.dotColor}`} />
                      <span>{badge.label}</span>
                      {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                    </button>
                  );
                })}

                {onAddStatusBadge && (
                  <button
                    type="button"
                    onClick={() => setIsBadgeModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-cyan-500/40 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 text-xs font-comfortaa font-medium transition-all cursor-pointer"
                    title="Adicionar novo selo personalizado"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Novo Selo</span>
                  </button>
                )}
              </div>
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

                {/* Responsável da Tarefa */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-cyan-500" />
                      <span>Responsável da Tarefa</span>
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
                      placeholder="Nome do responsável (ex: Renan Britto, Equipe Dev)..."
                      maxLength={60}
                      className="bg-white dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-comfortaa h-9 pl-9 pr-8"
                    />
                    {assignee && (
                      <button
                        type="button"
                        onClick={() => setAssignee("")}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Remover responsável"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações de Auditoria / Criação */}
              <div className="flex items-center gap-1.5 border-t border-slate-200/60 dark:border-white/5 pt-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Criado em {formatCreationDate(task.createdAt)}</span>
              </div>
            </div>

            {/* SEÇÃO DE COMENTÁRIOS & HISTÓRICO DE PROGRESSO */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-comfortaa text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span>Comentários & Histórico de Progresso</span>
                      <span className="font-mono text-[10px] bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        {comments.length}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registre o que foi feito, o que falta fazer e alinhamentos importantes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Caixa de Entrada de Comentário */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    placeholder="Escreva uma atualização ou nota (ex: 'Finalizei a query SQL e comecei a UI'). Pressione Ctrl+Enter para enviar..."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#090d16] p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y font-sans leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Dica: use <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[10px]">Enter</kbd> para enviar
                  </span>

                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={!newCommentText.trim()}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-comfortaa font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="h-3 w-3" />
                    <span>Adicionar Comentário</span>
                  </button>
                </div>
              </div>

              {/* Feed de Comentários Anteriores */}
              <div className="flex flex-col gap-2.5 pt-2">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-slate-300/80 dark:border-white/10 text-center">
                    <MessageSquareDashed className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-1" />
                    <span className="font-comfortaa text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Nenhum comentário registrado ainda
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                      Use o campo acima para registrar o que já fez ou o que falta fazer neste card.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="group relative flex flex-col gap-1.5 rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white dark:bg-[#090d16]/90 p-3.5 shadow-xs hover:border-slate-300 dark:hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-[10px] font-bold text-slate-950 uppercase shadow-xs">
                              {comment.authorName ? comment.authorName[0] : <User className="h-3 w-3" />}
                            </div>
                            <span className="font-comfortaa text-xs font-bold text-slate-800 dark:text-slate-200">
                              {comment.authorName || "Você"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              • {formatCreationDate(comment.createdAt)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1 rounded-lg transition-all cursor-pointer"
                            title="Excluir este comentário"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap pl-8">
                          {comment.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Modal Secundário de Criar & Personalizar Selos */}
      {onAddStatusBadge && onDeleteStatusBadge && (
        <CustomStatusBadgeDialog
          open={isBadgeModalOpen}
          onOpenChange={setIsBadgeModalOpen}
          statusBadges={statusBadges}
          selectedBadgeId={statusBadgeId}
          onSelectBadge={(badgeId) => setStatusBadgeId(badgeId)}
          onAddStatusBadge={onAddStatusBadge}
          onDeleteStatusBadge={onDeleteStatusBadge}
        />
      )}
    </>
  );
}
