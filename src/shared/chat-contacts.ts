/**
 * Contatos do chat (conversas diretas 1:1).
 * Compartilhado entre o módulo de chat e o modal de pendências.
 */
export type ChatContact = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
};

export const CHAT_CONTACTS: readonly ChatContact[] = [
  { id: "1", name: "Amirah Saleh", initials: "AS", avatarColor: "#d97706" },
  { id: "2", name: "Felipe Daiko", initials: "FD", avatarColor: "#7c3aed" },
  { id: "3", name: "Henrique Lunarderlli", initials: "HL", avatarColor: "#0891b2" },
  { id: "4", name: "Darizon Filho", initials: "DF", avatarColor: "#16a34a" },
  { id: "5", name: "Stefani Silva", initials: "SS", avatarColor: "#dc2626" },
  { id: "6", name: "Katharine Andrade", initials: "KA", avatarColor: "#be185d" },
  { id: "7", name: "Lucas Ferreira", initials: "LF", avatarColor: "#0369a1" },
] as const;

/** Busca contato pelo id da conversa. */
export function getChatContactById(id: string): ChatContact | undefined {
  return CHAT_CONTACTS.find((contact) => contact.id === id);
}
