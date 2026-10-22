import { supabase } from "@/lib/supabase";
import {
  PlannerTask,
  KanbanColumnDef,
  ColumnColor,
  Priority,
  TaskCategory,
} from "@/types/planner";

export const DEFAULT_COLUMNS: KanbanColumnDef[] = [
  { id: "todo", title: "A Fazer", color: "slate", order: 0 },
  { id: "in_progress", title: "Em Andamento", color: "cyan", order: 1 },
  { id: "blocked", title: "Atenção / Bloqueado", color: "rose", order: 2 },
  { id: "done", title: "Concluído", color: "emerald", order: 3 },
];

export const INITIAL_TASKS: PlannerTask[] = [
  {
    id: "t-1",
    code: "RN-101",
    title: "Revisar pipeline de inferência & métricas do Sentinel",
    description: "Validar taxa de falso positivos e latência média em produção.",
    category: "work",
    priority: "critical",
    column: "in_progress",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: "t-2",
    code: "RN-102",
    title: "Otimizar consultas Drizzle & índices do banco",
    description: "Adicionar índices parciais nas queries mais lentas.",
    category: "work",
    priority: "medium",
    column: "done",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: "t-3",
    code: "RN-103",
    title: "Estudo: Deep dive em Causal Inference & Estatística",
    description: "Ler capítulo 4 sobre Do-calculus e DAGs causais.",
    category: "study",
    priority: "medium",
    column: "todo",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: "t-4",
    code: "RN-104",
    title: "Treino de Força & Mobilidade (1h)",
    description: "Foco em membros superiores e liberação miofascial.",
    category: "health",
    priority: "low",
    column: "todo",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: "t-5",
    code: "RN-105",
    title: "Ajustar alocação de aportes do mês",
    description: "Transferir reserva estratégica e rebalancear carteira.",
    category: "finance",
    priority: "critical",
    column: "blocked",
    dueDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    order: 0,
  },
];

export interface CloudSyncResult {
  success: boolean;
  tableMissing?: boolean;
  error?: string;
}

export class PlannerService {
  /**
   * Carrega colunas e tarefas do usuário a partir do Supabase.
   * Se o usuário ainda não tiver colunas salvas, inicializa com os padrões.
   */
  static async fetchUserBoard(userId: string): Promise<{
    columns: KanbanColumnDef[];
    tasks: PlannerTask[];
    tableMissing?: boolean;
    error?: string;
  }> {
    try {
      // 1. Buscar colunas
      const { data: colsData, error: colsError } = await supabase
        .from("columns")
        .select("*")
        .eq("user_id", userId)
        .order("order", { ascending: true });

      if (colsError) {
        if (colsError.code === "PGRST205" || colsError.message?.includes("schema cache")) {
          return {
            columns: DEFAULT_COLUMNS,
            tasks: INITIAL_TASKS,
            tableMissing: true,
            error: "Tabelas do Supabase não encontradas. Execute o arquivo supabase/schema.sql.",
          };
        }
        throw colsError;
      }

      // 2. Buscar tarefas
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("order", { ascending: true });

      if (tasksError) {
        throw tasksError;
      }

      // Se usuário não tiver colunas cadastradas no banco, cria o layout inicial
      if (!colsData || colsData.length === 0) {
        await this.initializeUserBoard(userId, DEFAULT_COLUMNS, INITIAL_TASKS);
        return {
          columns: DEFAULT_COLUMNS,
          tasks: INITIAL_TASKS,
        };
      }

      const formattedColumns: KanbanColumnDef[] = colsData.map((c) => ({
        id: c.id,
        title: c.title,
        color: c.color as ColumnColor,
        order: c.order,
      }));

      const formattedTasks: PlannerTask[] = (tasksData || []).map((t) => ({
        id: t.id,
        code: t.code,
        title: t.title,
        description: t.description || undefined,
        category: t.category as TaskCategory,
        priority: t.priority as Priority,
        column: t.column_id,
        dueDate: t.due_date,
        createdAt: t.created_at,
        order: t.order,
      }));

      return {
        columns: formattedColumns,
        tasks: formattedTasks,
      };
    } catch (err: unknown) {
      console.error("[PlannerService.fetchUserBoard] Falha:", err);
      return {
        columns: DEFAULT_COLUMNS,
        tasks: INITIAL_TASKS,
        error: (err as Error)?.message || "Erro desconhecido ao buscar dados da nuvem.",
      };
    }
  }

