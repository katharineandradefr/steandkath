import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getCurrentUserPermissionContext } from "~/server/auth/permission-context";
import { resolvePendencyPermission } from "~/server/auth/pendency-permissions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  deleteAllAttachments,
  deleteRemovedAttachments,
  docToPendency,
  excerptFromMarkdown,
  resolveAttachments,
} from "~/server/api/routers/pendency-helpers";
import { PendencyModel } from "~/server/db/models/pendency";
import {
  DEFAULT_AREA_KEY,
  PENDENCY_AUDIENCES,
  PENDENCY_PROJECT_KEYS,
  PENDENCY_RECURRENCES,
  PENDENCY_STATUSES,
  PENDENCY_URGENCIES,
  type PendencyAttachment,
  type PendencyAudience,
  type PendencyProjectKey,
  type PendencyRecurrence,
  type PendencyStatus,
  type PendencyUrgency,
} from "~/shared/pendency";
import { getPendencyListStatuses } from "~/shared/permissions";
import { isCoordinationRole } from "~/shared/user";

const projectKeySchema = z.enum(
  PENDENCY_PROJECT_KEYS as unknown as [PendencyProjectKey, ...PendencyProjectKey[]],
);
const urgencySchema = z.enum(
  PENDENCY_URGENCIES as unknown as [PendencyUrgency, ...PendencyUrgency[]],
);
const statusSchema = z.enum(
  PENDENCY_STATUSES as unknown as [PendencyStatus, ...PendencyStatus[]],
);

const audienceSchema = z.enum(
  PENDENCY_AUDIENCES as unknown as [PendencyAudience, ...PendencyAudience[]],
);

const recurrenceSchema = z.enum(
  PENDENCY_RECURRENCES as unknown as [
    PendencyRecurrence,
    ...PendencyRecurrence[],
  ],
);

const pendingAttachmentSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  dataUrl: z.string().startsWith("data:image/"),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  mimeType: z.string().startsWith("image/"),
  pending: z.literal(true),
});

const savedAttachmentSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  url: z.string().url(),
  publicId: z.string().min(1),
  provider: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  createdAt: z.string().datetime(),
});

const attachmentDraftSchema = z.union([
  pendingAttachmentSchema,
  savedAttachmentSchema,
]);

const linkSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  label: z.string().max(200).optional(),
});

const checklistItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  checked: z.boolean(),
});

const pendencyWriteFieldsSchema = z.object({
  areaKey: z.string().min(1).default(DEFAULT_AREA_KEY),
  title: z.string().trim().min(1).max(500),
  descriptionMarkdown: z.string().max(50_000).default(""),
  solutionMarkdown: z.string().max(50_000).default(""),
  projectKey: projectKeySchema,
  urgency: urgencySchema,
  links: z.array(linkSchema).max(20).default([]),
  checklist: z.array(checklistItemSchema).max(50).default([]),
  attachments: z.array(attachmentDraftSchema).max(8).default([]),
  audience: audienceSchema.nullable().optional(),
  professorResponsible: z.string().max(200).nullable().optional(),
  directResponsibleId: z.string().max(50).nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  recurrence: recurrenceSchema.default("none"),
});

/**
 * Normaliza data para meia-noite UTC.
 */
function normalizeDueDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

async function assertCan(
  action: Parameters<typeof resolvePendencyPermission>[0],
  status?: Parameters<typeof resolvePendencyPermission>[1],
) {
  const allowed = await resolvePendencyPermission(action, status);
  if (!allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem permissão para esta ação.",
    });
  }
}

