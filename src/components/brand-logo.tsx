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
      {/* Símbolo Abstrato Geométrico (Estilo Linear / Board de Execução) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        {/* Superfície do Ícone */}
        <rect
          width="40"
          height="40"
          rx="12"
          className="fill-slate-100 dark:fill-[#0c101d] stroke-slate-200 dark:stroke-white/10"
          strokeWidth="1.5"
        />

        {/* 3 Barras Minimalistas do Quadro de Execução */}
        <rect
          x="11"
          y="15"
          width="4.5"
          height="11"
          rx="2.25"
          className="fill-slate-400 dark:fill-slate-600"
        />
        <rect
          x="18"
          y="10"
          width="4.5"
          height="20"
          rx="2.25"
          className="fill-cyan-600 dark:fill-cyan-400"
        />
        <rect
          x="25"
          y="17"
          width="4.5"
          height="13"
          rx="2.25"
          className="fill-emerald-600 dark:fill-emerald-400"
        />
      </svg>

      {/* Tipografia em Comfortaa */}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            planner
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />
        </div>
      )}
    </div>
  );
}