import type { GoalStatus } from "~/shared/goal";

export type GoalAction =
  | "create"
  | "update"
  | "update_status"
  | "delete"
  | "view";

/**
 * Verifica permissão de ação em meta.
 * TODO: integrar quando User.role e coordenador autorizado existirem.
 */
export function canGoalAction(_action: GoalAction, _status?: GoalStatus): boolean {
  return true;
}
