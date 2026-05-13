import React from 'react';
import { format, subDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';
import { FocusSession } from '../types';
import { cn } from '../lib/utils';

interface HeatmapProps {
  sessions: FocusSession[];
}

export default function Heatmap({ sessions }: HeatmapProps) {
  const today = startOfToday();
  const days = eachDayOfInterval({
    start: subDays(today, 55), // Show ~8 weeks
    end: today,
  });

  const getDayIntensity = (day: Date) => {
    const daySessions = sessions.filter(s => {
      const sessionDate = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
      return isSameDay(sessionDate, day);
    });
    
    const totalDuration = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const hours = totalDuration / 3600;

    if (hours === 0) return 'bg-gray-100';
    if (hours < 1) return 'bg-brand-accent/30';
    if (hours < 3) return 'bg-brand-accent/60';
    if (hours < 5) return 'bg-brand-accent/80';
    return 'bg-brand-accent';
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      <h3 className="text-xs font-black uppercase tracking-widest border-b-2 border-brand-primary pb-2 flex items-center justify-between">
        <span>Activity Pulse</span>
        <span className="text-gray-400 font-mono text-[8px]">LAST 56 DAYS</span>
      </h3>
      
      <div className="flex flex-wrap gap-1">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "w-3 h-3 border border-brand-primary/10",
              getDayIntensity(day)
            )}
            title={`${format(day, 'MMM d')}: ${sessions.filter(s => isSameDay(s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt), day)).length} sessions`}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-end gap-2 text-[8px] font-black uppercase text-gray-400">
        <span>Less</span>
        <div className="w-2 h-2 bg-gray-100 border border-brand-primary/10"></div>
        <div className="w-2 h-2 bg-brand-accent/30 border border-brand-primary/10"></div>
        <div className="w-2 h-2 bg-brand-accent/60 border border-brand-primary/10"></div>
        <div className="w-2 h-2 bg-brand-accent/90 border border-brand-primary/10"></div>
        <span>More</span>
      </div>
    </div>
  );
}
