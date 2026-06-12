"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  createEmptyPendencyDraft,
  DEFAULT_AREA_KEY,
  isPendencyAreaKey,
  projectRequiresArea,
  stripHtmlToPlainText,
  type Pendency,
  type PendencyFormValues,
} from "~/shared/pendency";

import { DescriptionRichEditor } from "~/app/(app)/calendario/_components/description-rich-editor";
import { ModalAttachments } from "./modal-attachments";
import { ModalChecklist } from "./modal-checklist";
import { ModalDirectResponsible } from "./modal-direct-responsible";
import { ModalLinks } from "./modal-links";
import { ModalSolver } from "./modal-solver";
import { ModalTagsRow } from "./modal-tags-row";
import { ModalTitleField } from "./modal-title-field";

export type PendencyDetailModalMode = "create" | "edit";

type PendencyDetailModalProps = {
  open: boolean;
  mode: PendencyDetailModalMode;
  initialValues: Pendency | null;
  readOnly?: boolean;
  onClose: () => void;
  onSave: (values: PendencyFormValues) => void;
  isSaving?: boolean;
};

/**
 * Modal estilo Trello para criar ou editar uma pendência.
 */
export function PendencyDetailModal({
  open,
  mode,
  initialValues,
  readOnly = false,
  onClose,
  onSave,
  isSaving = false,
}: PendencyDetailModalProps) {
  const [draft, setDraft] = useState<PendencyFormValues>(() =>
    createEmptyPendencyDraft(),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValues) {
      setDraft({
        ...initialValues,
        attachments: [...initialValues.attachments],
        checklist: [...initialValues.checklist],
      });
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

  const patch = useCallback((partial: Partial<PendencyFormValues>) => {
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
    if (
      projectRequiresArea(draft.projectKey) &&
      !isPendencyAreaKey(draft.areaKey)
    ) {
      window.alert("Escolha uma Grande área para este projeto.");
      return;
    }
    const plain = stripHtmlToPlainText(draft.descriptionMarkdown);
    const excerpt = plain.split("\n")[0]?.trim() ?? "";
    onSave({
      ...draft,
      title,
      description: excerpt.length > 0 ? excerpt : null,
      descriptionMarkdown: draft.descriptionMarkdown,
      updatedAt: new Date().toISOString(),
    });
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
        className="pendency-modal-backdrop fixed inset-0 bg-black/60"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="pendency-modal-card relative z-10 my-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-sidebar-border bg-shell-mid shadow-2xl">
        <header className="shrink-0 border-b border-sidebar-border px-5 pt-5 pb-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <ModalTagsRow
              areaKey={draft.areaKey}
              projectKey={draft.projectKey}
              urgency={draft.urgency}
              onAreaChange={(areaKey) =>
                patch({ areaKey: areaKey ?? DEFAULT_AREA_KEY })
              }
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
          <ModalDirectResponsible
            directResponsibleId={draft.directResponsibleId ?? null}
            pendencyTitle={draft.title}
            pendencyId={mode === "edit" ? draft.id : undefined}
            attachments={draft.attachments}
            onDirectResponsibleChange={(directResponsibleId) =>
              patch({ directResponsibleId })
            }
          />

          <section className="border-t border-sidebar-border pt-5">
            <div className="mb-3 flex items-center gap-2">
              <LinesIcon />
              <h3 className="text-sm font-semibold text-white">Descrição</h3>
            </div>
            <DescriptionRichEditor
              key={`${draft.id}-description`}
              initialValue={draft.descriptionMarkdown}
              theme="dark"
              placeholder="Detalhe a tarefa…"
              onChange={(descriptionMarkdown) => patch({ descriptionMarkdown })}
            />
          </section>

          <section className="border-t border-sidebar-border pt-5">
            <div className="mb-3 flex items-center gap-2">
              <LinesIcon />
              <h3 className="text-sm font-semibold text-white">Solução</h3>
            </div>
            {readOnly ? (
              <p className="min-h-[4rem] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 whitespace-pre-wrap">
                {stripHtmlToPlainText(draft.solutionMarkdown) ||
                  "Nenhuma solução registrada."}
              </p>
            ) : (
              <DescriptionRichEditor
                key={`${draft.id}-solution`}
                initialValue={draft.solutionMarkdown}
                theme="dark"
                placeholder="Descreva como a pendência foi ou será resolvida…"
                onChange={(solutionMarkdown) => patch({ solutionMarkdown })}
              />
            )}
          </section>

          <ModalSolver
            solverId={draft.solverId ?? null}
            readOnly={readOnly}
            onSolverChange={(solverId) => patch({ solverId })}
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

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-sidebar-border px-5 py-4">
          {readOnly ? (
            <p className="mr-auto text-sm text-white/55" role="status">
              Somente leitura
            </p>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-4 py-2 text-sm text-white/65 transition hover:text-white disabled:opacity-50"
          >
            {readOnly ? "Fechar" : "Cancelar"}
          </button>
          {!readOnly ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-bright disabled:opacity-50"
            >
              {isSaving
                ? "Salvando…"
                : mode === "create"
                  ? "Criar"
                  : "Salvar"}
            </button>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function LinesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-white/50"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}
