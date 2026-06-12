import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { resolveGoalPermission } from "~/server/auth/goal-permissions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { GoalModel, type GoalDoc } from "~/server/db/models/goal";
import { UserModel } from "~/server/db/models/user";
import {
  GOAL_STATUSES,
  toGoalDateIso,
  type Goal,
  type GoalChecklistItem,
  type GoalStatus,
} from "~/shared/goal";
import { getChatContactById } from "~/shared/chat-contacts";
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

const checklistItemSchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().min(1).max(500),
  checked: z.boolean(),
});

type MongoChecklistItem = {
  itemId: string;
  text: string;
  checked: boolean;
};

/**
 * Converte checklist do domínio para formato persistido no MongoDB.
 */
function toMongoChecklist(items: GoalChecklistItem[]): MongoChecklistItem[] {
  return items.map((item) => ({
    itemId: item.id,
    text: item.text,
    checked: Boolean(item.checked),
  }));
}

const goalBaseFieldsSchema = z.object({
  areaKey: z.string().min(1).default(DEFAULT_AREA_KEY),
  title: z.string().trim().min(1).max(500),
  projectKey: projectKeySchema,
  status: statusSchema.default("pending"),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  assigneeId: z.string().max(50).nullable().optional(),
  assigneeName: z.string().max(200).nullable().optional(),
  assigneeAvatarUrl: z.string().nullable().optional(),
  checklist: z.array(checklistItemSchema).max(50).default([]),
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
  return leanDocToGoal(doc as unknown as LeanGoalDoc);
}

/**
 * Extrai checklist de documento MongoDB (suporta itemId atual e id legado).
 */
function normalizeChecklistFromDoc(raw: unknown): GoalChecklistItem[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw
    .map((entry): GoalChecklistItem | null => {
      if (!entry || typeof entry !== "object") return null;

      const plain =
        "toObject" in entry &&
        typeof (entry as { toObject?: () => unknown }).toObject === "function"
          ? (entry as { toObject: () => Record<string, unknown> }).toObject()
          : (entry as Record<string, unknown>);

      const id = plain.itemId ?? plain.id;
      const text = plain.text;
      if (typeof id !== "string" || id.length === 0) return null;
      if (typeof text !== "string" || text.trim().length === 0) return null;

      return {
        id,
        text: text.trim(),
        checked: Boolean(plain.checked),
      };
    })
    .filter((item): item is GoalChecklistItem => item !== null);
}

type LeanGoalDoc = {
  id: string;
  areaKey: string;
  title: string;
  projectKey: Goal["projectKey"];
  status: GoalStatus;
  startDate: Date;
  dueDate: Date;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  checklist?: unknown;
  targetCount?: number | null;
  doneCount?: number;
  progressUnit?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Converte documento lean em tipo Goal compartilhado.
 */
function leanDocToGoal(doc: LeanGoalDoc): Goal {
  return {
    id: doc.id,
    areaKey: doc.areaKey,
    title: doc.title,
    projectKey: doc.projectKey,
    status: doc.status,
    startDate: toGoalDateIso(doc.startDate),
    dueDate: toGoalDateIso(doc.dueDate),
    assigneeId: doc.assigneeId ?? null,
    assigneeName: doc.assigneeName ?? null,
    assigneeAvatarUrl: doc.assigneeAvatarUrl ?? null,
    checklist: normalizeChecklistFromDoc(doc.checklist),
    targetCount: doc.targetCount ?? null,
    doneCount: doc.doneCount ?? 0,
    progressUnit: doc.progressUnit ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Carrega meta do banco (lean) e converte para tipo compartilhado.
 */
async function loadGoalById(id: string): Promise<Goal> {
  const doc = await GoalModel.findOne({ id }).lean<LeanGoalDoc>().exec();
  if (!doc) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
  }

  return leanDocToGoal(doc);
}

/**
 * Migra checklist legado (campo `id`) para `itemId` no MongoDB.
 */
async function migrateLegacyChecklist(id: string): Promise<void> {
  const raw = await GoalModel.collection.findOne(
    { id },
    { projection: { checklist: 1 } },
  );
  if (!raw?.checklist || !Array.isArray(raw.checklist)) return;

  const needsMigration = raw.checklist.some(
    (item: Record<string, unknown>) =>
      typeof item.id === "string" && typeof item.itemId !== "string",
  );
  if (!needsMigration) return;

  const migrated = raw.checklist.map((item: Record<string, unknown>) => {
    const rawId = item.itemId ?? item.id;
    const rawText = item.text;
    return {
      itemId: typeof rawId === "string" ? rawId : "",
      text: typeof rawText === "string" ? rawText : "",
      checked: Boolean(item.checked),
    };
  });

  await GoalModel.collection.updateOne({ id }, { $set: { checklist: migrated } });
}

/**
 * Remove contadores legados quando não há itens no checklist.
 */
async function repairOrphanProgress(id: string): Promise<void> {
  const doc = await GoalModel.findOne({ id })
    .select({ checklist: 1, targetCount: 1 })
    .lean<{ checklist?: unknown; targetCount?: number | null }>()
    .exec();
  if (!doc) return;

  const checklist = normalizeChecklistFromDoc(doc.checklist);
  if (checklist.length === 0 && doc.targetCount != null) {
    await GoalModel.collection.updateOne(
      { id },
      { $set: { targetCount: null, doneCount: 0, progressUnit: null } },
    );
  }
}

/**
 * Resolve responsável a partir do contato do chat ou usuário da plataforma.
 */
async function resolveAssignee(assigneeId: string | null | undefined): Promise<{
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
}> {
  if (!assigneeId) {
    return { assigneeId: null, assigneeName: null, assigneeAvatarUrl: null };
  }

  const contact = getChatContactById(assigneeId);
  if (contact) {
    return {
      assigneeId,
      assigneeName: contact.name,
      assigneeAvatarUrl: null,
    };
  }

  const user = await UserModel.findOne({ id: assigneeId }).lean().exec();
  if (!user) {
    return { assigneeId: null, assigneeName: null, assigneeAvatarUrl: null };
  }

  const assigneeAvatarUrl = user.photoBase64?.startsWith("data:")
    ? user.photoBase64
    : null;

  return {
    assigneeId,
    assigneeName: user.name,
    assigneeAvatarUrl,
  };
}

/**
 * Sincroniza contadores legados e status a partir do checklist.
 */
function applyChecklistRules(
  checklist: GoalChecklistItem[],
  status: GoalStatus,
): {
  checklist: GoalChecklistItem[];
  targetCount: number | null;
  doneCount: number;
  status: GoalStatus;
} {
  if (checklist.length === 0) {
    return { checklist, targetCount: null, doneCount: 0, status };
  }

  const doneCount = checklist.filter((item) => item.checked).length;
  const targetCount = checklist.length;
  const nextStatus =
    doneCount >= targetCount && status !== "cancelled"
      ? "completed"
      : status;

  return {
    checklist,
    targetCount,
    doneCount,
    status: nextStatus,
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

async function assertCan(
  action: Parameters<typeof resolveGoalPermission>[0],
  status?: Parameters<typeof resolveGoalPermission>[1],
) {
  const allowed = await resolveGoalPermission(action, status);
  if (!allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para esta ação.",
    });
  }
}

/**
 * Monta campos de checklist/contadores a partir dos itens e status.
 */
function buildChecklistFields(
  checklist: GoalChecklistItem[],
  status: GoalStatus,
) {
  const progress = applyChecklistRules(checklist, status);
  return {
    checklist: toMongoChecklist(progress.checklist),
    targetCount: progress.targetCount,
    doneCount: progress.doneCount,
    status: progress.status,
    progressUnit: null,
  };
}

/**
 * Persiste checklist via $set atômico (evita perda do array no Mongoose save).
 */
async function persistGoalChecklist(
  id: string,
  checklist: GoalChecklistItem[],
  status: GoalStatus,
): Promise<Goal> {
  const fields = buildChecklistFields(checklist, status);
  const result = await GoalModel.collection.updateOne(
    { id },
    {
      $set: {
        checklist: fields.checklist,
        targetCount: fields.targetCount,
        doneCount: fields.doneCount,
        status: fields.status,
        progressUnit: fields.progressUnit,
      },
    },
  );
  if (result.matchedCount === 0) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
  }
  return loadGoalById(id);
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
      await assertCan("view");
      const { start, end } = getMonthBounds(input.year, input.month);
      const filter: Record<string, unknown> = {
        startDate: { $lte: end },
        dueDate: { $gte: start },
      };
      if (input.areaKey) filter.areaKey = input.areaKey;
      if (input.projectKey) filter.projectKey = input.projectKey;

      const docs = await GoalModel.find(filter)
        .sort({ startDate: 1, dueDate: 1 })
        .lean<LeanGoalDoc[]>()
        .exec();
      return docs.map(leanDocToGoal);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      await assertCan("view");
      await migrateLegacyChecklist(input.id);
      await repairOrphanProgress(input.id);
      return loadGoalById(input.id);
    }),

  listByWeek: publicProcedure
    .input(
      z.object({
        referenceDate: z.coerce.date(),
        areaKey: z.string().min(1).optional(),
      }),
    )
    .query(async ({ input }) => {
      await assertCan("view");
      const { start, end } = getWeekBounds(input.referenceDate);
      const filter: Record<string, unknown> = {
        startDate: { $lte: end },
        dueDate: { $gte: start },
      };
      if (input.areaKey) filter.areaKey = input.areaKey;

      const docs = await GoalModel.find(filter)
        .sort({ dueDate: 1 })
        .lean<LeanGoalDoc[]>()
        .exec();
      return docs.map(leanDocToGoal);
    }),

  create: publicProcedure
    .input(goalWriteFieldsSchema)
    .mutation(async ({ input }) => {
      await assertCan("create");
      const assignee = await resolveAssignee(input.assigneeId);
      const checklistFields = buildChecklistFields(
        input.checklist ?? [],
        input.status,
      );

      let targetCount = input.targetCount ?? null;
      let doneCount = input.doneCount ?? 0;
      let status = input.status;

      if ((input.checklist ?? []).length > 0) {
        targetCount = checklistFields.targetCount;
        doneCount = checklistFields.doneCount;
        status = checklistFields.status;
      } else {
        const progress = applyProgressRules(targetCount, doneCount, status);
        doneCount = progress.doneCount;
        status = progress.status;
        targetCount = null;
      }

      const id = crypto.randomUUID();
      const now = new Date();

      await GoalModel.collection.insertOne({
        id,
        areaKey: input.areaKey,
        title: input.title,
        projectKey: input.projectKey,
        status,
        startDate: normalizeDate(input.startDate),
        dueDate: normalizeDate(input.dueDate),
        assigneeId: assignee.assigneeId,
        assigneeName: assignee.assigneeName,
        assigneeAvatarUrl: assignee.assigneeAvatarUrl,
        checklist: checklistFields.checklist,
        targetCount,
        doneCount,
        progressUnit: null,
        createdAt: now,
        updatedAt: now,
      });

      // TODO: registrar no histórico de atividades (RN-C05)
      return loadGoalById(id);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        patch: goalPatchSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await assertCan("update");
      await migrateLegacyChecklist(input.id);
      const existing = await GoalModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      const patch = input.patch;
      if (
        patch.status !== undefined &&
        patch.status !== existing.status
      ) {
        await assertCan("update_status", patch.status);
      }

      const $set: Record<string, unknown> = {};

      if (patch.title !== undefined) $set.title = patch.title;
      if (patch.areaKey !== undefined) $set.areaKey = patch.areaKey;
      if (patch.projectKey !== undefined) $set.projectKey = patch.projectKey;
      if (patch.startDate !== undefined) {
        $set.startDate = normalizeDate(patch.startDate);
      }
      if (patch.dueDate !== undefined) {
        $set.dueDate = normalizeDate(patch.dueDate);
      }
      if (patch.assigneeId !== undefined) {
        const assignee = await resolveAssignee(patch.assigneeId);
        $set.assigneeId = assignee.assigneeId;
        $set.assigneeName = assignee.assigneeName;
        $set.assigneeAvatarUrl = assignee.assigneeAvatarUrl;
      }

      const baseStatus = patch.status ?? existing.status;

      if (patch.checklist !== undefined) {
        Object.assign($set, buildChecklistFields(patch.checklist, baseStatus));
      } else {
        const existingChecklist = normalizeChecklistFromDoc(existing.checklist);

        if (existingChecklist.length > 0) {
          Object.assign(
            $set,
            buildChecklistFields(existingChecklist, baseStatus),
          );
        } else {
          $set.targetCount = null;
          $set.doneCount = 0;
          $set.progressUnit = null;
          if (patch.status !== undefined) {
            $set.status = patch.status;
          }
        }
      }

      const nextStart =
        ($set.startDate as Date | undefined) ?? existing.startDate;
      const nextDue = ($set.dueDate as Date | undefined) ?? existing.dueDate;
      if (nextDue < nextStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A data limite deve ser igual ou posterior à data de início.",
        });
      }

      const result = await GoalModel.collection.updateOne(
        { id: input.id },
        { $set },
      );

      if (result.matchedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      // TODO: registrar no histórico de atividades (RN-C05)
      return loadGoalById(input.id);
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: statusSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await assertCan("update_status", input.status);
      const existing = await GoalModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      existing.status = input.status;
      await existing.save();
      // TODO: registrar no histórico de atividades (RN-C05)
      return docToGoal(existing);
    }),

  /** Atualiza checklist da meta — disponível a qualquer usuário com acesso de visualização. */
  updateChecklist: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        checklist: z.array(checklistItemSchema).max(50),
      }),
    )
    .mutation(async ({ input }) => {
      await assertCan("view");
      await migrateLegacyChecklist(input.id);
      const existing = await GoalModel.findOne({ id: input.id })
        .select({ status: 1 })
        .lean()
        .exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      return persistGoalChecklist(
        input.id,
        input.checklist,
        existing.status,
      );
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await assertCan("delete");
      const existing = await GoalModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meta não encontrada." });
      }

      await GoalModel.deleteOne({ id: input.id }).exec();
      // TODO: registrar no histórico de atividades (RN-C05)
      return { id: input.id };
    }),
});
