import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid().nullable(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["SUPERADMIN", "ADMIN", "USER"]),
  pushNotificationToken: z.string().nullable(),
  password: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;
