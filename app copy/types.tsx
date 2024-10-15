interface Goal {
  id: string;
  name: string;
  score: number;
  completed: boolean;
  sectionTitle: string;
}

interface Section {
  title: string;
  color: string;
  totalScore: number;
  completedScore: number;
}

interface DonutChartProps {
  data: Section[];
  width: number;
  height: number;
}
