"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Paperclip, X } from "lucide-react";

import type { ChatHistoryEntry } from "~/app/(app)/chat/_components/chat-types";

/* Histórico inicial de exemplo para a conversa padrão */
export const DEFAULT_HISTORY_ENTRIES: ChatHistoryEntry[] = [
  {
    id: "1",
    date: "22/05/2026",
    status: "Atendimento Finalizado",
    user: "Stefani Silva",
    images: ["https://picsum.photos/seed/chat1/400/300"],
  },
  {
    id: "2",
    date: "22/05/2026",
    status: "Atendimento Finalizado",
    user: "Stefani Silva",
  },
  {
    id: "3",
    date: "21/05/2026",
    status: "Atendimento Finalizado",
    user: "Lucas Ferreira",
  },
  {
    id: "4",
    date: "20/05/2026",
    status: "Atendimento Finalizado",
    user: "Felipe Daiko",
    images: [
      "https://picsum.photos/seed/chat4a/400/300",
      "https://picsum.photos/seed/chat4b/400/300",
      "https://picsum.photos/seed/chat4c/400/300",
    ],
  },
  {
    id: "5",
    date: "19/05/2026",
    status: "Atendimento Finalizado",
    user: "Amirah Saleh",
  },
  {
    id: "6",
    date: "18/05/2026",
    status: "Atendimento Finalizado",
    user: "Stefani Silva",
  },
  {
    id: "7",
    date: "17/05/2026",
    status: "Atendimento Finalizado",
    user: "Henrique Lunarderlli",
  },
];

type ImageViewerProps = {
  images: string[];
  onClose: () => void;
};

/** Modal para visualizar as imagens do histórico de uma conversa */
function ImageViewer({ images, onClose }: ImageViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="app-overlay-modal fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Imagens do histórico"
      onClick={onClose}
    >
      <div
        className="app-overlay-modal-card relative flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            {images.length === 1 ? "1 imagem" : `${images.length} imagens`} encaminhadas
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`grid gap-3 ${
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Imagem ${i + 1}`}
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: images.length === 1 ? 300 : 180 }}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type Props = {
  entries: ChatHistoryEntry[];
};

/**
 * Sub-painel: histórico de atendimentos com data, usuário e visualizador de imagens.
 * Entradas com imagens exibem ícone de clip clicável.
 */
export function HistoricoPanel({ entries }: Props) {
  const [viewerImages, setViewerImages] = useState<string[] | null>(null);

  return (
    <>
      <div className="chat-subpanel-surface rounded-lg">
        <div className="flex flex-col divide-y divide-gray-200">
          {entries.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-gray-500">
              Nenhum atendimento finalizado ainda.
            </p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start justify-between gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700">{entry.date}</p>
                <p className="text-xs text-gray-600">{entry.status}</p>
                <p className="text-xs text-gray-500">
                  {entry.user} —{" "}
                  <button type="button" className="text-[#5B0A0A] hover:underline">
                    ver relatório
                  </button>
                </p>
              </div>

              {entry.images && entry.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewerImages(entry.images!)}
                  className="mt-0.5 shrink-0 rounded p-0.5 text-[#5B0A0A] transition-colors hover:bg-[#5B0A0A]/10"
                  aria-label={`Ver ${entry.images.length} imagem(ns)`}
                  title={`${entry.images.length} imagem(ns) — clique para ver`}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {viewerImages && (
        <ImageViewer images={viewerImages} onClose={() => setViewerImages(null)} />
      )}
    </>
  );
}
