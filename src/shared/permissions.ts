import {
  PENDENCY_STATUSES,
  type PendencyStatus,
} from "~/shared/pendency";
import { USER_ROLES, type UserRole } from "~/shared/user";

export type PermissionKey =
  | "pendency.edit"
  | "pendency.set_dates"
  | "pendency.edit_description"
  | "pendency.add_attachments"
  | "pendency.add_links"
  | "pendency.add_checklist"
  | "pendency.edit_checklist"
  | "pendency.set_priority"
  | "pendency.set_project_tags"
  | "pendency.set_responsible"
  | "pendency.delete"
  | "pendency.status_pending"
  | "pendency.status_in_review"
  | "pendency.status_corrected"
  | "pendency.status_completed"
  | "pendency.status_cancelled"
  | "goal.create"
  | "goal.view"
  | "goal.edit"
  | "goal.delete"
  | "goal.complete"
  | "goal.status_pending"
  | "goal.status_in_progress"
  | "goal.status_completed"
  | "goal.status_postponed"
  | "goal.status_cancelled";

export type PermissionGroup = {
  id: string;
  label: string;
  permissions: {
    key: PermissionKey;
    label: string;
  }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "pendencies",
    label: "Pendências",
    permissions: [
      { key: "pendency.edit", label: "Editar pendência" },
      { key: "pendency.set_dates", label: "Estabelecer datas (início / limite)" },
      { key: "pendency.edit_description", label: "Editar descrição" },
      { key: "pendency.add_attachments", label: "Adicionar anexos" },
      { key: "pendency.add_links", label: "Adicionar links" },
      { key: "pendency.add_checklist", label: "Adicionar checklist" },
      { key: "pendency.edit_checklist", label: "Editar checklist" },
      { key: "pendency.set_priority", label: "Tags de prioridade" },
      { key: "pendency.set_project_tags", label: "Tags de projeto" },
      { key: "pendency.set_responsible", label: "Nome do responsável" },
      { key: "pendency.delete", label: "Excluir pendência" },
      { key: "pendency.status_pending", label: "Status: Pendente" },
      { key: "pendency.status_in_review", label: "Status: Em análise" },
      { key: "pendency.status_corrected", label: "Status: Corrigido" },
      { key: "pendency.status_completed", label: "Status: Concluído" },
      { key: "pendency.status_cancelled", label: "Status: Cancelado" },
    ],
  },
  {
    id: "calendar",
    label: "Calendário (metas)",
    permissions: [
      { key: "goal.create", label: "Adicionar meta" },
      { key: "goal.view", label: "Visualizar meta" },
      { key: "goal.edit", label: "Editar meta" },
      { key: "goal.delete", label: "Excluir meta" },
      { key: "goal.complete", label: "Marcar meta como concluída" },
      { key: "goal.status_pending", label: "Status: Pendente" },
      { key: "goal.status_in_progress", label: "Status: Em execução" },
      { key: "goal.status_completed", label: "Status: Concluído" },
      { key: "goal.status_postponed", label: "Status: Adiado" },
      { key: "goal.status_cancelled", label: "Status: Cancelado" },
    ],
  },
];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_GROUPS.flatMap(
  (group) => group.permissions.map((permission) => permission.key),
);

export type PermissionMatrix = Record<UserRole, Record<PermissionKey, boolean>>;

/**
 * Matriz padrão conforme docs/business-rules/user-roles-permissions.md
 */
export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  designer_1: {
    "pendency.edit": true,
    "pendency.set_dates": true,
    "pendency.edit_description": true,
    "pendency.add_attachments": true,
    "pendency.add_links": true,
    "pendency.add_checklist": true,
    "pendency.edit_checklist": true,
    "pendency.set_priority": true,
    "pendency.set_project_tags": true,
    "pendency.set_responsible": true,
    "pendency.delete": true,
    "pendency.status_pending": true,
    "pendency.status_in_review": true,
    "pendency.status_corrected": true,
    "pendency.status_completed": true,
    "pendency.status_cancelled": true,
    "goal.create": true,
    "goal.view": true,
    "goal.edit": true,
    "goal.delete": true,
    "goal.complete": true,
    "goal.status_pending": true,
    "goal.status_in_progress": true,
    "goal.status_completed": true,
    "goal.status_postponed": true,
    "goal.status_cancelled": true,
  },
  designer: {
    "pendency.edit": true,
    "pendency.set_dates": false,
    "pendency.edit_description": true,
    "pendency.add_attachments": true,
    "pendency.add_links": true,
    "pendency.add_checklist": false,
    "pendency.edit_checklist": true,
    "pendency.set_priority": false,
    "pendency.set_project_tags": true,
    "pendency.set_responsible": true,
    "pendency.delete": true,
    "pendency.status_pending": true,
    "pendency.status_in_review": true,
    "pendency.status_corrected": true,
    "pendency.status_completed": true,
    "pendency.status_cancelled": false,
    "goal.create": false,
    "goal.view": true,
    "goal.edit": false,
    "goal.delete": false,
    "goal.complete": false,
    "goal.status_pending": false,
    "goal.status_in_progress": true,
    "goal.status_completed": false,
    "goal.status_postponed": false,
    "goal.status_cancelled": false,
  },
  coordinator: {
    "pendency.edit": true,
    "pendency.set_dates": true,
    "pendency.edit_description": true,
    "pendency.add_attachments": true,
    "pendency.add_links": true,
    "pendency.add_checklist": true,
    "pendency.edit_checklist": true,
    "pendency.set_priority": true,
    "pendency.set_project_tags": true,
    "pendency.set_responsible": true,
    "pendency.delete": false,
    "pendency.status_pending": true,
    "pendency.status_in_review": true,
    "pendency.status_corrected": true,
    "pendency.status_completed": false,
    "pendency.status_cancelled": true,
    "goal.create": true,
    "goal.view": true,
    "goal.edit": true,
    "goal.delete": true,
    "goal.complete": true,
    "goal.status_pending": true,
    "goal.status_in_progress": true,
    "goal.status_completed": true,
    "goal.status_postponed": true,
    "goal.status_cancelled": true,
  },
  sub_coordinator: {
    "pendency.edit": false,
    "pendency.set_dates": false,
    "pendency.edit_description": false,
    "pendency.add_attachments": false,
    "pendency.add_links": false,
    "pendency.add_checklist": false,
    "pendency.edit_checklist": true,
    "pendency.set_priority": false,
    "pendency.set_project_tags": false,
    "pendency.set_responsible": false,
    "pendency.delete": false,
    "pendency.status_pending": false,
    "pendency.status_in_review": true,
    "pendency.status_corrected": true,
    "pendency.status_completed": false,
    "pendency.status_cancelled": false,
    "goal.create": false,
    "goal.view": true,
    "goal.edit": false,
    "goal.delete": false,
    "goal.complete": true,
    "goal.status_pending": false,
    "goal.status_in_progress": true,
    "goal.status_completed": false,
    "goal.status_postponed": false,
    "goal.status_cancelled": false,
  },
};

