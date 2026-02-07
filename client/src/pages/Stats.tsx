import { useMemo } from "react";
import { useEntries } from "@/hooks/use-entries";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { calculateEntryScore } from "@/lib/scoring";
import { Loader2, TrendingUp, Award, BookOpen, Brain, BarChart3 } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";

export default function Stats() {
  // Fetch last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const from = format(thirtyDaysAgo, "yyyy-MM-dd");
  const to = format(today, "yyyy-MM-dd");
  
  const { data: entries, isLoading } = useEntries(from, to);

  // Compute Statistics
  const stats = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    let totalPoints = 0;
    let maxPossiblePoints = 0;
    let homeworkCount = 0;
    let questionCount = 0;
    let contributionsSum = 0;

    // Daily Average Chart Data
    const dailyScores: Record<string, { date: string; score: number; count: number }> = {};
    
    entries.forEach(entry => {
      const score = calculateEntryScore(entry);
      totalPoints += score;
      maxPossiblePoints += 100;
      if (entry.homework) homeworkCount++;
      if (entry.question) questionCount++;
      contributionsSum += entry.contributions;

      // Group by date
      if (!dailyScores[entry.date]) {
        dailyScores[entry.date] = { date: format(new Date(entry.date), "dd.MM"), score: 0, count: 0 };
      }
      dailyScores[entry.date].score += score;
      dailyScores[entry.date].count += 1;
    });

    const chartData = Object.values(dailyScores)
      .map(d => ({ ...d, average: Math.round(d.score / d.count) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 active days

    const overallAverage = Math.round((totalPoints / maxPossiblePoints) * 100) || 0;
    const homeworkRate = Math.round((homeworkCount / entries.length) * 100) || 0;
    const avgContributions = (contributionsSum / entries.length).toFixed(1);

    // Subject Performance (Mock mapping based on IDs for now as strict mapping is complex without schedule context)
    // In a real app, we'd join with subject names. Here we approximate from ID prefixes.
    const subjectScores: Record<string, { total: number; count: number }> = {};
    
    entries.forEach(entry => {
      // Very rough parsing: "mo-1" -> "Montag 1" etc. or we just group by prefix if available
      // Ideally we need the subject map. For now, let's just use the raw Subject ID or simplified
      const id = entry.subjectId; 
      if (!subjectScores[id]) subjectScores[id] = { total: 0, count: 0 };
      subjectScores[id].total += calculateEntryScore(entry);
      subjectScores[id].count += 1;
    });

    const subjectPerformance = Object.entries(subjectScores)
      .map(([id, data]) => ({
        id,
        average: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);

    return {
      chartData,
      overallAverage,
      homeworkRate,
      avgContributions,
      questionCount,
      subjectPerformance
    };
  }, [entries]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-white/5 mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Keine Daten verfügbar</h2>
        <p className="text-muted-foreground mt-2">Beginne mit dem Tracking deiner Fächer, um Statistiken zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dein Fortschritt</h1>
        <p className="text-muted-foreground">Statistik der letzten 30 Tage</p>
      </header>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award className="w-12 h-12 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Durchschnitt</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-display font-bold text-primary">{stats.overallAverage}</span>
            <span className="text-sm font-medium text-primary/70">%</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-12 h-12 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Hausaufgaben</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-display font-bold text-emerald-400">{stats.homeworkRate}</span>
            <span className="text-sm font-medium text-emerald-400/70">%</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain className="w-12 h-12 text-violet-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Ø Beiträge</p>
          <div className="mt-1">
            <span className="text-4xl font-display font-bold text-violet-400">{stats.avgContributions}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Fragen</p>
          <div className="mt-1">
            <span className="text-4xl font-display font-bold text-blue-400">{stats.questionCount}</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 rounded-2xl mb-8 border border-white/5">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Leistungsverlauf (Ø Punkte)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                {stats.chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.average > 80 ? '#8b5cf6' : entry.average > 60 ? '#6366f1' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent High Performers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold px-1">Top Leistungen (nach ID)</h3>
        {stats.subjectPerformance.map((subj, i) => (
          <div key={subj.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-muted-foreground">
                {i + 1}
              </div>
              <div>
                <span className="font-mono text-sm text-muted-foreground block mb-0.5">{subj.id.toUpperCase()}</span>
                <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${subj.average}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="text-xl font-bold font-display text-foreground">
              {subj.average} <span className="text-sm font-normal text-muted-foreground">pkt</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
