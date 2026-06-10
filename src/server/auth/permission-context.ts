import {
  PermissionMatrixModel,
  isValidStoredMatrix,
} from "~/server/db/models/permission-matrix";
import { UserModel } from "~/server/db/models/user";
import {
  DEFAULT_PERMISSION_MATRIX,
  normalizePermissionMatrix,
  type PermissionMatrix,
} from "~/shared/permissions";
import type { UserRole } from "~/shared/user";

/**
 * Carrega matriz persistida ou cria com valores padrão.
 */
async function getOrCreateMatrix(): Promise<PermissionMatrix> {
  const existing = await PermissionMatrixModel.findOne().lean();

  if (existing?.matrix && isValidStoredMatrix(existing.matrix)) {
    return normalizePermissionMatrix(
      existing.matrix as Partial<PermissionMatrix>,
    );
  }

  const doc = await PermissionMatrixModel.findOneAndUpdate(
    {},
    { matrix: DEFAULT_PERMISSION_MATRIX },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return normalizePermissionMatrix(
    (doc?.matrix as Partial<PermissionMatrix> | undefined) ??
      DEFAULT_PERMISSION_MATRIX,
  );
}

export type UserPermissionContext = {
  role: UserRole | null;
  matrix: PermissionMatrix;
};

/**
 * Retorna papel do usuário ativo e matriz de permissões do banco.
 */
export async function getCurrentUserPermissionContext(): Promise<UserPermissionContext> {
  const user = await UserModel.findOne().sort({ createdAt: 1 }).lean();
  const matrix = await getOrCreateMatrix();

  return {
    role: user?.role ?? null,
    matrix,
  };
}
