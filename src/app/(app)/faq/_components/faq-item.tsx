"use client";

import { ChevronDown, Pencil } from "lucide-react";

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
 * Toggle via chevron rotativo. Borda esquerda grossa vinho.
 * Exibe ícone de lápis quando expandido.
 */
export function FaqItem({ entry, isExpanded, onToggle, onEditClick }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-xl border-l-4 border-[#5B0A0A] bg-white transition-shadow ${
        isExpanded ? "shadow-md" : "shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
        aria-expanded={isExpanded}
      >
        <p className="flex-1 text-sm font-medium text-gray-800">
          {entry.question}
        </p>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#5B0A0A] transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Conteúdo expandido com animação */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="relative px-5 pb-5">
          <p className="text-sm leading-relaxed text-gray-600">{entry.answer}</p>

          {/* Ícone de lápis — editar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="absolute right-4 bottom-2 text-gray-400 transition-colors hover:text-[#5B0A0A]"
            aria-label="Editar pergunta"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
