"use client";

type ModalTitleFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Campo de título principal do card (estilo Trello).
 */
export function ModalTitleField({ value, onChange }: ModalTitleFieldProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Nome da tarefa"
      className="w-full border-0 bg-transparent text-xl font-semibold text-white placeholder:text-white/35 focus:outline-none focus:ring-0 sm:text-2xl"
    />
  );
}
