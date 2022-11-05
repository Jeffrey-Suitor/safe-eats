import { z } from "zod";

export const qrCodeSchema = z.object({
  qrCodeId: z.string().uuid(),
  recipeId: z.string().uuid(),
});

export type QRCode = z.infer<typeof qrCodeSchema>;
