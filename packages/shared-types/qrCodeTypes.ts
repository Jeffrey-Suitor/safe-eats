import { z } from "zod";

export const qrCodeSchema = z.object({
  id: z.string().uuid(),
  recipeId: z.string().uuid(),
});

export type QRCode = z.infer<typeof qrCodeSchema>;
