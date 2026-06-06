"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import type { DrCofMessage } from "./dr-cof-messages";
import type { ChatSession } from "./history-panel";
import { DrCofHeader } from "./dr-cof-header";
import { DrCofMessages } from "./dr-cof-messages";
import { DrCofInput } from "./dr-cof-input";
import { HistoryPanel } from "./history-panel";
import { TeachModal } from "./teach-modal";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Orquestrador da página Dr. Cof.
 * Gerencia sessões de conversa, histórico lateral e modal de ensino.
 */
export function DrCofLayout() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [teachOpen, setTeachOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => makeId());
  const [messagesBySession, setMessagesBySession] = useState<Record<string, DrCofMessage[]>>({});
  const [isReplying, setIsReplying] = useState(false);

  const askMutation = api.drCof.ask.useMutation();

  const activeMessages: DrCofMessage[] = messagesBySession[activeSessionId] ?? [];

  function addMessage(msg: DrCofMessage) {
    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] ?? []), msg],
    }));
  }

  function handleNewSession() {
    const newId = makeId();
    setActiveSessionId(newId);
    setMessagesBySession((prev) => ({ ...prev, [newId]: [] }));
  }

  function handleSelectSession(id: string) {
    setActiveSessionId(id);
  }

  async function handleSend(text: string) {
    const userMsg: DrCofMessage = {
      id: makeId(),
      text,
      role: "user",
      timestamp: nowTime(),
    };

    /* Se é a primeira mensagem desta sessão, cria a entrada no histórico */
    if (!messagesBySession[activeSessionId]?.length) {
      const session: ChatSession = {
        id: activeSessionId,
        firstQuestion: text.slice(0, 60),
        startedAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev.filter((s) => s.id !== activeSessionId)]);
    }

    addMessage(userMsg);
    setIsReplying(true);

    try {
      const history = activeMessages.slice(-10).map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }));

      const result = await askMutation.mutateAsync({ message: text, history });

      addMessage({
        id: makeId(),
        text: result.text,
        role: "assistant",
        timestamp: nowTime(),
      });
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <div
      className="fixed bottom-0 top-0 flex flex-col overflow-hidden bg-[#E2E2E2]"
      style={{ left: "var(--sidebar-width)", right: 0 }}
    >
      {/* Header */}
      <DrCofHeader
        historyOpen={historyOpen}
        onToggleHistory={() => setHistoryOpen((p) => !p)}
      />

      {/* Área central + painel lateral */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DrCofMessages messages={activeMessages} isReplying={isReplying} />
          <DrCofInput onSend={handleSend} onTeach={() => setTeachOpen(true)} />
        </div>

        {/* Painel histórico */}
        <HistoryPanel
          open={historyOpen}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />
      </div>

      {/* Modal Ensinar */}
      {teachOpen && <TeachModal onClose={() => setTeachOpen(false)} />}
    </div>
  );
}
