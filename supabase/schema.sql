-- ==============================================================================
-- RN-PLANNER: SCHEMA RELACIONAL & POLÍTICAS RLS SUPABASE
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Colunas (Etapas do Kanban)
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

-- 3. Tabela de Tarefas (Cards do Kanban)
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

-- 4. Índices para Otimização de Consultas por Usuário
CREATE INDEX IF NOT EXISTS idx_columns_user_order ON public.columns(user_id, "order" ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_column ON public.tasks(user_id, column_id, "order" ASC);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Acesso Seguro (RLS)
-- Cada usuário autenticado só pode visualizar, inserir, atualizar e deletar seus próprios dados

-- COLUMNS POLICIES
DROP POLICY IF EXISTS "Usuários podem visualizar apenas suas próprias colunas" ON public.columns;
CREATE POLICY "Usuários podem visualizar apenas suas próprias colunas"
ON public.columns FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias colunas" ON public.columns;
CREATE POLICY "Usuários podem criar suas próprias colunas"
ON public.columns FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias colunas" ON public.columns;
CREATE POLICY "Usuários podem atualizar suas próprias colunas"
ON public.columns FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias colunas" ON public.columns;
CREATE POLICY "Usuários podem deletar suas próprias colunas"
ON public.columns FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- TASKS POLICIES
DROP POLICY IF EXISTS "Usuários podem visualizar apenas suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem visualizar apenas suas próprias tarefas"
ON public.tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem criar suas próprias tarefas"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
ON public.tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem deletar suas próprias tarefas"
ON public.tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_columns_updated_at ON public.columns;
CREATE TRIGGER trigger_columns_updated_at
BEFORE UPDATE ON public.columns
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
