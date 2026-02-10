import { db } from "./db";
import { dailyEntries, type DailyEntry, type InsertDailyEntry, schedules, timetableVersions, type Schedule } from "@shared/schema";
import { and, gte, lte, eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getEntries(from?: string, to?: string): Promise<DailyEntry[]>;
  upsertEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  getScheduleForDate(date: string): Promise<Schedule[]>;
}

export class DatabaseStorage implements IStorage {
  async getEntries(from?: string, to?: string): Promise<DailyEntry[]> {
    const conditions = [];
    if (from) conditions.push(gte(dailyEntries.date, from));
    if (to) conditions.push(lte(dailyEntries.date, to));
    
    return await db.select()
      .from(dailyEntries)
      .where(conditions.length ? and(...conditions) : undefined);
  }

  async upsertEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const [result] = await db.insert(dailyEntries)
      .values(entry)
      .onConflictDoUpdate({
        target: [dailyEntries.date, dailyEntries.subjectId],
        set: {
          homework: entry.homework,
          question: entry.question,
          contributions: entry.contributions,
          qualityLevel: entry.qualityLevel,
          earlyContribution: entry.earlyContribution,
          selfAssessment: entry.selfAssessment,
          isCancelled: entry.isCancelled,
        }
      })
      .returning();
    return result;
  }

  async getScheduleForDate(date: string): Promise<Schedule[]> {
    // Find the latest version where effectiveDate <= date
    const [version] = await db.select()
      .from(timetableVersions)
      .where(lte(timetableVersions.effectiveDate, date))
      .orderBy(desc(timetableVersions.effectiveDate))
      .limit(1);

    if (!version) return [];

    return await db.select()
      .from(schedules)
      .where(eq(schedules.versionId, version.id));
  }
}

export const storage = new DatabaseStorage();
