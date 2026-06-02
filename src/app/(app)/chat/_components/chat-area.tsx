"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronLeft, X } from "lucide-react";

import type { Conversation, Message } from "./chat-types";
import { MessageInput } from "./message-input";
import { MessageContextMenu } from "./message-context-menu";

type ContextMenu = { x: number; y: number; message: Message } | null;

/** Lightbox para visualizar imagem em tamanho ampliado */
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Imagem ampliada"
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

type Props = {
  conversation: Conversation;
  messages: Message[];
  favoritedIds: Set<string>;
  rightPanelOpen: boolean;
  isReplying: boolean;
  onToggleRightPanel: () => void;
  onSendMessage: (text: string) => void;
  onSendImage: (dataUrl: string) => void;
  onFavoriteMessage: (message: Message) => void;
};

/**
 * Painel central: cabeçalho, área de mensagens com scroll interno e barra de input.
 */
export function ChatArea({
  conversation,
  messages,
  favoritedIds,
  rightPanelOpen,
  isReplying,
  onToggleRightPanel,
  onSendMessage,
  onSendImage,
  onFavoriteMessage,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleMessageClick(e: React.MouseEvent, message: Message) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  }

  return (
    <div className="flex flex-1 flex-col bg-[#E2E2E2]">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 bg-[#F1F1F1] px-4 py-3 shadow-sm">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: conversation.avatarColor }}
        >
          {conversation.initials}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{conversation.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {isReplying ? "digitando..." : "Online"}
          </p>
        </div>

        {/* Botão toggle: seta aponta para DIREITA quando fechado (painel virá da direita)
            e para ESQUERDA quando aberto (clique fecha/empurra para a direita) */}
        <button
          type="button"
          onClick={onToggleRightPanel}
          className="flex h-8 w-8 items-center justify-center rounded-md text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(255, 0, 24, 0.5)" }}
          aria-label={rightPanelOpen ? "Fechar painel" : "Abrir painel"}
          aria-pressed={rightPanelOpen}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${rightPanelOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Área de mensagens — scroll interno */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[65%] cursor-pointer flex-col gap-1 ${
                  msg.sender === "me" ? "items-end" : "items-start"
                }`}
                onClick={(e) => handleMessageClick(e, msg)}
              >
                <div
                  className={`relative rounded-2xl text-sm leading-relaxed text-gray-800 transition-opacity hover:opacity-80 ${
                    msg.sender === "me"
                      ? "rounded-tr-sm bg-[#F1F1F1]"
                      : "rounded-tl-sm border border-gray-300 bg-[#E2E2E2]"
                  } ${msg.imageUrl ? "overflow-hidden p-0" : "px-4 py-2.5"}`}
                >
                  {msg.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.imageUrl}
                      alt="Imagem enviada"
                      className="max-h-60 max-w-xs rounded-2xl object-cover"
                    />
                  ) : (
                    msg.text
                  )}
                  {favoritedIds.has(msg.id) && (
                    <Bookmark
                      className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 fill-gray-600 text-gray-600"
                      aria-label="Mensagem favorita"
                    />
                  )}
                </div>
                <p className="px-1 text-xs text-gray-400">
                  {msg.senderName} · {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {isReplying && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-300 bg-[#E2E2E2] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} onSendImage={onSendImage} />

      {/* Menu de contexto ao clicar na mensagem */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onFavorite={() => onFavoriteMessage(contextMenu.message)}
          onCopy={() =>
            navigator.clipboard.writeText(contextMenu.message.text).catch(() => undefined)
          }
          onClose={() => setContextMenu(null)}
          onAmplify={
            contextMenu.message.imageUrl
              ? () => setLightboxSrc(contextMenu.message.imageUrl!)
              : undefined
          }
        />
      )}

      {/* Lightbox — ampliar imagem */}
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
