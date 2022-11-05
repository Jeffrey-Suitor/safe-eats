import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { router } from "../trpc";
import { qrCodeSchema } from "@safe-eats/types/qrCodeTypes";
import { prisma } from "@safe-eats/db";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const qrCodeRouter = router({
  add: t.procedure.input(qrCodeSchema).mutation(async ({ input }) => {
    return await prisma.qRCode.create({ data: input });
  }),

  get: t.procedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.qRCode.findUnique({ where: { id: input } });
  }),

  delete: t.procedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return await prisma.qRCode.delete({ where: { id: input } });
  }),

  update: t.procedure.input(qrCodeSchema).mutation(async ({ input }) => {
    return await prisma.qRCode.update({ where: { id: input }, data: input });
  }),

  getRecipe: t.procedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.qRCode.findUnique({ where: { id: input } }).recipe();
  }),
});
