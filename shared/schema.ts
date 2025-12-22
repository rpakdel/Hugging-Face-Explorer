import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const operations = pgTable("operations", {
  id: serial("id").primaryKey(),
  task: text("task").notNull(), // e.g., "sentiment-analysis", "summarization"
  input: text("input").notNull(),
  output: jsonb("output").notNull(), // Store the flexible output from the model
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOperationSchema = createInsertSchema(operations).omit({
  id: true,
  createdAt: true,
});

export type Operation = typeof operations.$inferSelect;
export type InsertOperation = z.infer<typeof insertOperationSchema>;
