"use client";

import { Minus, Pencil, Plus } from "lucide-react";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  entry: FaqEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onEditClick: () => void;
};

/**
 * Item individual de FAQ no formato acordeão.
 * Exibe ícone de lápis para edição quando expandido.
 */
export function FaqItem({ entry, isExpanded, onToggle, onEditClick }: Props) {
  return (
    <div
      className={`relative rounded-xl bg-white shadow-sm transition-shadow ${
        isExpanded ? "shadow-md" : ""
      }`}
    >
      {/* Borda esquerda vermelha */}
      <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl bg-[#be1525]" />

      <div className="flex items-start gap-4 pl-5 pr-4 py-4">
        <p
          className={`flex-1 text-sm font-medium text-gray-800 ${
            isExpanded ? "pt-0.5" : ""
          }`}
        >
          {entry.question}
        </p>

        {/* Botão toggle (+/-) */}
        <button
          type="button"
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#be1525] text-white transition-opacity hover:opacity-80"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
        >
          {isExpanded ? (
            <Minus className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Conteúdo expandido */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="relative pl-5 pr-4 pb-4">
          <p className="text-sm leading-relaxed text-gray-600">{entry.answer}</p>

          {/* Ícone de lápis — editar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="absolute right-4 bottom-4 text-gray-400 transition-colors hover:text-[#5B0A0A]"
            aria-label="Editar pergunta"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
