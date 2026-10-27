"use client";

import React, { useState, useRef } from "react";
import {
  ColumnColor,
  COLUMN_COLOR_OPTIONS,
  WORKSPACE_ICONS,
  WORKSPACE_LUCIDE_ICONS,
} from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Check,
  Sparkles,
  Smile,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import {
  WorkspaceAvatar,
  LUCIDE_WORKSPACE_ICON_MAP,
} from "@/components/workspace/workspace-avatar";
import { toast } from "sonner";

interface NewWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (data: {
    name: string;
    icon: string;
    avatarUrl?: string;
    color: ColumnColor;
  }) => void;
}

/**
 * Compacta arquivo de imagem local no cliente (Canvas) para avatar leve (~20KB-40KB)
 */
async function compressAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 320;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webpData = canvas.toDataURL("image/webp", 0.85);
          if (webpData && webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback to png/jpeg
        }
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function NewWorkspaceDialog({
  open,
  onOpenChange,
  onCreateWorkspace,
}: NewWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("lucide:Rocket");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [color, setColor] = useState<ColumnColor>("cyan");
  const [activeVisualTab, setActiveVisualTab] = useState<"icons" | "emojis" | "image">("icons");
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    try {
      setIsUploading(true);
      const compressed = await compressAvatarFile(file);
      setAvatarUrl(compressed);
      toast.success("Imagem do workspace carregada!");
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      toast.error("Erro ao carregar imagem. Tente outro arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      toast.error("A URL deve começar com http:// ou https://");
      return;
    }
    setAvatarUrl(trimmed);
    setImageUrlInput("");
    toast.success("URL da imagem aplicada!");
  };

  const handleRemoveImage = () => {
    setAvatarUrl(null);
    toast.info("Imagem removida. Usando ícone padrão.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, digite um nome para o workspace.");
      return;
    }

    onCreateWorkspace({
      name: name.trim(),
      icon,
      avatarUrl: avatarUrl || undefined,
      color,
    });

    // Resetar campos
    setName("");
    setIcon("lucide:Rocket");
    setAvatarUrl(null);
    setColor("cyan");
    setActiveVisualTab("icons");
    setCustomEmojiInput("");
    setImageUrlInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[480px] shadow-2xl dark:shadow-black/60 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="font-comfortaa text-base font-bold text-slate-900 dark:text-white">
              Novo Workspace
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crie um espaço de trabalho dedicado para organizar seus projetos.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Pré-visualização do Badge do Workspace */}
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
            <WorkspaceAvatar
              icon={icon}
              avatarUrl={avatarUrl || undefined}
              color={color}
              size="lg"
              name={name}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-comfortaa text-sm font-bold text-slate-900 dark:text-white truncate">
                {name.trim() || "Nome do Workspace"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Quadro Kanban & Whiteboard isolados
              </span>
            </div>
          </div>

          {/* Nome do Workspace */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nome do Workspace
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Projetos Pessoais, Startup, Estudos..."
              maxLength={40}
              autoFocus
              className="bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl h-9"
            />
          </div>

          {/* Seletor Flexível: Ícones, Emojis ou Imagem */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
                Identidade Visual
              </label>

              {/* Seletor de Abas de Tipo */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#090d16]">
                <button
                  type="button"
                  onClick={() => setActiveVisualTab("icons")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-comfortaa font-bold transition-all cursor-pointer ${
                    activeVisualTab === "icons"
                      ? "bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-300 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Ícones</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveVisualTab("emojis")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-comfortaa font-bold transition-all cursor-pointer ${
                    activeVisualTab === "emojis"
                      ? "bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-300 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Smile className="h-3 w-3" />
                  <span>Emojis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveVisualTab("image")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-comfortaa font-bold transition-all cursor-pointer ${
                    activeVisualTab === "image"
                      ? "bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-300 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Imagem</span>
                </button>
              </div>
            </div>

            {/* Conteúdo Aba 1: Ícones Lucide */}
            {activeVisualTab === "icons" && (
              <div className="flex flex-col gap-2 p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16] animate-in fade-in duration-150">
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {WORKSPACE_LUCIDE_ICONS.map((iconKey) => {
                    const IconComp = LUCIDE_WORKSPACE_ICON_MAP[iconKey];
                    if (!IconComp) return null;
                    const isSelected = !avatarUrl && icon === `lucide:${iconKey}`;

                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => {
                          setIcon(`lucide:${iconKey}`);
                          setAvatarUrl(null);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/20 border border-cyan-500/60 text-cyan-600 dark:text-cyan-300 scale-105 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 border border-transparent"
                        }`}
                        title={iconKey}
                      >
                        <IconComp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conteúdo Aba 2: Emojis + Entrada customizada */}
            {activeVisualTab === "emojis" && (
              <div className="flex flex-col gap-2.5 p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16] animate-in fade-in duration-150">
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {WORKSPACE_ICONS.map((emoji) => {
                    const isSelected = !avatarUrl && icon === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setIcon(emoji);
                          setAvatarUrl(null);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-base transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/20 border border-cyan-500/60 scale-110 shadow-xs"
                            : "hover:bg-slate-200 dark:hover:bg-white/10 border border-transparent"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>

                {/* Input de Emoji customizado */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <span className="text-[11px] font-comfortaa text-slate-500 dark:text-slate-400 shrink-0">
                    Outro emoji:
                  </span>
                  <Input
                    value={customEmojiInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomEmojiInput(val);
                      if (val.trim()) {
                        setIcon(val.trim());
                        setAvatarUrl(null);
                      }
                    }}
                    placeholder="Digite ou cole qualquer emoji (ex: 🎯, 🚀, 💡)"
                    maxLength={10}
                    className="h-7 text-xs bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 rounded-lg px-2"
                  />
                </div>
              </div>
            )}

            {/* Conteúdo Aba 3: Upload de Imagem ou Link */}
            {activeVisualTab === "image" && (
              <div className="flex flex-col gap-3 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16] animate-in fade-in duration-150">
                {avatarUrl ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-comfortaa font-bold text-slate-800 dark:text-white truncate">
                          Imagem selecionada
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="h-3 w-3" /> Ativa para o workspace
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-comfortaa transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Botão de Upload Local */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-cyan-500/50 bg-white/60 dark:bg-white/[0.02] hover:bg-cyan-500/[0.03] transition-all cursor-pointer text-center group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="font-comfortaa text-xs font-bold text-slate-800 dark:text-white">
                        {isUploading ? "Processando imagem..." : "Carregar do computador"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                        PNG, JPG, WebP ou SVG (otimização automática)
                      </span>
                    </div>

                    {/* Ou Inserir por URL */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="Ou cole o link da imagem (https://...)"
                          className="h-8 pl-8 text-xs bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyImageUrl}
                        className="h-8 px-3 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-comfortaa font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Aplicar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Seletor de Cor de Destaque */}
          <div className="flex flex-col gap-1.5">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cor de Destaque
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLUMN_COLOR_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setColor(item.id)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                    color === item.id
                      ? `${item.badgeBg} border-cyan-500 ring-1 ring-cyan-500/40 shadow-xs`
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#090d16]"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.dotColor}`}
                  />
                  <span className="font-comfortaa text-[11px] font-medium truncate text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                  {color === item.id && (
                    <Check className="h-3 w-3 text-cyan-500 shrink-0 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer font-comfortaa"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-xl text-xs font-bold font-comfortaa bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Criar Workspace
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
