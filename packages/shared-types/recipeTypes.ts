import { z } from "zod";

export const temperatureUnits = ["C", "F"] as const;
export const applianceTypes = ["Toaster_Oven"] as const;
export const applianceModes = [
  "Bake",
  "Broil",
  "Convection",
  "Rotisserie",
] as const;

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  cookingTime: z.number(),
  expiryDate: z.number(),
  appliance: z.enum(applianceTypes),
  temperature: z.number(),
  temperatureUnit: z.enum(temperatureUnits),
  applianceMode: z.enum(applianceModes),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const defaultRecipe: Recipe = {
  name: "",
  description: "",
  cookingTime: 0,
  expiryDate: 0,
  appliance: "Toaster_Oven",
  temperature: 0,
  temperatureUnit: "C",
  applianceMode: "Bake",
};
