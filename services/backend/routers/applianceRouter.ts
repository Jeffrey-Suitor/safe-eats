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
import { router, authedProcedure, ee, publicProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";

export const applianceRouter = router({
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
      console.log("initial connectedApplianceId", connectedApplianceId);
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
});
