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
  conversationStatus?: "em-atendimento" | "sem-atendimento" | "finalizado";
};

export type Message = {
  id: string;
  text: string;
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

export type StatusValue =
  | "em-atendimento"
  | "sem-atendimento"
  | "aguardando-dr"
  | "aguardando-design"
  | "finalizado";

export type SubPanel =
  | "computadores"
  | "listas"
  | "mensagens-salvas"
  | "historico"
  | null;
