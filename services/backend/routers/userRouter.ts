/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../../.env" });
import { z } from "zod";
import { publicProcedure, router, authedProcedure } from "../trpc";
import {
  UserSchema,
  LoginInfoSchema,
  SignUpInfoSchema,
} from "@safe-eats/types/userTypes";
import { prisma } from "@safe-eats/db";
import { createAccessToken } from "../jwt";
import bcrypt from "bcrypt";

// create a global event emitter (could be replaced by redis, etc)
export const userRouter = router({
  googleAuth: publicProcedure
    .input(z.string())
    .output(z.object({ jwt: z.string(), user: UserSchema }))
    .mutation(async ({ input }) => {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: {
          Authorization: `Bearer ${input}`,
        },
      });
      const { email, name } = await res.json();
      const dbUser = await prisma.user.upsert({
        where: {
          email,
        },
        update: {},
        create: {
          email,
          name,
        },
      });
      const user = UserSchema.parse(dbUser);
      return { jwt: createAccessToken(user), user };
    }),

  passwordSignIn: publicProcedure
    .input(LoginInfoSchema)
    .output(z.object({ jwt: z.string(), user: UserSchema }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!user || user.hashedPassword === null) {
        throw new Error("Invalid credentials");
      }

      const valid = await bcrypt.compare(input.password, user.hashedPassword);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      return { jwt: createAccessToken(user), user };
    }),

  passwordSignUp: publicProcedure
    .input(SignUpInfoSchema)
    .output(z.object({ jwt: z.string(), user: UserSchema }))
    .mutation(async ({ input: { email, password, name } }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.upsert({
        where: {
          email,
        },
        update: {},
        create: {
          email,
          hashedPassword,
          name,
        },
      });
      return { jwt: createAccessToken(user), user };
    }),

  setExpoPushToken: authedProcedure
    .input(z.string())
    .output(z.object({ jwt: z.string(), user: UserSchema }))
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.update({
        where: {
          id: ctx?.user?.id,
        },
        data: {
          expoPushToken: input,
        },
      });
      return { jwt: createAccessToken(user), user };
    }),

  delete: authedProcedure.mutation(async ({ ctx }) => {
    return await prisma.user.delete({ where: { id: ctx.user.id } });
  }),

  update: authedProcedure
    .input(UserSchema)
    .output(z.object({ jwt: z.string(), user: UserSchema }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.id !== input.id) {
        throw new Error("You can only update your own user");
      }
      const user = await prisma.user.update({
        where: { id: input.id },
        data: input,
      });
      return { jwt: createAccessToken(user), user };
    }),
});
