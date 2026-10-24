"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useTheme } from "next-themes";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Sparkles, Trash2, Download, Maximize2, Minimize2 } from "lucide-react";

const STORAGE_KEY = "rn_planner_whiteboard_elements_v1";
const APP_STATE_STORAGE_KEY = "rn_planner_whiteboard_appstate_v1";

export function WhiteboardCanvas() {
  const { resolvedTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [initialData, setInitialData] = useState<{
    elements?: any[];
    appState?: Record<string, any>;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega dados salvos no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedElements = localStorage.getItem(STORAGE_KEY);
      const savedAppState = localStorage.getItem(APP_STATE_STORAGE_KEY);

      const parsedElements = savedElements ? JSON.parse(savedElements) : [];
      const parsedAppState = savedAppState ? JSON.parse(savedAppState) : {};

      setInitialData({
        elements: parsedElements,
        appState: {
          ...parsedAppState,
          theme: resolvedTheme === "dark" ? "dark" : "light",
        },
      });
    } catch (e) {
      console.warn("Erro ao carregar dados do Whiteboard:", e);
      setInitialData({ elements: [] });
    }
  }, [resolvedTheme]);

  // Atualiza tema do Excalidraw dinamicamente quando o usuário alternar modo claro/escuro
  useEffect(() => {
    if (!excalidrawAPI) return;
    const isDark = resolvedTheme === "dark";
    excalidrawAPI.updateScene({
      appState: {
        theme: isDark ? "dark" : "light",
      },
    });
  }, [resolvedTheme, excalidrawAPI]);

  // Salva alterações com debounce
  const handleChange = useCallback((elements: readonly any[], appState: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
        // Salva apenas configurações relevantes do appState (zoom, scroll, etc.)
        const stateToSave = {
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          gridSize: appState.gridSize,
          viewBackgroundColor: appState.viewBackgroundColor,
        };
        localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.warn("Falha ao salvar rascunho do Whiteboard:", err);
      }
    }, 400);
  }, []);

  const handleClearCanvas = () => {
    if (!excalidrawAPI) return;
    if (window.confirm("Deseja realmente limpar todos os desenhos e formas do quadro?")) {
      excalidrawAPI.resetScene();
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(APP_STATE_STORAGE_KEY);
    }
  };

  const handleExportPNG = async () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    if (!elements || elements.length === 0) {
      alert("Desenhe algo no quadro antes de exportar.");
      return;
    }

    try {
      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const blob = await exportToBlob({
        elements,
        appState: {
          ...excalidrawAPI.getAppState(),
          exportWithDarkMode: resolvedTheme === "dark",
        },
        files: excalidrawAPI.getFiles(),
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rn-planner-whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao exportar PNG:", e);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl shadow-xl overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen"
          : "h-[calc(100vh-190px)] min-h-[620px] w-full"
      }`}
    >
      {/* Barra Superior do Canvas */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#090d16]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-comfortaa text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Excalidraw</span>
              <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                Whiteboard
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans hidden sm:block">
              Rascunhos, fluxogramas, arquiteturas e ideação livre com salvamento automático.
            </p>
          </div>
        </div>

        {/* Ações do Canvas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-comfortaa transition-all cursor-pointer shadow-xs"
            title="Exportar como imagem PNG"
          >
            <Download className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Exportar PNG</span>
          </button>

          <button
            onClick={handleClearCanvas}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-rose-500/40 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-comfortaa transition-all cursor-pointer shadow-xs"
            title="Limpar quadro"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Área do Excalidraw Canvas */}
      <div className="relative flex-1 w-full h-full">
        {initialData !== null ? (
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={initialData}
            onChange={handleChange}
            theme={isDark ? "dark" : "light"}
            langCode="pt-BR"
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: true,
                clearCanvas: false, // Usamos nosso botão customizado
                export: {
                  saveFileToDisk: true,
                },
                loadScene: true,
                saveToActiveFile: false,
                toggleTheme: false, // Controlado pelo tema da nossa aplicação
              },
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100/50 dark:bg-[#090d16]/50">
            <div className="flex items-center gap-3 bg-white/90 dark:bg-[#0b0f1a]/95 px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                Iniciando Excalidraw Engine...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
