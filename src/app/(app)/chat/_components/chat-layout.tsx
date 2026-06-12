"use client";

import { useCallback, useEffect, useState } from "react";

import {
  CHAT_STORAGE_UPDATED_EVENT,
  loadChatState,
  mergeChatConversations,
  mergeMessagesByConversation,
  saveChatState,
} from "~/app/(app)/chat/_utils/chat-storage";
import { useUserPreferences } from "~/app/_components/user-preferences-provider";
import { playMessageSound } from "~/shared/message-sound";
import { showMessageNotification } from "~/shared/message-notifications";
import { api } from "~/trpc/react";
import type {
  ChatHistoryEntry,
  Conversation,
  Message,
  SavedMessage,
  StatusValue,
  SubPanel,
} from "./chat-types";
import { buildConversationPreviewMessage } from "~/app/(app)/chat/_utils/conversation-preview";

import { CONVERSATIONS, INITIAL_MESSAGES } from "./chat-data";
import { DEFAULT_HISTORY_ENTRIES } from "./right-panels/historico-panel";
import { ConversationList } from "./conversation-list";
import { ChatArea } from "./chat-area";
import { OptionsPanel } from "./options-panel";

const DEFAULT_MESSAGES_BY_CONVERSATION: Record<string, Message[]> = {
  "4": INITIAL_MESSAGES,
};

const DEFAULT_HISTORY_BY_CONVERSATION: Record<string, ChatHistoryEntry[]> = {
  "4": DEFAULT_HISTORY_ENTRIES,
};

/** Formata data no padrão brasileiro (dd/mm/aaaa). */
function formatHistoryDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

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
  const [historyByConversation, setHistoryByConversation] = useState<
    Record<string, ChatHistoryEntry[]>
  >(DEFAULT_HISTORY_BY_CONVERSATION);
  const [isReplying, setIsReplying] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0]!;
  const messages = messagesByConversation[activeConversationId] ?? [];

  const replyMutation = api.chat.reply.useMutation();
  const { data: currentUser } = api.user.getFirst.useQuery();
  const { preferences } = useUserPreferences();
  const senderName = currentUser?.name ?? "Usuário";

  function notifyIncomingMessage(senderName: string, text: string) {
    playMessageSound(preferences.messageSound);

    if (preferences.messageNotifications) {
      showMessageNotification(senderName, text);
    }
  }

  const hydrateFromStorage = useCallback(() => {
    const loaded = loadChatState();
    if (!loaded) return;

    setMessagesByConversation(
      mergeMessagesByConversation(
        loaded.messagesByConversation,
        DEFAULT_MESSAGES_BY_CONVERSATION,
      ),
    );
    setSavedMessages(loaded.savedMessages);
    setFavoritedIds(new Set(loaded.favoritedIds));
    setConversations(mergeChatConversations(loaded.conversations));
    if (loaded.historyByConversation) {
      setHistoryByConversation({
        ...DEFAULT_HISTORY_BY_CONVERSATION,
        ...loaded.historyByConversation,
      });
    }
    if (loaded.lastUpdatedConversationId) {
      setActiveConversationId(loaded.lastUpdatedConversationId);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
    setHydrated(true);
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hydrated) return;

    const syncFromStorage = () => hydrateFromStorage();

    window.addEventListener(CHAT_STORAGE_UPDATED_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);

    return () => {
      window.removeEventListener(CHAT_STORAGE_UPDATED_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, [hydrated, hydrateFromStorage]);

  useEffect(() => {
    if (!hydrated) return;

    saveChatState({
      messagesByConversation,
      savedMessages,
      favoritedIds: [...favoritedIds],
      conversations,
      historyByConversation,
    });
  }, [
    hydrated,
    messagesByConversation,
    savedMessages,
    favoritedIds,
    conversations,
    historyByConversation,
  ]);

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
        senderName,
        timestamp: now(),
      },
    ]);

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              conversationStatus: "em-atendimento",
              attendantName: senderName,
              preview: buildConversationPreviewMessage(text),
            }
          : conversation,
      ),
    );

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

      const replyText = result.text;

      setConversationMessages(conversationId, (prev) => [
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
    setConversationMessages(activeConversationId, (prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        text: "",
        imageUrl: dataUrl,
        sender: "me",
        senderName,
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
      preview: message.imageUrl
        ? "📷 Imagem"
        : message.pendencyTitle ?? message.text.slice(0, 60),
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

  function handleConversationStatusChange(status: StatusValue) {
    const conversationId = activeConversationId;
    const active = conversations.find((c) => c.id === conversationId);

    if (status === "finalizado") {
      const attendant = active?.attendantName ?? senderName;
      const images = (messagesByConversation[conversationId] ?? [])
        .map((message) => message.imageUrl)
        .filter((url): url is string => Boolean(url));

      const newEntry: ChatHistoryEntry = {
        id: `${Date.now()}`,
        date: formatHistoryDate(new Date()),
        status: "Atendimento Finalizado",
        user: attendant,
        ...(images.length > 0 ? { images } : {}),
      };

      setHistoryByConversation((prev) => ({
        ...prev,
        [conversationId]: [newEntry, ...(prev[conversationId] ?? [])],
      }));

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                conversationStatus: "sem-atendimento",
                attendantName: undefined,
              }
            : conversation,
        ),
      );
      return;
    }

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              conversationStatus: status,
              attendantName:
                status === "em-atendimento" ? senderName : undefined,
            }
          : conversation,
      ),
    );
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
    <div className="sidebar-content-offset fixed inset-y-0 right-0 flex overflow-hidden bg-[#D9D9D9]">
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
        historyEntries={historyByConversation[activeConversationId] ?? []}
        attendantName={activeConversation.attendantName}
        conversationStatus={activeConversation.conversationStatus}
        onStatusChange={handleConversationStatusChange}
        onSubPanelChange={setActiveSubPanel}
        onSelectConversation={handleSelectConversationFromList}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
