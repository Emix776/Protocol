import { useState, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { SubjectCard } from "@/components/SubjectCard";
import { useEntries, useSchedule } from "@/hooks/use-entries";
import { WEEK_DAYS } from "@/lib/constants";
import { calculateEntryScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Tracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekA, setWeekA] = useState(true);

  // Fetch entries for the current day
  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const { data: entries, isLoading: isLoadingEntries } = useEntries(formattedDate, formattedDate);
  const { data: rawSchedule, isLoading: isLoadingSchedule } = useSchedule(formattedDate);

  const schedule = useMemo(() => {
    if (!rawSchedule) return [];
    
    const dayIndex = currentDate.getDay();
    const currentWeekType = weekA ? "A" : "B";
    
    return rawSchedule
      .filter(item => {
        if (item.dayIndex !== dayIndex) return false;
        if (item.weekType === "both") return true;
        return item.weekType === currentWeekType;
      })
      .map(item => ({
        id: item.subjectId,
        subject: item.subjectName,
        teacher: item.teacher,
        room: item.room,
        time: item.timeSlot,
        type: item.itemType as 'single' | 'double' | 'break'
      }));
  }, [rawSchedule, currentDate, weekA]);

  const totalScore = schedule.reduce((acc, item) => {
    if (item.type === 'break') return acc;
    const entry = entries?.find(e => e.subjectId === item.id);
    if (!entry || entry.isCancelled) return acc;
    return acc + calculateEntryScore(entry);
  }, 0);

  const maxPossible = schedule.filter(i => {
    if (i.type === 'break') return false;
    const entry = entries?.find(e => e.subjectId === i.id);
    return !entry?.isCancelled;
  }).length * 100;
  
  const progress = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

  const isLoading = isLoadingEntries || isLoadingSchedule;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-white/5 shadow-2xl shadow-black/20">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          
          {/* Top Bar: Week Toggle & Date Nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekA(!weekA)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-white/5 hover:bg-secondary/80 transition-colors"
            >
              {weekA ? (
                <ToggleLeft className="w-5 h-5 text-primary" />
              ) : (
                <ToggleRight className="w-5 h-5 text-indigo-400" />
              )}
              <span className="text-sm font-medium font-display">
                {weekA ? "Woche A" : "Woche B"}
              </span>
            </button>

            <div className="flex items-center bg-card rounded-full p-1 border border-border">
              <button 
                onClick={handlePrevDay}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-4 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold whitespace-nowrap">
                  {format(currentDate, "dd.MM.yyyy")}
                </span>
              </div>

              <button 
                onClick={handleNextDay}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day & Score Display */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {WEEK_DAYS[currentDate.getDay()]}
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {schedule.length} Unterrichtseinheiten
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl font-bold font-display text-primary tracking-tight">
                  {totalScore}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  / {maxPossible} Pkt
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-32 h-2 bg-secondary rounded-full mt-2 overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Subject List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-card rounded-xl border border-white/5" />
            ))}
          </div>
        ) : schedule.length > 0 ? (
          schedule.map((item, index) => (
            <motion.div
              key={`${item.id}-${formattedDate}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SubjectCard
                item={item}
                date={currentDate}
                entry={entries?.find(e => e.subjectId === item.id)}
              />
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-white/5 shadow-xl">
              <CalendarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Kein Unterricht</h3>
              <p className="text-muted-foreground">Genieße deinen freien Tag!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
