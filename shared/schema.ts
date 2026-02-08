import { pgTable, text, serial, integer, boolean, unique, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

/**
 * Timetable versioning table.
 * Each version starts being effective from 'effectiveDate'.
 */
export const timetableVersions = pgTable("timetable_versions", {
  id: serial("id").primaryKey(),
  effectiveDate: text("effective_date").notNull(), // YYYY-MM-DD
  name: text("name").notNull().default("Standardplan"),
});

/**
 * Individual schedule items linked to a version.
 */
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => timetableVersions.id).notNull(),
  dayIndex: integer("day_index").notNull(), // 0=Sunday, 1=Monday...
  weekType: text("week_type").notNull().default("both"), // "A", "B", or "both"
  
  subjectId: text("subject_id").notNull(),
  subjectName: text("subject_name").notNull(),
  teacher: text("teacher").notNull(),
  room: text("room").notNull(),
  timeSlot: text("time_slot").notNull(), // e.g., "1. - 2. Std"
  itemType: text("item_type").notNull(), // "single", "double", "break"
});

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
  isCancelled: boolean("is_cancelled").default(false).notNull(),
}, (t) => ({
  // Ensure one entry per subject per day
  unq: unique().on(t.date, t.subjectId),
}));

// === BASE SCHEMAS ===
export const insertTimetableVersionSchema = createInsertSchema(timetableVersions).omit({ id: true });
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });
export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type TimetableVersion = typeof timetableVersions.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type DailyEntry = typeof dailyEntries.$inferSelect;

export type InsertTimetableVersion = z.infer<typeof insertTimetableVersionSchema>;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;

// Request types
export type CreateEntryRequest = InsertDailyEntry;
export type UpdateEntryRequest = Partial<InsertDailyEntry>;

// Response types
export type DailyEntryResponse = DailyEntry;
