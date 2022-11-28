import { z } from "zod";
import { DefinedRecipeSchema } from "./recipeTypes";
import { applianceTypes } from "./applianceConstants";

export const IdSchema = z.string();

export const TemperatureSchema = z.object({
  temperatureC: z.number(),
  temperatureF: z.number(),
});

export const TemperatureWithIdSchema = TemperatureSchema.extend({
  id: IdSchema,
});

export const ApplianceSchema = TemperatureWithIdSchema.extend({
  name: z.string(),
  type: z.enum(applianceTypes),
  cookingStartTime: z.date().nullable(),
  recipe: DefinedRecipeSchema.nullable(),
  BLEId: z.string(),
});

export const ApplianceWithoutRecipeSchema = ApplianceSchema.omit({
  recipe: true,
});

export const StatusMessageSchema = z.object({
  type: z.enum(["cookingStart", "cookingEnd", "alarm"]),
  message: z.string(),
});

export const StatusMessageWithIdSchema = StatusMessageSchema.extend({
  id: IdSchema,
});

export const ApplianceInfoSchema = z.object({
  name: z.string(),
  type: z.enum(applianceTypes),
  ssid: z.string(),
  pass: z.string(),
});

export type Appliance = z.infer<typeof ApplianceSchema>;
export type Temperature = z.infer<typeof TemperatureSchema>;
export type StatusMessage = z.infer<typeof StatusMessageSchema>;
export type ApplianceWithoutRecipe = z.infer<
  typeof ApplianceWithoutRecipeSchema
>;
export type ApplianceInfo = z.infer<typeof ApplianceInfoSchema>;

export const defaultAppliance: ApplianceWithoutRecipe = {
  id: "00000000-0000-0000-0000-000000000000",
  BLEId: "00000000-0000-0000-0000-000000000000",
  name: "SafeEats",
  type: "Toaster_Oven",
  temperatureC: 0,
  temperatureF: 0,
  cookingStartTime: new Date(),
};
