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
      {/* Top Row: Title, Breadcrumb & Quick Add */}
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
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{criticalCount} Críticos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-400 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{inProgressCount} Ativos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{doneCount} Concluídos</span>
            </div>
          </div>

          <Button
            onClick={onOpenNewCard}
            className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20 text-xs px-4"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Card
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between bg-[#0b0f1a] p-2.5 rounded-xl border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por título, ID ou descrição (#RN-101)..."
            className="h-9 pl-9 bg-[#090d16] border-white/10 text-xs text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          {/* Categoria */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-[#090d16] px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
            className="h-9 rounded-lg border border-white/10 bg-[#090d16] px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
