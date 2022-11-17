import { z } from "zod";
import { Expo } from "expo-server-sdk";
import { Appliance, Recipe } from "@prisma/client";
import { msToHMS } from "@safe-eats/helpers/timeConverter";

const pushMessageSchema = z.object({
  to: z.string(),
  title: z.string(),
  body: z.string().optional(),
});

export type PushMessage = z.infer<typeof pushMessageSchema>;
const expo = new Expo();

const isValidPushToken = (token: string) => {
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    return false;
  }
  return true;
};

const sendMessages = async (messages: PushMessage[]) => {
  const chunks = expo.chunkPushNotifications(messages);
  chunks.forEach(async (chunk) => {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  });
};

export const cookingStartPushNotification = async (
  expoPushTokens: string[],
  appliance: Appliance,
  recipe: Recipe
) => {
  const messages: PushMessage[] = [];
  expoPushTokens.forEach((pushToken) => {
    if (!isValidPushToken(pushToken)) return;

    messages.push({
      to: pushToken as string,
      title: `${appliance.name} heating ${recipe.name}`,
      body: `Cooking duration ${msToHMS(recipe.cookingTime)} (HH:MM:SS)`,
    });
  });

  await sendMessages(messages);
};

export const cookingEndPushNotification = async (
  expoPushTokens: string[],
  appliance: Appliance
) => {
  const messages: PushMessage[] = [];
  expoPushTokens.forEach((pushToken) => {
    if (!isValidPushToken(pushToken)) return;

    messages.push({
      to: pushToken as string,
      title: `${appliance.name} done cooking`,
    });
  });

  await sendMessages(messages);
};
