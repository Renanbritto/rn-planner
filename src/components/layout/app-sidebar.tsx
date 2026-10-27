"use client";

import React from "react";
import {
  Kanban,
  PenTool,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
  ChevronsUpDown,
  Plus,
  Check,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import {
  Workspace,
  DEFAULT_WORKSPACE,
  getColumnColorConfig,
} from "@/types/planner";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  activeTab: "kanban" | "whiteboard";
  setActiveTab: (tab: "kanban" | "whiteboard") => void;
  tasksCount?: number;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  workspaces?: Workspace[];
  activeWorkspace?: Workspace;
  onSelectWorkspace?: (workspaceId: string) => void;
  onOpenNewWorkspace?: () => void;
}

export function AppSidebar({
  activeTab,
  setActiveTab,
  tasksCount = 0,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  workspaces = [DEFAULT_WORKSPACE],
  activeWorkspace = DEFAULT_WORKSPACE,
  onSelectWorkspace,
  onOpenNewWorkspace,
}: AppSidebarProps) {
  const currentWorkspace = activeWorkspace || DEFAULT_WORKSPACE;
  const currentWsColor = getColumnColorConfig(currentWorkspace.color);

  const navItems = [
    {
      id: "kanban" as const,
      label: "Card",
      description: "Quadro de Tarefas",
      icon: Kanban,
      badge: tasksCount > 0 ? tasksCount : undefined,
    },
    {
      id: "whiteboard" as const,
      label: "Excalidraw",
      description: "Whiteboard Canvas",
      icon: PenTool,
    },
  ];

  const handleSelectTab = (tab: "kanban" | "whiteboard") => {
    setActiveTab(tab);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop para Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Principal (Desktop retrátil + Drawer mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl shadow-xl transition-all duration-300 md:static ${
          isMobileOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-[72px]" : "md:w-64"}`}
      >
        {/* Topo da Sidebar: Logo & Botão de Recolher */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {isCollapsed ? (
              <BrandLogo size={32} showText={false} />
            ) : (
              <BrandLogo size={32} showText={true} />
            )}
          </div>

          {/* Botão de Fechar no Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Botão de Recolher / Expandir no Desktop */}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Seletor de Workspace */}
        <div className="p-2 border-b border-slate-200 dark:border-white/10 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`group flex items-center rounded-2xl transition-all duration-200 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 ${
                isCollapsed
                  ? "h-11 w-full justify-center px-0 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  : "h-12 w-full justify-between px-2.5 py-1.5 border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/20 shadow-xs"
              }`}
              title={isCollapsed ? `Workspace: ${currentWorkspace.name}` : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Emoji / Ícone / Imagem com estilo do Workspace */}
                <WorkspaceAvatar
                  icon={currentWorkspace.icon}
                  avatarUrl={currentWorkspace.avatarUrl}
                  color={currentWorkspace.color}
                  size="md"
                  name={currentWorkspace.name}
                  className="transition-transform duration-200 group-hover:scale-105"
                />

                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-comfortaa text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentWorkspace.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${currentWsColor.dotColor}`} />
                      Espaço Ativo
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors ml-1" />
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align={isCollapsed ? "start" : "center"}
              side={isCollapsed ? "right" : "bottom"}
              sideOffset={6}
              className="w-60 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl p-1.5 text-slate-800 dark:text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Seus Workspaces
                </DropdownMenuLabel>

              <div className="flex flex-col gap-0.5 my-1 max-h-56 overflow-y-auto">
                {workspaces.map((ws) => {
                  const isCurrent = ws.id === currentWorkspace.id;
                  const itemColor = getColumnColorConfig(ws.color);

                  return (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => onSelectWorkspace?.(ws.id)}
                      className={`flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-comfortaa cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/20"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WorkspaceAvatar
                          icon={ws.icon}
                          avatarUrl={ws.avatarUrl}
                          color={ws.color}
                          size="sm"
                          name={ws.name}
                        />
                        <span className="truncate">{ws.name}</span>
                      </div>

                      {isCurrent && (
                        <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />

              <DropdownMenuItem
                onClick={() => onOpenNewWorkspace?.()}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-comfortaa font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <Plus className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span>Novo Workspace</span>
              </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Itens de Navegação (Card e Excalidraw) */}
        <div className="flex flex-1 flex-col gap-2 p-3 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navegação
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`group relative flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${
                  isCollapsed
                    ? "h-12 w-full justify-center px-0"
                    : "h-12 w-full justify-between px-3.5"
                } ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border border-transparent font-medium"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Ícone e Título */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300"
                        : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex flex-col text-left truncate">
                      <span className="font-comfortaa text-sm tracking-tight truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans truncate">
                        {item.description}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badge ou Indicador de Contagem */}
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`shrink-0 font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${
                      isActive
                        ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                        : "bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Indicador sutil quando colapsado */}
                {isCollapsed && isActive && (
                  <span className="absolute right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                )}

                {/* Tooltip flutuante quando colapsado */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-comfortaa font-bold text-white shadow-xl group-hover:block z-50 whitespace-nowrap">
                    {item.label}
                    {item.badge !== undefined && ` (${item.badge})`}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <span className="font-comfortaa text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
                  {currentWorkspace.name}
                </span>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-cyan-500/60 dark:text-cyan-400/60" />
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Expandir menu"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
