"use client";

import { useEffect, useState } from "react";

import { loadChatState, saveChatState } from "~/app/(app)/chat/_utils/chat-storage";
import { api } from "~/trpc/react";
import type { Conversation, Message, SavedMessage, SubPanel } from "./chat-types";
import { CONVERSATIONS, INITIAL_MESSAGES } from "./chat-data";
import { ConversationList } from "./conversation-list";
import { ChatArea } from "./chat-area";
import { OptionsPanel } from "./options-panel";

const DEFAULT_MESSAGES_BY_CONVERSATION: Record<string, Message[]> = {
  "4": INITIAL_MESSAGES,
};

/**
 * Orquestrador dos 3 painéis do chat: conversas, área principal e painel de opções.
 * Usa posicionamento fixed para garantir que apenas as mensagens rolem internamente.
 */
export function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState("4");
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, Message[]>
  >(DEFAULT_MESSAGES_BY_CONVERSATION);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeSubPanel, setActiveSubPanel] = useState<SubPanel>(null);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isReplying, setIsReplying] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0]!;
  const messages = messagesByConversation[activeConversationId] ?? [];

  const replyMutation = api.chat.reply.useMutation();

  useEffect(() => {
    const loaded = loadChatState();
    if (loaded) {
      setMessagesByConversation(loaded.messagesByConversation);
      setSavedMessages(loaded.savedMessages);
      setFavoritedIds(new Set(loaded.favoritedIds));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    saveChatState({
      messagesByConversation,
      savedMessages,
      favoritedIds: [...favoritedIds],
    });
  }, [hydrated, messagesByConversation, savedMessages, favoritedIds]);

  function setConversationMessages(
    conversationId: string,
    updater: (prev: Message[]) => Message[],
  ) {
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: updater(prev[conversationId] ?? []),
    }));
  }

  function now() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSendMessage(text: string) {
    const conversationId = activeConversationId;
    const currentMessages = messagesByConversation[conversationId] ?? [];

    setConversationMessages(conversationId, (prev) => [
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
        history: currentMessages.slice(-10).map((m) => ({
          role: m.sender === "me" ? ("user" as const) : ("model" as const),
          text: m.text,
        })),
      });

      setConversationMessages(conversationId, (prev) => [
        ...prev,
        {
          id: `${Date.now() + 1}`,
          text: result.text,
          sender: "other",
          senderName: activeConversation.name,
          timestamp: now(),
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  }

  function handleSendImage(dataUrl: string) {
    setConversationMessages(activeConversationId, (prev) => [
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
    setMessagesByConversation((prev) => ({
      ...prev,
      [newGroup.id]: [],
    }));
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
