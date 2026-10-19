"use client";

import { useState } from "react";
import { Search, Plus, AlertCircle, CheckCircle2, Clock, Share2, Check } from "lucide-react";
import { PlannerTask } from "@/types/planner";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { UserButton } from "@/components/auth/user-button";

interface KanbanHeaderProps {
  tasks: PlannerTask[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  onOpenNewCard: () => void;
}

export function KanbanHeader({
  tasks,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  onOpenNewCard,
}: KanbanHeaderProps) {
  const [copied, setCopied] = useState(false);

  const criticalCount = tasks.filter((t) => t.priority === "critical" && t.column !== "done").length;
  const inProgressCount = tasks.filter((t) => t.column === "in_progress").length;
  const doneCount = tasks.filter((t) => t.column === "done").length;

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        if (navigator.share) {
          await navigator.share({
            title: "planner",
            text: "Quadro de execução pessoal com arrastar e soltar, foco diário e métricas.",
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
      {/* Top Row: Logo & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Minimalist Brand Logo */}
        <div className="flex items-center gap-3">
          <BrandLogo size={36} showText={true} />
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Sprint Ativa</span>
          </div>
        </div>

        {/* Action Buttons & Fast Stats */}
        <div className="flex items-center gap-2">
          {/* Status Badges */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-600 dark:text-rose-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{criticalCount} Críticos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-600 dark:text-cyan-400 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{inProgressCount} Ativos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{doneCount} Concluídos</span>
            </div>
          </div>

          {/* Botão de Compartilhar Link */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/[0.8] hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 dark:hover:border-cyan-400/30 transition-all cursor-pointer shadow-xs"
            title="Copiar link ou compartilhar o planner"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Compartilhar</span>
              </>
            )}
          </button>

          {/* Alternador de Tema (Claro / Obsidian) */}
          <ThemeToggle />

          {/* Login Rápido com Google */}
          <UserButton />

          {/* Botão Novo Card */}
          <button
            onClick={onOpenNewCard}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold bg-white/[0.8] hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)] transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Novo Card</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between bg-white/70 dark:bg-[#0b0f1a] backdrop-blur-2xl p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por título, ID ou descrição (#RN-101)..."
            className="h-9 pl-9 bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          {/* Categoria */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-xs"
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
            className="h-9 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16] px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer shadow-xs"
          >
            <option value="all">Todas Prioridades</option>
            <option value="critical">Crítica</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>
    </div>
  );
}