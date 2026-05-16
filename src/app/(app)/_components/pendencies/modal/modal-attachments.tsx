"use client";

import { useCallback, useRef } from "react";

import type { PendencyAttachment } from "~/shared/pendency";

const MAX_BYTES = 5 * 1024 * 1024;

type ModalAttachmentsProps = {
  attachments: PendencyAttachment[];
  onChange: (attachments: PendencyAttachment[]) => void;
};

/**
 * Anexos de imagem: colar, arrastar ou selecionar ficheiro.
 */
export function ModalAttachments({
  attachments,
  onChange,
}: ModalAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (list.length === 0) return;

      const added: PendencyAttachment[] = [];
      for (const file of list) {
        if (file.size > MAX_BYTES) {
          window.alert(
            `"${file.name}" excede 5 MB. Escolha uma imagem menor.`,
          );
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        added.push({
          id: crypto.randomUUID(),
          fileName: file.name,
          dataUrl,
          createdAt: new Date().toISOString(),
        });
      }
      if (added.length > 0) onChange([...attachments, ...added]);
    },
    [attachments, onChange],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        void addFiles(files);
      }
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        void addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const remove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section
      className="border-t border-sidebar-border pt-5"
      onPaste={handlePaste}
    >
      <div className="mb-3 flex items-center gap-2">
        <PaperclipIcon />
        <h3 className="text-sm font-semibold text-white">Anexos</h3>
      </div>

      <div
        ref={dropRef}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        className="rounded-lg border border-dashed border-white/15 bg-shell/30 p-4 text-center transition hover:border-brand/30"
      >
        <p className="text-sm text-white/55">
          Cole uma imagem (Ctrl+V), arraste ficheiros ou{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-brand-bright underline-offset-2 hover:underline"
          >
            escolha do computador
          </button>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {attachments.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-shell/40 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.dataUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {a.fileName}
                </p>
                <p className="text-xs text-white/45">
                  Adicionado em {formatDate(a.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="shrink-0 rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                aria-label={`Remover ${a.fileName}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Falha ao ler o ficheiro."));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Falha ao ler o ficheiro."));
    reader.readAsDataURL(file);
  });
}

function PaperclipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-white/50"
      aria-hidden
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
