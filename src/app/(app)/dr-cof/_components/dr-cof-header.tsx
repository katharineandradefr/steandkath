"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

type Props = {
  historyOpen: boolean;
  onToggleHistory: () => void;
};

/**
 * Header da página Dr. Cof: logo + nome à esquerda, botão de histórico à direita.
 */
export function DrCofHeader({ historyOpen, onToggleHistory }: Props) {
  return (
    <div className="flex shrink-0 items-center justify-between bg-white px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Image
          src="/dr-cof-sidebar.svg"
          alt="Dr. Cof"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="text-base font-semibold text-gray-800">DR. Cof</span>
      </div>

      <button
        type="button"
        onClick={onToggleHistory}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#be1525] text-white transition-colors hover:bg-[#9f0f1e]"
        aria-label={historyOpen ? "Fechar histórico" : "Abrir histórico"}
        aria-pressed={historyOpen}
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-300 ${historyOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
