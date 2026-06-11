import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { assertPlatformPermission } from "~/server/auth/platform-permissions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  PermissionMatrixModel,
  isValidStoredMatrix,
} from "~/server/db/models/permission-matrix";
import { UserPreferencesModel, type UserPreferencesDoc } from "~/server/db/models/user-preferences";
import { UserModel } from "~/server/db/models/user";
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_PERMISSION_MATRIX,
  normalizePermissionMatrix,
  type PermissionKey,
  type PermissionMatrix,
} from "~/shared/permissions";
import {
  DEFAULT_USER_PREFERENCES,
  type ColorMode,
  type FontSize,
  type MessageSound,
  type UserPreferences,
} from "~/shared/user-preferences";
import { USER_ROLES, type UserRole } from "~/shared/user";

const roleSchema = z.enum(
  USER_ROLES as unknown as [UserRole, ...UserRole[]],
);

const permissionKeySchema = z.enum(
  ALL_PERMISSION_KEYS as unknown as [PermissionKey, ...PermissionKey[]],
);

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

const fontSizeSchema = z.enum(["small", "medium", "large", "extra_large"]);
const messageSoundSchema = z.enum(["none", "soft", "default", "alert"]);
const colorModeSchema = z.enum(["light", "dark"]);

const generalPreferencesSchema = z.object({
  fontSize: fontSizeSchema.optional(),
  messageSound: messageSoundSchema.optional(),
  colorMode: colorModeSchema.optional(),
  messageNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

function docToPreferences(doc: UserPreferencesDoc): UserPreferences {
  return {
    userId: doc.userId,
    fontSize: doc.fontSize as FontSize,
    messageSound: doc.messageSound as MessageSound,
    colorMode: doc.colorMode as ColorMode,
    messageNotifications: doc.messageNotifications,
    emailNotifications: doc.emailNotifications,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const user = await UserModel.findOne().sort({ createdAt: 1 }).lean();
  return user?.id ?? null;
}

export const settingsRouter = createTRPCRouter({
  getPermissions: publicProcedure.query(async () => {
    const matrix = await getOrCreateMatrix();
    return { matrix };
  }),

  updatePermission: publicProcedure
    .input(
      z.object({
        role: roleSchema,
        permissionKey: permissionKeySchema,
        allowed: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      await assertPlatformPermission("settings.access");
      const matrix = await getOrCreateMatrix();
      matrix[input.role][input.permissionKey] = input.allowed;

      const doc = await PermissionMatrixModel.findOneAndUpdate(
        {},
        { matrix },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      if (!doc) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível salvar a permissão.",
        });
      }

      return { matrix: normalizePermissionMatrix(matrix) };
    }),

  getGeneralPreferences: publicProcedure.query(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { ...DEFAULT_USER_PREFERENCES, userId: "" };
    }

    const doc = await UserPreferencesModel.findOne({ userId }).lean();
    if (!doc) {
      return { ...DEFAULT_USER_PREFERENCES, userId };
    }

    return docToPreferences(doc as UserPreferencesDoc);
  }),

  updateGeneralPreferences: publicProcedure
    .input(generalPreferencesSchema)
    .mutation(async ({ input }) => {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nenhum usuário encontrado para salvar as preferências.",
        });
      }

      const doc = await UserPreferencesModel.findOneAndUpdate(
        { userId },
        {
          userId,
          ...(input.fontSize !== undefined ? { fontSize: input.fontSize } : {}),
          ...(input.messageSound !== undefined
            ? { messageSound: input.messageSound }
            : {}),
          ...(input.colorMode !== undefined ? { colorMode: input.colorMode } : {}),
          ...(input.messageNotifications !== undefined
            ? { messageNotifications: input.messageNotifications }
            : {}),
          ...(input.emailNotifications !== undefined
            ? { emailNotifications: input.emailNotifications }
            : {}),
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );

      if (!doc) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível salvar as preferências.",
        });
      }

      return docToPreferences(doc);
    }),
});
