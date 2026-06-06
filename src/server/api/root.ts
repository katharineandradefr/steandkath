import { chatRouter } from "~/server/api/routers/chat";
import { drCofRouter } from "~/server/api/routers/dr-cof";
import { goalRouter } from "~/server/api/routers/goal";
import { healthRouter } from "~/server/api/routers/health";
import { pendencyRouter } from "~/server/api/routers/pendency";
import { savedTextRouter } from "~/server/api/routers/saved-text";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  savedText: savedTextRouter,
  pendency: pendencyRouter,
  chat: chatRouter,
  drCof: drCofRouter,
  goal: goalRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
