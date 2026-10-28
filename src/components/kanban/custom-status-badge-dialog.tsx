"use client";

import { useState } from "react";
import {
  StatusBadge,
  BADGE_COLOR_OPTIONS,
  getStatusBadgeColorConfig,
} from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tag,
  Plus,
  Trash2,
  Check,
  Palette,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface CustomStatusBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusBadges: StatusBadge[];
  selectedBadgeId?: string;
  onSelectBadge?: (badgeId: string | undefined) => void;
  onAddStatusBadge: (label: string, color: string) => StatusBadge;
  onDeleteStatusBadge: (id: string) => void;
}

export function CustomStatusBadgeDialog({
  open,
  onOpenChange,
  statusBadges,
  selectedBadgeId,
  onSelectBadge,
  onAddStatusBadge,
  onDeleteStatusBadge,
}: CustomStatusBadgeDialogProps) {
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState("cyan");
  const [isCreating, setIsCreating] = useState(false);

  const previewColorConfig = getStatusBadgeColorConfig(selectedColor);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      toast.error("Informe um nome para o selo.");
      return;
    }

    const created = onAddStatusBadge(newLabel.trim(), selectedColor);
    setNewLabel("");
    setIsCreating(false);

    if (onSelectBadge) {
      onSelectBadge(created.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl dark:shadow-black/70 rounded-3xl p-6">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="font-comfortaa text-base font-bold text-slate-900 dark:text-white">
                Selos de Status
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Crie ou selecione um selo personalizado para identificar o estado do card.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-3">
          {/* Formulário de Criação de Novo Selo */}
          {isCreating ? (
            <form
              onSubmit={handleCreate}
              className="rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="font-comfortaa text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Criar Novo Selo</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Nome do Selo */}
              <div className="flex flex-col gap-1.5">
                <label className="font-comfortaa text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Nome do Selo
                </label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nome do selo..."
                  maxLength={30}
                  autoFocus
                  className="bg-white dark:bg-[#090d16] border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white rounded-xl h-9"
                />
              </div>

              {/* Seleção de Cor */}
              <div className="flex flex-col gap-1.5">
                <label className="font-comfortaa text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Palette className="h-3 w-3 text-cyan-500" />
                  <span>Cor do Selo</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {BADGE_COLOR_OPTIONS.map((c) => {
                    const isSelected = selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0b0f1a] ${c.ringColor} scale-110 shadow-md`
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        title={c.name}
                      >
                        <span className={`h-5 w-5 rounded-full ${c.dotColor}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pré-visualização ao Vivo */}
              <div className="flex items-center justify-between border-t border-cyan-500/20 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Prévia:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-comfortaa font-bold tracking-wide ${previewColorConfig.badgeBg} ${previewColorConfig.badgeText} ${previewColorConfig.borderColor} shadow-xs`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${previewColorConfig.dotColor} shadow-[0_0_6px_currentColor]`}
                    />
                    <span>{newLabel.trim() || "Exemplo de Selo"}</span>
                  </span>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-comfortaa text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Salvar Selo</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-comfortaa text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Novo Selo de Status</span>
            </button>
          )}

          {/* Opção de "Nenhum Selo" */}
          {onSelectBadge && (
            <button
              type="button"
              onClick={() => {
                onSelectBadge(undefined);
                onOpenChange(false);
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer font-comfortaa text-xs ${
                !selectedBadgeId
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs"
                  : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-white/[0.02]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Nenhum selo (Sem etiqueta)</span>
              </span>
              {!selectedBadgeId && <Check className="h-4 w-4 text-cyan-500" />}
            </button>
          )}

          {/* Lista de Selos Disponíveis */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
              Selos Disponíveis ({statusBadges.length})
            </span>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {statusBadges.map((badge) => {
                const colorConfig = getStatusBadgeColorConfig(badge.color);
                const isSelected = selectedBadgeId === badge.id;

                return (
                  <div
                    key={badge.id}
                    onClick={() => {
                      if (onSelectBadge) {
                        onSelectBadge(badge.id);
                        onOpenChange(false);
                      }
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 ring-1 ring-cyan-500/50 bg-cyan-50/70 dark:bg-cyan-500/10 shadow-xs"
                        : "border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-comfortaa font-bold ${colorConfig.badgeBg} ${colorConfig.badgeText} ${colorConfig.borderColor}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${colorConfig.dotColor} shadow-[0_0_6px_currentColor]`}
                        />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold mr-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Selecionado</span>
                        </span>
                      )}

                      {/* Botão de Excluir Selo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStatusBadge(badge.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition-all cursor-pointer"
                        title="Excluir este selo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
