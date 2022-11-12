import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["SUPERADMIN", "ADMIN", "USER"]),
  expoPushToken: z.string().nullable(),
});

export const SignUpInfoSchema = UserSchema.pick({
  email: true,
  name: true,
}).extend({
  password: z.string().min(8),
});

export const LoginInfoSchema = SignUpInfoSchema.pick({
  email: true,
  password: true,
});

export const UnknownUserSchema = UserSchema.extend({
  id: z.string().uuid().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UnknownUser = z.infer<typeof UnknownUserSchema>;
export type SignUpInfo = z.infer<typeof SignUpInfoSchema>;
export type LoginInfo = z.infer<typeof LoginInfoSchema>;
