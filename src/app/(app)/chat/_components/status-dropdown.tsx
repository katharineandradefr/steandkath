"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { StatusValue } from "./chat-types";

type StatusOption = {
  value: StatusValue;
  label: string;
  bg: string;
  text: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "em-atendimento", label: "Em Atendimento", bg: "#16a34a", text: "#fff" },
  { value: "sem-atendimento", label: "S/ Atendimento", bg: "#e5e7eb", text: "#374151" },
  { value: "aguardando-dr", label: "Aguardando Dr.", bg: "#be1525", text: "#fff" },
  { value: "aguardando-design", label: "Aguardando Design", bg: "#5B0A0A", text: "#fff" },
  { value: "finalizado", label: "Finalizado", bg: "#15803d", text: "#fff" },
];

type Props = {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
};

/**
 * Dropdown de status de atendimento com cores distintas por opção e animação suave.
 */
export function StatusDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const current =
    STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0]!;
  const others = STATUS_OPTIONS.filter((o) => o.value !== value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: current.bg, color: current.text }}
      >
        {current.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Lista de opções */}
      <div
        className={`absolute top-full left-0 right-0 z-20 mt-1 flex flex-col overflow-hidden rounded-lg shadow-xl transition-all duration-200 ${
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {others.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: opt.bg, color: opt.text }}
          >
            {opt.label}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}
