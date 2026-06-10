import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

import { USER_ROLES } from "~/shared/user";

const permissionMatrixSchema = new Schema(
  {
    matrix: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  { timestamps: true },
);

export type PermissionMatrixDoc = InferSchemaType<
  typeof permissionMatrixSchema
> & {
  createdAt: Date;
  updatedAt: Date;
};

export const PermissionMatrixModel =
  (models.PermissionMatrix as Model<PermissionMatrixDoc> | undefined) ??
  model<PermissionMatrixDoc>("PermissionMatrix", permissionMatrixSchema);

export const PERMISSION_MATRIX_SINGLETON_ID = "default";

/** Valida estrutura mínima da matriz persistida. */
export function isValidStoredMatrix(
  value: unknown,
): value is Record<string, Record<string, boolean>> {
  if (!value || typeof value !== "object") return false;

  for (const role of USER_ROLES) {
    const roleMatrix = (value as Record<string, unknown>)[role];
    if (!roleMatrix || typeof roleMatrix !== "object") return false;

    for (const key of Object.keys(roleMatrix)) {
      const allowed = (roleMatrix as Record<string, unknown>)[key];
      if (typeof allowed !== "boolean") return false;
    }
  }

  return true;
}
