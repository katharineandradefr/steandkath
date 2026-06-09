import { randomUUID } from "crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { CourseModel, type CourseDoc } from "~/server/db/models/course";
import { DEFAULT_COURSES, type Course } from "~/shared/course";

/**
 * Converte documento Mongoose em tipo Course compartilhado.
 */
function docToCourse(doc: CourseDoc): Course {
  return {
    id: doc.id,
    name: doc.name,
    bg: doc.bg,
    users: doc.users,
    active: doc.active,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Garante cursos padrão no banco na primeira consulta.
 */
async function ensureDefaultCourses(): Promise<CourseDoc[]> {
  const count = await CourseModel.countDocuments();
  if (count > 0) {
    return CourseModel.find().sort({ name: 1 }).exec();
  }

  await CourseModel.insertMany(
    DEFAULT_COURSES.map((course) => ({
      id: course.id,
      name: course.name,
      bg: course.bg,
      users: course.users,
      active: course.active,
    })),
  );

  return CourseModel.find().sort({ name: 1 }).exec();
}

const courseInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  bg: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Informe uma cor válida (ex.: #dc2626)."),
  users: z.array(z.string().trim().min(1).max(120)).default([]),
});

export const courseRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          activeOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const docs = await ensureDefaultCourses();
      const filtered = input?.activeOnly
        ? docs.filter((doc) => doc.active)
        : docs;

      return filtered.map((doc) => docToCourse(doc));
    }),

  create: publicProcedure.input(courseInputSchema).mutation(async ({ input }) => {
    const doc = await CourseModel.create({
      id: randomUUID(),
      name: input.name,
      bg: input.bg,
      users: input.users,
      active: true,
    });

    return docToCourse(doc);
  }),

  update: publicProcedure
    .input(
      courseInputSchema.extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const doc = await CourseModel.findOneAndUpdate(
        { id: input.id },
        {
          name: input.name,
          bg: input.bg,
          users: input.users,
        },
        { new: true, runValidators: true },
      );

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso não encontrado.",
        });
      }

      return docToCourse(doc);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const doc = await CourseModel.findOneAndDelete({ id: input.id });

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso não encontrado.",
        });
      }

      return { id: input.id };
    }),

  setActive: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const doc = await CourseModel.findOneAndUpdate(
        { id: input.id },
        { active: input.active },
        { new: true },
      );

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso não encontrado.",
        });
      }

      return docToCourse(doc);
    }),
});
