import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from './Timer';
import { storage } from '../lib/storage';

vi.mock('../lib/storage', () => ({
  storage: {
    addSession: vi.fn(),
    updateTask: vi.fn(),
  },
}));

describe('Timer', () => {
  const mockProps = {
    userId: 'test-user-123',
    activeTask: {
      id: 'task-1',
      userId: 'test-user-123',
      title: 'Test Task',
      category: 'Coding',
      priority: 'high' as const,
      completed: false,
      totalSeconds: 0,
      createdAt: new Date() as any,
      lastActiveAt: new Date() as any,
    },
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartNextMode: false,
    },
    onSessionComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timer with initial work mode', () => {
    render(<Timer {...mockProps} />);
    
    expect(screen.getByText(/grind/i)).toBeInTheDocument();
    expect(screen.getByText(/pause/i)).toBeInTheDocument();
    expect(screen.getByText(/chill/i)).toBeInTheDocument();
    expect(screen.getByText('FOCUSING ON: Test Task')).toBeInTheDocument();
  });

  it('should display countdown timer', () => {
    render(<Timer {...mockProps} />);
    
    const timerDisplay = screen.getByText(/\d{2}:\d{2}/);
    expect(timerDisplay).toBeInTheDocument();
  });

  it('should start and pause timer', async () => {
    render(<Timer {...mockProps} />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('should reset timer when reset button is clicked', () => {
    render(<Timer {...mockProps} />);
    
    const resetButton = screen.getByTitle('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('should switch between modes', () => {
    render(<Timer {...mockProps} />);
    
    const shortBreakButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(shortBreakButton);
    
    expect(screen.getByText(/short break/i)).toBeInTheDocument();
  });

  it('should display progress bar', () => {
    render(<Timer {...mockProps} />);
    
    expect(screen.getByText(/session progress/i)).toBeInTheDocument();
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('should show "SELECT A DISCIPLINE" when no active task', () => {
    render(<Timer {...mockProps} activeTask={null} />);
    
    expect(screen.getByText(/select a discipline to begin/i)).toBeInTheDocument();
  });

  it('should call onSessionComplete when work session finishes', async () => {
    render(<Timer {...mockProps} />);
    
    // Fast-forward timer to completion
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });
    
    expect(mockProps.onSessionComplete).toHaveBeenCalled();
  });

  it('should save session when work mode completes', async () => {
    render(<Timer {...mockProps} />);
    
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });
    
    expect(storage.addSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-123',
        taskId: 'task-1',
        type: 'work',
      })
    );
  });

  it('should skip timer when skip button is clicked', () => {
    render(<Timer {...mockProps} />);
    
    const skipButton = screen.getByTitle('Skip');
    fireEvent.click(skipButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Bỏ qua lượt này?');
  });
});
