"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Workspace,
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
  Sliders,
  AlertTriangle,
} from "lucide-react";
import {
  WorkspaceAvatar,
  LUCIDE_WORKSPACE_ICON_MAP,
} from "@/components/workspace/workspace-avatar";
import { toast } from "sonner";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace | null;
  totalWorkspaces: number;
  onUpdateWorkspace: (
    id: string,
    updates: {
      name: string;
      icon: string;
      avatarUrl?: string;
      color: ColumnColor;
    }
  ) => void;
  onDeleteWorkspace?: (id: string) => void;
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
          // fallback to standard format
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

export function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  totalWorkspaces,
  onUpdateWorkspace,
  onDeleteWorkspace,
}: EditWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("lucide:Rocket");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [color, setColor] = useState<ColumnColor>("cyan");
  const [activeVisualTab, setActiveVisualTab] = useState<"icons" | "emojis" | "image">("icons");
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workspace && open) {
      setName(workspace.name || "");
      setIcon(workspace.icon || "lucide:Rocket");
      setAvatarUrl(workspace.avatarUrl || null);
      setColor(workspace.color || "cyan");
      setIsConfirmingDelete(false);

      if (workspace.avatarUrl) {
        setActiveVisualTab("image");
      } else if (workspace.icon && workspace.icon.startsWith("lucide:")) {
        setActiveVisualTab("icons");
      } else {
        setActiveVisualTab("emojis");
      }
    }
  }, [workspace, open]);

  if (!workspace) return null;

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

    onUpdateWorkspace(workspace.id, {
      name: name.trim(),
      icon,
      avatarUrl: avatarUrl || undefined,
      color,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!onDeleteWorkspace) return;
    if (totalWorkspaces <= 1) {
      toast.error("Você precisa manter pelo menos um workspace.");
      return;
    }

    onDeleteWorkspace(workspace.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:max-w-[480px] shadow-2xl dark:shadow-black/60 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="font-comfortaa text-base font-bold text-slate-900 dark:text-white">
                Editar Workspace
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personalize o nome, ícone e cores do espaço de trabalho.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Pré-visualização do Workspace em Tempo Real */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
            <WorkspaceAvatar
              icon={icon}
              avatarUrl={avatarUrl || undefined}
              color={color}
              size="lg"
              name={name}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-comfortaa text-sm font-bold text-slate-900 dark:text-white truncate">
                {name.trim() || "Nome do Workspace"}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Prévia visual da barra lateral
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
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 self-end">
              {name.length}/40 caracteres
            </span>
          </div>

          {/* Identidade Visual */}
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
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 shadow-xs scale-105"
                            : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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

            {/* Conteúdo Aba 2: Emojis */}
            {activeVisualTab === "emojis" && (
              <div className="flex flex-col gap-2.5 p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16] animate-in fade-in duration-150">
                <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {WORKSPACE_ICONS.map((itemEmoji) => {
                    const isSelected = !avatarUrl && icon === itemEmoji;
                    return (
                      <button
                        key={itemEmoji}
                        type="button"
                        onClick={() => {
                          setIcon(itemEmoji);
                          setAvatarUrl(null);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all cursor-pointer ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/15 shadow-xs scale-105"
                            : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02]"
                        }`}
                      >
                        {itemEmoji}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                  <Input
                    value={customEmojiInput}
                    onChange={(e) => setCustomEmojiInput(e.target.value)}
                    placeholder="Cole ou digite qualquer emoji (ex: 🌟, 💡)..."
                    maxLength={4}
                    className="h-8 text-xs bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customEmojiInput.trim()) {
                        setIcon(customEmojiInput.trim());
                        setAvatarUrl(null);
                        setCustomEmojiInput("");
                        toast.success("Emoji personalizado aplicado!");
                      }
                    }}
                    disabled={!customEmojiInput.trim()}
                    className="h-8 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-comfortaa font-bold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Usar
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo Aba 3: Imagem Customizada */}
            {activeVisualTab === "image" && (
              <div className="flex flex-col gap-3 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16] animate-in fade-in duration-150">
                {avatarUrl ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-cyan-500/30 shrink-0">
                        <img
                          src={avatarUrl}
                          alt="Avatar do Workspace"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-comfortaa font-bold text-slate-800 dark:text-slate-200 truncate">
                          Imagem Ativa
                        </span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                          Substitui o ícone/emoji
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-comfortaa transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remover</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-comfortaa">
                    Faça upload do logo da sua empresa ou cole uma URL direta:
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 h-9 px-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-cyan-500/50 bg-white dark:bg-white/[0.02] text-xs font-comfortaa font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploading ? "Processando..." : "Upload do Computador"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                      className="h-9 text-xs bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImageUrl}
                      disabled={!imageUrlInput.trim()}
                      className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs font-comfortaa transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                      title="Aplicar URL"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Paleta de Cores do Workspace */}
          <div className="flex flex-col gap-2">
            <label className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cor do Tema
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLUMN_COLOR_OPTIONS.map((item) => {
                const isSelected = color === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColor(item.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer font-comfortaa ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-md shadow-cyan-500/10"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dotColor} shadow-[0_0_6px_currentColor]`} />
                    <span className="truncate flex-1 text-left">{item.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zona de Perigo / Excluir Workspace */}
          <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
            <label className="font-comfortaa text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Zona de Perigo</span>
            </label>

            {isConfirmingDelete ? (
              <div className="flex flex-col gap-2 p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 animate-in fade-in duration-150">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-comfortaa">
                  Tem certeza que deseja excluir <strong>&quot;{workspace.name}&quot;</strong>? Todas as etapas e tarefas vinculadas serão removidas permanentemente.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-comfortaa text-slate-700 dark:text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 text-xs shadow-md shadow-rose-600/20 font-comfortaa cursor-pointer"
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                <div className="flex flex-col">
                  <span className="text-xs font-comfortaa font-medium text-slate-800 dark:text-slate-200">
                    Excluir este Workspace
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {totalWorkspaces <= 1
                      ? "Obrigatório manter pelo menos 1 workspace"
                      : "Remove permanentemente este espaço e seus dados"}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={totalWorkspaces <= 1}
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-comfortaa font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-comfortaa font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold px-4 py-2.5 text-xs shadow-lg shadow-cyan-500/20 font-comfortaa transition-all disabled:opacity-50 cursor-pointer"
            >
              Salvar Alterações
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
