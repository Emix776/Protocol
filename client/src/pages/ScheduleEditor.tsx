import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Plus, Trash2, Calendar as CalendarIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [items, setItems] = useState<ScheduleFormItem[]>([]);

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
    },
    onError: () => {
      toast({ variant: "destructive", title: "Fehler", description: "Konnte Stundenplan nicht speichern." });
    }
  });

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
      items: items.map(item => ({
        ...item,
        subjectId: `${item.dayIndex}-${item.weekType}-${item.subjectName.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 5)}`
      }))
    };
    
    saveMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-8 max-w-2xl mx-auto space-y-6">
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

      <Card className="glass-card border-white/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Start-Datum</CardTitle>
        </CardHeader>
        <CardContent>
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
          <p className="text-[10px] text-muted-foreground mt-2 italic">Dieser Plan gilt ab diesem Datum für alle zukünftigen Tage.</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
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
                    placeholder="Fach (z.B. Mathe)" 
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
  );
}