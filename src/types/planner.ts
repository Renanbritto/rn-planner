export type ColumnColor =
  | "slate"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "purple"
  | "indigo"
  | "blue"
  | "teal";

export interface Workspace {
  id: string; // e.g. "ws-default", "ws-172987123"
  name: string;
  icon?: string;
  avatarUrl?: string;
  color: ColumnColor;
  createdAt?: string;
}

export const DEFAULT_WORKSPACE: Workspace = {
  id: "ws-default",
  name: "Workspace Principal",
  icon: "⚡",
  color: "cyan",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const WORKSPACE_ICONS = [
  "⚡", "🚀", "💼", "🧠", "🎯", "🔬", "📊", "🔥", "💻", "✨", 
  "🛠️", "📚", "🎨", "📈", "⭐", "🏆", "💡", "🌐", "🔮", "💎",
  "🤖", "📐", "📝", "☕", "🌱"
];

export const WORKSPACE_LUCIDE_ICONS = [
  "Rocket",
  "Briefcase",
  "Code2",
  "Brain",
  "Target",
  "Sparkles",
  "Flame",
  "Laptop",
  "Layers",
  "Database",
  "FolderKanban",
  "BookOpen",
  "Palette",
  "TrendingUp",
  "Compass",
  "Terminal",
  "Cpu",
  "Wrench",
  "Globe",
  "Zap",
  "Shield",
  "Heart",
  "Activity",
  "Building2",
  "Coffee",
] as const;

export type ColumnSortOption =
  | "manual"
  | "priority-desc"
  | "priority-asc"
  | "date-desc"
  | "date-asc"
  | "due-asc";

export interface KanbanColumnDef {
  id: string; // unique id e.g. "todo", "in_progress", "col-12345"
  title: string;
  color: ColumnColor;
  order: number;
  workspaceId?: string;
  sortBy?: ColumnSortOption;
}

export type Priority = "critical" | "medium" | "low";
export type TaskCategory = "work" | "study" | "health" | "personal" | "finance";

export interface CardComment {
  id: string;
  text: string;
  createdAt: string; // ISO string
  authorName?: string;
  authorEmail?: string;
}

export interface StatusBadge {
  id: string;
  label: string;
  color: string;
  createdAt?: string;
}

export interface PlannerTask {
  id: string;
  code: string; // e.g. "RN-101"
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  column: string; // ID da coluna correspondente
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  order: number;
  workspaceId?: string;
  statusBadgeId?: string;
  comments?: CardComment[];
  assignee?: string;
  repositoryUrl?: string; // URL ou slug do repositório (ex: "Renanbritto/rn-planner")
  branchName?: string; // Nome da branch vinculada (ex: "feature/task-assignee")
}

export type KanbanColumn = string;

/**
 * Formata o código do card para exibição e cópia (converte prefixo antigo RN- em Task-).
 */
export function formatCardCode(code?: string): string {
  if (!code) return "Task-100";
  return code.replace(/^RN-/i, "Task-");
}

/**
 * Constrói a URL direta para visualização da branch ou repositório
 */
export function getGitLinkUrl(repositoryUrl?: string, branchName?: string): string | null {
  if (!repositoryUrl) return null;
  let cleanUrl = repositoryUrl.trim();
  if (!cleanUrl) return null;

  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    if (cleanUrl.startsWith("github.com/")) {
      cleanUrl = `https://${cleanUrl}`;
    } else if (cleanUrl.startsWith("gitlab.com/")) {
      cleanUrl = `https://${cleanUrl}`;
    } else if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(cleanUrl)) {
      cleanUrl = `https://github.com/${cleanUrl}`;
    } else {
      cleanUrl = `https://${cleanUrl}`;
    }
  }

  if (branchName && branchName.trim()) {
    const cleanBranch = encodeURIComponent(branchName.trim()).replace(/%2F/gi, "/");
    if (cleanUrl.includes("github.com")) {
      return `${cleanUrl.replace(/\/+$/, "")}/tree/${cleanBranch}`;
    }
    if (cleanUrl.includes("gitlab.com")) {
      return `${cleanUrl.replace(/\/+$/, "")}/-/tree/${cleanBranch}`;
    }
  }

  return cleanUrl;
}

