import { CONVERSATIONS } from "~/app/(app)/chat/_components/chat-data";
import { buildConversationPreviewMessage } from "~/app/(app)/chat/_utils/conversation-preview";
import type {
  ChatHistoryEntry,
  Conversation,
  Message,
  SavedMessage,
} from "~/app/(app)/chat/_components/chat-types";
import { getChatContactById } from "~/shared/chat-contacts";

const STORAGE_KEY = "steandkath-chat-v1";

export type ChatPersistedState = {
  messagesByConversation: Record<string, Message[]>;
  savedMessages: SavedMessage[];
  favoritedIds: string[];
  conversations?: Conversation[];
  historyByConversation?: Record<string, ChatHistoryEntry[]>;
};

export type SendPendencyChatMessageInput = {
  conversationId: string;
  senderName: string;
  message: string;
  pendencyTitle: string;
  pendencyId?: string;
  attachmentImageUrl?: string;
};

function formatChatTime(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Mescla conversas salvas com os valores padrão do seed.
 */
export function mergeChatConversations(
  stored?: Conversation[],
): Conversation[] {
  if (!stored?.length) return [...CONVERSATIONS];

  const storedById = new Map(stored.map((conversation) => [conversation.id, conversation]));

  return CONVERSATIONS.map((defaults) => {
    const saved = storedById.get(defaults.id);
    return saved ? { ...defaults, ...saved } : defaults;
  });
}

/**
 * Carrega o estado do chat do localStorage; retorna null se ausente ou inválido.
 */
export function loadChatState(): ChatPersistedState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ChatPersistedState;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.messagesByConversation ||
      !Array.isArray(parsed.savedMessages) ||
      !Array.isArray(parsed.favoritedIds)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Salva o estado do chat no localStorage.
 */
export function saveChatState(state: ChatPersistedState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[chat-storage] Não foi possível salvar o chat:", err);
  }
}

/**
 * Envia mensagem de pendência ao chat do responsável direto e marca a conversa como em atendimento.
 */
export function sendPendencyChatMessage(
  input: SendPendencyChatMessageInput,
): { ok: true } | { ok: false; reason: string } {
  const contact = getChatContactById(input.conversationId);
  if (!contact) {
    return { ok: false, reason: "Contato não encontrado." };
  }

  const trimmedMessage = input.message.trim();
  const trimmedTitle = input.pendencyTitle.trim();
  if (!trimmedMessage) {
    return { ok: false, reason: "Digite uma mensagem antes de enviar." };
  }
  if (!input.senderName.trim()) {
    return { ok: false, reason: "Nome do remetente não identificado." };
  }

  const loaded = loadChatState();
  const messagesByConversation = {
    ...(loaded?.messagesByConversation ?? {}),
  };
  const conversations = mergeChatConversations(loaded?.conversations);

  const existingMessages = messagesByConversation[input.conversationId] ?? [];
  messagesByConversation[input.conversationId] = [
    ...existingMessages,
    {
      id: `${Date.now()}`,
      text: trimmedMessage,
      pendencyTitle: trimmedTitle || undefined,
      pendencyId: input.pendencyId,
      imageUrl: input.attachmentImageUrl,
      sender: "me",
      senderName: input.senderName.trim(),
      timestamp: formatChatTime(),
    },
  ];

  const preview = trimmedTitle
    ? buildConversationPreviewMessage(trimmedTitle)
    : buildConversationPreviewMessage(trimmedMessage);
  const updatedConversations = conversations.map((conversation) =>
    conversation.id === input.conversationId
      ? {
          ...conversation,
          conversationStatus: "em-atendimento" as const,
          attendantName: input.senderName.trim(),
          preview,
        }
      : conversation,
  );

  saveChatState({
    messagesByConversation,
    savedMessages: loaded?.savedMessages ?? [],
    favoritedIds: loaded?.favoritedIds ?? [],
    conversations: updatedConversations,
  });

  return { ok: true };
}
