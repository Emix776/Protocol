import { useState } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Plus, Trash2, Calendar as CalendarIcon, Save, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { WEEK_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ScheduleFormItem {
  dayIndex: number;
  weekType: string;
  subjectName: string;
  teacher: string;
  room: string;
  timeSlot: string;
  itemType: string;
}

export default function ScheduleEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [versionName, setVersionName] = useState("");
  const [items, setItems] = useState<ScheduleFormItem[]>([]);

  const { data: versions, isLoading: isLoadingVersions } = useQuery({
    queryKey: [api.schedules.versions.path],
    queryFn: async () => {
      const res = await fetch(api.schedules.versions.path);
      if (!res.ok) throw new Error("Failed to fetch versions");
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.schedules.save.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save schedule");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Erfolg", description: "Stundenplan-Version gespeichert." });
      queryClient.invalidateQueries({ queryKey: [api.schedules.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.schedules.versions.path] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Fehler", description: "Konnte Stundenplan nicht speichern." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(api.schedules.deleteVersion.path.replace(":id", id.toString()), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete version");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gelöscht", description: "Version wurde entfernt." });
      queryClient.invalidateQueries({ queryKey: [api.schedules.versions.path] });
    }
  });

  const loadVersion = async (version: any) => {
    try {
      const res = await fetch(`${api.schedules.list.path}?date=${version.effectiveDate}`);
      if (!res.ok) throw new Error("Failed to load version details");
      const scheduleItems = await res.json();
      
      setEffectiveDate(parseISO(version.effectiveDate));
      setVersionName(version.name);
      setItems(scheduleItems.map((item: any) => ({
        dayIndex: item.dayIndex,
        weekType: item.weekType,
        subjectName: item.subjectName,
        teacher: item.teacher,
        room: item.room,
        timeSlot: item.timeSlot,
        itemType: item.itemType
      })));
      
      toast({ description: `Version "${version.name}" geladen.` });
    } catch (err) {
      toast({ variant: "destructive", description: "Fehler beim Laden der Version." });
    }
  };

  const addItem = () => {
    setItems([...items, {
      dayIndex: 1,
      weekType: "both",
      subjectName: "",
      teacher: "",
      room: "",
      timeSlot: "1. - 2. Std",
      itemType: "double"
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<ScheduleFormItem>) => {
    setItems(items.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const handleSave = () => {
    if (items.length === 0) {
      toast({ variant: "destructive", description: "Bitte füge mindestens ein Fach hinzu." });
      return;
    }
    
    const data = {
      effectiveDate: format(effectiveDate, "yyyy-MM-dd"),
      name: versionName || undefined,
      items: items.map(item => ({
        ...item,
        subjectId: `${item.dayIndex}-${item.weekType}-${item.subjectName.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 5)}`
      }))
    };
    
    saveMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-8 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Plan-Editor</h1>
          <p className="text-muted-foreground text-sm">Verwalte deine Stundenplan-Versionen</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="shadow-lg shadow-primary/20">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Speichern
        </Button>
      </header>

      <div className="grid gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Version & Datum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Name der Version (optional)</Label>
              <Input 
                placeholder="z.B. Q2 2. Halbjahr" 
                value={versionName} 
                onChange={(e) => setVersionName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Gültig ab</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-medium", !effectiveDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {effectiveDate ? format(effectiveDate, "dd.MM.yyyy", { locale: de }) : <span>Datum wählen</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={effectiveDate} onSelect={(date) => date && setEffectiveDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Existing Versions List */}
        {versions && versions.length > 0 && (
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gespeicherte Versionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {versions.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group">
                  <div>
                    <span className="font-bold text-sm block">{v.name}</span>
                    <span className="text-[10px] text-muted-foreground">Gültig ab {format(parseISO(v.effectiveDate), "dd.MM.yyyy")}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => loadVersion(v)} className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(v.id)} className="h-8 w-8 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Fächer</h3>
          {items.map((item, index) => (
            <Card key={index} className="glass-card border-white/5 relative overflow-hidden group">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Tag</Label>
                    <Select value={item.dayIndex.toString()} onValueChange={(val) => updateItem(index, { dayIndex: parseInt(val) })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEK_DAYS.map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Woche</Label>
                    <Select value={item.weekType} onValueChange={(val) => updateItem(index, { weekType: val })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Beide</SelectItem>
                        <SelectItem value="A">Woche A</SelectItem>
                        <SelectItem value="B">Woche B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Fach / Lehrer / Raum</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input 
                      placeholder="Fach" 
                      value={item.subjectName} 
                      onChange={(e) => updateItem(index, { subjectName: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input 
                      placeholder="Lehrer" 
                      value={item.teacher} 
                      onChange={(e) => updateItem(index, { teacher: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                    <Input 
                      placeholder="Raum" 
                      value={item.room} 
                      onChange={(e) => updateItem(index, { room: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Zeit</Label>
                    <Input 
                      placeholder="1. - 2. Std" 
                      value={item.timeSlot} 
                      onChange={(e) => updateItem(index, { timeSlot: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Typ</Label>
                    <Select value={item.itemType} onValueChange={(val) => updateItem(index, { itemType: val })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="double">Doppelstunde</SelectItem>
                        <SelectItem value="single">Einzelstunde</SelectItem>
                        <SelectItem value="break">Pause/Frei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem(index)}
                  className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="outline" onClick={addItem} className="w-full border-dashed border-white/10 py-8 hover:bg-white/5">
          <Plus className="w-4 h-4 mr-2" /> Fach hinzufügen
        </Button>
      </div>
    </div>
  );
}