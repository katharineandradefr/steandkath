"use client";

import type { SavedMessage } from "../chat-layout";

type Props = {
  messages: SavedMessage[];
};

/**
 * Sub-painel: mensagens salvas como favoritas pelo usuário.
 */
export function MensagensSalvasPanel({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <p className="text-center text-xs text-white/70 py-4">
        Nenhuma mensagem favorita ainda.
        <br />
        Clique em uma mensagem e escolha Favoritar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => (
        <button
          key={msg.id}
          type="button"
          className="flex items-center gap-3 rounded-lg bg-[#be1525] px-3 py-3 text-left transition-opacity hover:opacity-90"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: msg.avatarColor }}
          >
            {msg.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">{msg.senderName}</p>
            <p className="truncate text-xs text-white/80">{msg.preview}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
