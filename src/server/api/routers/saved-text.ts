import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SavedTextModel } from "~/server/db/models/saved-text";

export const savedTextRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const docs = await SavedTextModel.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      content: doc.content,
      createdAt: doc.createdAt,
    }));
  }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .mutation(async ({ input }) => {
      const doc = new SavedTextModel({ content: input.content });
      await doc.save();
      return {
        id: doc._id.toString(),
        content: doc.content,
        createdAt: doc.createdAt,
      };
    }),
});
