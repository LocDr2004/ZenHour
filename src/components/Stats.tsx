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
  
  // Calculate Daily & Weekly summaries
  const getPeriodData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push({
        date: d,
        label: days[d.getDay()],
        seconds: 0,
        tasksCompleted: 0
      });
    }

    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      const dayData = last7Days.find(d => 
        d.date.getDate() === sessionDate.getDate() &&
        d.date.getMonth() === sessionDate.getMonth() &&
        d.date.getFullYear() === sessionDate.getFullYear()
      );
      if (dayData) {
        dayData.seconds += session.durationSeconds;
      }
    });

    tasks.forEach(task => {
      if (task.completed && task.lastActiveAt) {
        const completedDate = new Date(task.lastActiveAt);
        const dayData = last7Days.find(d => 
          d.date.getDate() === completedDate.getDate() &&
          d.date.getMonth() === completedDate.getMonth() &&
          d.date.getFullYear() === completedDate.getFullYear()
        );
        if (dayData) {
          dayData.tasksCompleted += 1;
        }
      }
    });
    
    return last7Days;
  };

  const dailyStats = getPeriodData();
  const todayStats = dailyStats[dailyStats.length - 1];
  const weeklyTotalSeconds = dailyStats.reduce((acc, d) => acc + d.seconds, 0);
  const weeklyTasksCompleted = dailyStats.reduce((acc, d) => acc + d.tasksCompleted, 0);

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
          <h3 className="text-xs uppercase tracking-widest font-black mb-6 border-b-2 border-brand-primary pb-2 flex items-center justify-between">
            <span>Weekly Velocity</span>
            <Clock size={14} />
          </h3>
          <div className="flex-1 w-full flex items-center justify-center min-h-[150px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dailyStats}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis 
                   dataKey="label" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 900, fill: '#0D0D0D' }} 
                 />
                 <YAxis hide />
                 <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   formatter={(value: number) => [`${(value / 60).toFixed(0)} min`, 'Focus']}
                   contentStyle={{ border: '2px solid #0D0D0D', borderRadius: '0', fontWeight: 'bold' }}
                 />
                 <Bar 
                   dataKey="seconds" 
                   fill="#00E676" 
                   stroke="#0D0D0D" 
                   strokeWidth={2}
                 />
               </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
             <div className="p-3 border-2 border-brand-primary bg-brand-bg">
                <p className="text-[9px] font-black uppercase opacity-50">Today's Focus</p>
                <div className="flex items-end gap-1">
                  <p className="text-xl font-black italic tracking-tighter">{(todayStats.seconds / 60).toFixed(0)} MIN</p>
                  <p className="text-[10px] font-bold mb-1">/ {todayStats.tasksCompleted} TASKS</p>
                </div>
             </div>
             <div className="p-3 border-2 border-brand-primary bg-brand-accent">
                <p className="text-[9px] font-black uppercase opacity-50">Week Sum</p>
                <div className="flex items-end gap-1">
                  <p className="text-xl font-black italic tracking-tighter">{(weeklyTotalSeconds / 3600).toFixed(1)} HRS</p>
                  <p className="text-[10px] font-bold mb-1">/ {weeklyTasksCompleted} TASKS</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Summary Report Section */}
      <div className="p-6 bg-white border-4 border-brand-primary shadow-[4px_4px_0px_0px_#0D0D0D] flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest font-black border-b-2 border-brand-primary pb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-accent" />
          <span>Performance Report</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase opacity-40">Peak Focus Day</span>
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              {[...dailyStats].sort((a, b) => b.seconds - a.seconds)[0].label}
            </span>
            <p className="text-[10px] font-mono mt-1">THE DAY OF MAXIMUM GRIND</p>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase opacity-40">Task Velocity</span>
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              {(weeklyTasksCompleted / 7).toFixed(1)} / DAY
            </span>
            <p className="text-[10px] font-mono mt-1">AVERAGE MISSIONS CLEARED</p>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase opacity-40">Focus Efficiency</span>
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              {weeklyTotalSeconds > 0 ? (weeklyTasksCompleted / (weeklyTotalSeconds / 3600)).toFixed(1) : '0'} PK/HR
            </span>
            <p className="text-[10px] font-mono mt-1">TASKS PER FOCUS HOUR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

