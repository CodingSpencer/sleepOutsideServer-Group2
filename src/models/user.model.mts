import mongodb from "../database/index.mts";
import type { User } from "./types.mts";

async function getUserByEmail(email: string): Promise<User | null> {
  const user = await mongodb
    .getDb()
    .collection<User>("users")
    .findOne({ email: email });

  return user;
}

async function createUser(newUser: {
  email: string;
  password_hash: string;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
}) {
  const result = await mongodb
    .getDb()
    .collection("users")
    .insertOne(newUser);

  return result;
}

export default {
  getUserByEmail,
  createUser,
};