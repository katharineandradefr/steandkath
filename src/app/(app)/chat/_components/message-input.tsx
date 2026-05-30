"use client";

import { useRef, useState } from "react";
import { Plus, Send } from "lucide-react";

import { PlusModal } from "./plus-modal";

type Props = {
  onSend: (text: string) => void;
};

/**
 * Barra de entrada de mensagem com botão "+" (PlusModal) e envio por Enter ou botão.
 */
export function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const plusContainerRef = useRef<HTMLDivElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="relative p-3">
      {/* Plus modal — fecha no mouseLeave do container */}
      <div
        ref={plusContainerRef}
        className="absolute bottom-full left-6 mb-1"
        onMouseLeave={() => setPlusOpen(false)}
      >
        <PlusModal open={plusOpen} />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
        <button
          type="button"
          onMouseEnter={() => setPlusOpen(true)}
          onClick={() => setPlusOpen((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Anexar"
        >
          <Plus className="h-4 w-4" />
        </button>

        <input
          type="text"
          placeholder="Mensagem"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#5B0A0A] transition-colors hover:bg-red-50 disabled:opacity-30"
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
