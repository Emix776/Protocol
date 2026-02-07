import { 
  Circle, 
  CircleDot, 
  CircleDashed,
  HelpCircle,
  Meh,
  Frown,
  Smile,
  Laugh
} from "lucide-react";

export const WEEK_DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export const QUALITY_LEVELS = [
  { value: 0, label: 'Wiederholung', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-400/20' },
  { value: 1, label: 'Sinnvoll', icon: CircleDashed, color: 'text-blue-400', bg: 'bg-blue-400/20' },
  { value: 2, label: 'Transfer', icon: CircleDot, color: 'text-indigo-400', bg: 'bg-indigo-400/20' },
  { value: 3, label: 'Exzellent', icon: CircleDot, color: 'text-violet-400', bg: 'bg-violet-400/20' }
];

export const SELF_ASSESSMENT_LABELS = [
  { value: 1, icon: Frown, label: 'Schwach', color: 'text-red-400' },
  { value: 2, icon: Meh, label: 'Unterdurchschnittlich', color: 'text-orange-400' },
  { value: 3, icon: HelpCircle, label: 'OK', color: 'text-yellow-400' },
  { value: 4, icon: Smile, label: 'Gut', color: 'text-emerald-400' },
  { value: 5, icon: Laugh, label: 'Sehr gut', color: 'text-green-400' }
];

export interface ScheduleItem {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  time: string;
  type: 'single' | 'double' | 'break';
}

export const getScheduleForDay = (date: Date, weekA: boolean): ScheduleItem[] => {
  const dayIndex = date.getDay();
  switch (dayIndex) {
    case 1: // Montag
      return [
        { id: 'mo-1', subject: 'Erdkunde LK', teacher: 'MNG3', room: 'LK4', time: '1. - 2. Std', type: 'double' },
        { id: 'mo-2', subject: 'Mathe LK', teacher: 'RE', room: 'B 208', time: '3. - 4. Std', type: 'double' },
        { id: 'mo-3', subject: 'Deutsch GK', teacher: 'SL', room: 'B 209', time: '5. - 6. Std', type: 'double' },
        { id: 'mo-4', subject: 'Reli GK', teacher: 'BL', room: 'A 211', time: '7. Std', type: 'single' },
      ];
    case 2: // Dienstag
      return [
        { id: 'di-1', subject: 'Informatik GK', teacher: 'DV', room: 'B 113', time: '1. - 2. Std', type: 'double' },
        { id: 'di-free', subject: 'Freistunde', teacher: '-', room: '-', time: '3. - 4. Std', type: 'break' },
        { id: 'di-3', subject: 'Kunst GK', teacher: 'PF', room: 'B 008', time: '5. Std', type: 'single' },
        { id: 'di-4', subject: 'Englisch GK', teacher: 'SI', room: 'B 207', time: '6. Std', type: 'single' },
      ];
    case 3: // Mittwoch
      return [
        { id: 'mi-1', subject: 'Englisch GK', teacher: 'SI', room: 'B 206', time: '1. - 2. Std', type: 'double' },
        { id: 'mi-2', subject: 'Reli GK', teacher: 'BL', room: 'A 211', time: '3. - 4. Std', type: 'double' },
        { id: 'mi-3', subject: 'Bio GK', teacher: 'WÜ', room: 'C 008', time: '5. - 6. Std', type: 'double' },
        { id: 'mi-4', subject: 'Geschichte GK', teacher: 'BM', room: 'B 208', time: '7. Std', type: 'single' }, 
      ];
    case 4: // Donnerstag
      return [
        { id: 'do-1', subject: 'Mathe LK', teacher: 'RE', room: 'B 208', time: '1. - 2. Std', type: 'double' },
        { id: 'do-2', subject: 'Erdkunde LK', teacher: 'MNG3', room: 'LK4', time: '3. - 4. Std', type: 'double' },
        { id: 'do-3', subject: 'Kunst GK', teacher: 'PF', room: 'B 008', time: '5. - 6. Std', type: 'double' },
        { id: 'do-4', subject: 'Bio GK', teacher: 'WÜ', room: 'C 008', time: '7. Std', type: 'single' },
      ];
    case 5: // Freitag
      if (weekA) {
        return [
          { id: 'fr-1', subject: 'Mathe LK', teacher: 'RE', room: 'B 208', time: '1. - 2. Std', type: 'double' },
          { id: 'fr-2', subject: 'Geschichte GK', teacher: 'BM', room: 'B 208', time: '3. - 4. Std', type: 'double' },
          { id: 'fr-3', subject: 'Informatik GK', teacher: 'DV', room: 'B 113', time: '5. - 6. Std (A)', type: 'double' }
        ];
      } else {
        return [
          { id: 'fr-1', subject: 'Erdkunde LK', teacher: 'MNG3', room: 'LK4', time: '1. - 2. Std', type: 'double' },
          { id: 'fr-2', subject: 'Geschichte GK', teacher: 'BM', room: 'B 208', time: '3. - 4. Std', type: 'double' },
          { id: 'fr-3', subject: 'Deutsch GK', teacher: 'SL', room: 'B 209', time: '5. - 6. Std (B)', type: 'double' }
        ];
      }
    default:
      return []; 
  }
};
