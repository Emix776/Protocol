import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Clock,
  Minus,
  Plus
} from "lucide-react";
import { QUALITY_LEVELS, SELF_ASSESSMENT_LABELS, type ScheduleItem } from "@/lib/constants";
import { calculateEntryScore, getScoreColor } from "@/lib/scoring";
import { useSyncEntry } from "@/hooks/use-entries";
import type { DailyEntry } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  item: ScheduleItem;
  date: Date;
  entry?: DailyEntry;
}

export function SubjectCard({ item, date, entry }: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const syncEntry = useSyncEntry();
  
  // Local state initialized from prop, or defaults
  const [formData, setFormData] = useState({
    homework: false,
    question: false,
    contributions: 0,
    qualityLevel: 0,
    earlyContribution: false,
    selfAssessment: 0,
    isCancelled: false
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        homework: entry.homework,
        question: entry.question,
        contributions: entry.contributions,
        qualityLevel: entry.qualityLevel,
        earlyContribution: entry.earlyContribution,
        selfAssessment: entry.selfAssessment,
        isCancelled: entry.isCancelled
      });
    } else {
      setFormData({
        homework: false,
        question: false,
        contributions: 0,
        qualityLevel: 0,
        earlyContribution: false,
        selfAssessment: 0,
        isCancelled: false
      });
    }
  }, [entry]);

  const handleUpdate = (updates: Partial<typeof formData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Debounce or immediate sync? For simplicity, immediate sync on significant actions
    syncEntry.mutate({
      date: format(date, "yyyy-MM-dd"),
      subjectId: item.id,
      ...newData
    });
  };

  const score = calculateEntryScore(formData);
  const scoreColor = getScoreColor(score);

  if (item.type === 'break') {
    return (
      <div className="bg-card/30 rounded-xl p-4 border border-dashed border-border/50 flex items-center justify-between text-muted-foreground">
        <span className="font-mono text-sm opacity-50">{item.time}</span>
        <span className="font-medium italic">Freistunde</span>
        <div className="w-8" />
      </div>
    );
  }

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden transition-all duration-300",
      formData.isCancelled && "opacity-60 grayscale-[0.5] border-slate-700/50"
    )}>
      {/* Header - Always Visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-inner transition-colors",
            formData.isCancelled ? "bg-slate-700 text-slate-400" : "bg-primary/10 text-primary"
          )}>
            {item.subject.slice(0, 2)}
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-semibold transition-colors",
              formData.isCancelled ? "text-slate-400 line-through decoration-slate-500/50" : "text-foreground group-hover:text-primary"
            )}>
              {item.subject}
              {formData.isCancelled && (
                <span className="ml-2 text-xs font-bold uppercase tracking-widest text-slate-500 no-underline inline-block py-0.5 px-1.5 bg-slate-800 rounded">
                  Ausfall
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono">{item.time}</span>
              <span>•</span>
              <span>{item.room}</span>
              <span>•</span>
              <span>{item.teacher}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={cn("text-2xl font-bold font-display", formData.isCancelled ? "text-slate-500" : scoreColor)}>
              {formData.isCancelled ? "-" : score}
            </span>
            <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
              Punkte
            </span>
          </div>
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300", 
              isExpanded && "rotate-180"
            )} 
          />
        </div>
      </div>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-black/20"
          >
            <div className="p-4 space-y-6">
              
              {/* Status Row */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 border-border/50">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    formData.isCancelled ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  )} />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Status: {formData.isCancelled ? "Ausfall" : "Regulär"}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate({ isCancelled: !formData.isCancelled });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all",
                    formData.isCancelled 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" 
                      : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                  )}
                >
                  {formData.isCancelled ? "Reaktivieren" : "Als Ausfall markieren"}
                </button>
              </div>

              {!formData.isCancelled && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Toggles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleUpdate({ homework: !formData.homework })}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200",
                    formData.homework 
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]" 
                      : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Hausaufgaben</span>
                </button>
                
                <button
                  onClick={() => handleUpdate({ question: !formData.question })}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200",
                    formData.question
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]" 
                      : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Frage gestellt</span>
                </button>

                <button
                  onClick={() => handleUpdate({ earlyContribution: !formData.earlyContribution })}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200",
                    formData.earlyContribution
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]" 
                      : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Früher Beitrag</span>
                </button>
              </div>

              {/* Counter Row */}
              <div className="bg-card/50 rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold">Beiträge</span>
                  </div>
                  <span className="text-2xl font-bold font-display">{formData.contributions}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleUpdate({ contributions: Math.max(0, formData.contributions - 1) })}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex gap-1 h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i}
                        className={cn(
                          "flex-1 transition-all duration-300",
                          i <= formData.contributions ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => handleUpdate({ contributions: Math.min(10, formData.contributions + 1) })}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quality Selector */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Qualität
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUALITY_LEVELS.map((level) => {
                    const Icon = level.icon;
                    const isSelected = formData.qualityLevel === level.value;
                    return (
                      <button
                        key={level.value}
                        onClick={() => handleUpdate({ qualityLevel: level.value })}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                          isSelected 
                            ? `border-current ${level.color} bg-current/10 shadow-lg` 
                            : "bg-card border-border hover:border-primary/30 text-muted-foreground"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected && level.color)} />
                        <span className="text-sm font-medium">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Self Assessment */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Selbsteinschätzung
                </span>
                <div className="flex justify-between bg-card/50 p-2 rounded-xl border border-border/50">
                  {SELF_ASSESSMENT_LABELS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.selfAssessment === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => handleUpdate({ selfAssessment: item.value })}
                        title={item.label}
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all duration-200 relative",
                          isSelected 
                            ? "bg-white/10 scale-110 shadow-lg z-10" 
                            : "hover:bg-white/5 opacity-50 hover:opacity-100"
                        )}
                      >
                        <Icon className={cn("w-6 h-6 sm:w-7 sm:h-7", isSelected ? item.color : "text-foreground")} />
                        {isSelected && (
                          <span className="absolute -bottom-6 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap text-foreground bg-background px-2 py-0.5 rounded shadow border border-border">
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
