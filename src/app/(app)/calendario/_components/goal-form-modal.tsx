"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  createEmptyGoalDraft,
  GOAL_STATUS_LABELS,
  GOAL_STATUSES,
  type Goal,
  type GoalStatus,
} from "~/shared/goal";
import {
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  type PendencyProjectKey,
} from "~/shared/pendency";
import { api } from "~/trpc/react";

type GoalFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  goal: Goal | null;
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

/**
 * Modal de criação/edição de meta.
 */
export function GoalFormModal({
  open,
  mode,
  goal,
  onClose,
  onSuccess,
}: GoalFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildFormFromGoal(null));
  const [error, setError] = useState<string | null>(null);

  const utils = api.useUtils();

  useEffect(() => {
    if (open) {
      setForm(buildFormFromGoal(goal));
      setError(null);
    }
  }, [open, goal]);

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

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Informe o título da meta.");
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="goal-modal-title" className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Nova meta" : "Editar meta"}
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
              maxLength={500}
              required
            />
          </div>

          <div>
            <label htmlFor="goal-project" className="mb-1 block text-sm font-medium text-gray-700">
              Projeto
            </label>
            <select
              id="goal-project"
              value={form.projectKey}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  projectKey: e.target.value as PendencyProjectKey,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
            >
              {PENDENCY_PROJECT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {PENDENCY_PROJECT_LABELS[key]}
                </option>
              ))}
            </select>
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
            >
              {GOAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {GOAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
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
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-calendar-cardinal px-4 py-2 text-sm font-medium text-white hover:bg-brand-bright disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            >
              {isPending ? "Salvando…" : mode === "create" ? "Criar meta" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildFormFromGoal(goal: Goal | null): FormState {
  const draft = createEmptyGoalDraft(goal ?? undefined);
  return {
    title: draft.title,
    projectKey: draft.projectKey,
    status: draft.status,
    startDate: toInputDate(draft.startDate),
    dueDate: toInputDate(draft.dueDate),
    assigneeName: draft.assigneeName ?? "",
    assigneeAvatarUrl: draft.assigneeAvatarUrl ?? "",
  };
}
