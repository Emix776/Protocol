import { db } from "./db";
import { dailyEntries, type DailyEntry, type InsertDailyEntry } from "@shared/schema";
import { and, gte, lte, eq, sql } from "drizzle-orm";

export interface IStorage {
  getEntries(from?: string, to?: string): Promise<DailyEntry[]>;
  upsertEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
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
        }
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
