import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Task, ACHIEVEMENTS, FocusSession, TimerMode, UserSettings } from '../types';
import { formatDuration, cn } from '../lib/utils';
import { Target, TrendingUp, Award, Clock, Trophy } from 'lucide-react';
import Heatmap from './Heatmap';

interface StatsProps {
  tasks: Task[];
  sessions: FocusSession[];
}

export default function Stats({ tasks, sessions }: StatsProps) {
  const totalSeconds = tasks.reduce((acc, t) => acc + t.totalSeconds, 0);
  const totalHours = totalSeconds / 3600;
  const progressPercent = (totalSeconds / (10000 * 3600)) * 100;
  
  const unlockedAchievements = ACHIEVEMENTS.filter(a => totalHours >= a.threshold);
  const nextAchievement = ACHIEVEMENTS.find(a => totalHours < a.threshold);

  const categoryData = tasks.reduce((acc: any[], task) => {
    const existing = acc.find(a => a.name === task.category);
    if (existing) {
      existing.value += task.totalSeconds;
    } else {
      acc.push({ name: task.category, value: task.totalSeconds });
    }
    return acc;
  }, []);

  const COLORS = ['#0D0D0D', '#00E676', '#6366F1', '#EC4899', '#F59E0B', '#8B5CF6'];

  const topTasks = [...tasks]
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .slice(0, 5)
    .map(t => ({
      name: t.title,
      hours: parseFloat((t.totalSeconds / 3600).toFixed(1))
    }));

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white border-4 border-brand-primary flex flex-col shadow-[4px_4px_0px_0px_#0D0D0D]">
          <span className="text-[10px] font-black underline uppercase tracking-widest mb-1">TOTAL GRIND</span>
          <span className="text-4xl font-mono font-black text-brand-primary">{(totalSeconds / 3600).toFixed(1)} HR</span>
          <div className="mt-4 flex justify-between text-[10px] font-black uppercase">
            <span>MASTERY PROGRESS</span>
            <span>{progressPercent.toFixed(4)}%</span>
          </div>
          <div className="w-full border-2 border-brand-primary h-4 mt-1 bg-gray-100 overflow-hidden text-black">
            <div className="bg-brand-accent h-full" style={{ width: `${Math.min(100, progressPercent * 100)}%` }} />
          </div>
        </div>

        <div className="p-6 bg-brand-primary text-white border-4 border-brand-primary flex flex-col shadow-[4px_4px_0px_0px_#00E676]">
          <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">MASTERY LEVEL</span>
          <span className="text-4xl font-black uppercase tracking-tighter italic">
            {totalSeconds > 500 * 3600 ? 'EXPERT' : totalSeconds > 100 * 3600 ? 'SKILLED' : 'NOVICE'}
          </span>
          <p className="text-[10px] mt-2 font-mono opacity-80 decoration-brand-accent underline flex items-center gap-2">
            <Award size={12} /> {unlockedAchievements.length} BADGES EARNED
          </p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="p-6 bg-white border-4 border-brand-primary shadow-[4px_4px_0px_0px_#0D0D0D]">
        <Heatmap sessions={sessions} />
      </div>

      {/* Achievements Row */}
      <div className="bg-white border-4 border-brand-primary p-6 shadow-[4px_4px_0px_0px_#0D0D0D]">
        <h3 className="text-xs uppercase tracking-widest font-black mb-6 border-b-2 border-brand-primary pb-2 flex items-center gap-2">
          <Trophy size={14} className="text-brand-accent" />
          <span>Milestones</span>
        </h3>
        <div className="flex flex-wrap gap-4">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = totalHours >= a.threshold;
            return (
              <div 
                key={a.id} 
                className={cn(
                  "p-4 border-2 border-brand-primary flex flex-col items-center text-center transition-all min-w-[120px] flex-1",
                  isUnlocked ? "bg-brand-accent" : "bg-gray-50 opacity-40 grayscale"
                )}
              >
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{a.title}</p>
                <p className="text-[8px] font-medium leading-tight text-gray-700">{a.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white border-4 border-brand-primary min-h-[350px] flex flex-col shadow-[4px_4px_0px_0px_#0D0D0D]">
          <h3 className="text-xs uppercase tracking-widest font-black mb-6 border-b-2 border-brand-primary pb-2 flex items-center justify-between">
            <span>Discipline Mix</span>
            <TrendingUp size={14} />
          </h3>
          <div className="flex-1 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#0D0D0D"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${(value / 3600).toFixed(1)} hrs`}
                    contentStyle={{ border: '2px solid #0D0D0D', borderRadius: '0', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[10px] font-black uppercase text-gray-300">DATA_EMPTY</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white border-4 border-brand-primary flex flex-col shadow-[4px_4px_0px_0px_#0D0D0D]">
          <h3 className="text-xs uppercase tracking-widest font-black mb-6 border-b-2 border-brand-primary pb-2">Weekly Velocity</h3>
          <div className="flex items-end gap-1 h-32 mb-8">
            <div className="flex-1 bg-brand-primary opacity-20 h-[40%] border-2 border-brand-primary"></div>
            <div className="flex-1 bg-brand-primary opacity-40 h-[65%] border-2 border-brand-primary"></div>
            <div className="flex-1 bg-brand-primary opacity-20 h-[30%] border-2 border-brand-primary"></div>
            <div className="flex-1 bg-brand-primary opacity-60 h-[85%] border-2 border-brand-primary"></div>
            <div className="flex-1 bg-brand-primary opacity-30 h-[50%] border-2 border-brand-primary"></div>
            <div className="flex-1 bg-brand-primary h-full border-2 border-brand-primary"></div>
            <div className="flex-1 bg-brand-accent h-[20%] border-2 border-brand-primary"></div>
          </div>
          <div className="flex justify-between text-[8px] font-black mt-2 uppercase border-t-2 border-brand-primary pt-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          <div className="mt-8 space-y-3">
             <div className="p-2 border-2 border-brand-primary bg-brand-bg">
                <p className="text-[9px] font-black uppercase opacity-50">Mastery Forecast</p>
                <p className="text-sm font-black italic tracking-tighter">EST. AUGUST 2029</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

