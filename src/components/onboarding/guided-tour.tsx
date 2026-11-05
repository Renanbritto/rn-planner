"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  ArrowRight,
  ArrowLeft,
  X,
  MousePointerClick,
  Trophy,
  SkipForward,
} from "lucide-react";

/**
 * Tour guiado estilo "tutorial de jogo":
 * - Escurece a tela e abre um "buraco" (spotlight) sobre o elemento alvo
 * - Balão com setinha ancorado no alvo, barra de XP e contador de missão
 * - Passos interativos (action: "click"): o usuário precisa clicar no alvo real para avançar
 *
 * Os alvos são marcados no JSX com o atributo `data-tour="<id>"`.
 */

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  id: string;
  /** Valor do atributo data-tour do elemento a destacar. Sem target = balão centralizado. */
  target?: string;
  title: string;
  content: React.ReactNode;
  placement?: TourPlacement;
  /** Passo interativo: só avança quando o usuário clica no elemento destacado. */
  action?: "click";
  actionHint?: string;
  /** Se o alvo não existir/estiver invisível, o passo é pulado automaticamente. */
  optional?: boolean;
  padding?: number;
  onEnter?: () => void;
  onExit?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  /** completed = true quando o usuário chegou ao fim; false quando pulou. */
  onClose: (completed: boolean) => void;
}

type Rect = { top: number; left: number; width: number; height: number };
type Side = "top" | "bottom" | "left" | "right";
type Position = { top: number; left: number; side: Side | "center"; arrow: number };

const TOOLTIP_W = 360;
const GAP = 16;
const MARGIN = 12;
const TARGET_TIMEOUT_MS = 2500;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function findVisibleTarget(target: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  for (const el of Array.from(nodes)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth) {
      return el;
    }
  }
  return null;
}

function computePosition(
  hole: Rect | null,
  preferred: TourPlacement | undefined,
  tw: number,
  th: number,
  vw: number,
  vh: number
): Position {
  if (!hole || preferred === "center") {
    return {
      top: Math.max(MARGIN, (vh - th) / 2),
      left: Math.max(MARGIN, (vw - tw) / 2),
      side: "center",
      arrow: 0,
    };
  }

  const right = hole.left + hole.width;
  const bottom = hole.top + hole.height;
  const fits: Record<Side, boolean> = {
    right: vw - right >= tw + GAP + MARGIN,
    left: hole.left >= tw + GAP + MARGIN,
    bottom: vh - bottom >= th + GAP + MARGIN,
    top: hole.top >= th + GAP + MARGIN,
  };
  const order: Side[] = [
    ...(preferred ? [preferred as Side] : []),
    "bottom",
    "right",
    "top",
    "left",
  ];
  const side = order.find((s) => fits[s]);

  // Alvo muito grande (ex.: canvas): balão flutua no rodapé da tela, por cima do destaque
  if (!side) {
    return {
      top: vh - th - MARGIN * 2,
      left: clamp(hole.left + hole.width / 2 - tw / 2, MARGIN, vw - tw - MARGIN),
      side: "center",
      arrow: 0,
    };
  }

  if (side === "left" || side === "right") {
    const top = clamp(hole.top + hole.height / 2 - th / 2, MARGIN, vh - th - MARGIN);
    return {
      top,
      left: side === "right" ? right + GAP : hole.left - GAP - tw,
      side,
      arrow: clamp(hole.top + hole.height / 2 - top, 20, th - 20),
    };
  }

  const left = clamp(hole.left + hole.width / 2 - tw / 2, MARGIN, vw - tw - MARGIN);
  return {
    top: side === "bottom" ? bottom + GAP : hole.top - GAP - th,
    left,
    side,
    arrow: clamp(hole.left + hole.width / 2 - left, 20, tw - 20),
  };
}

