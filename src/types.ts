export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  totalMinutes: number;
  createdAt: any;
  settings?: UserSettings;
}

export interface UserSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartNextMode: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number; // in hours or sessions
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'novice', title: 'Novice', description: 'Complete 1 hour of focus', icon: '🌱', threshold: 1 },
  { id: 'apprentice', title: 'Apprentice', description: 'Complete 10 hours of focus', icon: '🛠️', threshold: 10 },
  { id: 'expert', title: 'Expert', description: 'Complete 100 hours of focus', icon: '🏆', threshold: 100 },
  { id: 'master', title: 'Master', description: 'Complete 1,000 hours of focus', icon: '⚡', threshold: 1000 },
  { id: 'legend', title: 'Legend', description: 'Complete 10,000 hours of focus', icon: '🔥', threshold: 10000 },
];

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: string;
  priority: Priority;
  completed: boolean;
  totalSeconds: number;
  createdAt: any;
  lastActiveAt: any;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId: string;
  durationSeconds: number;
  type: 'work' | 'short_break' | 'long_break';
  createdAt: any;
}

export type TimerMode = 'work' | 'short_break' | 'long_break';

export const TIMER_CONFIG = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};
