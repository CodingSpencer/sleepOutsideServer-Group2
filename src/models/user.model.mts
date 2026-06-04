import mongodb from "../database/index.mts";
import { Collection } from "mongodb";
import type { User } from "./types.mts";

async function getUserByEmail(email: string): Promise<User | null> {
    const user = await mongodb.getDb().collection<User>("user").findOne({id: email});
    return user;
}

async function createUser(newUser:{email:string, password:string, name:string}) {
    const result = await mongodb.getDb().collection("users").insertOne(newUser)
    return result
}

export default {
    getUserByEmail,
    createUser
}