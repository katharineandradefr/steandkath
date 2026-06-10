"use client";

import { useEffect, useRef } from "react";
import { Bookmark, ClipboardList, Copy, Expand, X } from "lucide-react";

type Props = {
  x: number;
  y: number;
  onFavorite: () => void;
  onCopy: () => void;
  onClose: () => void;
  onAmplify?: () => void;
  onVerifyPendency?: () => void;
};

/**
 * Mini-menu flutuante exibido ao clicar em uma mensagem.
 * Fecha ao clicar fora ou pressionar Escape.
 * Exibe "Ampliar imagem" apenas quando onAmplify for fornecido (mensagens com imagem).
 */
export function MessageContextMenu({
  x,
  y,
  onFavorite,
  onCopy,
  onClose,
  onAmplify,
  onVerifyPendency,
}: Props) {
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
  const menuHeight = onVerifyPendency ? 220 : 160;

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    top: Math.min(y, window.innerHeight - menuHeight),
    left: Math.min(x, window.innerWidth - 220),
    zIndex: 50,
  };

  return (
    <div
      ref={ref}
      style={menuStyle}
      className="chat-msg-menu flex flex-col overflow-hidden rounded-xl shadow-xl"
    >
      <button
        type="button"
        onClick={() => { onFavorite(); onClose(); }}
        className="chat-msg-menu-item flex items-center gap-2.5 px-4 py-3 text-sm"
      >
        <Bookmark className="chat-msg-menu-icon h-4 w-4" aria-hidden />
        Favoritar mensagem
      </button>

      {onVerifyPendency && (
        <>
          <div className="chat-msg-menu-divider mx-3 border-t" />
          <button
            type="button"
            onClick={() => { onVerifyPendency(); onClose(); }}
            className="chat-msg-menu-item flex items-center gap-2.5 px-4 py-3 text-sm"
          >
            <ClipboardList className="chat-msg-menu-icon h-4 w-4" aria-hidden />
            Verificar pendência
          </button>
        </>
      )}

      {onAmplify && (
        <>
          <div className="chat-msg-menu-divider mx-3 border-t" />
          <button
            type="button"
            onClick={() => { onAmplify(); onClose(); }}
            className="chat-msg-menu-item flex items-center gap-2.5 px-4 py-3 text-sm"
          >
            <Expand className="chat-msg-menu-icon h-4 w-4" aria-hidden />
            Ampliar imagem
          </button>
        </>
      )}

      <div className="chat-msg-menu-divider mx-3 border-t" />
      <button
        type="button"
        onClick={() => { onCopy(); onClose(); }}
        className="chat-msg-menu-item flex items-center gap-2.5 px-4 py-3 text-sm"
      >
        <Copy className="chat-msg-menu-icon h-4 w-4" aria-hidden />
        Copiar mensagem
      </button>

      <div className="chat-msg-menu-divider mx-3 border-t" />
      <button
        type="button"
        onClick={onClose}
        className="chat-msg-menu-item chat-msg-menu-item--muted flex items-center gap-2.5 px-4 py-3 text-sm"
      >
        <X className="h-4 w-4" aria-hidden />
        Fechar
      </button>
    </div>
  );
}
