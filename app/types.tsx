export interface Goal {
  id: string;
  name: string;
  score: number;
  completed: boolean;
  sectionTitle: string;
}

export interface Section {
  title: string;
  color: string;
}

export interface SectionData extends Section {
  totalScore: number;
  completedScore: number;
}
