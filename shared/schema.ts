import { pgTable, text, serial, integer, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const dailyEntries = pgTable("daily_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  subjectId: text("subject_id").notNull(), // e.g., 'mo-1'
  
  // Tracking metrics
  homework: boolean("homework").default(false).notNull(),
  question: boolean("question").default(false).notNull(),
  contributions: integer("contributions").default(0).notNull(),
  qualityLevel: integer("quality_level").default(0).notNull(),
  earlyContribution: boolean("early_contribution").default(false).notNull(),
  selfAssessment: integer("self_assessment").default(0).notNull(),
}, (t) => ({
  // Ensure one entry per subject per day
  unq: unique().on(t.date, t.subjectId),
}));

// === BASE SCHEMAS ===
export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type DailyEntry = typeof dailyEntries.$inferSelect;
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;

// Request types
export type CreateEntryRequest = InsertDailyEntry;
export type UpdateEntryRequest = Partial<InsertDailyEntry>;

// Response types
export type DailyEntryResponse = DailyEntry;
