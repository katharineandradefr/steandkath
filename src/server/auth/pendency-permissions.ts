import { getCurrentUserPermissionContext } from "~/server/auth/permission-context";
import type { PendencyStatus } from "~/shared/pendency";
import {
  can,
  pendencyActionToPermissionKey,
  type PendencyPermissionAction,
} from "~/shared/permissions";

export type PendencyAction = PendencyPermissionAction;

/**
 * Verifica permissão de ação em pendência com base no papel e matriz do banco.
 */
export async function resolvePendencyPermission(
  action: PendencyAction,
  status?: PendencyStatus,
): Promise<boolean> {
  const { role, matrix } = await getCurrentUserPermissionContext();
  const key = pendencyActionToPermissionKey(action, status);
  return can(role, key, matrix);
}
