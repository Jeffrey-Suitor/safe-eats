import { initTRPC } from "@trpc/server";
import { EventEmitter } from "events";
import { z } from "zod";
import { router } from "../trpc";
import { UserSchema } from "@safe-eats/types/userTypes";
import { prisma } from "@safe-eats/db";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

const t = initTRPC.create();

export const userRouter = router({
  register: t.procedure
    .input(
      z.object({
        email: z.string().email().max(100),
        unencryptedPassword: z.string().min(8).max(100),
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input: { email, unencryptedPassword, name } }) => {
      const password = await bcrypt.hash(unencryptedPassword, 10);

      const existingEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingEmail) {
        throw new TRPCError({
          message: "The email is already in use",
          code: "BAD_REQUEST",
        });
      }

      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
        },
      });

      return user;
    }),

  login: t.procedure
    .input(
      z.object({
        email: z.string().email().max(100),
        unencryptedPassword: z.string().min(8).max(100),
      })
    )
    .query(async ({ input }) => {
      const { email, unencryptedPassword } = input;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new TRPCError({
          message: "Invalid credentials",
          code: "BAD_REQUEST",
        });
      }

      const passwordMatch = await bcrypt.compare(
        unencryptedPassword,
        user.password
      );

      if (!passwordMatch) {
        throw new TRPCError({
          message: "Invalid credentials",
          code: "BAD_REQUEST",
        });
      }

      const token = await createSession(user);

      return { token };
    }),

  delete: t.procedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return await prisma.user.delete({ where: { id: input } });
  }),

  update: t.procedure.input(UserSchema).mutation(async ({ input }) => {
    return await prisma.user.update({ where: { id: input.id }, data: input });
  }),
});
