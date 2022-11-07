import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { router } from "../trpc";
import { ApplianceSchema } from "@safe-eats/types/applianceTypes";
import { prisma } from "@safe-eats/db";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const applianceRouter = router({
  add: t.procedure.input(ApplianceSchema).mutation(async ({ input }) => {
    return await prisma.appliance.create({ data: input });
  }),

  get: t.procedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.appliance.findUnique({ where: { id: input } });
  }),

  all: t.procedure.query(async () => {
    return await prisma.appliance.findMany();
  }),

  delete: t.procedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return await prisma.appliance.delete({ where: { id: input } });
  }),

  update: t.procedure.input(ApplianceSchema).mutation(async ({ input }) => {
    return await prisma.appliance.update({
      where: { id: input.id },
      data: input,
    });
  }),
});
