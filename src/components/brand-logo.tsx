"use client";

import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function BrandLogo({
  className = "",
  size = 32,
  showText = true,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Símbolo Abstrato Geométrico em Obsidian Glass */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        {/* Superfície Obsidian do Ícone */}
        <rect
          width="40"
          height="40"
          rx="12"
          fill="#0b0f1a"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* 3 Barras Neon Semânticas do Quadro */}
        <rect
          x="11"
          y="15"
          width="4.5"
          height="11"
          rx="2.25"
          fill="#f43f5e"
        />
        <rect
          x="18"
          y="10"
          width="4.5"
          height="20"
          rx="2.25"
          fill="#06b6d4"
        />
        <rect
          x="25"
          y="17"
          width="4.5"
          height="13"
          rx="2.25"
          fill="#10b981"
        />
      </svg>

      {/* Tipografia em Comfortaa */}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className="font-comfortaa text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            planner
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
      )}
    </div>
  );
}