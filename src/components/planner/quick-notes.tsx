"use client";

import { useState } from "react";
import { StickyNote, Plus, Trash2 } from "lucide-react";
import { QuickNote } from "@/types/planner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuickNotesProps {
  notes: QuickNote[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
}

export function QuickNotes({ notes, onAddNote, onDeleteNote }: QuickNotesProps) {
  const [content, setContent] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddNote(content);
    setContent("");
  };

  return (
    <div className="glass-panel flex flex-col rounded-2xl p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Notas Rápidas & Insights</span>
            <StickyNote className="h-4 w-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Braindump para esvaziar a mente e capturar ideias instantaneamente.
          </p>
        </div>
      </div>

      {/* Input de captura rápida */}
      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Capturar insight ou anotação rápida..."
          className="bg-[#090d16] border-white/10 text-xs text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
        />
        <Button
          type="submit"
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white shrink-0 border border-white/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Lista de Notas */}
      <div className="mt-4 flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            Nenhuma anotação rápida no momento.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-start justify-between rounded-xl border border-white/10 bg-[#0b0f1a]/80 p-3 hover:border-white/20"
            >
              <div className="flex flex-col gap-1 pr-2">
                <p className="text-xs leading-relaxed text-slate-200">{note.content}</p>
                <span className="text-[10px] text-slate-500">{note.createdAt}</span>
              </div>
              <button
                onClick={() => onDeleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1"
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
