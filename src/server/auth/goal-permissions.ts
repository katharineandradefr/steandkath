import { getCurrentUserPermissionContext } from "~/server/auth/permission-context";
import type { GoalStatus } from "~/shared/goal";
import {
  can,
  goalActionToPermissionKey,
  type GoalPermissionAction,
} from "~/shared/permissions";

export type GoalAction = GoalPermissionAction;

/**
 * Verifica permissão de ação em meta com base no papel e matriz do banco.
 */
export async function resolveGoalPermission(
  action: GoalAction,
  status?: GoalStatus,
): Promise<boolean> {
  const { role, matrix } = await getCurrentUserPermissionContext();
  const key = goalActionToPermissionKey(action, status);
  return can(role, key, matrix);
}