export const pendencyRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          areaKey: z.string().min(1).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { role } = await getCurrentUserPermissionContext();
      const visibleStatuses = getPendencyListStatuses(role);
      const filter: Record<string, unknown> = {
        status: { $in: visibleStatuses },
      };
      if (input?.areaKey) filter.areaKey = input.areaKey;

      const docs = await PendencyModel.find(filter)
        .sort({ status: 1, position: 1 })
        .exec();
      return docs.map(docToPendency);
    }),

  listByDueDateRange: publicProcedure
    .input(
      z.object({
        start: z.coerce.date(),
        end: z.coerce.date(),
        areaKey: z.string().min(1).optional(),
      }),
    )
    .query(async ({ input }) => {
      const start = normalizeDueDate(input.start);
      const end = normalizeDueDate(input.end);
      end.setUTCHours(23, 59, 59, 999);

      const filter: Record<string, unknown> = {
        dueDate: { $gte: start, $lte: end },
      };
      if (input.areaKey) filter.areaKey = input.areaKey;

      const docs = await PendencyModel.find(filter)
        .sort({ dueDate: 1 })
        .exec();
      return docs.map(docToPendency);
    }),

  create: publicProcedure
    .input(pendencyWriteFieldsSchema)
    .mutation(async ({ input }) => {
      await assertCan("create");
      const attachments = await resolveAttachments(input.attachments);
      const pendingCount = await PendencyModel.countDocuments({
        areaKey: input.areaKey,
        status: "pending",
      }).exec();

      const doc = await PendencyModel.create({
        id: crypto.randomUUID(),
        areaKey: input.areaKey,
        title: input.title,
        description: excerptFromMarkdown(input.descriptionMarkdown),
        descriptionMarkdown: input.descriptionMarkdown,
        solutionMarkdown: input.solutionMarkdown ?? "",
        projectKey: input.projectKey,
        status: "pending",
        urgency: input.urgency,
        position: pendingCount,
        attachments,
        links: input.links,
        checklist: input.checklist,
        audience: input.audience ?? null,
        professorResponsible: input.professorResponsible ?? null,
        directResponsibleId: input.directResponsibleId ?? null,
        dueDate: input.dueDate ? normalizeDueDate(input.dueDate) : null,
        recurrence: input.recurrence ?? "none",
      });

      return docToPendency(doc);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        patch: pendencyWriteFieldsSchema.partial().extend({
          attachments: z.array(attachmentDraftSchema).max(8).optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      await assertCan("update");
      const existing = await PendencyModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pendência não encontrada." });
      }

      const previousAttachments: PendencyAttachment[] = existing.attachments.map(
        (a) => ({
          id: a.id,
          fileName: a.fileName,
          url: a.url,
          publicId: a.publicId,
          provider: a.provider,
          mimeType: a.mimeType,
          size: a.size,
          width: a.width ?? undefined,
          height: a.height ?? undefined,
          createdAt: a.createdAt,
        }),
      );

      const patch = input.patch;
      let nextAttachments: PendencyAttachment[] = previousAttachments;

      if (patch.attachments !== undefined) {
        nextAttachments = await resolveAttachments(patch.attachments);
        await deleteRemovedAttachments(previousAttachments, nextAttachments);
      }

      if (patch.title !== undefined) existing.title = patch.title;
      if (patch.areaKey !== undefined) existing.areaKey = patch.areaKey;
      if (patch.descriptionMarkdown !== undefined) {
        existing.descriptionMarkdown = patch.descriptionMarkdown;
        existing.description = excerptFromMarkdown(patch.descriptionMarkdown);
      }
      if (patch.solutionMarkdown !== undefined) {
        existing.solutionMarkdown = patch.solutionMarkdown;
      }
      if (patch.projectKey !== undefined) existing.projectKey = patch.projectKey;
      if (patch.urgency !== undefined) existing.urgency = patch.urgency;
      if (patch.links !== undefined) existing.set("links", patch.links);
      if (patch.checklist !== undefined) existing.set("checklist", patch.checklist);
      if (patch.attachments !== undefined) existing.set("attachments", nextAttachments);
      if (patch.audience !== undefined) existing.audience = patch.audience;
      if (patch.professorResponsible !== undefined) {
        existing.professorResponsible = patch.professorResponsible;
      }
      if (patch.directResponsibleId !== undefined) {
        existing.directResponsibleId = patch.directResponsibleId;
      }
      if (patch.dueDate !== undefined) {
        existing.dueDate = patch.dueDate ? normalizeDueDate(patch.dueDate) : null;
      }
      if (patch.recurrence !== undefined) existing.recurrence = patch.recurrence;

      await existing.save();
      return docToPendency(existing);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await assertCan("delete");
      const existing = await PendencyModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pendência não encontrada." });
      }

      const attachments = existing.attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        url: a.url,
        publicId: a.publicId,
        provider: a.provider,
        mimeType: a.mimeType,
        size: a.size,
        width: a.width ?? undefined,
        height: a.height ?? undefined,
        createdAt: a.createdAt,
      }));

      await deleteAllAttachments(attachments);
      await PendencyModel.deleteOne({ id: input.id }).exec();
      return { id: input.id };
    }),

  reorder: publicProcedure
    .input(
      z.object({
        moves: z
          .array(
            z.object({
              id: z.string().uuid(),
              status: statusSchema,
              position: z.number().int().nonnegative(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const ids = input.moves.map((move) => move.id);
      const existingDocs = await PendencyModel.find({ id: { $in: ids } })
        .select({ id: 1, status: 1, position: 1 })
        .lean()
        .exec();
      const existingById = new Map(
        existingDocs.map((doc) => [
          doc.id,
          {
            status: doc.status,
            position: doc.position,
          },
        ]),
      );

      for (const move of input.moves) {
        const current = existingById.get(move.id);
        if (!current) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pendência não encontrada.",
          });
        }

        const statusChanged = move.status !== current.status;
        const positionChanged = move.position !== current.position;
        if (!statusChanged && !positionChanged) continue;

        if (statusChanged) {
          await assertCan("set_status", move.status);
          continue;
        }

        const canUpdate = await resolvePendencyPermission("update");
        const canSetStatus = await resolvePendencyPermission(
          "set_status",
          move.status,
        );
        if (!canUpdate && !canSetStatus) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para esta ação.",
          });
        }
      }

      const bulkOps = input.moves.map((move) => ({
        updateOne: {
          filter: { id: move.id },
          update: { $set: { status: move.status, position: move.position } },
        },
      }));

      await PendencyModel.bulkWrite(bulkOps);
      return { updated: input.moves.length };
    }),

  /**
   * Coordenador/subcoordenador assume pendência pendente → em análise ao visualizar.
   */
  pickup: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { role } = await getCurrentUserPermissionContext();
      if (!isCoordinationRole(role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas coordenadores podem assumir pendências.",
        });
      }

      const existing = await PendencyModel.findOne({ id: input.id }).exec();
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pendência não encontrada.",
        });
      }

      if (existing.status !== "pending") {
        return docToPendency(existing);
      }

      await assertCan("set_status", "in_review");

      const inReviewCount = await PendencyModel.countDocuments({
        status: "in_review",
      }).exec();

      existing.status = "in_review";
      existing.position = inReviewCount;
      await existing.save();

      return docToPendency(existing);
    }),
});
