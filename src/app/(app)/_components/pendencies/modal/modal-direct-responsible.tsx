"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

import { sendPendencyChatMessage } from "~/app/(app)/chat/_utils/chat-storage";
import { CHAT_CONTACTS } from "~/shared/chat-contacts";
import {
  getAttachmentPreviewUrl,
  type PendencyAttachmentDraft,
} from "~/shared/pendency";
import { api } from "~/trpc/react";

type Props = {
  directResponsibleId: string | null;
  pendencyTitle: string;
  /** Id da pendência salva (necessário para vincular a mensagem no chat). */
  pendencyId?: string;
  attachments: PendencyAttachmentDraft[];
  onDirectResponsibleChange: (id: string | null) => void;
};

/** Retorna a URL da primeira imagem anexada à pendência, se houver. */
function getFirstAttachmentImageUrl(
  attachments: PendencyAttachmentDraft[],
): string | undefined {
  const image = attachments.find((attachment) =>
    attachment.mimeType.startsWith("image/"),
  );
  return image ? getAttachmentPreviewUrl(image) : undefined;
}

/**
 * Seleção opcional do responsável direto e envio de mensagem ao chat.
 */
export function ModalDirectResponsible({
  directResponsibleId,
  pendencyTitle,
  pendencyId,
  attachments,
  onDirectResponsibleChange,
}: Props) {
  const attachmentPreviewUrl = getFirstAttachmentImageUrl(attachments);
  const [showMessageField, setShowMessageField] = useState(false);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const { data: currentUser } = api.user.getFirst.useQuery();

  const selectedContact = CHAT_CONTACTS.find(
    (contact) => contact.id === directResponsibleId,
  );

  async function handleSendMessage() {
    if (!directResponsibleId) {
      setError("Selecione um responsável direto antes de enviar a mensagem.");
      return;
    }

    setSending(true);
    setFeedback(null);
    setError(null);

    const result = sendPendencyChatMessage({
      conversationId: directResponsibleId,
      senderName: currentUser?.name ?? "Usuário",
      message,
      pendencyTitle,
      pendencyId,
      attachmentImageUrl: attachmentPreviewUrl,
    });

    setSending(false);

    if (!result.ok) {
      setError(result.reason);
      return;
    }

    setMessage("");
    setShowMessageField(false);
    setFeedback(
      `Mensagem enviada para ${selectedContact?.name ?? "o contato"}. A conversa foi movida para Em Atendimento.`,
    );
  }

  return (
    <section className="border-t border-sidebar-border py-4">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-white/50" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Responsável direto</h3>
        <span className="text-xs text-white/40">(opcional)</span>
      </div>

      <label className="mb-1.5 block text-xs font-medium text-white/50">
        Selecionar usuário
      </label>
      <select
        value={directResponsibleId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          onDirectResponsibleChange(value.length > 0 ? value : null);
          setShowMessageField(false);
          setMessage("");
          setFeedback(null);
          setError(null);
        }}
        className="pendency-direct-select w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <option value="" className="pendency-direct-select-option">
          Nenhum selecionado
        </option>
        {CHAT_CONTACTS.map((contact) => (
          <option
            key={contact.id}
            value={contact.id}
            className="pendency-direct-select-option"
          >
            {contact.name}
          </option>
        ))}
      </select>

      {directResponsibleId && (
        <div className="mt-3 flex flex-col gap-3">
          {!showMessageField ? (
            <button
              type="button"
              onClick={() => {
                setShowMessageField(true);
                setFeedback(null);
                setError(null);
              }}
              className="self-start rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Enviar mensagem ao responsável
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="pendency-direct-message"
                className="text-xs font-medium text-white/50"
              >
                Mensagem para {selectedContact?.name}
              </label>
              {attachmentPreviewUrl && (
                <p className="text-xs text-white/50">
                  A primeira imagem anexada será enviada junto com a mensagem.
                </p>
              )}
              <textarea
                id="pendency-direct-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                placeholder="Escreva a mensagem que aparecerá no chat..."
                className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageField(false);
                    setMessage("");
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-white/65 transition hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {feedback && (
        <p role="status" className="mt-3 text-sm text-emerald-400">
          {feedback}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
