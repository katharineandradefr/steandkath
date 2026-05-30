"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import type { Message, SubPanel } from "./chat-types";
import { CONVERSATIONS, INITIAL_MESSAGES } from "./chat-data";
import { ConversationList } from "./conversation-list";
import { ChatArea } from "./chat-area";
import { OptionsPanel } from "./options-panel";

/** Mensagem salva como favorita */
export type SavedMessage = {
  id: string;
  senderName: string;
  avatarColor: string;
  initials: string;
  preview: string;
};

/**
 * Orquestrador dos 3 painéis do chat: conversas, área principal e painel de opções.
 * Usa posicionamento fixed para garantir que apenas as mensagens rolem internamente.
 */
export function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState("4");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeSubPanel, setActiveSubPanel] = useState<SubPanel>(null);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isReplying, setIsReplying] = useState(false);

  const activeConversation =
    CONVERSATIONS.find((c) => c.id === activeConversationId) ?? CONVERSATIONS[0]!;

  const replyMutation = api.chat.reply.useMutation();

  async function handleSendMessage(text: string) {
    const now = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        text,
        sender: "me",
        senderName: "Katharine Andrade",
        timestamp: now,
      },
    ]);

    setIsReplying(true);
    try {
      const result = await replyMutation.mutateAsync({
        message: text,
        senderName: activeConversation.name,
        history: messages.slice(-10).map((m) => ({
          role: m.sender === "me" ? ("user" as const) : ("model" as const),
          text: m.text,
        })),
      });

      const replyTime = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 1}`,
          text: result.text,
          sender: "other",
          senderName: activeConversation.name,
          timestamp: replyTime,
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  }

  function handleFavoriteMessage(message: Message) {
    const conv = CONVERSATIONS.find((c) => c.id === activeConversationId);
    const entry: SavedMessage = {
      id: message.id,
      senderName: message.senderName,
      avatarColor: conv?.avatarColor ?? "#888",
      initials:
        message.senderName
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("") ?? "?",
      preview: message.text.slice(0, 60),
    };
    setSavedMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [entry, ...prev];
    });
    setFavoritedIds((prev) => new Set([...prev, message.id]));
  }

  function handleToggleRightPanel() {
    setRightPanelOpen((prev) => {
      if (prev) setActiveSubPanel(null);
      return !prev;
    });
  }

  function handleSelectConversationFromList(id: string) {
    setActiveConversationId(id);
    setActiveSubPanel(null);
    setRightPanelOpen(false);
  }

  return (
    /* Posicionamento fixed para ocupar toda a altura disponível sem fazer a página rolar */
    <div
      className="fixed bottom-0 top-0 flex overflow-hidden"
      style={{ left: "var(--sidebar-width)", right: 0 }}
    >
      <ConversationList
        conversations={CONVERSATIONS}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
      />
      <ChatArea
        conversation={activeConversation}
        messages={messages}
        favoritedIds={favoritedIds}
        rightPanelOpen={rightPanelOpen}
        isReplying={isReplying}
        onToggleRightPanel={handleToggleRightPanel}
        onSendMessage={handleSendMessage}
        onFavoriteMessage={handleFavoriteMessage}
      />
      <OptionsPanel
        open={rightPanelOpen}
        activeSubPanel={activeSubPanel}
        savedMessages={savedMessages}
        onSubPanelChange={setActiveSubPanel}
        onSelectConversation={handleSelectConversationFromList}
      />
    </div>
  );
}
