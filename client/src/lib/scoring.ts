import type { DailyEntry } from "@shared/schema";

interface EntryData {
  homework: boolean;
  question: boolean;
  contributions: number;
  qualityLevel: number;
  earlyContribution: boolean;
  selfAssessment: number;
}

export const MAX_DAILY_SCORE_POINTS = 
  25 + // Homework
  15 + // Question
  30 + // Contributions (3 * 10)
  15 + // Quality (3 * 5)
  5 +  // Early
  10;  // Self assessment (5 * 2)
  // Total: 100

export function calculateEntryScore(entry: EntryData): number {
  let score = 0;
  
  if (entry.homework) score += 25;
  if (entry.question) score += 15;
  
  // Cap contributions at 3 for calculation purposes
  score += Math.min(entry.contributions, 3) * 10;
  
  // Quality level 0-3 * 5
  score += entry.qualityLevel * 5;
  
  if (entry.earlyContribution) score += 5;
  
  // Self assessment 1-5 * 2
  score += entry.selfAssessment * 2;
  
  return score;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-violet-400';
  if (score >= 75) return 'text-emerald-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-slate-400';
}
