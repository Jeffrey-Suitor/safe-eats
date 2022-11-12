import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { ApplianceSchema } from "@safe-eats/types/applianceTypes";
import { prisma } from "@safe-eats/db";
import { router, publicProcedure } from "../trpc";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const applianceRouter = router({
  add: publicProcedure.input(ApplianceSchema).mutation(async ({ input }) => {
    return await prisma.appliance.create({ data: input });
  }),

  get: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.appliance.findUnique({
      where: { id: input },
      include: { recipe: true },
    });
  }),

  all: publicProcedure.query(async () => {
    return await prisma.appliance.findMany({
      include: { recipe: true },
    });
  }),

  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.appliance.delete({ where: { id: input } });
    }),

  update: publicProcedure.input(ApplianceSchema).mutation(async ({ input }) => {
    return await prisma.appliance.update({
      where: { id: input.id },
      data: input,
    });
  }),
});
