
export interface Chapter {
  id: string;
  name: string;
  progress: number; // 0 to 100
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  chapterId?: string; // Track which chapter was studied
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  date: string; // YYYY-MM-DD
}

export interface PlannerTask {
  id: string;
  title: string;
  time: string;
  date: string;
  completed: boolean;
  score: number;
}

export interface StudyInsights {
  weakSubjects: string[];
  strongSubjects: string[];
  recommendation: string;
}

export interface StudyGoals {
  daily: number;
  weekly: number;
  monthly: number;
}

export type AppMode = 'dashboard' | 'subjects' | 'planner' | 'ai' | 'videos' | 'analytics';
