"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  AlertCircle,
  Clock,
  Share2,
  Check,
  Columns3,
  ListTodo,
  AlertTriangle,
  LogOut,
  Kanban,
  PenTool,
  Menu,
  ArrowUpDown,
} from "lucide-react";
import { PlannerTask, ColumnSortOption } from "@/types/planner";
import { SyncStatus } from "@/lib/planner-store";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { UserButton } from "@/components/auth/user-button";
import { SupabaseSetupDialog } from "./supabase-setup-dialog";

interface KanbanHeaderProps {
  tasks: PlannerTask[];
  columnsCount: number;
  syncStatus: SyncStatus;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  onOpenNewCard: () => void;
  onOpenNewColumn: () => void;
  onSyncLocalToCloud?: () => void;
  activeTab?: "kanban" | "whiteboard";
  setActiveTab?: (tab: "kanban" | "whiteboard") => void;
  onToggleMobileMenu?: () => void;
  onApplySortToAllColumns?: (sortBy: ColumnSortOption) => void;
}

export function KanbanHeader({
  tasks,
  columnsCount,
  syncStatus,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  onOpenNewCard,
  onOpenNewColumn,
  onSyncLocalToCloud,
  activeTab = "kanban",
  setActiveTab,
  onToggleMobileMenu,
  onApplySortToAllColumns,
}: KanbanHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const { user, isGuestMode, exitGuestMode } = useAuth();

  const totalTasks = tasks.length;
  const criticalCount = tasks.filter((t) => t.priority === "critical").length;
  const inProgressCount = tasks.filter(
    (t) =>
      t.column === "in_progress" ||
      t.column.toLowerCase().includes("prog") ||
      t.column.toLowerCase().includes("andamento") ||
      t.column.toLowerCase().includes("exec")
  ).length;
  const doneCount = tasks.filter(
    (t) =>
      t.column === "done" ||
      t.column.toLowerCase().includes("done") ||
      t.column.toLowerCase().includes("conclu") ||
      t.column.toLowerCase().includes("finaliz")
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        if (navigator.share) {
          await navigator.share({
            title: "RN Planner | Personal Operating System",
            text: "Quadro de execução pessoal com etapas personalizadas, foco e métricas.",
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
      {/* Top Row: Brand & Quick Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          {/* Botão de Menu para Mobile */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 md:hidden text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-comfortaa text-lg font-bold text-slate-900 dark:text-white">
                {activeTab === "kanban" ? "Card" : "Excalidraw"}
              </h1>
              {activeTab === "kanban" ? (
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-500/20">
                  {totalTasks} {totalTasks === 1 ? "tarefa" : "tarefas"}
                </span>
              ) : (
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-500/20">
                  Whiteboard
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              {activeTab === "kanban"
                ? `${columnsCount} etapas de trabalho • Foco e execução`
                : "Ideação livre, diagramas e arquitetura"}
            </p>
          </div>

          {/* Sync Status (apenas quando precisa de ação ou aviso - 'Nuvem Ativa' removida conforme solicitado) */}
          {syncStatus === "syncing" && (
            <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-mono font-medium">
              <div className="h-2.5 w-2.5 animate-spin rounded-full border border-cyan-500 dark:border-cyan-400 border-t-transparent" />
              <span className="font-comfortaa">Salvando...</span>
            </div>
          )}

          {syncStatus === "needs_schema" && (
            <button
              onClick={() => setIsSetupDialogOpen(true)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 text-[11px] font-comfortaa font-bold transition-all cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.2)]"
              title="Clique para ver instruções de ativação das tabelas no Supabase"
            >
              <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span>Configurar Banco</span>
            </button>
          )}

          {syncStatus === "local" && (
            <button
              onClick={onSyncLocalToCloud}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/80 dark:bg-[#0b0f1a]/95 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[11px] font-comfortaa transition-all cursor-pointer shadow-xs"
              title="Salvo apenas neste navegador. Faça login para salvar na nuvem."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>Modo Local</span>
            </button>
          )}

          {syncStatus === "error" && (
            <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-mono font-medium">
              <AlertCircle className="h-3 w-3 text-rose-500 dark:text-rose-400" />
              <span className="font-comfortaa">Offline / Erro</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de Compartilhar Link */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-xs"
            title="Copiar link ou compartilhar o planner"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-comfortaa">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline font-comfortaa">Compartilhar</span>
              </>
            )}
          </button>

          {/* Alternador de Tema */}
          <ThemeToggle />

          {/* Se estiver no Modo Convidado: Botão para Retornar ao Login */}
          {isGuestMode && !user && (
            <button
              onClick={exitGuestMode}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#0b0f1a]/95 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-comfortaa transition-all cursor-pointer shadow-xs"
              title="Voltar à tela inicial de login"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Tela de Login</span>
            </button>
          )}

          {/* Auth Button com Perfil, Trocar de Conta e Logout */}
          <UserButton />

          {/* Botões específicos do Kanban */}
          {activeTab === "kanban" && (
            <>
              {/* Botão Nova Etapa */}
              <button
                onClick={onOpenNewColumn}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-xs"
                title="Criar nova etapa no quadro"
              >
                <Columns3 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline font-comfortaa">Nova Etapa</span>
              </button>

              {/* Botão Novo Card Principal */}
              <button
                onClick={onOpenNewCard}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold font-comfortaa bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Card</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === "kanban" && (
        <>
          {/* Row of 4 Obsidian Glass Metric Cards with Semantic Neon Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
            {/* Cyan Metric: Total de Tarefas (#06b6d4) */}
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 hover:border-cyan-500/40 p-3.5 transition-all duration-200 shadow-sm dark:shadow-xl dark:shadow-black/20 group">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80" />
              <div className="flex items-center justify-between">
                <span className="font-comfortaa text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Total Tarefas
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                  <ListTodo className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
                  {totalTasks}
                </span>
                <span className="font-mono text-[11px] text-[#06b6d4] font-bold">
                  {columnsCount} etapas
                </span>
              </div>
            </div>

            {/* Amber Metric: Em Execução (#f59e0b) */}
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 p-3.5 transition-all duration-200 shadow-sm dark:shadow-xl dark:shadow-black/20 group">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-80" />
              <div className="flex items-center justify-between">
                <span className="font-comfortaa text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Em Execução
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono font-extrabold text-2xl text-[#f59e0b] tracking-tight">
                  {inProgressCount}
                </span>
                <span className="font-mono text-[11px] text-[#f59e0b] font-bold">
                  foco ativo
                </span>
              </div>
            </div>

            {/* Rose/Magenta Metric: Críticos / Urgentes (#f43f5e) */}
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 hover:border-rose-500/40 p-3.5 transition-all duration-200 shadow-sm dark:shadow-xl dark:shadow-black/20 group">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#f43f5e] to-transparent opacity-80" />
              <div className="flex items-center justify-between">
                <span className="font-comfortaa text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Prioridade Crítica
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]">
                  <AlertCircle className={`h-3.5 w-3.5 ${criticalCount > 0 ? "animate-pulse" : ""}`} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono font-extrabold text-2xl text-[#f43f5e] tracking-tight">
                  {criticalCount}
                </span>
                <span className="font-mono text-[11px] text-[#f43f5e] font-bold">
                  {criticalCount > 0 ? "ação urgente" : "sob controle"}
                </span>
              </div>
            </div>

            {/* Emerald Metric: Concluídas (#10b981) */}
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 p-3.5 transition-all duration-200 shadow-sm dark:shadow-xl dark:shadow-black/20 group">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-80" />
              <div className="flex items-center justify-between">
                <span className="font-comfortaa text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Concluídas
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono font-extrabold text-2xl text-[#10b981] tracking-tight">
                  {doneCount}
                </span>
                <span className="font-mono font-extrabold text-[11px] text-[#10b981]">
                  {completionRate}% taxa
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Busca e Filtros em Obsidian Glass */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between bg-white/80 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-lg dark:shadow-black/20 animate-in fade-in duration-200">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por título, código (#RN-101)..."
                className="h-9 pl-9 bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2">
              {/* Categoria */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-xs font-comfortaa"
              >
                <option value="all">Todas Categorias</option>
                <option value="work">Tech / Trabalho</option>
                <option value="study">Estudo</option>
                <option value="health">Saúde / Treino</option>
                <option value="finance">Finanças</option>
                <option value="personal">Pessoal</option>
              </select>

              {/* Prioridade */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-xs font-comfortaa"
              >
                <option value="all">Todas Prioridades</option>
                <option value="critical">Crítica</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              {/* Ordenar Todas as Etapas */}
              {onApplySortToAllColumns && (
                <div className="relative">
                  <select
                    defaultValue="manual"
                    onChange={(e) => {
                      const val = e.target.value as ColumnSortOption;
                      onApplySortToAllColumns(val);
                    }}
                    className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-xs font-comfortaa"
                    title="Organizar todas as etapas do quadro de uma só vez"
                  >
                    <option value="manual">Ordenar: Manual (Padrão)</option>
                    <option value="priority-desc">Ordenar: Prioridade (Alta → Baixa)</option>
                    <option value="priority-asc">Ordenar: Prioridade (Baixa → Alta)</option>
                    <option value="date-desc">Ordenar: Data (Mais novo → Antigo)</option>
                    <option value="date-asc">Ordenar: Data (Mais antigo → Novo)</option>
                    <option value="due-asc">Ordenar: Prazo (Mais próximo)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <SupabaseSetupDialog
        open={isSetupDialogOpen}
        onOpenChange={setIsSetupDialogOpen}
      />
    </div>
  );
}