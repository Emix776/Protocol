import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET entries (list)
  app.get(api.entries.list.path, async (req, res) => {
    try {
      const { from, to } = req.query;
      const entries = await storage.getEntries(
        typeof from === 'string' ? from : undefined,
        typeof to === 'string' ? to : undefined
      );
      res.json(entries);
    } catch (err) {
      console.error('Error fetching entries:', err);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // POST entry (upsert)
  app.post(api.entries.sync.path, async (req, res) => {
    try {
      const input = api.entries.sync.input.parse(req.body);
      const entry = await storage.upsertEntry(input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error('Error syncing entry:', err);
      res.status(500).json({ message: "Failed to sync entry" });
    }
  });

  // GET schedule for date
  app.get(api.schedules.list.path, async (req, res) => {
    try {
      const { date } = api.schedules.list.input.parse(req.query);
      const schedule = await storage.getScheduleForDate(date);
      res.json(schedule);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error('Error fetching schedule:', err);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  return httpServer;
}
