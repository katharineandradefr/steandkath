export type StatusValue =
  | "em-atendimento"
  | "sem-atendimento"
  | "aguardando-dr"
  | "aguardando-design"
  | "finalizado";

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  preview: string;
  unreadCount?: number;
  online: boolean;
  isGroup?: boolean;
  /** Status do atendimento desta conversa */
  conversationStatus?: StatusValue;
  /** Nome de quem está atendendo a conversa (somente em "em-atendimento") */
  attendantName?: string;
};

export type Message = {
  id: string;
  text: string;
  /** Título da pendência vinculada (mensagens encaminhadas do kanban) */
  pendencyTitle?: string;
  /** Id da pendência vinculada (para abrir detalhes a partir do chat) */
  pendencyId?: string;
  /** Data URL de imagem enviada como anexo */
  imageUrl?: string;
  sender: "me" | "other";
  senderName: string;
  timestamp: string;
};

/** Mensagem salva como favorita */
export type SavedMessage = {
  id: string;
  senderName: string;
  avatarColor: string;
  initials: string;
  preview: string;
};

export type SubPanel =
  | "computadores"
  | "listas"
  | "mensagens-salvas"
  | "historico"
  | null;

/** Registro de atendimento finalizado no histórico do chat */
export type ChatHistoryEntry = {
  id: string;
  date: string;
  status: string;
  user: string;
  images?: string[];
};