export const DEFAULT_STATUS_BADGES: StatusBadge[] = [
  { id: "badge-in-review", label: "Em Revisão", color: "purple" },
  { id: "badge-waiting", label: "Aguardando", color: "amber" },
];

export interface BadgeColorConfig {
  id: string;
  name: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  ringColor: string;
}

export const BADGE_COLOR_OPTIONS: BadgeColorConfig[] = [
  {
    id: "cyan",
    name: "Ciano Neon",
    dotColor: "bg-cyan-500 dark:bg-cyan-400",
    badgeBg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    borderColor: "border-cyan-500/30",
    ringColor: "ring-cyan-500",
  },
  {
    id: "emerald",
    name: "Esmeralda",
    dotColor: "bg-emerald-500 dark:bg-emerald-400",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-500/30",
    ringColor: "ring-emerald-500",
  },
  {
    id: "purple",
    name: "Roxo",
    dotColor: "bg-purple-500 dark:bg-purple-400",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/15",
    badgeText: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-500/30",
    ringColor: "ring-purple-500",
  },
  {
    id: "amber",
    name: "Âmbar",
    dotColor: "bg-amber-500 dark:bg-amber-400",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-500/30",
    ringColor: "ring-amber-500",
  },
  {
    id: "rose",
    name: "Rosa / Alerta",
    dotColor: "bg-rose-500 dark:bg-rose-400",
    badgeBg: "bg-rose-500/10 dark:bg-rose-500/15",
    badgeText: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-500/30",
    ringColor: "ring-rose-500",
  },
  {
    id: "blue",
    name: "Azul",
    dotColor: "bg-blue-500 dark:bg-blue-400",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/15",
    badgeText: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-500/30",
    ringColor: "ring-blue-500",
  },
  {
    id: "indigo",
    name: "Índigo",
    dotColor: "bg-indigo-500 dark:bg-indigo-400",
    badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    borderColor: "border-indigo-500/30",
    ringColor: "ring-indigo-500",
  },
  {
    id: "teal",
    name: "Turquesa",
    dotColor: "bg-teal-500 dark:bg-teal-400",
    badgeBg: "bg-teal-500/10 dark:bg-teal-500/15",
    badgeText: "text-teal-700 dark:text-teal-300",
    borderColor: "border-teal-500/30",
    ringColor: "ring-teal-500",
  },
  {
    id: "fuchsia",
    name: "Fúcsia",
    dotColor: "bg-fuchsia-500 dark:bg-fuchsia-400",
    badgeBg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/15",
    badgeText: "text-fuchsia-700 dark:text-fuchsia-300",
    borderColor: "border-fuchsia-500/30",
    ringColor: "ring-fuchsia-500",
  },
  {
    id: "orange",
    name: "Laranja",
    dotColor: "bg-orange-500 dark:bg-orange-400",
    badgeBg: "bg-orange-500/10 dark:bg-orange-500/15",
    badgeText: "text-orange-700 dark:text-orange-300",
    borderColor: "border-orange-500/30",
    ringColor: "ring-orange-500",
  },
  {
    id: "slate",
    name: "Neutro",
    dotColor: "bg-slate-400 dark:bg-slate-400",
    badgeBg: "bg-slate-500/10 dark:bg-slate-500/15",
    badgeText: "text-slate-700 dark:text-slate-300",
    borderColor: "border-slate-400/30",
    ringColor: "ring-slate-400",
  },
];

export function getStatusBadgeColorConfig(color?: string): BadgeColorConfig {
  return (
    BADGE_COLOR_OPTIONS.find((b) => b.id === color) || BADGE_COLOR_OPTIONS[0]
  );
}

export function extractTaskMetadata(description?: string): {
  cleanDescription: string;
  statusBadgeId?: string;
  comments?: CardComment[];
  assignee?: string;
  repositoryUrl?: string;
  branchName?: string;
} {
  if (!description) {
    return { cleanDescription: "" };
  }

  const metaMatch = description.match(/<!--rn_meta:([\s\S]*?)-->/);
  if (!metaMatch) {
    return { cleanDescription: description };
  }

  try {
    const parsed = JSON.parse(metaMatch[1]);
    const cleanDescription = description.replace(/<!--rn_meta:[\s\S]*?-->/, "").trim();
    return {
      cleanDescription,
      statusBadgeId: parsed.statusBadgeId || undefined,
      comments: Array.isArray(parsed.comments) ? parsed.comments : undefined,
      assignee: typeof parsed.assignee === "string" ? parsed.assignee : undefined,
      repositoryUrl: typeof parsed.repositoryUrl === "string" ? parsed.repositoryUrl : undefined,
      branchName: typeof parsed.branchName === "string" ? parsed.branchName : undefined,
    };
  } catch {
    return { cleanDescription: description };
  }
}