export function GuidedTour({ steps, onClose }: GuidedTourProps) {
  const [index, setIndex] = useState(0);
  const [measured, setMeasured] = useState<{ index: number; rect: Rect } | null>(null);
  const [missingIndex, setMissingIndex] = useState<number | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ w: TOOLTIP_W, h: 240 });
  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  const [shake, setShake] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef(steps);
  const directionRef = useRef<1 | -1>(1);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    stepsRef.current = steps;
    onCloseRef.current = onClose;
  });

  const total = steps.length;
  const step = steps[index];
  const isLast = index === total - 1;
  const rect = measured?.index === index ? measured.rect : null;
  const targetMissing = missingIndex === index;

  const goTo = useCallback((next: number) => {
    directionRef.current = next >= 0 ? 1 : -1;
    setIndex((current) => {
      const target = current + next;
      if (target >= stepsRef.current.length) {
        // Fim da jornada
        window.setTimeout(() => onCloseRef.current(true), 0);
        return current;
      }
      return clamp(target, 0, stepsRef.current.length - 1);
    });
  }, []);

  const next = useCallback(() => goTo(1), [goTo]);
  const prev = useCallback(() => goTo(-1), [goTo]);
  const skip = useCallback(() => onCloseRef.current(false), []);

  // Ciclo de vida de cada passo: onEnter/onExit + rastreio contínuo do alvo
  useEffect(() => {
    const current = stepsRef.current[index];
    if (!current) return;

    current.onEnter?.();

    if (!current.target) {
      return () => current.onExit?.();
    }

    let cancelled = false;
    let raf = 0;
    let el: HTMLElement | null = null;
    let scrolled = false;
    let listened: HTMLElement | null = null;
    let advanceTimer = 0;
    const startedAt = performance.now();

    const handleTargetClick = () => {
      window.clearTimeout(advanceTimer);
      advanceTimer = window.setTimeout(() => goTo(1), 280);
    };

    const loop = () => {
      if (cancelled) return;

      if (!el || !el.isConnected) {
        el = findVisibleTarget(current.target!);
      }

      if (el) {
        if (!scrolled) {
          el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
          scrolled = true;
        }
        if (current.action === "click" && listened !== el) {
          listened?.removeEventListener("click", handleTargetClick);
          el.addEventListener("click", handleTargetClick);
          listened = el;
        }
        const r = el.getBoundingClientRect();
        setMeasured((prevMeasured) =>
          prevMeasured &&
          prevMeasured.index === index &&
          prevMeasured.rect.top === r.top &&
          prevMeasured.rect.left === r.left &&
          prevMeasured.rect.width === r.width &&
          prevMeasured.rect.height === r.height
            ? prevMeasured
            : { index, rect: { top: r.top, left: r.left, width: r.width, height: r.height } }
        );
      } else if (performance.now() - startedAt > TARGET_TIMEOUT_MS) {
        if (current.optional) {
          goTo(directionRef.current);
          return;
        }
        setMissingIndex(index);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(advanceTimer);
      listened?.removeEventListener("click", handleTargetClick);
      current.onExit?.();
    };
  }, [index, goTo]);

  // Mede o balão para posicionar corretamente
  useLayoutEffect(() => {
    const node = tooltipRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => {
      setTooltipSize({ w: node.offsetWidth, h: node.offsetHeight });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Viewport
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const current = stepsRef.current[index];
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      } else if ((e.key === "ArrowRight" || e.key === "Enter") && current?.action !== "click") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, next, prev, skip]);

  const nudge = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  if (!step) return null;

  // Recorte do spotlight (limitado à viewport para alvos gigantes)
  let hole: Rect | null = null;
  if (rect && step.placement !== "center") {
    const pad = step.padding ?? 8;
    const top = Math.max(rect.top - pad, 6);
    const left = Math.max(rect.left - pad, 6);
    const bottom = Math.min(rect.top + rect.height + pad, viewport.h - 6);
    const right = Math.min(rect.left + rect.width + pad, viewport.w - 6);
    if (bottom > top && right > left) {
      hole = { top, left, width: right - left, height: bottom - top };
    }
  }

  const tooltipWidth = Math.min(TOOLTIP_W, viewport.w - MARGIN * 2);
  const waitingTarget = Boolean(step.target) && !hole && !targetMissing;
  const pos = computePosition(
    waitingTarget ? null : hole,
    step.placement,
    tooltipWidth,
    tooltipSize.h,
    viewport.w,
    viewport.h
  );
  const isInteractive = step.action === "click" && Boolean(hole);
  const progress = ((index + 1) / total) * 100;

  const arrowStyle: React.CSSProperties | null =
    pos.side === "bottom"
      ? { top: -6, left: pos.arrow - 6 }
      : pos.side === "top"
      ? { bottom: -6, left: pos.arrow - 6 }
      : pos.side === "right"
      ? { left: -6, top: pos.arrow - 6 }
      : pos.side === "left"
      ? { right: -6, top: pos.arrow - 6 }
      : null;

  return createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-none" role="dialog" aria-modal="true" aria-label="Tour guiado">
      {/* Camada escura */}
      {hole ? (
        <>
          {/* Bloqueadores em volta do recorte (clique fora = balão "treme") */}
          <div className="absolute pointer-events-auto" style={{ top: 0, left: 0, right: 0, height: hole.top }} onClick={nudge} />
          <div className="absolute pointer-events-auto" style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} onClick={nudge} />
          <div className="absolute pointer-events-auto" style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} onClick={nudge} />
          <div className="absolute pointer-events-auto" style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} onClick={nudge} />

          {/* Passo informativo: o alvo não é clicável */}
          {!isInteractive && (
            <div
              className="absolute pointer-events-auto cursor-default"
              style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
              onClick={nudge}
            />
          )}

          {/* Spotlight */}
          <div
            className="absolute rounded-2xl transition-all duration-300 ease-out"
            style={{
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
              boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.72)",
            }}
          />
          <div
            className="absolute rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.55)] transition-all duration-300 ease-out animate-[tour-ring_1.8s_ease-in-out_infinite]"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          />

          {/* Mãozinha indicando o clique (passos interativos) */}
          {isInteractive && (
            <div
              className="absolute text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-bounce"
              style={{
                top: hole.top + hole.height - 10,
                left: hole.left + hole.width / 2 - 4,
              }}
            >
              <MousePointerClick className="h-7 w-7" />
            </div>
          )}
        </>
      ) : (
        <div
          className="absolute inset-0 pointer-events-auto bg-slate-950/70 backdrop-blur-[2px] animate-in fade-in duration-300"
          onClick={nudge}
        />
      )}

      {/* Balão do guia */}
      <div
        ref={tooltipRef}
        className={`absolute pointer-events-auto rounded-2xl border border-cyan-500/30 bg-white dark:bg-[#0b0f1a] text-slate-900 dark:text-slate-100 shadow-2xl shadow-black/40 transition-[top,left,opacity] duration-300 ease-out ${
          waitingTarget ? "opacity-0" : "opacity-100"
        } ${shake ? "animate-[tour-shake_0.45s_ease-in-out]" : ""}`}
        style={{ top: pos.top, left: pos.left, width: tooltipWidth }}
      >
        {arrowStyle && (
          <span
            className="absolute h-3 w-3 rotate-45 bg-white dark:bg-[#0b0f1a] border-cyan-500/30 border-l border-t"
            style={{
              ...arrowStyle,
              transform:
                pos.side === "bottom"
                  ? "rotate(45deg)"
                  : pos.side === "top"
                  ? "rotate(225deg)"
                  : pos.side === "right"
                  ? "rotate(-45deg)"
                  : "rotate(135deg)",
            }}
          />
        )}

        <div className="relative p-4 sm:p-5 flex flex-col gap-3">
          {/* Cabeçalho: avatar do guia + contador de missão */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.5)]">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0b0f1a]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-comfortaa text-xs font-bold">RN Guide</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Missão {index + 1}/{total}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={skip}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Sair do tutorial (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barra de XP */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col gap-1.5">
            <h3 className="font-comfortaa text-base font-bold tracking-tight">{step.title}</h3>
            <div className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{step.content}</div>
          </div>

          {isInteractive && (
            <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
              <MousePointerClick className="h-4 w-4 shrink-0 animate-pulse" />
              <span>{step.actionHint ?? "Clique no item destacado para continuar"}</span>
            </div>
          )}

          {targetMissing && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Esse elemento não está visível nesta tela agora. Pode seguir em frente.
            </div>
          )}

          {/* Rodapé */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-comfortaa font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>
              )}
              {!isLast && (
                <button
                  type="button"
                  onClick={skip}
                  className="rounded-lg px-2 py-1.5 text-[11px] font-comfortaa text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Pular tutorial
                </button>
              )}
            </div>

            {isInteractive ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-comfortaa text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Avançar sem clicar"
              >
                Pular etapa
                <SkipForward className="h-3 w-3" />
              </button>
            ) : isLast ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 px-4 py-2 text-xs font-comfortaa font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer"
              >
                <Trophy className="h-4 w-4" />
                Concluir missão
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                autoFocus
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2 text-xs font-comfortaa font-bold text-white shadow-md shadow-cyan-500/20 hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer"
              >
                {index === 0 ? "Começar" : "Próximo"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

