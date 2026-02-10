import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type EntryInput, type EntryResponse } from "@shared/routes";

// GET /api/entries
export function useEntries(from?: string, to?: string) {
  const queryKey = [api.entries.list.path, from, to].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.entries.list.path, window.location.origin);
      if (from) url.searchParams.append("from", from);
      if (to) url.searchParams.append("to", to);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch entries");
      return api.entries.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/entries (Sync/Upsert)
export function useSyncEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EntryInput) => {
      const validated = api.entries.sync.input.parse(data);
      const res = await fetch(api.entries.sync.path, {
        method: api.entries.sync.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.entries.sync.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to sync entry");
      }
      return api.entries.sync.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entries.list.path] });
    },
  });
}

// GET /api/schedules
export function useSchedule(date: string) {
  const queryKey = [api.schedules.list.path, date];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.schedules.list.path, window.location.origin);
      url.searchParams.append("date", date);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return api.schedules.list.responses[200].parse(await res.json());
    },
  });
}
