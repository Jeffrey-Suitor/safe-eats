import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../../.env" });
import { User } from "@safe-eats/types/userTypes";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const accessTokenTable: Record<string, User> = {};
const TokenSchema = z.object({
  uuid: z.string().uuid(),
});

export const createAccessToken = (user: User) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET not set");
  }
  const uuid = uuidv4();
  accessTokenTable[uuid] = user;
  const uuidObj = TokenSchema.parse({ uuid });
  console.log("Access token table in create", accessTokenTable);

  return jwt.sign(uuidObj, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

export const decryptAccessToken = (token: string) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET not set");
  }
  const uuidObj = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const uuid = TokenSchema.parse(uuidObj).uuid;
  console.log("uuid", uuid);
  console.log("access token table", accessTokenTable);
  const user = accessTokenTable[uuid];
  if (!user) {
    throw new Error("Invalid token");
  }
  return user;
};
