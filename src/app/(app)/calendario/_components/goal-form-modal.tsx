"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { usePermissions } from "~/app/_components/active-user-provider";
import {
  createEmptyGoalDraft,
  getGoalProgress,
  GOAL_STATUS_LABELS,
  GOAL_STATUSES,
  type Goal,
  type GoalStatus,
} from "~/shared/goal";
import { goalActionToPermissionKey } from "~/shared/permissions";
import {
  PENDENCY_PROJECT_BAR_HEX,
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  type PendencyProjectKey,
} from "~/shared/pendency";
import { api } from "~/trpc/react";

type GoalFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  goal: Goal | null;
  readOnly?: boolean;
  initialStartDate?: Date | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  title: string;
  projectKey: PendencyProjectKey;
  status: GoalStatus;
  startDate: string;
  dueDate: string;
  assigneeName: string;
  assigneeAvatarUrl: string;
  targetCount: string;
  doneCount: string;
  progressUnit: string;
};

/**
 * Converte ISO para valor de input date (YYYY-MM-DD).
 */
function toInputDate(iso: string): string {
  const date = new Date(iso);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toInputDateFromUtcDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Dropdown de projeto com tag colorida no campo fechado e pilulas na lista.
 */
function ProjectTagSelect({
  value,
  onChange,
}: {
  value: PendencyProjectKey;
  onChange: (key: PendencyProjectKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
      >
        <span
          className="rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: PENDENCY_PROJECT_BAR_HEX[value] }}
        >
          {PENDENCY_PROJECT_LABELS[value]}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Projeto"
          className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <div className="flex flex-col items-start gap-2">
            {PENDENCY_PROJECT_KEYS.map((key) => {
              const isSelected = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  style={{ backgroundColor: PENDENCY_PROJECT_BAR_HEX[key] }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                    isSelected ? "ring-2 ring-gray-400 ring-offset-1" : "opacity-85"
                  }`}
                >
                  {PENDENCY_PROJECT_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Modal de criação/edição de meta.
 */
export function GoalFormModal({
  open,
  mode,
  goal,
  readOnly = false,
  initialStartDate = null,
  onClose,
  onSuccess,
}: GoalFormModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildFormFromGoal(null, null),
  );
  const [error, setError] = useState<string | null>(null);
  const { can } = usePermissions();

  const utils = api.useUtils();

  const selectableStatuses = useMemo(
    () =>
      GOAL_STATUSES.filter((status) => {
        if (status === form.status) return true;
        const key = goalActionToPermissionKey("update_status", status);
        return can(key);
      }),
    [can, form.status],
  );

  useEffect(() => {
    if (open) {
      setForm(
        buildFormFromGoal(
          goal,
          mode === "create" ? initialStartDate : null,
        ),
      );
      setError(null);
    }
  }, [open, goal, mode, initialStartDate]);

  const createMutation = api.goal.create.useMutation({
    onSuccess: async () => {
      await utils.goal.invalidate();
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.goal.update.useMutation({
    onSuccess: async () => {
      await utils.goal.invalidate();
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const fieldDisabled = readOnly || isPending;
  const modalTitle = readOnly
    ? "Detalhes da meta"
    : mode === "create"
      ? "Nova meta"
      : "Editar meta";

  if (!open) return null;

  const targetNum = form.targetCount.trim()
    ? Number.parseInt(form.targetCount, 10)
    : null;
  const doneNum = form.doneCount.trim()
    ? Number.parseInt(form.doneCount, 10)
    : 0;
  const progress = getGoalProgress({
    targetCount: targetNum && !Number.isNaN(targetNum) ? targetNum : null,
    doneCount: Number.isNaN(doneNum) ? 0 : doneNum,
  });

  const adjustDoneCount = (delta: number) => {
    if (!targetNum || Number.isNaN(targetNum)) return;
    const current = Number.isNaN(doneNum) ? 0 : doneNum;
    const next = Math.min(Math.max(current + delta, 0), targetNum);
    setForm((f) => ({ ...f, doneCount: String(next) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Informe o título da meta.");
      return;
    }

    const targetCountRaw = form.targetCount.trim();
    const targetCount = targetCountRaw ? Number.parseInt(targetCountRaw, 10) : null;
    const doneCount = form.doneCount.trim()
      ? Number.parseInt(form.doneCount, 10)
      : 0;

    if (targetCountRaw && (Number.isNaN(targetCount) || (targetCount ?? 0) < 1)) {
      setError("Informe um total válido (mínimo 1) ou deixe o campo vazio.");
      return;
    }

    if (targetCount !== null && (Number.isNaN(doneCount) || doneCount < 0)) {
      setError("Informe uma quantidade concluída válida.");
      return;
    }

    if (targetCount !== null && doneCount > targetCount) {
      setError("As concluídas não podem ser maiores que o total.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      projectKey: form.projectKey,
      status: form.status,
      startDate: new Date(`${form.startDate}T00:00:00.000Z`),
      dueDate: new Date(`${form.dueDate}T00:00:00.000Z`),
      assigneeName: form.assigneeName.trim() || null,
      assigneeAvatarUrl: form.assigneeAvatarUrl.trim() || null,
      targetCount,
      doneCount: targetCount === null ? 0 : doneCount,
      progressUnit:
        targetCount === null ? null : form.progressUnit.trim() || null,
    };

    if (payload.dueDate < payload.startDate) {
      setError("A data limite deve ser igual ou posterior à data de início.");
      return;
    }

    if (mode === "create") {
      createMutation.mutate(payload);
    } else if (goal) {
      updateMutation.mutate({ id: goal.id, patch: payload });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="goal-modal-title" className="text-lg font-semibold text-gray-900">
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal-title" className="mb-1 block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              id="goal-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              disabled={fieldDisabled}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
              maxLength={500}
              required
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Projeto
            </span>
            {readOnly ? (
              <p className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {PENDENCY_PROJECT_LABELS[form.projectKey]}
              </p>
            ) : (
              <ProjectTagSelect
                value={form.projectKey}
                onChange={(key) => setForm((f) => ({ ...f, projectKey: key }))}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-start" className="mb-1 block text-sm font-medium text-gray-700">
                Data de início
              </label>
              <input
                id="goal-start"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                disabled={fieldDisabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
                required
              />
            </div>
            <div>
              <label htmlFor="goal-due" className="mb-1 block text-sm font-medium text-gray-700">
                Data limite
              </label>
              <input
                id="goal-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                disabled={fieldDisabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="goal-status" className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="goal-status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as GoalStatus,
                }))
              }
              disabled={fieldDisabled}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
            >
              {selectableStatuses.map((status) => (
                <option key={status} value={status}>
                  {GOAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700">
              Acompanhamento (opcional)
            </p>

            <div>
              <label
                htmlFor="goal-progress-unit"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Unidade
              </label>
              <input
                id="goal-progress-unit"
                type="text"
                value={form.progressUnit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, progressUnit: e.target.value }))
                }
                placeholder="Ex.: fichas"
                disabled={fieldDisabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
                maxLength={40}
              />
            </div>

            <div>
              <label
                htmlFor="goal-target-count"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Total
              </label>
              <input
                id="goal-target-count"
                type="number"
                min={1}
                value={form.targetCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetCount: e.target.value }))
                }
                placeholder="Ex.: 30"
                disabled={fieldDisabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
              />
            </div>

            {progress.hasProgress && (
              <>
                <div>
                  <label
                    htmlFor="goal-done-count"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Concluídas
                  </label>
                  <div className="flex items-center gap-2">
                    {!readOnly ? (
                      <button
                        type="button"
                        onClick={() => adjustDoneCount(-1)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
                        aria-label="Diminuir concluídas"
                      >
                        −
                      </button>
                    ) : null}
                    <input
                      id="goal-done-count"
                      type="number"
                      min={0}
                      max={progress.total}
                      value={form.doneCount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, doneCount: e.target.value }))
                      }
                      disabled={fieldDisabled}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
                    />
                    {!readOnly ? (
                      <button
                        type="button"
                        onClick={() => adjustDoneCount(1)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-lg font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
                        aria-label="Aumentar concluídas"
                      >
                        +
                      </button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
                    role="progressbar"
                    aria-valuenow={progress.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progresso da meta"
                  >
                    <div
                      className="h-full rounded-full bg-calendar-cardinal transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {progress.done}/{progress.total}
                    {form.progressUnit.trim()
                      ? ` ${form.progressUnit.trim()}`
                      : ""}{" "}
                    ({progress.percent}%)
                  </p>
                </div>
              </>
            )}
          </div>

          <div>
            <label htmlFor="goal-assignee" className="mb-1 block text-sm font-medium text-gray-700">
              Responsável (opcional)
            </label>
            <input
              id="goal-assignee"
              type="text"
              value={form.assigneeName}
              onChange={(e) =>
                setForm((f) => ({ ...f, assigneeName: e.target.value }))
              }
              disabled={fieldDisabled}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
              maxLength={200}
            />
          </div>

          <div>
            <label htmlFor="goal-avatar" className="mb-1 block text-sm font-medium text-gray-700">
              URL do avatar (opcional)
            </label>
            <input
              id="goal-avatar"
              type="url"
              value={form.assigneeAvatarUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, assigneeAvatarUrl: e.target.value }))
              }
              placeholder="https://..."
              disabled={fieldDisabled}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            >
              {readOnly ? "Fechar" : "Cancelar"}
            </button>
            {!readOnly ? (
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-calendar-cardinal px-4 py-2 text-sm font-medium text-white hover:bg-brand-bright disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
              >
                {isPending ? "Salvando…" : mode === "create" ? "Criar meta" : "Salvar"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function buildFormFromGoal(
  goal: Goal | null,
  initialStartDate?: Date | null,
): FormState {
  const draft = createEmptyGoalDraft(goal ?? undefined);
  const dateInput = initialStartDate
    ? toInputDateFromUtcDate(initialStartDate)
    : toInputDate(draft.startDate);

  return {
    title: draft.title,
    projectKey: draft.projectKey,
    status: draft.status,
    startDate: dateInput,
    dueDate: initialStartDate ? dateInput : toInputDate(draft.dueDate),
    assigneeName: draft.assigneeName ?? "",
    assigneeAvatarUrl: draft.assigneeAvatarUrl ?? "",
    targetCount:
      draft.targetCount != null ? String(draft.targetCount) : "",
    doneCount: String(draft.doneCount ?? 0),
    progressUnit: draft.progressUnit ?? "",
  };
}
