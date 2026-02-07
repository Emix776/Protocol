import { z } from 'zod';
import { insertDailyEntrySchema, dailyEntries } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  entries: {
    list: {
      method: 'GET' as const,
      path: '/api/entries' as const,
      input: z.object({
        from: z.string().optional(), // ISO Date string
        to: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof dailyEntries.$inferSelect>()),
      },
    },
    sync: {
      // Using POST to "upsert" an entry
      method: 'POST' as const,
      path: '/api/entries' as const,
      input: insertDailyEntrySchema,
      responses: {
        200: z.custom<typeof dailyEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
};

// ============================================
// HELPERS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type EntryInput = z.infer<typeof api.entries.sync.input>;
export type EntryResponse = z.infer<typeof api.entries.sync.responses[200]>;
