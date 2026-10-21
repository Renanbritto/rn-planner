"use client";

import { useState } from "react";
import { KanbanColumnDef } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: KanbanColumnDef | null;
  tasksCount: number;
  availableColumns: KanbanColumnDef[];
  onConfirmDelete: (
    columnId: string,
    options?: { moveTasksToColumnId?: string }
  ) => void;
}

export function DeleteColumnDialog({
  open,
  onOpenChange,
  column,
  tasksCount,
  availableColumns,
  onConfirmDelete,
}: DeleteColumnDialogProps) {
  const [deleteMode, setDeleteMode] = useState<"move" | "delete_all">("move");
  const otherColumns = availableColumns.filter((c) => c.id !== column?.id);
  const [targetColumnId, setTargetColumnId] = useState<string>(
    otherColumns[0]?.id || ""
  );

  if (!column) return null;

  const handleConfirm = () => {
    if (tasksCount > 0 && deleteMode === "move" && targetColumnId) {
      onConfirmDelete(column.id, { moveTasksToColumnId: targetColumnId });
    } else {
      onConfirmDelete(column.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-100 sm:max-w-[440px] shadow-2xl shadow-black/60 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-comfortaa text-base font-bold text-white">
                Excluir Etapa &quot;{column.title}&quot;
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Esta ação removerá esta coluna do seu quadro.
              </p>
            </div>
          </div>
        </DialogHeader>

        {tasksCount > 0 ? (
          <div className="flex flex-col gap-3 py-2 text-xs">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-300">
              <p className="font-comfortaa font-bold">
                Atenção: Esta etapa contém <span className="font-mono font-extrabold">{tasksCount}</span> {tasksCount === 1 ? "tarefa" : "tarefas"}.
              </p>
              <p className="mt-1 text-[11px] opacity-90 font-sans">
                O que você deseja fazer com as tarefas existentes?
              </p>
            </div>

            <div className="space-y-2 mt-1">
              {otherColumns.length > 0 && (
                <label className="flex items-start gap-3 p-3 rounded-2xl border border-white/10 hover:border-cyan-500/40 bg-white/[0.02] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="deleteMode"
                    value="move"
                    checked={deleteMode === "move"}
                    onChange={() => setDeleteMode("move")}
                    className="mt-0.5 accent-cyan-500"
                  />
                  <div className="flex-1">
                    <span className="font-comfortaa font-semibold text-white">
                      Mover tarefas para outra etapa
                    </span>
                    {deleteMode === "move" && (
                      <select
                        value={targetColumnId}
                        onChange={(e) => setTargetColumnId(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-comfortaa"
                      >
                        {otherColumns.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              )}

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deleteMode"
                  value="delete_all"
                  checked={deleteMode === "delete_all"}
                  onChange={() => setDeleteMode("delete_all")}
                  className="mt-0.5 accent-rose-500"
                />
                <div className="flex-1">
                  <span className="font-comfortaa font-semibold text-rose-400">
                    Excluir etapa e apagar todas as suas {tasksCount} tarefas
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    As tarefas desta coluna serão apagadas permanentemente.
                  </p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <p className="font-comfortaa text-xs text-slate-400 py-2">
            Esta etapa está vazia no momento. Nenhuma tarefa será afetada.
          </p>
        )}

        <DialogFooter className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors font-comfortaa"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-[#f43f5e] hover:bg-[#e11d48] px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition-all font-comfortaa"
          >
            Confirmar Exclusão
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
