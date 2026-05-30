"use client";

import { useRef } from "react";
import { ImageIcon, FileDown } from "lucide-react";

type Props = {
  open: boolean;
};

/**
 * Mini-modal que abre ao clicar em "+" na barra de mensagem.
 * Fecha automaticamente via onMouseLeave no container pai.
 * Cada opção dispara um <input type="file"> oculto.
 */
export function PlusModal({ open }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl bg-white p-2 shadow-lg transition-all duration-200 ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      {/* Input oculto para imagens */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) console.log("Imagem selecionada:", file.name);
          e.target.value = "";
        }}
      />

      {/* Input oculto para arquivos genéricos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) console.log("Arquivo selecionado:", file.name);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
      >
        <ImageIcon className="h-4 w-4 text-[#5B0A0A]" />
        <span>Anexar foto</span>
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
      >
        <FileDown className="h-4 w-4 text-[#5B0A0A]" />
        <span>Enviar arquivo</span>
      </button>
    </div>
  );
}
