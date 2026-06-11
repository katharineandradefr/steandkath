/** Máximo de caracteres da mensagem armazenada na prévia. */
export const CHAT_PREVIEW_MESSAGE_MAX = 13;

/** Máximo de caracteres da linha exibida na lista (somente a mensagem). */
export const CHAT_PREVIEW_LINE_MAX = 13;

/**
 * Encurta texto para prévia com reticências.
 */
export function truncatePreviewText(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Normaliza o texto da última mensagem antes de salvar na conversa.
 */
export function buildConversationPreviewMessage(text: string): string {
  return truncatePreviewText(text, CHAT_PREVIEW_MESSAGE_MAX);
}

/**
 * Formata a linha de prévia exibida na lista lateral do chat.
 * Com limite curto, exibe só a mensagem — o nome do atendente não entra na prévia.
 */
export function formatConversationPreviewLine(preview: string): string {
  return truncatePreviewText(preview, CHAT_PREVIEW_LINE_MAX);
}
