import { z } from "zod";
import { applianceTypes, applianceModes } from "./applianceConstants";

export const temperatureUnits = ["C", "F"] as const;

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  cookingTime: z.number(),
  expiryDate: z.number(),
  applianceType: z.enum(applianceTypes),
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
  applianceType: "Toaster_Oven",
  temperature: 0,
  temperatureUnit: "C",
  applianceMode: "Bake",
};
