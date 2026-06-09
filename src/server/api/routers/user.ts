import { randomUUID } from "crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { UserModel, type UserDoc } from "~/server/db/models/user";
import {
  PENDENCY_AREA_KEYS,
  PENDENCY_PROJECT_KEYS,
  type PendencyAreaKey,
  type PendencyProjectKey,
} from "~/shared/pendency";
import {
  EXAMPLE_USER,
  USER_ROLES,
  showsProfileProjectsAndArea,
  type User,
  type UserRole,
} from "~/shared/user";

const MAX_PHOTO_BASE64_LENGTH = 2 * 1024 * 1024;

const projectKeySchema = z.enum(
  PENDENCY_PROJECT_KEYS as unknown as [
    PendencyProjectKey,
    ...PendencyProjectKey[],
  ],
);

const roleSchema = z.enum(
  USER_ROLES as unknown as [UserRole, ...UserRole[]],
);

const areaKeySchema = z.enum(
  PENDENCY_AREA_KEYS as unknown as [PendencyAreaKey, ...PendencyAreaKey[]],
);

const userUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(200),
  role: roleSchema,
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(30).nullable().optional(),
  projects: z.array(projectKeySchema),
  area: areaKeySchema.nullable().optional(),
  photoBase64: z
    .string()
    .max(MAX_PHOTO_BASE64_LENGTH, "A foto excede o tamanho máximo permitido.")
    .nullable()
    .optional(),
}).superRefine((data, ctx) => {
  if (showsProfileProjectsAndArea(data.role) && data.projects.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione ao menos um projeto.",
      path: ["projects"],
    });
  }
});

/**
 * Garante o usuário de exemplo no banco com senha padrão de demonstração.
 */
async function ensureExampleUser(): Promise<void> {
  await UserModel.findOneAndUpdate(
    { email: EXAMPLE_USER.email },
    {
      $set: {
        name: EXAMPLE_USER.name,
        email: EXAMPLE_USER.email,
        phone: EXAMPLE_USER.phone,
        password: EXAMPLE_USER.password,
        role: EXAMPLE_USER.role,
        projects: EXAMPLE_USER.projects,
        area: EXAMPLE_USER.area,
      },
      $setOnInsert: {
        id: EXAMPLE_USER.id,
      },
    },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

/**
 * Converte documento Mongoose em tipo User compartilhado.
 */

function docToUser(doc: UserDoc): User {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    email: doc.email,
    phone: doc.phone ?? null,
    projects: doc.projects as PendencyProjectKey[],
    area: doc.area ?? null,
    photoBase64: doc.photoBase64 ?? null,
    hasPassword: Boolean(doc.password),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    await ensureExampleUser();
    const docs = await UserModel.find().sort({ name: 1 }).lean();
    return (docs as UserDoc[]).map(docToUser);
  }),

  getFirst: publicProcedure.query(async () => {
    await ensureExampleUser();
    const doc = await UserModel.findOne().sort({ createdAt: 1 }).lean();
    return doc ? docToUser(doc as UserDoc) : null;
  }),

  revealPassword: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        adminPassword: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.adminPassword !== env.SETTINGS_ADMIN_PASSWORD) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Senha de administrador incorreta.",
        });
      }

      const doc = await UserModel.findOne({ id: input.userId }).lean();
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado.",
        });
      }

      return {
        password: doc.password ?? null,
      };
    }),

  upsert: publicProcedure.input(userUpsertSchema).mutation(async ({ input }) => {
    const userId = input.id ?? randomUUID();

    const doc = await UserModel.findOneAndUpdate(
      { id: userId },
      {
        id: userId,
        name: input.name,
        role: input.role,
        email: input.email,
        phone: input.phone ?? null,
        projects: input.projects,
        area: input.area ?? null,
        photoBase64: input.photoBase64 ?? null,
      },
      { upsert: true, new: true, runValidators: true },
    );

    if (!doc) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Não foi possível salvar o perfil.",
      });
    }

    return docToUser(doc);
  }),
});
