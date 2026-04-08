import { healthRouter } from "~/server/api/routers/health";
import { savedTextRouter } from "~/server/api/routers/saved-text";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  savedText: savedTextRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
