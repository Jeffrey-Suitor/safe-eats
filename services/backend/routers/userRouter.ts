/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../../.env" });
import { z } from "zod";
import { publicProcedure, router, authProcedure } from "../trpc";
import { UserSchema } from "@safe-eats/types/userTypes";
import { prisma } from "@safe-eats/db";
import { createAccessToken } from "../jwt";
import bcrypt from "bcrypt";

// create a global event emitter (could be replaced by redis, etc)
export const userRouter = router({
  googleAuth: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: {
        Authorization: `Bearer ${input}`,
      },
    });
    const { id, email, name } = await res.json();
    const dbUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const user =
      dbUser ??
      (await prisma.user.create({
        data: {
          id,
          email,
          name,
        },
      }));

    return { jwt: createAccessToken(user), user };
  }),

  passwordSignUp: publicProcedure
    .input(
      z.object({ email: z.string(), password: z.string(), name: z.string() })
    )
    .mutation(async ({ input: { email, password, name } }) => {
      const dbUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (dbUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });
      return { jwt: createAccessToken(user), user };
    }),

  setExpoPushToken: authProcedure
    .input(z.string())
    .mutation(async ({ input }, ctx) => {
      const user = await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          expoPushToken: input,
        },
      });
      return { jwt: createAccessToken(user), user };
    }),

  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.user.delete({ where: { id: input } });
    }),

  update: publicProcedure.input(UserSchema).mutation(async ({ input }) => {
    return await prisma.user.update({ where: { id: input.id }, data: input });
  }),
});
function createAccessToken(user: import(".prisma/client").User | null): any {
  throw new Error("Function not implemented.");
}
