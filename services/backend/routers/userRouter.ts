import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { router } from "../trpc";
import { UserSchema } from "@safe-eats/types/userTypes";
import { prisma } from "@safe-eats/db";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const userRouter = router({
  add: t.procedure.input(UserSchema).mutation(async ({ input }) => {
    return await prisma.user.create({ data: input });
  }),

  get: t.procedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.user.findUnique({ where: { id: input } });
  }),

  delete: t.procedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return await prisma.user.delete({ where: { id: input } });
  }),

  update: t.procedure.input(UserSchema).mutation(async ({ input }) => {
    return await prisma.user.update({ where: { id: input.id }, data: input });
  }),
});
