"use client";

import { Search, Plus, LayoutGrid, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PlannerTask } from "@/types/planner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const criticalCount = tasks.filter((t) => t.priority === "critical" && t.column !== "done").length;
  const inProgressCount = tasks.filter((t) => t.column === "in_progress").length;
  const doneCount = tasks.filter((t) => t.column === "done").length;

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
      {/* Top Row: Title & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <LayoutGrid className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-semibold">RN Planner</span>
            <span>/</span>
            <span className="text-cyan-400">Sprint Ativa</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Quadro de Execução & Tarefas
          </h1>
        </div>

        {/* Action Button & Fast Stats */}
        <div className="flex items-center gap-3">
          {/* Status Badges */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{criticalCount} Críticos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-400 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{inProgressCount} Ativos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{doneCount} Concluídos</span>
            </div>
          </div>

          {/* Botão Novo Card com Estilo Obsidian */}
          <button
            onClick={onOpenNewCard}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>Novo Card</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros - Superfície #0b0f1a */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between bg-[#0b0f1a] backdrop-blur-2xl p-2.5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por título, ID ou descrição (#RN-101)..."
            className="h-9 pl-9 bg-[#090d16] border-white/10 hover:border-white/20 text-xs text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          {/* Categoria */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-white/10 hover:border-white/20 bg-[#090d16] px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
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
            className="h-9 rounded-xl border border-white/10 hover:border-white/20 bg-[#090d16] px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
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