export function injectTaskMetadata(
  cleanDescription?: string,
  meta?: {
    statusBadgeId?: string;
    comments?: CardComment[];
    assignee?: string;
    repositoryUrl?: string;
    branchName?: string;
  }
): string {
  const baseDesc = (cleanDescription || "").replace(/<!--rn_meta:[\s\S]*?-->/, "").trim();
  const hasMeta =
    meta &&
    (meta.statusBadgeId ||
      (meta.comments && meta.comments.length > 0) ||
      (meta.assignee && meta.assignee.trim().length > 0) ||
      (meta.repositoryUrl && meta.repositoryUrl.trim().length > 0) ||
      (meta.branchName && meta.branchName.trim().length > 0));

  if (!hasMeta) {
    return baseDesc;
  }

  const payload = JSON.stringify({
    statusBadgeId: meta.statusBadgeId || null,
    comments: meta.comments || [],
    assignee: meta.assignee?.trim() || null,
    repositoryUrl: meta.repositoryUrl?.trim() || null,
    branchName: meta.branchName?.trim() || null,
  });

  return `${baseDesc}\n\n<!--rn_meta:${payload}-->`;
}

export interface ColorPaletteItem {
  id: ColumnColor;
  name: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  ringColor: string;
}

export const COLUMN_COLOR_OPTIONS: ColorPaletteItem[] = [
  {
    id: "slate",
    name: "Neutro",
    dotColor: "bg-slate-400 dark:bg-slate-400",
    badgeBg: "bg-slate-500/10 border-slate-400/20",
    badgeText: "text-slate-700 dark:text-slate-300",
    borderColor: "border-slate-400/30",
    ringColor: "ring-slate-400",
  },
  {
    id: "cyan",
    name: "Ciano",
    dotColor: "bg-cyan-500 dark:bg-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20",
    badgeText: "text-cyan-700 dark:text-cyan-400",
    borderColor: "border-cyan-500/30",
    ringColor: "ring-cyan-500",
  },
  {
    id: "emerald",
    name: "Esmeralda",
    dotColor: "bg-emerald-500 dark:bg-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
    ringColor: "ring-emerald-500",
  },
  {
    id: "amber",
    name: "Âmbar",
    dotColor: "bg-amber-500 dark:bg-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-500/30",
    ringColor: "ring-amber-500",
  },
  {
    id: "rose",
    name: "Rosa / Alerta",
    dotColor: "bg-rose-500 dark:bg-rose-400",
    badgeBg: "bg-rose-500/10 border-rose-500/20",
    badgeText: "text-rose-700 dark:text-rose-400",
    borderColor: "border-rose-500/30",
    ringColor: "ring-rose-500",
  },
  {
    id: "purple",
    name: "Roxo",
    dotColor: "bg-purple-500 dark:bg-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-500/30",
    ringColor: "ring-purple-500",
  },
  {
    id: "indigo",
    name: "Índigo",
    dotColor: "bg-indigo-500 dark:bg-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/20",
    badgeText: "text-indigo-700 dark:text-indigo-400",
    borderColor: "border-indigo-500/30",
    ringColor: "ring-indigo-500",
  },
  {
    id: "blue",
    name: "Azul",
    dotColor: "bg-blue-500 dark:bg-blue-400",
    badgeBg: "bg-blue-500/10 border-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-500/30",
    ringColor: "ring-blue-500",
  },
  {
    id: "teal",
    name: "Turquesa",
    dotColor: "bg-teal-500 dark:bg-teal-400",
    badgeBg: "bg-teal-500/10 border-teal-500/20",
    badgeText: "text-teal-700 dark:text-teal-400",
    borderColor: "border-teal-500/30",
    ringColor: "ring-teal-500",
  },
];

