"use client";

import { useState } from "react";

import { useUserPreferences } from "~/app/_components/user-preferences-provider";
import { playMessageSound } from "~/shared/message-sound";
import { showMessageNotification } from "~/shared/message-notifications";
import { api } from "~/trpc/react";
import type { Conversation, Message, SubPanel } from "./chat-types";
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
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState("4");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeSubPanel, setActiveSubPanel] = useState<SubPanel>(null);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isReplying, setIsReplying] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0]!;

  const replyMutation = api.chat.reply.useMutation();
  const { preferences } = useUserPreferences();

  function notifyIncomingMessage(senderName: string, text: string) {
    playMessageSound(preferences.messageSound);

    if (preferences.messageNotifications) {
      showMessageNotification(senderName, text);
    }
  }

  function now() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSendMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        text,
        sender: "me",
        senderName: "Katharine Andrade",
        timestamp: now(),
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

      const replyText = result.text;

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 1}`,
          text: replyText,
          sender: "other",
          senderName: activeConversation.name,
          timestamp: now(),
        },
      ]);

      notifyIncomingMessage(activeConversation.name, replyText);
    } finally {
      setIsReplying(false);
    }
  }

  function handleSendImage(dataUrl: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        text: "",
        imageUrl: dataUrl,
        sender: "me",
        senderName: "Katharine Andrade",
        timestamp: now(),
      },
    ]);
  }

  function handleFavoriteMessage(message: Message) {
    const conv = conversations.find((c) => c.id === activeConversationId);
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
      preview: message.imageUrl ? "📷 Imagem" : message.text.slice(0, 60),
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

  function handleCreateGroup(name: string, memberIds: string[]) {
    const initials = name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    const COLORS = ["#7c3aed", "#0891b2", "#16a34a", "#d97706", "#be185d"];
    const avatarColor = COLORS[memberIds.length % COLORS.length] ?? "#7c3aed";

    const memberNames = memberIds
      .map((id) => conversations.find((c) => c.id === id)?.name.split(" ")[0] ?? "")
      .filter(Boolean)
      .join(", ");

    const newGroup: Conversation = {
      id: `group-${Date.now()}`,
      name,
      initials,
      avatarColor,
      preview: `${memberIds.length} participantes — ${memberNames}`,
      online: false,
      isGroup: true,
    };

    setConversations((prev) => [newGroup, ...prev]);
    setActiveConversationId(newGroup.id);
    setMessages([]);
  }

  return (
    /* Posicionamento fixed para ocupar toda a altura disponível sem fazer a página rolar */
    <div className="fixed inset-y-0 right-0 left-0 flex overflow-hidden bg-[#D9D9D9] pl-(--sidebar-width)">
      <ConversationList
        conversations={conversations}
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
        onSendImage={handleSendImage}
        onFavoriteMessage={handleFavoriteMessage}
      />
      <OptionsPanel
        open={rightPanelOpen}
        activeSubPanel={activeSubPanel}
        savedMessages={savedMessages}
        onSubPanelChange={setActiveSubPanel}
        onSelectConversation={handleSelectConversationFromList}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
