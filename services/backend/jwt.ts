import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../../.env" });
import { User } from "@safe-eats/types/userTypes";
import jwt from "jsonwebtoken";

export const createAccessToken = (user: User) => {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET not set");
  }
  return jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

export const decryptAccessToken = (token: string) => {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET not set");
  }
  return jwt.verify(token, process.env.TOKEN_SECRET);
};
