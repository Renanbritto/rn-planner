"use client";

import dynamic from "next/dynamic";
import React from "react";

// Carregamento dinâmico estritamente no cliente para evitar erros de SSR com APIs do navegador (canvas, window)
const WhiteboardCanvas = dynamic(
  () =>
    import("./whiteboard-canvas").then((mod) => mod.WhiteboardCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-190px)] min-h-[620px] w-full items-center justify-center rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#090d16] px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
            Carregando Whiteboard Canvas...
          </span>
        </div>
      </div>
    ),
  }
);

export function WhiteboardWrapper() {
  return <WhiteboardCanvas />;
}
