"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { GoalChecklistField } from "~/app/(app)/calendario/_components/goal-checklist-field";
import type { GoalChecklistFieldHandle } from "~/app/(app)/calendario/_components/goal-checklist-field";
import { usePermissions } from "~/app/_components/active-user-provider";
import {
  createEmptyGoalDraft,
  getGoalProgress,
  GOAL_STATUS_LABELS,
  GOAL_STATUSES,
  type Goal,
  type GoalChecklistItem,
  type GoalStatus,
} from "~/shared/goal";
import { goalActionToPermissionKey } from "~/shared/permissions";
import {
  PENDENCY_PROJECT_BAR_HEX,
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  type PendencyProjectKey,
} from "~/shared/pendency";
import {
  CHAT_CONTACTS,
  getChatContactById,
} from "~/shared/chat-contacts";
import { api } from "~/trpc/react";

type GoalFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  goal: Goal | null;
  readOnly?: boolean;
  /** Visualização com checklist interativo (marcar/desmarcar itens). */
  checklistInteractive?: boolean;
  initialStartDate?: Date | null;
  /** Chaves das queries do calendário para atualizar cache após salvar. */
  monthQueryKey?: { year: number; month: number };
  weekQueryKey?: { referenceDate: Date };
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  title: string;
  projectKey: PendencyProjectKey;
  status: GoalStatus;
  startDate: string;
  dueDate: string;
  assigneeId: string;
  checklist: GoalChecklistItem[];
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
  checklistInteractive = false,
  initialStartDate = null,
  monthQueryKey,
  weekQueryKey,
  onClose,
  onSuccess,
}: GoalFormModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildFormFromGoal(null, null),
  );
  const [error, setError] = useState<string | null>(null);
  const checklistFieldRef = useRef<GoalChecklistFieldHandle>(null);
  const loadedGoalIdRef = useRef<string | null>(null);
  const { can } = usePermissions();

  const utils = api.useUtils();

  const editGoalId = mode === "edit" ? goal?.id : undefined;

  const {
    data: freshGoal,
    isLoading: isLoadingGoal,
    isError: isGoalLoadError,
  } = api.goal.getById.useQuery(
    { id: editGoalId! },
    {
      enabled: open && mode === "edit" && !!editGoalId,
      staleTime: 0,
      refetchOnMount: "always",
    },
  );

  const syncGoalInListCache = async (saved: Goal) => {
    const merge = (prev: Goal[] | undefined) => {
      if (!prev) return [saved];
      const index = prev.findIndex((item) => item.id === saved.id);
      if (index === -1) return [...prev, saved];
      const next = [...prev];
      next[index] = saved;
      return next;
    };

    utils.goal.getById.setData({ id: saved.id }, saved);

    if (monthQueryKey) {
      utils.goal.listByMonth.setData(monthQueryKey, merge);
    }
    if (weekQueryKey) {
      utils.goal.listByWeek.setData(weekQueryKey, merge);
    }

    await Promise.all([
      utils.goal.listByMonth.invalidate(),
      utils.goal.listByWeek.invalidate(),
    ]);
  };

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
    if (!open) {
      loadedGoalIdRef.current = null;
      return;
    }

    if (mode === "create") {
      setForm(buildFormFromGoal(null, initialStartDate));
      setError(null);
      return;
    }

    if (!freshGoal || freshGoal.id !== editGoalId) return;

    const syncKey = `${freshGoal.id}:${freshGoal.updatedAt}:${freshGoal.checklist.length}`;
    if (loadedGoalIdRef.current === syncKey) return;

    loadedGoalIdRef.current = syncKey;
    setForm(buildFormFromGoal(freshGoal, null));
    setError(null);
  }, [open, mode, editGoalId, freshGoal, initialStartDate]);

  const showOrphanProgressWarning =
    mode === "edit" &&
    (freshGoal?.checklist.length ?? 0) === 0 &&
    (freshGoal?.targetCount ?? 0) > 0;

  const activeGoalId = freshGoal?.id ?? goal?.id;

  const createMutation = api.goal.create.useMutation({
    onSuccess: async (saved) => {
      await syncGoalInListCache(saved);
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.goal.update.useMutation({
    onSuccess: async (saved) => {
      await syncGoalInListCache(saved);
      onSuccess();
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateChecklistMutation = api.goal.updateChecklist.useMutation({
    onSuccess: async (saved) => {
      await syncGoalInListCache(saved);
      setForm((current) => ({
        ...current,
        checklist: [...saved.checklist],
        status: saved.status,
      }));
      loadedGoalIdRef.current = `${saved.id}:${saved.updatedAt}:${saved.checklist.length}`;
    },
    onError: (err) => setError(err.message),
  });

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateChecklistMutation.isPending;
  const fieldDisabled = readOnly || isPending;
  const modalTitle = readOnly
    ? "Visualizar meta"
    : mode === "create"
      ? "Nova meta"
      : "Editar meta";

  const handleChecklistChange = (checklist: GoalChecklistItem[]) => {
    setForm((f) => ({ ...f, checklist }));
    if (checklistInteractive && activeGoalId) {
      updateChecklistMutation.mutate({ id: activeGoalId, checklist });
    }
  };

  if (!open) return null;

  const isEditLoading = mode === "edit" && isLoadingGoal;
  const isEditLoadFailed = mode === "edit" && isGoalLoadError;

  if (isEditLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
      >
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          <p id="goal-modal-title" className="text-sm text-gray-600">
            Carregando meta…
          </p>
        </div>
      </div>
    );
  }

  if (isEditLoadFailed) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
      >
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          <p id="goal-modal-title" className="mb-4 text-sm text-red-600">
            Não foi possível carregar a meta.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-calendar-cardinal px-4 py-2 text-sm font-medium text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const progress = getGoalProgress({
    checklist: form.checklist,
    targetCount: freshGoal?.targetCount ?? goal?.targetCount,
    doneCount: freshGoal?.doneCount ?? goal?.doneCount,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Informe o título da meta.");
      return;
    }

    const checklist =
      checklistFieldRef.current?.getItemsForSave() ?? form.checklist;

    const payload = {
      title: form.title.trim(),
      projectKey: form.projectKey,
      status: form.status,
      startDate: new Date(`${form.startDate}T00:00:00.000Z`),
      dueDate: new Date(`${form.dueDate}T00:00:00.000Z`),
      assigneeId: form.assigneeId.trim() || null,
      checklist,
    };

    if (payload.dueDate < payload.startDate) {
      setError("A data limite deve ser igual ou posterior à data de início.");
      return;
    }

    if (mode === "create") {
      createMutation.mutate(payload);
    } else if (activeGoalId) {
      updateMutation.mutate({ id: activeGoalId, patch: payload });
    } else {
      setError("Não foi possível identificar a meta para salvar.");
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
            {showOrphanProgressWarning ? (
              <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                O progresso estava salvo sem os itens do checklist. Adicione as
                etapas novamente para acompanhar o andamento.
              </p>
            ) : null}
            <GoalChecklistField
              ref={checklistFieldRef}
              items={form.checklist}
              readOnly={readOnly && !checklistInteractive}
              toggleOnly={checklistInteractive}
              onChange={handleChecklistChange}
            />
            {progress.hasProgress && readOnly ? (
              <p className="text-xs text-gray-500">
                {progress.done}/{progress.total} itens concluídos ({progress.percent}%)
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="goal-assignee"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Responsável (opcional)
            </label>
            {readOnly ? (
              <p className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {getChatContactById(form.assigneeId)?.name ??
                  freshGoal?.assigneeName ??
                  goal?.assigneeName ??
                  "Nenhum selecionado"}
              </p>
            ) : (
              <select
                id="goal-assignee"
                value={form.assigneeId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assigneeId: e.target.value }))
                }
                disabled={fieldDisabled}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal disabled:bg-gray-100 disabled:text-gray-700"
              >
                <option value="">Nenhum selecionado</option>
                {CHAT_CONTACTS.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {checklistInteractive && updateChecklistMutation.isPending ? (
            <p role="status" className="text-sm text-gray-500">
              Salvando progresso…
            </p>
          ) : null}

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
    assigneeId: draft.assigneeId ?? "",
    checklist: [...(draft.checklist ?? [])],
  };
}
