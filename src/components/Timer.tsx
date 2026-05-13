import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TIMER_CONFIG, TimerMode, Task, UserSettings } from '../types';
import { cn, formatDuration } from '../lib/utils';
import { storage } from '../lib/storage';

interface TimerProps {
  userId: string | undefined;
  activeTask: Task | null;
  settings?: UserSettings;
  onSessionComplete: (duration: number) => void;
}

export default function Timer({ userId, activeTask, settings, onSessionComplete }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  
  const getDuration = (m: TimerMode) => {
    if (!settings) return TIMER_CONFIG[m];
    switch(m) {
      case 'work': return settings.workDuration * 60;
      case 'short_break': return settings.shortBreakDuration * 60;
      case 'long_break': return settings.longBreakDuration * 60;
      default: return TIMER_CONFIG[m];
    }
  };

  const [timeLeft, setTimeLeft] = useState(getDuration('work'));
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Only reset timer if the duration for the CURRENT mode changed
  useEffect(() => {
    setTimeLeft(getDuration(mode));
    setIsRunning(false);
  }, [mode, settings?.workDuration, settings?.shortBreakDuration, settings?.longBreakDuration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Play alert sound (optional, browser constraints might block)
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) {}

    const currentDuration = getDuration(mode);

    if (mode === 'work' && userId && activeTask) {
      // Save session
      storage.addSession({
        userId,
        taskId: activeTask.id,
        durationSeconds: currentDuration,
        type: 'work',
        createdAt: new Date() as any,
      });

      // Update task time
      storage.updateTask(activeTask.id, {
        totalSeconds: (activeTask.totalSeconds || 0) + currentDuration,
        lastActiveAt: new Date() as any,
      });

      onSessionComplete(currentDuration);
      setSessionCount(prev => prev + 1);
    }

    // Auto-switch mode
    if (mode === 'work') {
      const nextMode = sessionCount % 4 === 3 ? 'long_break' : 'short_break';
      setMode(nextMode);
      if (settings?.autoStartNextMode) setIsRunning(true);
    } else {
      setMode('work');
      if (settings?.autoStartNextMode) setIsRunning(true);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const skipTimer = () => {
    if (confirm('Bỏ qua lượt này?')) {
      handleTimerComplete();
    }
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-2xl mx-auto py-12 px-6 bg-white relative">
      {/* Mode Indicator Overlay */}
      <div className="absolute top-0 left-0">
        <span className="text-[10px] font-black uppercase px-2 py-1 border-2 border-brand-primary bg-white shadow-[2px_2px_0px_0px_#0D0D0D]">
          Mode: {mode === 'work' ? 'Deep Work' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
        </span>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 w-full mt-4">
        {(['work', 'short_break', 'long_break'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all",
              mode === m 
                ? "bg-brand-primary text-white border-brand-primary shadow-[4px_4px_0px_0px_#00E676]" 
                : "bg-white text-brand-primary border-brand-primary hover:bg-gray-100"
            )}
          >
            {m === 'work' ? 'Grind' : m === 'short_break' ? 'Pause' : 'Chill'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center py-8">
        <div className="text-[100px] md:text-[180px] font-mono font-black tracking-tighter leading-none mb-4 select-none">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <AnimatePresence mode="wait">
          {activeTask ? (
            <motion.div 
              key={activeTask.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-black uppercase italic tracking-tighter bg-brand-accent px-3 py-1 border-2 border-brand-primary"
            >
              FOCUSING ON: {activeTask.title}
            </motion.div>
          ) : (
            <div className="text-sm font-black uppercase italic tracking-tighter text-gray-300">
              SELECT A DISCIPLINE TO BEGIN
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer Controls */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={cn(
            "px-12 py-6 text-2xl font-black uppercase tracking-tighter transition-all border-4 border-brand-primary",
            isRunning 
              ? "bg-white text-brand-primary shadow-[8px_8px_0px_0px_#0D0D0D]" 
              : "bg-brand-primary text-white shadow-[8px_8px_0px_0px_#00E676]"
          )}
        >
          {isRunning ? 'Pause' : 'Start'}
        </motion.button>

        <div className="flex gap-4">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 border-4 border-brand-primary bg-white flex items-center justify-center hover:bg-gray-100 transition-all font-black"
            title="Reset"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={skipTimer}
            className="w-16 h-16 border-4 border-brand-primary bg-white flex items-center justify-center hover:bg-gray-100 transition-all font-black"
            title="Skip"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>

      {/* Focus Intensity / Progress */}
      <div className="w-full max-w-md mt-12">
        <div className="flex justify-between text-[10px] font-black uppercase mb-2">
          <span>Session Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-6 border-4 border-brand-primary bg-gray-100 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-brand-primary"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
