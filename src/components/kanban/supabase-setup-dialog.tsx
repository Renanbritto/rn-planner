"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Database, Copy, Check, ExternalLink, Terminal } from "lucide-react";

interface SupabaseSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupabaseSetupDialog({
  open,
  onOpenChange,
}: SupabaseSetupDialogProps) {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- Execute este script no SQL Editor do seu projeto Supabase:
-- URL do Projeto: https://supabase.com/dashboard/project/vmextlzjsambgblssvkn/sql/new

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.columns (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'cyan',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    column_id TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'work',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, user_id),
    CONSTRAINT fk_task_column FOREIGN KEY (column_id, user_id) 
        REFERENCES public.columns(id, user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_columns_user_order ON public.columns(user_id, "order" ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_column ON public.tasks(user_id, column_id, "order" ASC);

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam suas próprias colunas"
ON public.columns FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam suas próprias tarefas"
ON public.tasks FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Erro ao copiar SQL", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-comfortaa text-lg font-bold text-slate-900 dark:text-white">
                Ativar Banco de Dados no Supabase
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
                Para que suas tarefas sejam salvas na nuvem com isolamento seguro (RLS),
                crie as tabelas executando o SQL abaixo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
              <Terminal className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>supabase/schema.sql</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard/project/vmextlzjsambgblssvkn/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-comfortaa text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
              >
                <span>Abrir SQL Editor</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-comfortaa font-bold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900 p-4 font-mono text-[11px] text-slate-200 max-h-64 overflow-y-auto selection:bg-cyan-500/30">
            <pre className="whitespace-pre-wrap">{sqlSchema}</pre>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 text-xs text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
            <span className="font-comfortaa font-bold text-cyan-600 dark:text-cyan-400">Passo a passo rápido:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>Clique no botão <strong>Copiar SQL</strong> acima.</li>
              <li>Acesse o <strong>SQL Editor</strong> no painel do seu Supabase.</li>
              <li>Cole o script e clique no botão <strong>RUN</strong>.</li>
              <li>Pronto! O status mudará automaticamente para <strong>Nuvem Ativa</strong> e tudo será salvo online!</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
