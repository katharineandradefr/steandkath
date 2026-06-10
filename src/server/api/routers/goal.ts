import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { canGoalAction } from "~/server/auth/goal-permissions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { GoalModel, type GoalDoc } from "~/server/db/models/goal";
import {
  GOAL_STATUSES,
  toGoalDateIso,
  type Goal,
  type GoalStatus,
} from "~/shared/goal";
import {
  DEFAULT_AREA_KEY,
  PENDENCY_PROJECT_KEYS,
  type PendencyProjectKey,
} from "~/shared/pendency";

const projectKeySchema = z.enum(
  PENDENCY_PROJECT_KEYS as unknown as [
    PendencyProjectKey,
    ...PendencyProjectKey[],
  ],
);

const statusSchema = z.enum(
  GOAL_STATUSES as unknown as [GoalStatus, ...GoalStatus[]],
);

const goalBaseFieldsSchema = z.object({
  areaKey: z.string().min(1).default(DEFAULT_AREA_KEY),
  title: z.string().trim().min(1).max(500),
  projectKey: projectKeySchema,
  status: statusSchema.default("pending"),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  assigneeName: z.string().max(200).nullable().optional(),
  assigneeAvatarUrl: z.string().url().nullable().optional(),
  targetCount: z.number().int().min(1).nullable().optional(),
  doneCount: z.number().int().min(0).optional(),
  progressUnit: z.string().trim().max(40).nullable().optional(),
});

const goalWriteFieldsSchema = goalBaseFieldsSchema.refine(
  (data) => data.dueDate >= data.startDate,
  {
    message: "A data limite deve ser igual ou posterior à data de início.",
    path: ["dueDate"],
  },
);

const goalPatchSchema = goalBaseFieldsSchema.partial();

/**
 * Converte documento Mongoose em tipo Goal compartilhado.
 */
