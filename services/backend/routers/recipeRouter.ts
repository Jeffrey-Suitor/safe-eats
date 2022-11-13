import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { authedProcedure, router } from "../trpc";
import { RecipeSchema } from "@safe-eats/types/recipeTypes";
import { prisma } from "@safe-eats/db";

export const recipeRouter = router({
  add: authedProcedure.input(RecipeSchema).mutation(async ({ input, ctx }) => {
    const recipe = await prisma.recipe.create({
      data: {
        ...input,
        users: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
    });
    return recipe;
  }),

  all: authedProcedure.query(async ({ ctx }) => {
    return await prisma.recipe.findMany({
      where: {
        users: {
          some: {
            id: ctx.user.id,
          },
        },
      },
    });
  }),

  byId: authedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.recipe.findUniqueOrThrow({
      where: {
        id: input,
      },
    });
  }),

  delete: authedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.recipe.delete({
        where: {
          id: input,
        },
      });
    }),

  update: authedProcedure.input(RecipeSchema).mutation(async ({ input }) => {
    return await prisma.recipe.update({
      where: { id: input.id },
      data: input,
    });
  }),
});
