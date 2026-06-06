"use client";

import { FileText } from "lucide-react";

export type ChatSession = {
  id: string;
  /** Primeira pergunta feita na sessão — vira o título */
  firstQuestion: string;
  startedAt: string;
};

type Props = {
  open: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
};

const SLOT_COUNT = 6;

/**
 * Painel lateral direito com histórico de conversas do Dr. Cof.
 * Mostra até SLOT_COUNT slots — os com conteúdo em salmão, os vazios em cinza.
 */
export function HistoryPanel({
  open,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: Props) {
  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden bg-[#f0f0f0] transition-all duration-300 ease-in-out ${
        open ? "w-72" : "w-0"
      }`}
    >
      <div className="flex w-72 flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Histórico</h2>
          <button
            type="button"
            onClick={onNewSession}
            className="rounded-lg bg-[#5B0A0A] px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            + Nova
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: SLOT_COUNT }).map((_, i) => {
            const session = sessions[i];

            if (session) {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-[#be1525] text-white"
                      : "bg-[#e8a0a0] text-gray-800 hover:bg-[#d98080]"
                  }`}
                >
                  <span className="flex-1 truncate text-sm leading-snug">
                    {session.firstQuestion}
                  </span>
                  <FileText className="h-4 w-4 shrink-0 opacity-70" />
                </button>
              );
            }

            return (
              <div
                key={`empty-${i}`}
                className="flex w-full items-center justify-end rounded-xl bg-gray-300 px-4 py-3"
              >
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
