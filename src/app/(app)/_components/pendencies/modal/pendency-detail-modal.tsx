"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  createEmptyPendencyDraft,
  type Pendency,
} from "~/shared/pendency";

import { ModalAttachments } from "./modal-attachments";
import { ModalChecklist } from "./modal-checklist";
import { ModalDescription } from "./modal-description";
import { ModalLinks } from "./modal-links";
import { ModalTagsRow } from "./modal-tags-row";
import { ModalTitleField } from "./modal-title-field";

export type PendencyDetailModalMode = "create" | "edit";

type PendencyDetailModalProps = {
  open: boolean;
  mode: PendencyDetailModalMode;
  initialValues: Pendency | null;
  onClose: () => void;
  onSave: (pendency: Pendency) => void;
};

/**
 * Modal estilo Trello para criar ou editar uma pendência (estado local).
 */
export function PendencyDetailModal({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
}: PendencyDetailModalProps) {
  const [draft, setDraft] = useState<Pendency>(() =>
    createEmptyPendencyDraft(),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValues) {
      setDraft({ ...initialValues });
    } else {
      setDraft(createEmptyPendencyDraft());
    }
  }, [open, mode, initialValues]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const patch = useCallback((partial: Partial<Pendency>) => {
    setDraft((d) => ({
      ...d,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleSave = () => {
    const title = draft.title.trim();
    if (!title) {
      window.alert("Informe um título para a pendência.");
      return;
    }
    const excerpt = draft.descriptionMarkdown.trim().split("\n")[0]?.trim() ?? "";
    onSave({
      ...draft,
      title,
      description: excerpt.length > 0 ? excerpt : null,
      descriptionMarkdown: draft.descriptionMarkdown,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pendency-modal-title"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/60"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="relative z-10 my-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-sidebar-border bg-shell-mid shadow-2xl">
        <header className="shrink-0 border-b border-sidebar-border px-5 pt-5 pb-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <ModalTagsRow
              projectKey={draft.projectKey}
              urgency={draft.urgency}
              onProjectChange={(projectKey) => patch({ projectKey })}
              onUrgencyChange={(urgency) => patch({ urgency })}
            />
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <span className="text-xl leading-none" aria-hidden>
                ×
              </span>
            </button>
          </div>
          <ModalTitleField
            value={draft.title}
            onChange={(title) => patch({ title })}
          />
          <p id="pendency-modal-title" className="sr-only">
            {mode === "create" ? "Criar pendência" : "Editar pendência"}
          </p>
        </header>

        <div className="flex-1 space-y-0 overflow-y-auto px-5">
          <ModalDescription
            value={draft.descriptionMarkdown}
            onChange={(descriptionMarkdown) => patch({ descriptionMarkdown })}
          />
          <ModalAttachments
            attachments={draft.attachments}
            onChange={(attachments) => patch({ attachments })}
          />
          <ModalLinks
            links={draft.links}
            onChange={(links) => patch({ links })}
          />
          <ModalChecklist
            items={draft.checklist}
            onChange={(checklist) => patch({ checklist })}
          />
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-sidebar-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-white/65 transition hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-bright"
          >
            {mode === "create" ? "Criar" : "Salvar"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
