import { Task, UserProfile, FocusSession, UserSettings } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'pomofocus_profile',
  TASKS: 'pomofocus_tasks',
  SESSIONS: 'pomofocus_sessions',
};

export const storage = {
  // Profile
  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new Event('storage_update'));
  },
  updateProfile: (updates: Partial<UserProfile>) => {
    const current = storage.getProfile();
    if (current) {
      storage.saveProfile({ ...current, ...updates });
    }
  },
  updateSettings: (settings: UserSettings) => {
    const current = storage.getProfile();
    if (current) {
      storage.saveProfile({ ...current, settings });
    }
  },

  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    window.dispatchEvent(new Event('storage_update'));
  },
  addTask: (task: Omit<Task, 'id'>): Task => {
    const tasks = storage.getTasks();
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    storage.saveTasks([newTask, ...tasks]);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = storage.getTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    storage.saveTasks(updated);
  },
  deleteTask: (id: string) => {
    const tasks = storage.getTasks();
    storage.saveTasks(tasks.filter(t => t.id !== id));
  },

  // Sessions
  getSessions: (): FocusSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },
  addSession: (session: Omit<FocusSession, 'id'>) => {
    const sessions = storage.getSessions();
    const newSession = { ...session, id: Math.random().toString(36).substr(2, 9) };
    storage.saveSessions([newSession, ...sessions]);
    return newSession;
  },
  saveSessions: (sessions: FocusSession[]) => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    window.dispatchEvent(new Event('storage_update'));
  }
};
