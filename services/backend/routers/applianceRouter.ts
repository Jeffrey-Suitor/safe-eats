import { z } from "zod";
import {
  ApplianceSchema,
  ApplianceWithoutRecipeSchema,
  Temperature,
  TemperatureWithIdSchema,
  StatusMessageWithIdSchema,
  StatusMessage,
} from "@safe-eats/types/applianceTypes";
import { prisma } from "@safe-eats/db";
import { router, authedProcedure, ee, publicProcedure } from "../utils/trpc";
import { observable } from "@trpc/server/observable";
import {
  cookingEndPushNotification,
  cookingStartPushNotification,
} from "../utils/pushNotifications";

export const applianceRouter = router({
  exists: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    const appliance = await prisma.appliance.findUnique({
      where: {
        id: input,
      },
    });
    return appliance != null;
  }),

  add: authedProcedure
    .input(ApplianceSchema)
    .mutation(async ({ input, ctx }) => {
      const { recipe } = input;
      const applianceInfo = ApplianceWithoutRecipeSchema.parse(input);
      const appliance = await prisma.appliance.create({
        data: {
          ...applianceInfo,
          users: {
            connect: {
              id: ctx.user.id,
            },
          },
          recipe: {
            connect: {
              id: recipe?.id ? recipe?.id : undefined,
            },
          },
        },
      });
      return appliance;
    }),

  byId: authedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await prisma.appliance.findUnique({
      where: { id: input },
      include: { recipe: true },
    });
  }),

  all: authedProcedure.query(async ({ ctx }) => {
    const appliances = await prisma.appliance.findMany({
      where: {
        users: {
          some: {
            id: ctx.user.id,
          },
        },
      },
      include: { recipe: true },
    });
    return appliances;
  }),

  delete: authedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      return await prisma.appliance.delete({ where: { id: input } });
    }),

  update: authedProcedure.input(ApplianceSchema).mutation(async ({ input }) => {
    const { recipe } = input;
    const applianceInfo = ApplianceWithoutRecipeSchema.parse(input);
    return await prisma.appliance.update({
      where: { id: input.id },
      data: {
        ...applianceInfo,
        recipe: {
          connect: {
            id: recipe?.id ? recipe?.id : undefined,
          },
        },
      },
    });
  }),

  onTemperatureUpdate: publicProcedure
    .input(z.string())
    .subscription(({ input: connectedApplianceId }) => {
      return observable<Temperature>((emit) => {
        const listener = (val: unknown) => {
          const { id, temperatureC, temperatureF } =
            TemperatureWithIdSchema.parse(val);
          if (id === connectedApplianceId) {
            emit.next({ temperatureC, temperatureF });
          }
        };
        ee.on("temperatureUpdate", listener);
        return () => {
          ee.off("temperatureUpdate", listener);
        };
      });
    }),

  updateTemperature: publicProcedure
    .input(TemperatureWithIdSchema)
    .mutation(async ({ input }) => {
      ee.emit("temperatureUpdate", input);
      return await prisma.appliance.update({
        where: { id: input.id },
        data: {
          temperatureC: input.temperatureC,
          temperatureF: input.temperatureF,
        },
      });
    }),

  onStatusUpdate: publicProcedure
    .input(z.string())
    .subscription(({ input: connectedApplianceId }) => {
      return observable<StatusMessage>((emit) => {
        const listener = (val: unknown) => {
          const { id, type, message } = StatusMessageWithIdSchema.parse(val);
          if (id === connectedApplianceId) {
            emit.next({ type, message });
          }
        };
        ee.on("statusUpdate", listener);
        return () => {
          ee.off("statusUpdate", listener);
        };
      });
    }),

  statusUpdate: publicProcedure
    .input(StatusMessageWithIdSchema)
    .mutation(async ({ input }) => {
      ee.emit("statusUpdate", input);
    }),

  cookingStop: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      const appliance = await prisma.appliance.update({
        where: { id: input },
        data: {
          recipe: {
            disconnect: true,
          },
        },
      });

      ee.emit("statusUpdate", {
        id: input,
        type: "cookingEnd",
        message: `${appliance.name} has stopped cooking`,
      });

      const expoPushTokensObjList = await prisma.user.findMany({
        where: {
          appliances: {
            some: {
              id: input,
            },
          },
        },
        select: {
          expoPushToken: true,
        },
      });

      const expoPushTokens = expoPushTokensObjList
        .map((obj) => obj.expoPushToken)
        .filter((token) => token !== null) as string[];

      await cookingEndPushNotification(expoPushTokens, appliance);
      return `Users have been notified that ${appliance.name} is done cooking`;
    }),

  cookingStart: publicProcedure
    .input(
      z.object({ applianceId: z.string().uuid(), qrCode: z.string().uuid() })
    )
    .mutation(async ({ input }) => {
      const recipeId = await prisma.qRCode.findUnique({
        where: { id: input.qrCode },
        select: { recipeId: true },
      });
      if (!recipeId) {
        throw new Error("Invalid QR Code");
      }
      await prisma.qRCode.delete({ where: { id: input.qrCode } });
      const appliance = await prisma.appliance.update({
        where: { id: input.applianceId },
        data: {
          recipe: {
            connect: {
              id: recipeId.recipeId,
            },
          },
        },
        include: {
          recipe: true,
        },
      });

      if (!appliance) {
        throw new Error("Appliance not found");
      }

      if (!appliance.recipe) {
        throw new Error("Recipe could not be linked to appliance");
      }

      const expoPushTokensObjList = await prisma.user.findMany({
        where: {
          appliances: {
            some: {
              id: input.applianceId,
            },
          },
        },
        select: {
          expoPushToken: true,
        },
      });

      ee.emit("statusUpdate", {
        id: input.applianceId,
        type: "cookingStart",
        message: `${appliance.name} is cooking ${appliance.recipe.name}`,
      });

      const expoPushTokens = expoPushTokensObjList
        .map((obj) => obj.expoPushToken)
        .filter((token) => token !== null) as string[];

      cookingStartPushNotification(expoPushTokens, appliance, appliance.recipe);

      return `Users have been notified that ${appliance.name} is heating ${appliance.recipe.name}`;
    }),
});
