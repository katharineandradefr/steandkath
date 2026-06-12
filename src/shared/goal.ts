/**
 * Contrato de domínio para metas do calendário.
 */
import {
  DEFAULT_AREA_KEY,
  PENDENCY_PROJECT_KEYS,
  type PendencyProjectKey,
} from "~/shared/pendency";

export type GoalStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "postponed"
  | "cancelled";

export type GoalChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type Goal = {
  id: string;
  areaKey: string;
  title: string;
  projectKey: PendencyProjectKey;
  status: GoalStatus;
  startDate: string;
  dueDate: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  checklist: GoalChecklistItem[];
  /** @deprecated Preferir checklist; mantido para metas antigas. */
  targetCount?: number | null;
  /** @deprecated Preferir checklist; mantido para metas antigas. */
  doneCount?: number;
  /** @deprecated Removido da UI; mantido para metas antigas. */
  progressUnit?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalProgress = {
  hasProgress: boolean;
  done: number;
  total: number;
  percent: number;
};

export const GOAL_STATUSES: readonly GoalStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "postponed",
  "cancelled",
] as const;

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  pending: "Pendente",
  in_progress: "Em execução",
  completed: "Concluído",
  postponed: "Adiado",
  cancelled: "Cancelado",
};

export const DEFAULT_GOAL_AVATAR_URL =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face";

/**
 * Formata data ISO para exibição DD/MM/YYYY.
 */
export function formatGoalDueDate(isoDate: string): string {
  const date = parseGoalDate(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Converte string ISO em Date UTC (meia-noite).
 */
export function parseGoalDate(isoDate: string): Date {
  const date = new Date(isoDate);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/**
 * Converte Date para ISO string UTC meia-noite.
 */
export function toGoalDateIso(date: Date): string {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  ).toISOString();
}

/**
 * Verifica se uma meta intersecta o intervalo [start, end] (inclusivo).
 */
export function goalOverlapsRange(
  goal: Goal,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const start = parseGoalDate(goal.startDate);
  const end = parseGoalDate(goal.dueDate);
  return start <= rangeEnd && end >= rangeStart;
}

/**
 * Filtra metas que intersectam o intervalo [start, end].
 */
export function goalsOverlappingRange(
  goals: Goal[],
  rangeStart: Date,
  rangeEnd: Date,
): Goal[] {
  return goals.filter((goal) => goalOverlapsRange(goal, rangeStart, rangeEnd));
}

/**
 * Filtra metas por projeto.
 */
export function filterGoalsByProject(
  goals: Goal[],
  projectKey: PendencyProjectKey,
): Goal[] {
  return goals.filter((goal) => goal.projectKey === projectKey);
}

/**
 * Retorna início e fim do mês em UTC.
 */
export function getMonthRange(year: number, month: number): {
  start: Date;
  end: Date;
} {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start, end };
}

/**
 * Retorna início (domingo) e fim (sábado) da semana ISO da data de referência.
 */
export function getWeekRange(referenceDate: Date): { start: Date; end: Date } {
  const utc = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  const dayOfWeek = utc.getUTCDay();
  const start = new Date(utc);
  start.setUTCDate(utc.getUTCDate() - dayOfWeek);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

export const GOAL_PROJECT_KEYS = PENDENCY_PROJECT_KEYS;

/**
 * Rascunho vazio para criação de meta.
 */
export function createEmptyGoalDraft(
  overrides?: Partial<Goal>,
): Omit<Goal, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string } {
  const today = toGoalDateIso(new Date());
  return {
    id: crypto.randomUUID(),
    areaKey: DEFAULT_AREA_KEY,
    title: "",
    projectKey: "extensivo",
    status: "pending",
    startDate: today,
    dueDate: today,
    assigneeId: null,
    assigneeName: null,
    assigneeAvatarUrl: null,
    checklist: [],
    targetCount: null,
    doneCount: 0,
    progressUnit: null,
    ...overrides,
  };
}

/**
 * Calcula progresso da meta a partir do checklist ou campos legados.
 */
export function getGoalProgress(goal: {
  checklist?: GoalChecklistItem[];
  targetCount?: number | null;
  doneCount?: number;
}): GoalProgress {
  const checklist = goal.checklist ?? [];
  if (checklist.length > 0) {
    const total = checklist.length;
    const done = checklist.filter((item) => item.checked).length;
    const percent = Math.min(100, Math.round((done / total) * 100));
    return { hasProgress: true, done, total, percent };
  }

  const total = goal.targetCount ?? null;
  if (total === null || total <= 0) {
    return { hasProgress: false, done: 0, total: 0, percent: 0 };
  }

  const done = Math.min(Math.max(goal.doneCount ?? 0, 0), total);
  const percent = Math.min(100, Math.round((done / total) * 100));

  return { hasProgress: true, done, total, percent };
}
