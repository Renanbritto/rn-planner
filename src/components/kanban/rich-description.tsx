"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  CheckSquare,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  Upload,
  ExternalLink,
  X,
  Maximize2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export interface ExtractedImage {
  id: string;
  alt: string;
  src: string;
  markdown: string;
}

/**
 * Extrai todas as imagens markdown ![alt](src) do texto
 */
export function extractImagesFromMarkdown(text: string): ExtractedImage[] {
  if (!text) return [];
  const regex = /!\[(.*?)\]\((.*?)\)/g;
  const images: ExtractedImage[] = [];
  let match;
  let index = 0;
  while ((match = regex.exec(text)) !== null) {
    images.push({
      id: `img-${index++}`,
      alt: match[1] || "Imagem anexada",
      src: match[2],
      markdown: match[0],
    });
  }
  return images;
}

/**
 * Remove sintaxe de imagem para exibição limpa em cards
 */
export function getCleanSnippet(text: string): string {
  if (!text) return "";
  return text
    .replace(/!\[(.*?)\]\(.*?\)/g, "📷 [Imagem]")
    .replace(/[#*`_~>[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compacta arquivos de imagem no cliente (Canvas) para WebP/JPEG leve (~30KB-80KB)
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.8
): Promise<string> {
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
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData && webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback to jpeg
        }
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface RichDescriptionEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichDescriptionEditor({
  value,
  onChange,
  placeholder = "Descreva os detalhes da tarefa, anotações, checklists ou anexe imagens...",
}: RichDescriptionEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const images = extractImagesFromMarkdown(value);

  // Insere texto na posição do cursor
  const insertTextAtCursor = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange((value || "") + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selected = currentVal.substring(start, end) || defaultText;

    const replacement = prefix + selected + suffix;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Upload e processamento de imagem
  const handleProcessImageFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Por favor, selecione arquivos de imagem válidos (PNG, JPG, WebP, SVG).");
      return;
    }

    const toastId = toast.loading("Comprimindo e inserindo imagem...");
    try {
      let appendedMarkdown = "";
      for (const file of validFiles) {
        const compressedDataUrl = await compressImageFile(file);
        const altName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        appendedMarkdown += `\n\n![${altName}](${compressedDataUrl})\n`;
      }

      onChange((value || "").trimEnd() + appendedMarkdown);
      toast.success("Imagem(ns) anexada(s) com sucesso!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar imagem.", { id: toastId });
    }
  };

  // Suporte a colar (Ctrl+V) imagem da área de transferência
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      handleProcessImageFiles(imageFiles);
    }
  };

  // Suporte a Drag & Drop de arquivo
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessImageFiles(e.dataTransfer.files);
    }
  };

  // Inserir imagem por URL externa
  const handleInsertImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    const alt = imageAltInput.trim() || "Imagem";
    const md = `\n\n![${alt}](${imageUrlInput.trim()})\n`;
    onChange((value || "").trimEnd() + md);

    setImageUrlInput("");
    setImageAltInput("");
    setIsUrlModalOpen(false);
    toast.success("Imagem por URL adicionada!");
  };

  // Remover imagem específica do texto
  const handleRemoveImage = (img: ExtractedImage) => {
    const updated = value.replace(img.markdown, "").replace(/\n\s*\n\s*\n/g, "\n\n").trim();
    onChange(updated);
    toast.info("Imagem removida da descrição.");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Barra de Ferramentas / Header do Editor */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 dark:border-white/10 pb-2">
        {/* Botões de Formatação Markdown */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertTextAtCursor("**", "**", "texto em negrito")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Negrito (**texto**)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor("*", "*", "texto em itálico")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Itálico (*texto*)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor("\n- ", "", "Item da lista")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Lista com marcadores"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor("\n- [ ] ", "", "Item de checklist")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Checklist / Tarefa (- [ ])"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor("\n```\n", "\n```\n", "código")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Bloco de código"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor("[", "](https://link.com)", "Título do link")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Inserir link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

          {/* Botões de Inserção de Imagem */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-comfortaa font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer shadow-xs"
            title="Fazer upload de imagem do computador"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Imagem</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUrlModalOpen(true)}
            className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-comfortaa font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Inserir imagem por URL externa"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Imagem URL</span>
          </button>

          {/* Input invisível para seleção de arquivo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) handleProcessImageFiles(e.target.files);
              e.target.value = "";
            }}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* Alternador Editar / Visualizar */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] p-0.5 border border-slate-200 dark:border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-comfortaa font-semibold transition-all ${
              activeTab === "edit"
                ? "bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Edit3 className="h-3 w-3" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-comfortaa font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Visualizar</span>
            {images.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-mono text-slate-950 font-bold px-1">
                {images.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modal / Caixa para Inserir Imagem por Link */}
      {isUrlModalOpen && (
        <form
          onSubmit={handleInsertImageUrl}
          className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10 p-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
            <input
              type="url"
              required
              placeholder="Cole o link da imagem (ex: https://.../screenshot.png)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090d16] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="Legenda da imagem (opcional)"
              value={imageAltInput}
              onChange={(e) => setImageAltInput(e.target.value)}
              className="sm:w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090d16] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="submit"
              className="h-8 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-comfortaa cursor-pointer"
            >
              Inserir
            </button>
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Área Principal de Conteúdo: Modo Edição ou Modo Preview */}
      {activeTab === "edit" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border transition-all ${
            isDraggingOver
              ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-500/10"
              : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]"
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="w-full bg-transparent p-3.5 text-xs leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-sans resize-y min-h-[140px]"
          />

          {/* Rodapé do editor */}
          <div className="flex items-center justify-end border-t border-slate-200/60 dark:border-white/5 px-3 py-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>{value?.length || 0} caracteres</span>
          </div>

          {isDraggingOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20 backdrop-blur-xs rounded-2xl pointer-events-none">
              <span className="font-comfortaa font-bold text-xs text-cyan-600 dark:text-cyan-300">
                Solte a imagem para anexar
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Modo Visualização Renderizada (Preview com Markdown e Imagens) */
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#090d16]/80 p-4 min-h-[140px] text-xs leading-relaxed text-slate-800 dark:text-slate-200">
          {!value?.trim() ? (
            <p className="text-slate-400 dark:text-slate-500 italic">
              Nenhuma descrição fornecida ainda.
            </p>
          ) : (
            <MarkdownRenderer
              content={value}
              onImageClick={(src, alt) => setLightboxImage({ src, alt })}
            />
          )}
        </div>
      )}

      {/* Galeria de Miniaturas das Imagens Anexadas (sempre acessível para visualização rápida) */}
      {images.length > 0 && (
        <div className="mt-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-comfortaa text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-cyan-500" />
              <span>Imagens Anexadas ({images.length})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Clique para expandir
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-[#090d16] aspect-video flex items-center justify-center cursor-pointer shadow-xs hover:border-cyan-500/40 transition-all"
                onClick={() => setLightboxImage({ src: img.src, alt: img.alt })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay com Ações */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src: img.src, alt: img.alt });
                    }}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Expandir imagem"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(img);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white transition-colors"
                    title="Remover imagem"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Tag de Nome no canto inferior */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1 px-1.5 text-[10px] text-white font-mono truncate">
                  {img.alt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal de Imagem em Tela Cheia */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 right-0 flex items-center gap-2">
              <a
                href={lightboxImage.src}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Abrir original</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            {lightboxImage.alt && (
              <p className="mt-2 text-center text-xs text-slate-300 font-mono">
                {lightboxImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Renderizador de Markdown Customizado e Seguro (suporta imagens, links, checklists, headers, code, listas)
 */
export function MarkdownRenderer({
  content,
  onImageClick,
}: {
  content: string;
  onImageClick?: (src: string, alt: string) => void;
}) {
  // Processamento linha a linha
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bloco de código
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // Fecha o bloco de código
        renderedElements.push(
          <pre
            key={`code-${i}`}
            className="my-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 p-3 font-mono text-[11px] text-cyan-300"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Linha vazia
    if (!line.trim()) {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h4 key={`h3-${i}`} className="font-comfortaa text-xs font-bold text-slate-900 dark:text-white mt-2 mb-1">
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      renderedElements.push(
        <h3 key={`h2-${i}`} className="font-comfortaa text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1">
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h2 key={`h1-${i}`} className="font-comfortaa text-base font-bold text-slate-900 dark:text-white mt-2 mb-1">
          {renderInlineMarkdown(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Checklists (- [ ] ou - [x])
    const checklistMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (checklistMatch) {
      const isChecked = checklistMatch[1].toLowerCase() === "x";
      const text = checklistMatch[2];
      renderedElements.push(
        <div key={`check-${i}`} className="flex items-center gap-2 my-1">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="h-3.5 w-3.5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 cursor-default"
          />
          <span className={isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""}>
            {renderInlineMarkdown(text)}
          </span>
        </div>
      );
      continue;
    }

    // Listas normais (- ou *)
    if (line.match(/^[-*]\s+(.*)$/)) {
      const itemText = line.replace(/^[-*]\s+/, "");
      renderedElements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
          <span>{renderInlineMarkdown(itemText)}</span>
        </div>
      );
      continue;
    }

    // Imagem em linha dedicada: ![alt](src)
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      const alt = imageMatch[1] || "Imagem";
      const src = imageMatch[2];
      renderedElements.push(
        <div key={`img-block-${i}`} className="my-2.5">
          <div
            className="group relative inline-block max-w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#090d16] cursor-pointer shadow-md hover:border-cyan-500/40 transition-all"
            onClick={() => onImageClick?.(src, alt)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-72 w-auto max-w-full object-contain rounded-2xl transition-transform duration-200 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs text-white font-comfortaa font-medium shadow-lg">
                <Maximize2 className="h-3.5 w-3.5" />
                Expandir Imagem
              </span>
            </div>
          </div>
          {alt && alt !== "Imagem" && (
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono italic">
              {alt}
            </p>
          )}
        </div>
      );
      continue;
    }

    // Parágrafo regular
    renderedElements.push(
      <p key={`p-${i}`} className="my-1">
        {renderInlineMarkdown(line, onImageClick)}
      </p>
    );
  }

  // Caso tenha ficado bloco de código aberto
  if (inCodeBlock && codeBuffer.length > 0) {
    renderedElements.push(
      <pre
        key="code-unclosed"
        className="my-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 p-3 font-mono text-[11px] text-cyan-300"
      >
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5">{renderedElements}</div>;
}

/**
 * Renderiza formatação inline: imagens, links, negrito, itálico, código inline
 */
function renderInlineMarkdown(
  text: string,
  onImageClick?: (src: string, alt: string) => void
): React.ReactNode {
  // 1. Processar imagens inline primeiro
  const parts = text.split(/(!\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1] || "Imagem";
      const src = imgMatch[2];
      return (
        <span
          key={`inline-img-${index}`}
          onClick={() => onImageClick?.(src, alt)}
          className="inline-block my-1 align-middle cursor-pointer group"
          title="Clique para ver imagem expandida"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="inline-block max-h-48 max-w-xs rounded-xl border border-slate-200 dark:border-white/10 group-hover:border-cyan-500/50 shadow-sm"
          />
        </span>
      );
    }

    // 2. Processar links [texto](url)
    const linkParts = part.split(/(\[.*?\]\(.*?\))/g);
    return linkParts.map((subPart, subIdx) => {
      const linkMatch = subPart.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={`link-${index}-${subIdx}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
          </a>
        );
      }

      // 3. Processar código inline `code`
      const codeParts = subPart.split(/(`[^`]+`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith("`") && cPart.endsWith("`") && cPart.length > 2) {
          return (
            <code
              key={`code-${index}-${subIdx}-${cIdx}`}
              className="rounded bg-slate-200/70 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-300"
            >
              {cPart.slice(1, -1)}
            </code>
          );
        }

        // 4. Negrito **texto**
        const boldParts = cPart.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length > 4) {
            return (
              <strong key={`bold-${index}-${subIdx}-${cIdx}-${bIdx}`} className="font-bold text-slate-900 dark:text-white">
                {bPart.slice(2, -2)}
              </strong>
            );
          }

          // 5. Itálico *texto*
          const italicParts = bPart.split(/(\*[^*]+\*)/g);
          return italicParts.map((iPart, iIdx) => {
            if (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length > 2) {
              return (
                <em key={`italic-${index}-${subIdx}-${cIdx}-${bIdx}-${iIdx}`} className="italic">
                  {iPart.slice(1, -1)}
                </em>
              );
            }
            return iPart;
          });
        });
      });
    });
  });
}
