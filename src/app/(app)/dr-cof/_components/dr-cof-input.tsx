"use client";

import { useRef, useState } from "react";
import { ImageIcon, FileDown, BookOpen, Plus, Send } from "lucide-react";

type Props = {
  onSend: (text: string) => void;
  onTeach: () => void;
  canTeach?: boolean;
};

/**
 * Barra de input do Dr. Cof.
 * Botão "+" abre mini-modal com: Ensinar Dr. Cof, Anexar foto, Enviar arquivo.
 */
export function DrCofInput({ onSend, onTeach, canTeach = false }: Props) {
  const [text, setText] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    <div className="relative shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      {/* Mini-modal do botão + */}
      <div
        className="absolute bottom-full left-4 mb-2"
        onMouseLeave={() => setPlusOpen(false)}
      >
        <div
          className={`flex flex-col gap-1 rounded-xl bg-white p-2 shadow-lg transition-all duration-200 ${
            plusOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          <input ref={imageRef} type="file" accept="image/*" className="hidden" />
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt" className="hidden" />

          {canTeach ? (
            <button
              type="button"
              onClick={() => {
                onTeach();
                setPlusOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <BookOpen className="h-4 w-4 text-[#5B0A0A]" />
              <span>Ensinar Dr. Cof</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <ImageIcon className="h-4 w-4 text-[#5B0A0A]" />
            <span>Anexar foto</span>
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <FileDown className="h-4 w-4 text-[#5B0A0A]" />
            <span>Enviar arquivo</span>
          </button>
        </div>
      </div>

      {/* Barra de input */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onMouseEnter={() => setPlusOpen(true)}
          onClick={() => setPlusOpen((p) => !p)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Mais opções"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-gray-200" />

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
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#5B0A0A] transition-colors hover:bg-red-50 disabled:opacity-30"
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
