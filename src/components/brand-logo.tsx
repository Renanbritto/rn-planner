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
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Ícone Minimalista Geométrico RN */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
      >
        <rect
          width="40"
          height="40"
          rx="10"
          className="fill-[#0c111d] dark:fill-[#0c101d] stroke-slate-200 dark:stroke-white/10"
          strokeWidth="1.5"
        />
        {/* Traço Geométrico 'R' e 'N' */}
        <path
          d="M12 28V12H18C20.2091 12 22 13.7909 22 16C22 18.2091 20.2091 20 18 20H12"
          className="stroke-cyan-500 dark:stroke-cyan-400"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 20L22 28"
          className="stroke-cyan-500 dark:stroke-cyan-400"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M24 28V12L30 28V12"
          className="stroke-slate-700 dark:stroke-slate-200"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ponto de foco Neon */}
        <circle cx="30" cy="12" r="2" className="fill-cyan-400" />
      </svg>

      {/* Tipografia da Marca */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              RN
            </span>
            <span className="text-base font-light text-slate-600 dark:text-slate-400">
              Planner
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-0.5 font-mono">
            OS • Board
          </span>
        </div>
      )}
    </div>
  );
}
