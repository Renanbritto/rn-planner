"use client";

import React from "react";
import {
  ColumnColor,
  getColumnColorConfig,
  Workspace,
} from "@/types/planner";
import {
  Rocket,
  Briefcase,
  Code2,
  Brain,
  Target,
  Sparkles,
  Flame,
  Laptop,
  Layers,
  Database,
  FolderKanban,
  BookOpen,
  Palette,
  TrendingUp,
  Compass,
  Terminal,
  Cpu,
  Wrench,
  Globe,
  Zap,
  Shield,
  Heart,
  Activity,
  Building2,
  Coffee,
  LucideIcon,
} from "lucide-react";

export const LUCIDE_WORKSPACE_ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  Briefcase,
  Code2,
  Brain,
  Target,
  Sparkles,
  Flame,
  Laptop,
  Layers,
  Database,
  FolderKanban,
  BookOpen,
  Palette,
  TrendingUp,
  Compass,
  Terminal,
  Cpu,
  Wrench,
  Globe,
  Zap,
  Shield,
  Heart,
  Activity,
  Building2,
  Coffee,
};

interface WorkspaceAvatarProps {
  icon?: string;
  avatarUrl?: string;
  color?: ColumnColor;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function WorkspaceAvatar({
  icon = "⚡",
  avatarUrl,
  color = "cyan",
  name = "Workspace",
  size = "md",
  className = "",
}: WorkspaceAvatarProps) {
  const colorConfig = getColumnColorConfig(color);

  // Determinar dimensões
  const sizeClasses = {
    xs: "h-6 w-6 text-xs rounded-lg",
    sm: "h-7 w-7 text-xs rounded-lg",
    md: "h-8 w-8 text-sm rounded-xl",
    lg: "h-11 w-11 text-xl rounded-xl",
    xl: "h-14 w-14 text-2xl rounded-2xl",
  }[size];

  const iconSizes = {
    xs: "h-3.5 w-3.5",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  }[size];

  // 1. Caso seja imagem (avatarUrl ou data URL / link no icon)
  const imageSrc =
    avatarUrl ||
    (icon && (icon.startsWith("data:image") || icon.startsWith("http://") || icon.startsWith("https://"))
      ? icon
      : null);

  if (imageSrc) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden border shadow-xs ${colorConfig.borderColor} ${sizeClasses} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // 2. Caso seja um ícone vetorial Lucide (ex: "lucide:Rocket")
  if (icon && icon.startsWith("lucide:")) {
    const iconKey = icon.replace("lucide:", "");
    const IconComponent = LUCIDE_WORKSPACE_ICON_MAP[iconKey] || Zap;

    return (
      <div
        className={`flex shrink-0 items-center justify-center border shadow-xs transition-colors ${colorConfig.badgeBg} ${colorConfig.borderColor} ${colorConfig.badgeText} ${sizeClasses} ${className}`}
      >
        <IconComponent className={iconSizes} />
      </div>
    );
  }

  // 3. Caso padrão: emoji ou caractere de texto
  return (
    <div
      className={`flex shrink-0 items-center justify-center border shadow-xs transition-colors select-none ${colorConfig.badgeBg} ${colorConfig.borderColor} ${colorConfig.badgeText} ${sizeClasses} ${className}`}
    >
      <span>{icon || "⚡"}</span>
    </div>
  );
}
