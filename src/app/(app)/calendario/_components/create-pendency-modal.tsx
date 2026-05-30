"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

import { AreaButtonsRow } from "~/app/(app)/calendario/_components/area-buttons-row";
import { AudienceToggle } from "~/app/(app)/calendario/_components/audience-toggle";
import { CancelConfirmModal } from "~/app/(app)/calendario/_components/cancel-confirm-modal";
import { DescriptionRichEditor } from "~/app/(app)/calendario/_components/description-rich-editor";
import { FeedbackBanner } from "~/app/(app)/calendario/_components/feedback-banner";
import { RecurrenceButtons } from "~/app/(app)/calendario/_components/recurrence-buttons";
import {
  CALENDAR_DEFAULT_AREA_KEY,
  createEmptyCalendarPendencyDraft,
  DEFAULT_PROJECT_KEY,
  isRichTextEmpty,
  titleFromCalendarDraft,
  type CalendarPendencyDraft,
} from "~/shared/pendency";
import { api } from "~/trpc/react";

type CreatePendencyModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormFeedback = "idle" | "error" | "success";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

/**
 * Valida rascunho antes de salvar.
 */
function validateDraft(draft: CalendarPendencyDraft): boolean {
  if (!draft.area) return false;
  if (!draft.audience) return false;
  if (isRichTextEmpty(draft.description)) return false;
  if (!draft.dueDate) return false;
  if (
    draft.audience === "medical_team" &&
    !draft.professorResponsible.trim()
  ) {
    return false;
  }
  return true;
}

/**
 * Modal unificado para registro de pendências no calendário.
 */
export function CreatePendencyModal({ open, onClose }: CreatePendencyModalProps) {
  const [draft, setDraft] = useState<CalendarPendencyDraft>(() =>
    createEmptyCalendarPendencyDraft("design"),
  );
  const [feedback, setFeedback] = useState<FormFeedback>("idle");
  const [errorMessage, setErrorMessage] = useState<string>(
    "Existem campos em branco",
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const utils = api.useUtils();

  const createMutation = api.pendency.create.useMutation({
    onSuccess: async () => {
      await utils.pendency.invalidate();
    },
  });

  useEffect(() => {
    if (!open) return;
    setEditorKey((k) => k + 1);
    setDraft(createEmptyCalendarPendencyDraft("design"));
    setFeedback("idle");
    setErrorMessage("Existem campos em branco");
    setShowCancelConfirm(false);
    setIsSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const showFeedback = useCallback(
    (kind: FormFeedback, message?: string) => {
      setFeedback(kind);
      if (kind === "error" && message) setErrorMessage(message);
      if (kind !== "idle") {
        window.setTimeout(() => setFeedback("idle"), 4000);
      }
    },
    [],
  );

  const resetDraft = useCallback(() => {
    setDraft(createEmptyCalendarPendencyDraft("design"));
  }, []);

  const handleRegister = useCallback(async () => {
    if (!validateDraft(draft)) {
      showFeedback("error", "Existem campos em branco");
      return;
    }

    setIsSaving(true);

    try {
      await createMutation.mutateAsync({
        areaKey: draft.area ?? CALENDAR_DEFAULT_AREA_KEY,
        title: titleFromCalendarDraft(draft),
        descriptionMarkdown: draft.description.trim(),
        projectKey: DEFAULT_PROJECT_KEY,
        urgency: "medium",
        audience: draft.audience,
        professorResponsible:
          draft.audience === "medical_team"
            ? draft.professorResponsible.trim()
            : null,
        dueDate: new Date(`${draft.dueDate}T00:00:00.000Z`),
        recurrence: draft.recurrence,
        links: [],
        checklist: [],
        attachments: [],
      });

      showFeedback("success");
      resetDraft();
      window.setTimeout(() => onClose(), 1500);
    } catch {
      showFeedback(
        "error",
        "Não foi possível salvar a pendência. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [draft, createMutation, showFeedback, resetDraft, onClose]);

  const handleCancelConfirm = useCallback(() => {
    resetDraft();
    setShowCancelConfirm(false);
    onClose();
  }, [resetDraft, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-pendency-modal-title"
    >
      <div className="relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 text-gray-900 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="create-pendency-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Registrar pendência
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="relative space-y-4 rounded-2xl bg-gray-100 p-5">
          <div>
            <p className={labelClass}>Para qual grande área é essa pendência?</p>
            <AreaButtonsRow
              value={draft.area}
              onChange={(area) => setDraft((d) => ({ ...d, area }))}
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">Essa é uma Pendência para:</p>
            <AudienceToggle
              value={draft.audience}
              onChange={(audience) => setDraft((d) => ({ ...d, audience }))}
            />
          </div>

          <div>
            <label htmlFor="professor-responsible" className={labelClass}>
              Professor mais responsável:
            </label>
            <input
              id="professor-responsible"
              type="text"
              value={draft.professorResponsible}
              onChange={(e) =>
                setDraft((d) => ({ ...d, professorResponsible: e.target.value }))
              }
              className={inputClass}
              maxLength={200}
            />
          </div>

          <div>
            <p className={labelClass} id="pendency-description-label">
              Descreva a pendência:
            </p>
            <DescriptionRichEditor
              key={editorKey}
              onChange={(html) =>
                setDraft((d) => ({ ...d, description: html }))
              }
            />
          </div>

          <div>
            <label htmlFor="pendency-due-date" className={labelClass}>
              Determine uma Data Limite:
            </label>
            <input
              id="pendency-due-date"
              type="date"
              value={draft.dueDate}
              onChange={(e) =>
                setDraft((d) => ({ ...d, dueDate: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <p className={labelClass}>Repetir tarefa:</p>
            <RecurrenceButtons
              value={draft.recurrence}
              onChange={(recurrence) =>
                setDraft((d) => ({ ...d, recurrence }))
              }
            />
          </div>

          {feedback === "error" && (
            <FeedbackBanner kind="error" message={errorMessage} />
          )}
          {feedback === "success" && (
            <FeedbackBanner
              kind="success"
              message="Nova Pendência Registrada com sucesso!"
            />
          )}

          <CancelConfirmModal
            open={showCancelConfirm}
            onConfirm={handleCancelConfirm}
            onDismiss={() => setShowCancelConfirm(false)}
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            disabled={isSaving}
            className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleRegister()}
            disabled={isSaving}
            className="rounded-full bg-calendar-cardinal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal disabled:opacity-50"
          >
            {isSaving ? "Registrando…" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
