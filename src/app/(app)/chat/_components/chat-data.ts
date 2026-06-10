import { CHAT_CONTACTS } from "~/shared/chat-contacts";

import type { Conversation, Message } from "./chat-types";

const CONVERSATION_DEFAULTS: Record<
  string,
  Partial<Pick<Conversation, "preview" | "unreadCount" | "online" | "conversationStatus" | "attendantName">>
> = {
  "1": { preview: "Helloo...", unreadCount: 1, online: true, conversationStatus: "em-atendimento", attendantName: "Stefani Silva" },
  "2": { preview: "Helloo...", online: false },
  "3": { preview: "Helloo...", online: true, conversationStatus: "em-atendimento", attendantName: "Stefani Silva" },
  "4": { preview: "esse é um texto teste...", online: true },
  "5": { preview: "Helloo...", unreadCount: 3, online: false, conversationStatus: "em-atendimento", attendantName: "Stefani Silva" },
  "6": { preview: "Helloo...", online: true },
  "7": { preview: "Helloo...", online: false },
};

export const CONVERSATIONS: Conversation[] = CHAT_CONTACTS.map((contact) => {
  const defaults = CONVERSATION_DEFAULTS[contact.id] ?? { preview: "Helloo...", online: false };
  return {
    ...contact,
    preview: defaults.preview ?? "Helloo...",
    online: defaults.online ?? false,
    unreadCount: defaults.unreadCount,
    conversationStatus: defaults.conversationStatus,
    attendantName: defaults.attendantName,
  };
});

const LOREM_LONG =
  "esse é um texto teste para as mensagens, çôõô'p esse é um texto teste para as mensagens, çôõô'pesse é um texto teste para as mensagens, çôõô'pesse é um texto teste para as mensagens, çôõô'p";

const LOREM_SHORT =
  "esse é um texto teste para as mensagens, çôõô'p esse é um texto teste para as mensagens, çôõô'pesse é um texto teste.";

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: LOREM_LONG,
    sender: "me",
    senderName: "Katharine Andrade",
    timestamp: "14:02",
  },
  {
    id: "2",
    text: LOREM_SHORT,
    sender: "other",
    senderName: "Amirah Saleh",
    timestamp: "14:05",
  },
  {
    id: "3",
    text: LOREM_LONG,
    sender: "me",
    senderName: "Katharine Andrade",
    timestamp: "14:07",
  },
  {
    id: "4",
    text: LOREM_SHORT,
    sender: "other",
    senderName: "Amirah Saleh",
    timestamp: "14:10",
  },
  {
    id: "5",
    text: LOREM_LONG,
    sender: "me",
    senderName: "Katharine Andrade",
    timestamp: "14:12",
  },
];
