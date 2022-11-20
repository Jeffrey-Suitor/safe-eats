import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { authedProcedure, router } from "../utils/trpc";
import { qrCodeSchema } from "@safe-eats/types/qrCodeTypes";
import { prisma } from "@safe-eats/db";

export const qrCodeRouter = router({
  add: authedProcedure.input(qrCodeSchema).mutation(async ({ input }) => {
    return await prisma.qRCode.create({ data: input });
  }),

  get: authedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.qRCode.findUnique({ where: { id: input } });
  }),

  delete: authedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.qRCode.delete({ where: { id: input } });
    }),

  update: authedProcedure.input(qrCodeSchema).mutation(async ({ input }) => {
    return await prisma.qRCode.update({ where: { id: input.id }, data: input });
  }),
});