  /**
   * Inicializa o quadro com colunas e tarefas padrão para um novo usuário
   */
  static async initializeUserBoard(
    userId: string,
    initialCols: KanbanColumnDef[],
    initialTasks: PlannerTask[]
  ): Promise<CloudSyncResult> {
    try {
      const colRows = initialCols.map((col, index) => ({
        id: col.id,
        user_id: userId,
        title: col.title,
        color: col.color,
        order: col.order ?? index,
        updated_at: new Date().toISOString(),
      }));

      const { error: colErr } = await supabase.from("columns").upsert(colRows, {
        onConflict: "id,user_id",
      });

      if (colErr) {
        if (colErr.code === "PGRST205") return { success: false, tableMissing: true };
        throw colErr;
      }

      const taskRows = initialTasks.map((t) => ({
        id: t.id,
        user_id: userId,
        column_id: t.column,
        code: t.code,
        title: t.title,
        description: t.description || null,
        category: t.category,
        priority: t.priority,
        due_date: t.dueDate,
        order: t.order,
        created_at: t.createdAt,
        updated_at: new Date().toISOString(),
      }));

      const { error: taskErr } = await supabase.from("tasks").upsert(taskRows, {
        onConflict: "id,user_id",
      });

      if (taskErr) throw taskErr;

      return { success: true };
    } catch (err: unknown) {
      console.warn("[PlannerService.initializeUserBoard] Falha:", err);
      return { success: false, error: (err as Error)?.message };
    }
  }

  /**
   * Salva ou atualiza uma tarefa no Supabase
   */
  static async upsertTask(userId: string, task: PlannerTask): Promise<CloudSyncResult> {
    try {
      const { error } = await supabase.from("tasks").upsert(
        {
          id: task.id,
          user_id: userId,
          column_id: task.column,
          code: task.code,
          title: task.title,
          description: task.description || null,
          category: task.category,
          priority: task.priority,
          due_date: task.dueDate,
          order: task.order,
          created_at: task.createdAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id,user_id" }
      );

      if (error) {
        if (error.code === "PGRST205") return { success: false, tableMissing: true };
        throw error;
      }
      return { success: true };
    } catch (err: unknown) {
      console.error("[PlannerService.upsertTask] Erro:", err);
      return { success: false, error: (err as Error)?.message };
    }
  }

  /**
   * Remove uma tarefa do Supabase
   */
  static async deleteTask(userId: string, taskId: string): Promise<CloudSyncResult> {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) {
        if (error.code === "PGRST205") return { success: false, tableMissing: true };
        throw error;
      }
      return { success: true };
    } catch (err: unknown) {
      console.error("[PlannerService.deleteTask] Erro:", err);
      return { success: false, error: (err as Error)?.message };
    }
  }

  /**
   * Salva ou atualiza uma coluna no Supabase
   */
  static async upsertColumn(userId: string, column: KanbanColumnDef): Promise<CloudSyncResult> {
    try {
      const { error } = await supabase.from("columns").upsert(
        {
          id: column.id,
          user_id: userId,
          title: column.title,
          color: column.color,
          order: column.order,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id,user_id" }
      );

      if (error) {
        if (error.code === "PGRST205") return { success: false, tableMissing: true };
        throw error;
      }
      return { success: true };
    } catch (err: unknown) {
      console.error("[PlannerService.upsertColumn] Erro:", err);
      return { success: false, error: (err as Error)?.message };
    }
  }

  /**
   * Remove uma coluna do Supabase (reassociando tarefas se solicitado)
   */
  static async deleteColumn(
    userId: string,
    columnId: string,
    moveTasksToColumnId?: string
  ): Promise<CloudSyncResult> {
    try {
      if (moveTasksToColumnId) {
        await supabase
          .from("tasks")
          .update({ column_id: moveTasksToColumnId, updated_at: new Date().toISOString() })
          .eq("column_id", columnId)
          .eq("user_id", userId);
      }

      const { error } = await supabase
        .from("columns")
        .delete()
        .eq("id", columnId)
        .eq("user_id", userId);

      if (error) {
        if (error.code === "PGRST205") return { success: false, tableMissing: true };
        throw error;
      }
      return { success: true };
    } catch (err: unknown) {
      console.error("[PlannerService.deleteColumn] Erro:", err);
      return { success: false, error: (err as Error)?.message };
    }
  }

  /**
   * Sincroniza e migra tarefas locais (criadas antes do login) para a conta na nuvem
   */
  static async syncLocalBoardToCloud(
    userId: string,
    columns: KanbanColumnDef[],
    tasks: PlannerTask[]
  ): Promise<CloudSyncResult> {
    return this.initializeUserBoard(userId, columns, tasks);
  }
}
