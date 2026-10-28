import { supabase } from "@/lib/supabase";
import {
  PlannerTask,
  KanbanColumnDef,
  ColumnColor,
  Priority,
  TaskCategory,
  extractWorkspaceIdFromColumnId,
  extractTaskMetadata,
  injectTaskMetadata,
} from "@/types/planner";

export const DEFAULT_COLUMNS: KanbanColumnDef[] = [
  { id: "todo", title: "A Fazer", color: "slate", order: 0 },
  { id: "in_progress", title: "Em Andamento", color: "cyan", order: 1 },
  { id: "blocked", title: "Atenção / Bloqueado", color: "rose", order: 2 },
  { id: "done", title: "Concluído", color: "emerald", order: 3 },
];

export const DEMO_TASK_IDS = new Set(["t-1", "t-2", "t-3", "t-4", "t-5"]);

// Novos usuários iniciam zerados de tarefas
export const INITIAL_TASKS: PlannerTask[] = [];

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
  static async fetchUserBoard(
    userId: string,
    initialCols?: KanbanColumnDef[],
    initialTasks?: PlannerTask[]
  ): Promise<{
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
            tasks: [],
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

      // Se usuário não tiver colunas cadastradas no banco, cria o layout inicial com zero cards
      if (!colsData || colsData.length === 0) {
        const colsToSeed = initialCols && initialCols.length > 0 ? initialCols : DEFAULT_COLUMNS;
        const tasksToSeed: PlannerTask[] = [];
        await this.initializeUserBoard(userId, colsToSeed, tasksToSeed);
        return {
          columns: colsToSeed,
          tasks: tasksToSeed,
        };
      }

      const formattedColumns: KanbanColumnDef[] = colsData.map((c) => ({
        id: c.id,
        title: c.title,
        color: c.color as ColumnColor,
        order: c.order,
        workspaceId: extractWorkspaceIdFromColumnId(c.id),
      }));

      // Detectar se há colunas locais (criadas em novos workspaces) que ainda não estão no Supabase
      const existingColIds = new Set(formattedColumns.map((c) => c.id));
      const extraCols = (initialCols || []).filter((c) => !existingColIds.has(c.id));

      let allColumns = formattedColumns;
      if (extraCols.length > 0) {
        try {
          await supabase.from("columns").upsert(
            extraCols.map((c, idx) => ({
              id: c.id,
              user_id: userId,
              title: c.title,
              color: c.color,
              order: c.order ?? (colsData.length + idx),
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "id,user_id" }
          );
        } catch (e) {
          console.warn("[PlannerService] Falha ao sincronizar colunas locais adicionais:", e);
        }
        allColumns = [...formattedColumns, ...extraCols];
      }

      const colToWs = new Map<string, string>();
      allColumns.forEach((c) => {
        const wsId = c.workspaceId || extractWorkspaceIdFromColumnId(c.id);
        colToWs.set(c.id, wsId);
      });

      const formattedTasks: PlannerTask[] = (tasksData || []).map((t) => {
        const meta = extractTaskMetadata(t.description);
        return {
          id: t.id,
          code: t.code,
          title: t.title,
          description: meta.cleanDescription || undefined,
          category: t.category as TaskCategory,
          priority: t.priority as Priority,
          column: t.column_id,
          dueDate: t.due_date,
          createdAt: t.created_at,
          order: t.order,
          workspaceId: colToWs.get(t.column_id) || extractWorkspaceIdFromColumnId(t.column_id),
          statusBadgeId: meta.statusBadgeId,
          comments: meta.comments,
          assignee: meta.assignee || (t as any).assignee || undefined,
          repositoryUrl: meta.repositoryUrl || (t as any).repository_url || undefined,
          branchName: meta.branchName || (t as any).branch_name || undefined,
        };
      });

      // Detectar se há tarefas locais (ex: recém criadas em um workspace) que ainda não foram para o Supabase
      // Ignora tarefas mock/demo legadas (t-1 a t-5) para manter contas novas zeradas
      const existingTaskIds = new Set(formattedTasks.map((t) => t.id));
      const extraTasks = (initialTasks || []).filter(
        (t) => !existingTaskIds.has(t.id) && !DEMO_TASK_IDS.has(t.id)
      );

      let allTasks = formattedTasks;
      if (extraTasks.length > 0) {
        const validColIds = new Set(allColumns.map((c) => c.id));
        const validExtraTasks = extraTasks.filter((t) => validColIds.has(t.column));
        if (validExtraTasks.length > 0) {
          try {
            await supabase.from("tasks").upsert(
              validExtraTasks.map((t) => ({
                id: t.id,
                user_id: userId,
                column_id: t.column,
                code: t.code,
                title: t.title,
                description:
                  injectTaskMetadata(t.description, {
                    statusBadgeId: t.statusBadgeId,
                    comments: t.comments,
                    assignee: t.assignee,
                    repositoryUrl: t.repositoryUrl,
                    branchName: t.branchName,
                  }) || null,
                category: t.category,
                priority: t.priority,
                due_date: t.dueDate,
                order: t.order,
                created_at: t.createdAt,
                updated_at: new Date().toISOString(),
              })),
              { onConflict: "id,user_id" }
            );
          } catch (e) {
            console.warn("[PlannerService] Falha ao sincronizar tarefas locais adicionais:", e);
          }
          const sanitizedExtraTasks = validExtraTasks.map((t) => ({
            ...t,
            workspaceId: colToWs.get(t.column) || extractWorkspaceIdFromColumnId(t.column) || t.workspaceId,
          }));
          allTasks = [...formattedTasks, ...sanitizedExtraTasks];
        }
      }

      return {
        columns: allColumns,
        tasks: allTasks,
      };
    } catch (err: unknown) {
      console.error("[PlannerService.fetchUserBoard] Falha:", err);
      return {
        columns: DEFAULT_COLUMNS,
        tasks: [],
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

      const validColIds = new Set(initialCols.map((c) => c.id));
      const validTasks = initialTasks.filter((t) => validColIds.has(t.column));

      const taskRows = validTasks.map((t) => ({
        id: t.id,
        user_id: userId,
        column_id: t.column,
        code: t.code,
        title: t.title,
        description:
          injectTaskMetadata(t.description, {
            statusBadgeId: t.statusBadgeId,
            comments: t.comments,
            assignee: t.assignee,
            repositoryUrl: t.repositoryUrl,
            branchName: t.branchName,
          }) || null,
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
      const fullDescription = injectTaskMetadata(task.description, {
        statusBadgeId: task.statusBadgeId,
        comments: task.comments,
        assignee: task.assignee,
        repositoryUrl: task.repositoryUrl,
        branchName: task.branchName,
      });

      const { error } = await supabase.from("tasks").upsert(
        {
          id: task.id,
          user_id: userId,
          column_id: task.column,
          code: task.code,
          title: task.title,
          description: fullDescription || null,
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
