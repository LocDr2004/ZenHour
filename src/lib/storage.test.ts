import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage';
import type { Task, UserProfile, FocusSession, UserSettings } from '../types';

describe('storage', () => {
  const mockProfile: UserProfile = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    totalMinutes: 100,
    createdAt: new Date() as any,
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartNextMode: false,
    },
  };

  const mockTask: Omit<Task, 'id'> = {
    userId: 'test-user-123',
    title: 'Test Task',
    category: 'Coding',
    priority: 'high',
    completed: false,
    totalSeconds: 0,
    createdAt: new Date() as any,
    lastActiveAt: new Date() as any,
  };

  const mockSession: Omit<FocusSession, 'id'> = {
    userId: 'test-user-123',
    taskId: 'task-123',
    durationSeconds: 1500,
    type: 'work',
    createdAt: new Date() as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as any).mockReturnValue(null);
  });

  describe('Profile Management', () => {
    it('should return null when no profile exists', () => {
      expect(storage.getProfile()).toBeNull();
    });

    it('should save and retrieve profile', () => {
      const savedProfiles: any[] = [];
      (localStorage.setItem as any).mockImplementation((key, value) => {
        savedProfiles.push({ key, value });
      });
      (localStorage.getItem as any).mockImplementation((key) => {
        const item = savedProfiles.find((p) => p.key === key);
        return item ? item.value : null;
      });

      storage.saveProfile(mockProfile);
      const retrieved = storage.getProfile();

      expect(retrieved).toEqual(mockProfile);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should update profile with partial data', () => {
      let storedProfile: any = { ...mockProfile };
      (localStorage.getItem as any).mockImplementation(() => 
        storedProfile ? JSON.stringify(storedProfile) : null
      );
      (localStorage.setItem as any).mockImplementation((key, value) => {
        storedProfile = JSON.parse(value);
      });

      storage.updateProfile({ totalMinutes: 200 });
      const updated = storage.getProfile();

      expect(updated?.totalMinutes).toBe(200);
      expect(updated?.email).toBe('test@example.com');
    });

    it('should update settings', () => {
      let storedProfile: any = { ...mockProfile };
      (localStorage.getItem as any).mockImplementation(() => 
        storedProfile ? JSON.stringify(storedProfile) : null
      );
      (localStorage.setItem as any).mockImplementation((key, value) => {
        storedProfile = JSON.parse(value);
      });

      const newSettings: UserSettings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        autoStartNextMode: true,
      };
      storage.updateSettings(newSettings);

      expect(storage.getProfile()?.settings).toEqual(newSettings);
    });
  });

  describe('Task Management', () => {
    it('should return empty array when no tasks exist', () => {
      expect(storage.getTasks()).toEqual([]);
    });

    it('should add a new task', () => {
      const savedTasks: any[] = [];
      (localStorage.setItem as any).mockImplementation((key, value) => {
        savedTasks.push({ key, value });
      });
      (localStorage.getItem as any).mockImplementation((key) => {
        const item = savedTasks.find((t) => t.key === key);
        return item ? item.value : null;
      });

      const newTask = storage.addTask(mockTask);

      expect(newTask.id).toBeDefined();
      expect(newTask.title).toBe('Test Task');
      expect(newTask.completed).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should update an existing task', () => {
      let storedTasks: any[] = [{ id: 'task-1', title: 'Original', completed: false }];
      (localStorage.getItem as any).mockImplementation(() => 
        JSON.stringify(storedTasks)
      );
      (localStorage.setItem as any).mockImplementation((key, value) => {
        storedTasks = JSON.parse(value);
      });

      storage.updateTask('task-1', { completed: true, title: 'Updated' });

      const tasks = storage.getTasks();
      expect(tasks[0].completed).toBe(true);
      expect(tasks[0].title).toBe('Updated');
    });

    it('should delete a task', () => {
      let storedTasks: any[] = [
        { id: 'task-1', title: 'Task 1' },
        { id: 'task-2', title: 'Task 2' },
      ];
      (localStorage.getItem as any).mockImplementation(() => 
        JSON.stringify(storedTasks)
      );
      (localStorage.setItem as any).mockImplementation((key, value) => {
        storedTasks = JSON.parse(value);
      });

      storage.deleteTask('task-1');

      expect(storage.getTasks().length).toBe(1);
      expect(storage.getTasks()[0].id).toBe('task-2');
    });

    it('should save tasks and dispatch event', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      storage.saveTasks([mockTask as Task]);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    });
  });

  describe('Session Management', () => {
    it('should return empty array when no sessions exist', () => {
      expect(storage.getSessions()).toEqual([]);
    });

    it('should add a new session', () => {
      const savedSessions: any[] = [];
      (localStorage.setItem as any).mockImplementation((key, value) => {
        savedSessions.push({ key, value });
      });
      (localStorage.getItem as any).mockImplementation((key) => {
        const item = savedSessions.find((s) => s.key === key);
        return item ? item.value : null;
      });

      const newSession = storage.addSession(mockSession);

      expect(newSession.id).toBeDefined();
      expect(newSession.durationSeconds).toBe(1500);
      expect(newSession.type).toBe('work');
    });

    it('should save sessions and dispatch event', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      storage.saveSessions([mockSession as FocusSession]);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    });
  });

  describe('Storage Events', () => {
    it('should dispatch storage_update event on profile save', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      storage.saveProfile(mockProfile);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'storage_update' })
      );
    });

    it('should dispatch storage_update event on tasks save', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      storage.saveTasks([]);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'storage_update' })
      );
    });
  });
});
