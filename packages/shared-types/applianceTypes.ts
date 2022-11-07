import { z } from "zod";

export const applianceTypes = ["Toaster_Oven"] as const;
export const applianceModes = [
  "Bake",
  "Broil",
  "Convection",
  "Rotisserie",
] as const;

export const ApplianceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(applianceTypes),
  temperatureC: z.number(),
  temperatureF: z.number(),
  cookingStartTime: z.date(),
  recipeId: z.string().uuid().nullable(),
});

export type Appliance = z.infer<typeof ApplianceSchema>;

export const defaultAppliance: Appliance = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Toaster Oven",
  type: "Toaster_Oven",
  temperatureC: 0,
  temperatureF: 0,
  cookingStartTime: new Date(),
  recipeId: null,
};
