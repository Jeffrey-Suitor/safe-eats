import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string(),
});

export type User = z.infer<typeof UserSchema>;
