"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  Sparkles,
  Kanban,
  PenTool,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Layers,
  Cpu,
  Zap,
  Check,
} from "lucide-react";

interface AiOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function AiOnboardingDialog({
  open,
  onOpenChange,
  onComplete,
}: AiOnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rn_planner_onboarding_completed_v1", "true");
    }
    onComplete?.();
    onOpenChange(false);
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[620px] shadow-2xl dark:shadow-black/80 rounded-3xl p-6 md:p-8 max-h-[92vh] overflow-y-auto selection:bg-cyan-500 selection:text-white"
      >
        {/* Glow Decorativo de Fundo */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />

        {/* Header do Onboarding */}
        <DialogHeader className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
              <Bot className="h-3.5 w-3.5 animate-pulse" />
              <span>Tutorial IA-First • Guia Rápido</span>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs font-comfortaa text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
              title="Pular tutorial"
            >
              Pular
            </button>
          </div>

          <div className="flex items-center justify-between mt-1">
            <DialogTitle className="font-comfortaa text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentStep === 1 && "1. Contexto é Poder: Workspaces"}
              {currentStep === 2 && "2. Fatiamento Ágil no Kanban"}
              {currentStep === 3 && "3. Pensamento Visual com Excalidraw"}
              {currentStep === 4 && "4. O Método IA-First em 3 Passos"}
            </DialogTitle>

            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              Passo {currentStep} de {totalSteps}
            </span>
          </div>

          {/* Barra de Progresso com 4 Etapas */}
          <div className="flex items-center gap-1.5 w-full pt-1">
            {[1, 2, 3, 4].map((step) => {
              const isActive = step === currentStep;
              const isPast = step < currentStep;
              return (
                <div
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                      : isPast
                      ? "bg-cyan-500/40 dark:bg-cyan-500/40"
                      : "bg-slate-200 dark:bg-white/10"
                  }`}
                  title={`Ir para passo ${step}`}
                />
              );
            })}
          </div>
        </DialogHeader>

        {/* Conteúdo Dinâmico por Passo */}
        <div className="relative z-10 py-4 min-h-[300px] flex flex-col justify-center">
          {/* PASSO 1: WORKSPACES */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Na metodologia <strong className="text-cyan-600 dark:text-cyan-400">IA-First</strong>, contexto isolado é o segredo da clareza mental. Não misture código, carreira e vida pessoal no mesmo lugar.
              </p>

              {/* Card Ilustrativo */}
              <div className="p-4 rounded-2xl border border-cyan-500/30 dark:border-cyan-500/20 bg-slate-50 dark:bg-[#070b14] space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-cyan-500" />
                    <span>Seus Silos de Contexto</span>
                  </span>
                  <span className="text-[10px] text-cyan-500 font-bold">100% ISOLADOS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-500/15 flex flex-col gap-1">
                    <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300 font-comfortaa">🚀 Dev & IA</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">Projetos, repositórios e arquitetura</span>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 flex flex-col gap-1">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-comfortaa">💼 Carreira</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">Portfólio, metas e reuniões</span>
                  </div>
                  <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-500/15 flex flex-col gap-1">
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-300 font-comfortaa">🌿 Pessoal</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">Hábitos, leituras e saúde</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-sans">
                  💡 <strong>Dica Prática:</strong> Use o seletor no topo da barra lateral para trocar de workspace ou criar novos com ícones e cores exclusivas.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 2: KANBAN & FATIAMENTO ÁGIL */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Objetivos vagos geram procrastinação. Divida grandes ideias em <strong className="text-cyan-600 dark:text-cyan-400">micro-entregas acionáveis de 1 a 2 horas</strong> e atribua prioridades reais.
              </p>

              {/* Card Ilustrativo */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Kanban className="h-4 w-4 text-rose-500" />
                    <span>Anatomia de um Card de Alta Performance</span>
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold">EM ANDAMENTO</span>
                </div>

                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-white dark:bg-[#0b0f1a] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        P1 CRÍTICO
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                        BACKEND
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-amber-500">
                      Hoje, 18:00
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white font-comfortaa">
                    Implementar rota autenticada com Supabase SSR
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      Em Revisão
                    </span>
                    <span className="text-[10px] font-mono">Subtarefas: 3/4</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  💡 <strong>Dica Prática:</strong> Clique no botão <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">[+]</code> no topo de qualquer coluna para cadastrar tarefas instantaneamente.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 3: WHITEBOARD EXCALIDRAW */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Nem tudo cabe em uma lista de tarefas. Use o <strong className="text-cyan-600 dark:text-cyan-400">Excalidraw integrado</strong> para rabiscar a arquitetura, desenhar o fluxo de dados e mapear soluções antes de codar.
              </p>

              {/* Card Ilustrativo */}
              <div className="p-4 rounded-2xl border border-indigo-500/30 dark:border-indigo-500/20 bg-slate-50 dark:bg-[#070b14] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="flex items-center gap-1.5">
                    <PenTool className="h-4 w-4 text-indigo-500" />
                    <span>Do Rascunho à Execução com 1 Clique</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold">CANVAS INFINITO</span>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/50 dark:bg-[#0b0f1a] flex items-center justify-around gap-2 text-center text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="font-comfortaa font-bold text-[11px]">1. Brainstorm</span>
                    <span className="text-[10px] text-slate-500">Ideias livres</span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                      <PenTool className="h-5 w-5" />
                    </div>
                    <span className="font-comfortaa font-bold text-[11px]">2. Diagrama</span>
                    <span className="text-[10px] text-slate-500">Fluxos & Wireframes</span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="font-comfortaa font-bold text-[11px]">3. Kanban</span>
                    <span className="text-[10px] text-slate-500">Tarefas no board</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  💡 <strong>Dica Prática:</strong> Alterne entre a aba <strong className="text-slate-800 dark:text-white">Card</strong> e a aba <strong className="text-slate-800 dark:text-white">Excalidraw</strong> no menu lateral sempre que precisar pensar visualmente.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 4: WORKFLOW IA-FIRST EM 3 PASSOS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Para manter alto rendimento diário sem estresse, aplique o <strong className="text-cyan-600 dark:text-cyan-400">Protocolo dos 3 Passos</strong> todos os dias ao abrir o RN Planner:
              </p>

              {/* Os 3 Passos Práticos */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs space-y-0.5">
                    <span className="font-comfortaa font-bold text-slate-900 dark:text-white">
                      Defina a Tarefa Crítica do Dia (P1)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-sans">
                      Escolha no máximo 1 ou 2 tarefas prioritárias que destravam o dia. Todo o resto é secundário.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs space-y-0.5">
                    <span className="font-comfortaa font-bold text-slate-900 dark:text-white">
                      Limite o "Em Andamento" a 3 Itens
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-sans">
                      Multitarefa é inimiga da entrega. Termine um card antes de puxar o próximo da coluna A Fazer.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070b14] flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs space-y-0.5">
                    <span className="font-comfortaa font-bold text-slate-900 dark:text-white">
                      Revise com Selos de Status
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-sans">
                      Se dependeu de alguém, marque como <em>Aguardando</em>. Se está finalizado, jogue para <em>Em Revisão</em> ou <em>Concluído</em>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center text-xs font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                ✨ Seu espaço de trabalho está configurado e pronto para você produzir com foco total!
              </div>
            </div>
          )}
        </div>

        {/* Footer com Navegação e Conclusão */}
        <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-comfortaa font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-comfortaa font-bold text-xs transition-all shadow-md hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-comfortaa font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Começar a Organizar Agora</span>
                <Zap className="h-4 w-4 fill-slate-950" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

