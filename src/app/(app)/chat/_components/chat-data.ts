import type { Conversation, Message } from "./chat-types";

export const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Amirah Saleh",
    initials: "AS",
    avatarColor: "#d97706",
    preview: "Helloo...",
    unreadCount: 1,
    online: true,
    conversationStatus: "em-atendimento",
  },
  {
    id: "2",
    name: "Felipe Daiko",
    initials: "FD",
    avatarColor: "#7c3aed",
    preview: "Helloo...",
    online: false,
  },
  {
    id: "3",
    name: "Henrique Lunarderlli",
    initials: "HL",
    avatarColor: "#0891b2",
    preview: "Helloo...",
    online: true,
    conversationStatus: "em-atendimento",
  },
  {
    id: "4",
    name: "Darizon Filho",
    initials: "DF",
    avatarColor: "#16a34a",
    preview: "esse é um texto teste...",
    online: true,
  },
  {
    id: "5",
    name: "Stefani Silva",
    initials: "SS",
    avatarColor: "#dc2626",
    preview: "Helloo...",
    unreadCount: 3,
    online: false,
    conversationStatus: "em-atendimento",
  },
  {
    id: "6",
    name: "Katharine Andrade",
    initials: "KA",
    avatarColor: "#be185d",
    preview: "Helloo...",
    online: true,
  },
  {
    id: "7",
    name: "Lucas Ferreira",
    initials: "LF",
    avatarColor: "#0369a1",
    preview: "Helloo...",
    online: false,
  },
];

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