function docToGoal(doc: GoalDoc): Goal {
  return {
    id: doc.id,
    areaKey: doc.areaKey,
    title: doc.title,
    projectKey: doc.projectKey,
    status: doc.status,
    startDate: toGoalDateIso(doc.startDate),
    dueDate: toGoalDateIso(doc.dueDate),
    assigneeName: doc.assigneeName ?? null,
    assigneeAvatarUrl: doc.assigneeAvatarUrl ?? null,
    targetCount: doc.targetCount ?? null,
    doneCount: doc.doneCount ?? 0,
    progressUnit: doc.progressUnit ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Aplica regras de progresso: clamp de concluídas e auto-conclusão ao atingir o total.
 */
function applyProgressRules(
  target: number | null | undefined,
  done: number | undefined,
  status: GoalStatus,
): { doneCount: number; status: GoalStatus } {
  if (target === null || target === undefined) {
    return { doneCount: 0, status };
  }

  const clampedDone = Math.min(Math.max(done ?? 0, 0), target);
  const nextStatus = clampedDone >= target ? "completed" : status;

  return { doneCount: clampedDone, status: nextStatus };
}

/**
 * Normaliza data para meia-noite UTC.
 */
function normalizeDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/**
 * Retorna início e fim do mês em UTC.
 */
function getMonthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

/**
 * Retorna início (domingo) e fim (sábado) da semana da data de referência.
 */
function getWeekBounds(referenceDate: Date) {
  const utc = normalizeDate(referenceDate);
  const dayOfWeek = utc.getUTCDay();
  const start = new Date(utc);
  start.setUTCDate(utc.getUTCDate() - dayOfWeek);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

function assertCan(
  action: Parameters<typeof canGoalAction>[0],
  status?: Parameters<typeof canGoalAction>[1],
) {
  if (!canGoalAction(action, status)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para esta ação.",
    });
  }
}

export const goalRouter = createTRPCRouter({
  listByMonth: publicProcedure
    .input(
      z.object({
        year: z.number().int().min(1970).max(2100),
        month: z.number().int().min(1).max(12),
        areaKey: z.string().min(1).optional(),
        projectKey: projectKeySchema.optional(),
      }),
    )
    .query(async ({ input }) => {
      assertCan("view");
      const { start, end } = getMonthBounds(input.year, input.month);
      const filter: Record<string, unknown> = {
        startDate: { $lte: end },
        dueDate: { $gte: start },
      };
      if (input.areaKey) filter.areaKey = input.areaKey;
      if (input.projectKey) filter.projectKey = input.projectKey;

      const docs = await GoalModel.find(filter)
        .sort({ startDate: 1, dueDate: 1 })
        .exec();
      return docs.map(docToGoal);
    }),

  listByWeek: publicProcedure
    .input(
      z.object({
        referenceDate: z.coerce.date(),
        areaKey: z.string().min(1).optional(),
      }),
    )
    .query(async ({ input }) => {
      assertCan("view");
      const { start, end } = getWeekBounds(input.referenceDate);
      const filter: Record<string, unknown> = {
        startDate: { $lte: end },
        dueDate: { $gte: start },
      };
      if (input.areaKey) filter.areaKey = input.areaKey;

      const docs = await GoalModel.find(filter)
        .sort({ dueDate: 1 })
        .exec();
      return docs.map(docToGoal);
    }),

  create: publicProcedure
    .input(goalWriteFieldsSchema)
    .mutation(async ({ input }) => {
      assertCan("create");
      const targetCount = input.targetCount ?? null;
      const progress = applyProgressRules(
        targetCount,
        input.doneCount,
        input.status,
      );
      const doc = await GoalModel.create({
        id: crypto.randomUUID(),
        areaKey: input.areaKey,
        title: input.title,
        projectKey: input.projectKey,
        status: progress.status,
        startDate: normalizeDate(input.startDate),
        dueDate: normalizeDate(input.dueDate),
        assigneeName: input.assigneeName ?? null,
        assigneeAvatarUrl: input.assigneeAvatarUrl ?? null,
        targetCount,
        doneCount: progress.doneCount,
        progressUnit: targetCount ? (input.progressUnit ?? null) : null,
      });
      // TODO: registrar no histórico de atividades (RN-C05)
      return docToGoal(doc);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        patch: goalPatchSchema,
      }),
    )
    .mutation(async ({ input }) => {
      assertCan("update");
      const existing = await GoalModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      const patch = input.patch;
      if (patch.title !== undefined) existing.title = patch.title;
      if (patch.areaKey !== undefined) existing.areaKey = patch.areaKey;
      if (patch.projectKey !== undefined) existing.projectKey = patch.projectKey;
      if (patch.status !== undefined) existing.status = patch.status;
      if (patch.startDate !== undefined) {
        existing.startDate = normalizeDate(patch.startDate);
      }
      if (patch.dueDate !== undefined) {
        existing.dueDate = normalizeDate(patch.dueDate);
      }
      if (patch.assigneeName !== undefined) {
        existing.assigneeName = patch.assigneeName;
      }
      if (patch.assigneeAvatarUrl !== undefined) {
        existing.assigneeAvatarUrl = patch.assigneeAvatarUrl;
      }
      if (patch.targetCount !== undefined) {
        existing.targetCount = patch.targetCount;
      }
      if (patch.progressUnit !== undefined) {
        existing.progressUnit = patch.progressUnit;
      }
      if (patch.doneCount !== undefined) {
        existing.doneCount = patch.doneCount;
      }

      const targetCount = existing.targetCount ?? null;
      if (targetCount === null) {
        existing.doneCount = 0;
        existing.progressUnit = null;
      } else {
        const progress = applyProgressRules(
          targetCount,
          existing.doneCount,
          existing.status,
        );
        existing.doneCount = progress.doneCount;
        existing.status = progress.status;
      }

      if (existing.dueDate < existing.startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A data limite deve ser igual ou posterior à data de início.",
        });
      }

      await existing.save();
      // TODO: registrar no histórico de atividades (RN-C05)
      return docToGoal(existing);
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: statusSchema,
      }),
    )
    .mutation(async ({ input }) => {
      assertCan("update_status", input.status);
      const existing = await GoalModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      existing.status = input.status;
      await existing.save();
      // TODO: registrar no histórico de atividades (RN-C05)
      return docToGoal(existing);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      assertCan("delete");
      const existing = await GoalModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      await GoalModel.deleteOne({ id: input.id }).exec();
      // TODO: registrar no histórico de atividades (RN-C05)
      return { id: input.id };
    }),
});
