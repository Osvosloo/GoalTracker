export interface DailyCompletion {
  date: string;
  completedGoals: string[]; // Array of goal IDs
  sectionData: SectionData[];
}

export interface WeeklyStats {
  mostCompletedGoals: { id: string; name: string }[];
  leastCompletedGoals: { id: string; name: string }[];
  dailyCompletions: { [date: string]: SectionData[] };
}

export interface DailyRecord {
  date: string; // Format: "YYYY-MM-DD"
  sections: SectionData[]; // Array of sections with their goals
}
export interface Section {
  title: string;
  color: string;
}

export interface SectionData extends Section {
  totalScore: number;
  completedScore: number;
  goals: Goal[];
}

export interface Goal {
  id: string;
  title: string;
  score: number;
  completed: boolean;
  sectionTitle: string;
  creationDate: Date;
}
export interface ExistingData {
  date: string;
  sections: SectionData[];
}
