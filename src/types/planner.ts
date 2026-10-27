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

export interface KanbanColumnDef {
  id: string; // unique id e.g. "todo", "in_progress", "col-12345"
  title: string;
  color: ColumnColor;
  order: number;
  workspaceId?: string;
}

export type Priority = "critical" | "medium" | "low";
export type TaskCategory = "work" | "study" | "health" | "personal" | "finance";

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
}

export type KanbanColumn = string;

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
