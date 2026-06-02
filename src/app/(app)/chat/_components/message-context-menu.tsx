"use client";

import { useEffect, useRef } from "react";
import { Bookmark, Copy, Expand, X } from "lucide-react";

type Props = {
  x: number;
  y: number;
  onFavorite: () => void;
  onCopy: () => void;
  onClose: () => void;
  onAmplify?: () => void;
};

/**
 * Mini-menu flutuante exibido ao clicar em uma mensagem.
 * Fecha ao clicar fora ou pressionar Escape.
 * Exibe "Ampliar imagem" apenas quando onAmplify for fornecido (mensagens com imagem).
 */
export function MessageContextMenu({ x, y, onFavorite, onCopy, onClose, onAmplify }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  /* Garante que o menu não saia da tela */
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    top: Math.min(y, window.innerHeight - 160),
    left: Math.min(x, window.innerWidth - 200),
    zIndex: 50,
  };

  return (
    <div
      ref={ref}
      style={menuStyle}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10 animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        type="button"
        onClick={() => { onFavorite(); onClose(); }}
        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Bookmark className="h-4 w-4 text-[#5B0A0A]" />
        Favoritar mensagem
      </button>

      {onAmplify && (
        <>
          <div className="mx-3 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => { onAmplify(); onClose(); }}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Expand className="h-4 w-4 text-[#5B0A0A]" />
            Ampliar imagem
          </button>
        </>
      )}

      <div className="mx-3 border-t border-gray-100" />
      <button
        type="button"
        onClick={() => { onCopy(); onClose(); }}
        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Copy className="h-4 w-4 text-[#5B0A0A]" />
        Copiar mensagem
      </button>

      <div className="mx-3 border-t border-gray-100" />
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-gray-50"
      >
        <X className="h-4 w-4" />
        Fechar
      </button>
    </div>
  );
}
