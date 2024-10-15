export interface Goal {
  id: string;
  name: string;
  score: number;
  completed: boolean;
  sectionTitle: string;
  creationDate: Date;
}

export interface Section {
  title: string;
  color: string;
}

export interface SectionData extends Section {
  totalScore: number;
  completedScore: number;
}
