import type { Message, SavedMessage } from "~/app/(app)/chat/_components/chat-types";

const STORAGE_KEY = "steandkath-chat-v1";

export type ChatPersistedState = {
  messagesByConversation: Record<string, Message[]>;
  savedMessages: SavedMessage[];
  favoritedIds: string[];
};

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
