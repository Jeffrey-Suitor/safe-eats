import { z } from "zod";

export const applianceTypes = ["Toaster_Oven"] as const;
export const applianceModes = [
  "Bake",
  "Broil",
  "Convection",
  "Rotisserie",
] as const;

export const ApplianceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  type: z.enum(applianceTypes),
  temperatureC: z.number(),
  temperatureF: z.number(),
  cookingStartTime: z.number(),
  mode: z.enum(applianceModes),
});

export type Appliance = z.infer<typeof ApplianceSchema>;
