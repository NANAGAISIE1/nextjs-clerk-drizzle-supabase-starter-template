import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "editor", "member"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image"),
  clerkUserId: text("clerk_userId").unique(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  role: roleEnum("role").default("member"),
});

export type User = typeof users.$inferSelect; // return type when queried
export type NewUser = typeof users.$inferInsert; // insert type

// const result: User[] = await db.select().from(users);

// export async function insertUser(user: NewUser): Promise<User[]> {
//   return db.insert(users).values(user).returning();
// }
