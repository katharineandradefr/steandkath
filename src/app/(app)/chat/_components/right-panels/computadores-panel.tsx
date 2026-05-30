"use client";

import { Monitor } from "lucide-react";

const COMPUTERS = [
  { id: "1", label: "Mac 1 | Stefani", active: true },
  { id: "2", label: "Mac 2 | Escritório", active: false },
];

/**
 * Sub-painel: computadores onde o usuário está conectado.
 */
export function ComputadoresPanel() {
  return (
    <div className="flex flex-col gap-2">
      {COMPUTERS.map((comp) => (
        <div
          key={comp.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 ${
            comp.active ? "bg-[#be1525] text-white" : "bg-white/80 text-gray-700"
          }`}
        >
          <Monitor className="h-4 w-4 shrink-0" />
          {comp.label}
        </div>
      ))}
    </div>
  );
}
