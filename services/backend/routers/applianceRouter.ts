import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { ApplianceSchema } from "@safe-eats/types/applianceTypes";
import { prisma } from "@safe-eats/db";
import { router, authedProcedure } from "../trpc";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const applianceRouter = router({
  add: authedProcedure
    .input(ApplianceSchema)
    .mutation(async ({ input, ctx }) => {
      const appliance = await prisma.appliance.create({
        data: {
          ...input,
          users: {
            create: {
              userId: ctx.user.id,
            },
          },
        },
      });
      return appliance;
    }),

  get: authedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.appliance.findUnique({
      where: { id: input },
      include: { recipe: true },
    });
  }),

  all: authedProcedure.query(async ({ ctx }) => {
    return await prisma.appliance.findMany({
      where: {
        users: {
          every: {
            userId: ctx.user.id,
          },
        },
      },
      include: { recipe: true },
    });
  }),

  delete: authedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.appliance.delete({ where: { id: input } });
    }),

  update: authedProcedure.input(ApplianceSchema).mutation(async ({ input }) => {
    return await prisma.appliance.update({
      where: { id: input.id },
      data: input,
    });
  }),
});
