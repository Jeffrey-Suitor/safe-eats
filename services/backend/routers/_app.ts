/**
 * This file contains the root router of your tRPC-backend
 */
import { router, publicProcedure, mergeRouters } from "../trpc";
import { recipeRouter } from "./recipeRouter";
import { qrCodeRouter } from "./qrCodeRouter";
import { applianceRouter } from "./applianceRouter";
import { userRouter } from "./userRouter";
export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
  recipe: recipeRouter,
  qrCode: qrCodeRouter,
  appliance: applianceRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
