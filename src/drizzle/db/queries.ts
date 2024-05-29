import { db } from "..";
import { NewUser, users } from "./schema";

export async function createUser(data: NewUser) {
  await db.insert(users).values(data);
}
