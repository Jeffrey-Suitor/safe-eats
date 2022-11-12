import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { RecipeSchema } from "@safe-eats/types/recipeTypes";
import { prisma } from "@safe-eats/db";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const recipeRouter = router({
  add: publicProcedure.input(RecipeSchema).mutation(async ({ input }) => {
    return await prisma.recipe.create({ data: input });
  }),

  all: publicProcedure.query(async () => {
    return await prisma.recipe.findMany();
  }),

  get: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.recipe.findUnique({ where: { id: input } });
  }),

  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.recipe.delete({ where: { id: input } });
    }),

  update: publicProcedure.input(RecipeSchema).mutation(async ({ input }) => {
    return await prisma.recipe.update({ where: { id: input.id }, data: input });
  }),
});
