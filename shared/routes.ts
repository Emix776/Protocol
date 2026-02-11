import { z } from 'zod';
import { insertDailyEntrySchema, dailyEntries, schedules } from './schema';

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
  schedules: {
    list: {
      method: 'GET' as const,
      path: '/api/schedules' as const,
      input: z.object({
        date: z.string().optional(), // ISO Date string to find the correct version
      }),
      responses: {
        200: z.array(z.custom<typeof schedules.$inferSelect>()),
      },
    },
    versions: {
      method: 'GET' as const,
      path: '/api/timetable-versions' as const,
      responses: {
        200: z.array(z.custom<typeof timetableVersions.$inferSelect>()),
      },
    },
    deleteVersion: {
      method: 'DELETE' as const,
      path: '/api/timetable-versions/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/schedules' as const,
      input: z.object({
        effectiveDate: z.string(),
        name: z.string().optional(),
        items: z.array(z.object({
          dayIndex: z.number(),
          weekType: z.string(),
          subjectId: z.string(),
          subjectName: z.string(),
          teacher: z.string(),
          room: z.string(),
          timeSlot: z.string(),
          itemType: z.string(),
        })),
      }),
      responses: {
        200: z.object({ message: z.string(), versionId: z.number() }),
      },
    }
  }
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
