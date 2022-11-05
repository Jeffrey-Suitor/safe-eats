import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { authedProcedure, publicProcedure, router } from "../trpc";
import { RecipeSchema } from "@safe-eats/types/recipeTypes";
import { prisma } from "@safe-eats/db";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const recipeRouter = router({
  add: t.procedure.input(RecipeSchema).mutation(async ({ input }) => {
    return await prisma.recipe.create({ data: input });
  }),

  all: t.procedure.query(async () => {
    return await prisma.recipe.findMany();
  }),

  get: t.procedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.recipe.findUnique({ where: { id: input } });
  }),

  delete: t.procedure.input(z.string().uuid()).mutation(async ({ input }) => {
    await prisma.qRCode.deleteMany({ where: { recipeId: input } });
    return await prisma.recipe.delete({ where: { id: input } });
  }),

  update: t.procedure.input(RecipeSchema).mutation(async ({ input }) => {
    return await prisma.recipe.update({ where: { id: input.id }, data: input });
  }),
});
