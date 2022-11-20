import { z } from "zod";
import {
  ApplianceSchema,
  ApplianceWithoutRecipeSchema,
  Temperature,
  TemperatureWithIdSchema,
  StatusMessageWithIdSchema,
  StatusMessage,
  IdSchema,
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

  get: authedProcedure.input(IdSchema).query(async ({ input }) => {
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
      orderBy: {
        name: "asc",
      },
    });
    return appliances;
  }),

  delete: authedProcedure.input(IdSchema).mutation(async ({ input }) => {
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
    .input(IdSchema)
    .subscription(({ input: connectedApplianceId }) => {
      console.log("onTemperatureUpdate");
      return observable<Temperature>((emit) => {
        console.log("onTemperatureUpdate: observable");
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
    .input(IdSchema)
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

  updateStatus: publicProcedure
    .input(StatusMessageWithIdSchema)
    .mutation(async ({ input }) => {
      ee.emit("statusUpdate", input);
    }),

  cookingStop: publicProcedure
    .input(z.object({ id: IdSchema }))
    .mutation(async ({ input }) => {
      const appliance = await prisma.appliance.update({
        where: { id: input.id },
        data: {
          cookingStartTime: null,
          recipe: {
            disconnect: true,
          },
        },
      });

      ee.emit("statusUpdate", {
        id: input.id,
        type: "cookingEnd",
        message: `${appliance.name} has stopped cooking`,
      });

      const expoPushTokensObjList = await prisma.user.findMany({
        where: {
          appliances: {
            some: {
              id: input.id,
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

  setRecipe: publicProcedure
    .input(z.object({ id: IdSchema, qrCode: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const qrCode = await prisma.qRCode.findUnique({
        where: { id: input.qrCode },
      });
      if (!qrCode) {
        throw new Error("Invalid QR Code");
      }
      // await prisma.qRCode.delete({ where: { id: input.qrCode } });
      const appliance = await prisma.appliance.update({
        where: { id: input.id },
        data: {
          recipe: {
            connect: {
              id: qrCode.recipeId,
            },
          },
        },
        include: {
          recipe: true,
        },
      });

      if (!appliance || !appliance.recipe) {
        throw new Error("Invalid Appliance");
      }

      appliance.recipe.expiryDate += qrCode.createdAt.getTime();

      if (appliance.recipe.expiryDate < Date.now()) {
        console.log("Recipe has expired");
        const emitVal = {
          id: input.id,
          type: "alarm",
          message: `${appliance.recipe.name} is expired`,
        };
        ee.emit("statusUpdate", emitVal);
        // throw new Error("Recipe has expired");
      }

      return appliance.recipe;
    }),

  cookingStart: publicProcedure
    .input(z.object({ id: IdSchema }))
    .mutation(async ({ input }) => {
      const appliance = await prisma.appliance.findUnique({
        where: { id: input.id },
        include: {
          recipe: true,
        },
      });

      if (!appliance) {
        throw new Error("Appliance not found");
      }

      if (!appliance.recipe) {
        throw new Error("Appliance has no recipe assigned to it");
      }

      await prisma.appliance.update({
        where: { id: input.id },
        data: {
          cookingStartTime: new Date(),
        },
      });

      const expoPushTokensObjList = await prisma.user.findMany({
        where: {
          appliances: {
            some: {
              id: input.id,
            },
          },
        },
        select: {
          expoPushToken: true,
        },
      });

      ee.emit("statusUpdate", {
        id: input.id,
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
