"use client";

import { Paperclip } from "lucide-react";

const HISTORY_ENTRIES = [
  { id: "1", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: true },
  { id: "2", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: false },
  { id: "3", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: false },
  { id: "4", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: true },
  { id: "5", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: false },
  { id: "6", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: false },
  { id: "7", date: "22/05/2026", status: "Atendimento Finalizado", user: "Stefani Silva", hasAttachment: true },
];

/**
 * Sub-painel: histórico de atendimentos com data, usuário e link para relatório.
 */
export function HistoricoPanel() {
  return (
    <div className="rounded-lg bg-[#f3f4f6]">
      <div className="flex flex-col divide-y divide-gray-200">
        {HISTORY_ENTRIES.map((entry) => (
          <div key={entry.id} className="flex items-start justify-between gap-2 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">{entry.date}</p>
              <p className="text-xs text-gray-600">{entry.status}</p>
              <p className="text-xs text-gray-500">
                {entry.user} —{" "}
                <button
                  type="button"
                  className="text-[#5B0A0A] hover:underline"
                >
                  ver relatório
                </button>
              </p>
            </div>
            {entry.hasAttachment && (
              <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
