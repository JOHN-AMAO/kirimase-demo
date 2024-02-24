import { sql } from "drizzle-orm";
import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { books } from "./books"
import { type getReflecions } from "@/lib/api/reflecions/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const reflecions = pgTable('reflecions', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  content: varchar("content", { length: 256 }).notNull(),
  bookId: varchar("book_id", { length: 256 }).references(() => books.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

});


// Schema for reflecions - used to validate API requests
const baseSchema = createSelectSchema(reflecions).omit(timestamps)

export const insertReflecionSchema = createInsertSchema(reflecions).omit(timestamps);
export const insertReflecionParams = baseSchema.extend({
  bookId: z.coerce.string().min(1)
}).omit({ 
  id: true,
  userId: true
});

export const updateReflecionSchema = baseSchema;
export const updateReflecionParams = baseSchema.extend({
  bookId: z.coerce.string().min(1)
}).omit({ 
  userId: true
});
export const reflecionIdSchema = baseSchema.pick({ id: true });

// Types for reflecions - used to type API request params and within Components
export type Reflecion = typeof reflecions.$inferSelect;
export type NewReflecion = z.infer<typeof insertReflecionSchema>;
export type NewReflecionParams = z.infer<typeof insertReflecionParams>;
export type UpdateReflecionParams = z.infer<typeof updateReflecionParams>;
export type ReflecionId = z.infer<typeof reflecionIdSchema>["id"];
    
// this type infers the return from getReflecions() - meaning it will include any joins
export type CompleteReflecion = Awaited<ReturnType<typeof getReflecions>>["reflecions"][number];

