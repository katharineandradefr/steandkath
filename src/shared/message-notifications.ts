/**
 * Solicita permissão do navegador para notificações de mensagens.
 */
export async function requestMessageNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Exibe notificação de nova mensagem no navegador.
 */
export function showMessageNotification(senderName: string, preview: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  new Notification(`Nova mensagem de ${senderName}`, {
    body: preview.slice(0, 120),
    icon: "/header-logo.svg",
  });
}
