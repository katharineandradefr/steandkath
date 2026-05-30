export type Conversation = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  preview: string;
  unreadCount?: number;
  online: boolean;
};

export type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  senderName: string;
  timestamp: string;
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
