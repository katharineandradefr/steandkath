import { TRPCError } from "@trpc/server";

import { getCurrentUserPermissionContext } from "~/server/auth/permission-context";
import { can, type PermissionKey } from "~/shared/permissions";

/**
 * Exige permissão de plataforma (FAQ, IA, configurações).
 */
export async function assertPlatformPermission(key: PermissionKey): Promise<void> {
  const { role, matrix } = await getCurrentUserPermissionContext();
  if (!can(role, key, matrix)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para esta ação.",
    });
  }
}