/**
 * Verifica se o papel possui a permissão na matriz.
 */
export function can(
  role: UserRole | null | undefined,
  key: PermissionKey,
  matrix: PermissionMatrix,
): boolean {
  if (!role) return false;
  return matrix[role]?.[key] ?? false;
}

const GOAL_STATUS_PERMISSION_KEYS: Record<
  "pending" | "in_progress" | "completed" | "postponed" | "cancelled",
  PermissionKey
> = {
  pending: "goal.status_pending",
  in_progress: "goal.status_in_progress",
  completed: "goal.status_completed",
  postponed: "goal.status_postponed",
  cancelled: "goal.status_cancelled",
};

export type GoalPermissionAction =
  | "create"
  | "update"
  | "update_status"
  | "delete"
  | "view";

/**
 * Mapeia ação de meta para chave de permissão.
 */
export function goalActionToPermissionKey(
  action: GoalPermissionAction,
  status?: "pending" | "in_progress" | "completed" | "postponed" | "cancelled",
): PermissionKey {
  switch (action) {
    case "create":
      return "goal.create";
    case "update":
      return "goal.edit";
    case "delete":
      return "goal.delete";
    case "view":
      return "goal.view";
    case "update_status":
      if (status === "completed") return "goal.complete";
      if (status) return GOAL_STATUS_PERMISSION_KEYS[status];
      return "goal.status_in_progress";
  }
}

const PENDENCY_STATUS_PERMISSION_KEYS: Record<
  Exclude<PendencyStatus, "waiting_someone">,
  PermissionKey
> = {
  pending: "pendency.status_pending",
  in_review: "pendency.status_in_review",
  fixed: "pendency.status_corrected",
  finished: "pendency.status_completed",
};

export type PendencyPermissionAction =
  | "create"
  | "update"
  | "delete"
  | "set_status";

/**
 * Mapeia ação de pendência para chave de permissão.
 */
export function pendencyActionToPermissionKey(
  action: PendencyPermissionAction,
  status?: PendencyStatus,
): PermissionKey {
  switch (action) {
    case "create":
    case "update":
      return "pendency.edit";
    case "delete":
      return "pendency.delete";
    case "set_status":
      if (!status || status === "waiting_someone") return "pendency.edit";
      return PENDENCY_STATUS_PERMISSION_KEYS[status];
  }
}

/** Colunas visíveis no board por papel (ausente = todas). */
export const PENDENCY_VISIBLE_STATUSES_BY_ROLE: Partial<
  Record<UserRole, PendencyStatus[]>
> = {
  sub_coordinator: ["pending", "waiting_someone", "fixed"],
};

/**
 * Retorna os status de pendência visíveis no board para o papel.
 */
export function getVisiblePendencyStatuses(
  role: UserRole | null | undefined,
): PendencyStatus[] {
  if (!role) return [...PENDENCY_STATUSES];
  return PENDENCY_VISIBLE_STATUSES_BY_ROLE[role] ?? [...PENDENCY_STATUSES];
}

/** Garante que todas as chaves existam para cada papel. */
export function normalizePermissionMatrix(
  partial: Partial<PermissionMatrix>,
): PermissionMatrix {
  const result = {} as PermissionMatrix;

  for (const role of USER_ROLES) {
    result[role] = { ...DEFAULT_PERMISSION_MATRIX[role] };
    const roleOverrides = partial[role];
    if (!roleOverrides) continue;

    for (const key of ALL_PERMISSION_KEYS) {
      if (key in roleOverrides) {
        result[role][key] = roleOverrides[key] ?? false;
      }
    }
  }

  return result;
}
