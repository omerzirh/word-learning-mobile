export interface Card {
  id: string;
  english: string;
  turkish: string;
  status: 'learning' | 'known';
  createdAt: Date;
  lastStudied?: Date;
  studyCount: number;
  successRate: number;
}

export interface StudySession {
  id: string;
  date: Date;
  cardIds: string[];
  correctCount: number;
  incorrectCount: number;
  duration: number;
}

export interface UserProgress {
  totalCards: number;
  knownCards: number;
  learningCards: number;
  dailyGoal: number;
  streak: number;
} 