import { chatRouter } from "~/server/api/routers/chat";
import { healthRouter } from "~/server/api/routers/health";
import { pendencyRouter } from "~/server/api/routers/pendency";
import { savedTextRouter } from "~/server/api/routers/saved-text";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  savedText: savedTextRouter,
  pendency: pendencyRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