export function getColumnColorConfig(color?: ColumnColor): ColorPaletteItem {
  return (
    COLUMN_COLOR_OPTIONS.find((item) => item.id === color) ||
    COLUMN_COLOR_OPTIONS[0]
  );
}

export interface SortOptionItem {
  id: ColumnSortOption;
  label: string;
  shortLabel: string;
  description: string;
}

export const COLUMN_SORT_OPTIONS: SortOptionItem[] = [
  {
    id: "manual",
    label: "Ordem manual (Padrão)",
    shortLabel: "Manual",
    description: "Posicionamento livre de cards",
  },
  {
    id: "priority-desc",
    label: "Prioridade: Alta → Baixa",
    shortLabel: "Prioridade (Alta)",
    description: "Crítica primeiro, depois Média e Baixa",
  },
  {
    id: "priority-asc",
    label: "Prioridade: Baixa → Alta",
    shortLabel: "Prioridade (Baixa)",
    description: "Baixa primeiro, depois Média e Crítica",
  },
  {
    id: "date-desc",
    label: "Data: Mais novo para mais antigo",
    shortLabel: "Mais novos",
    description: "Cards criados recentemente no topo",
  },
  {
    id: "date-asc",
    label: "Data: Mais antigo para mais novo",
    shortLabel: "Mais antigos",
    description: "Cards mais antigos no topo",
  },
  {
    id: "due-asc",
    label: "Prazo: Mais próximo primeiro",
    shortLabel: "Prazo",
    description: "Vencimentos mais urgentes no topo",
  },
];

export function getColumnSortConfig(sortBy?: ColumnSortOption): SortOptionItem {
  return (
    COLUMN_SORT_OPTIONS.find((item) => item.id === sortBy) ||
    COLUMN_SORT_OPTIONS[0]
  );
}

function parseDateSafe(dateStr?: string): number {
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
}

export function sortTasks(
  tasks: PlannerTask[],
  sortBy: ColumnSortOption = "manual"
): PlannerTask[] {
  if (!sortBy || sortBy === "manual") {
    return [...tasks];
  }

  const PRIORITY_ORDER: Record<Priority, number> = {
    critical: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priority-desc": {
        const diff =
          (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
        if (diff !== 0) return diff;
        const timeA = parseDateSafe(a.createdAt);
        const timeB = parseDateSafe(b.createdAt);
        return timeB - timeA;
      }
      case "priority-asc": {
        const diff =
          (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
        if (diff !== 0) return diff;
        const timeA = parseDateSafe(a.createdAt);
        const timeB = parseDateSafe(b.createdAt);
        return timeB - timeA;
      }
      case "date-desc": {
        const timeA = parseDateSafe(a.createdAt);
        const timeB = parseDateSafe(b.createdAt);
        if (timeA !== timeB) return timeB - timeA;
        return (b.order ?? 0) - (a.order ?? 0);
      }
      case "date-asc": {
        const timeA = parseDateSafe(a.createdAt);
        const timeB = parseDateSafe(b.createdAt);
        if (timeA !== timeB) return timeA - timeB;
        return (a.order ?? 0) - (b.order ?? 0);
      }
      case "due-asc": {
        const timeA = a.dueDate ? parseDateSafe(a.dueDate) : Infinity;
        const timeB = b.dueDate ? parseDateSafe(b.dueDate) : Infinity;
        if (timeA !== timeB) return timeA - timeB;
        return (
          (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0)
        );
      }
      default:
        return 0;
    }
  });
}

export function extractWorkspaceIdFromColumnId(
  columnId: string,
  fallbackWsId = DEFAULT_WORKSPACE.id
): string {
  if (!columnId) return fallbackWsId;

  // Formato: col-ws-<wsId>-<colSuffix> (ex: col-ws-mha8xyz-todo -> ws-mha8xyz)
  const match = columnId.match(/^col-(ws-[a-zA-Z0-9]+)-/);
  if (match && match[1]) {
    return match[1];
  }

  // Se o ID da coluna for exatamente "col-ws-<wsId>"
  const exactWsMatch = columnId.match(/^col-(ws-[a-zA-Z0-9]+)$/);
  if (exactWsMatch && exactWsMatch[1]) {
    return exactWsMatch[1];
  }

  return fallbackWsId;
}

