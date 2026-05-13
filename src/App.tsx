import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User } from './lib/firebase';
import { Task, FocusSession, UserProfile, UserSettings } from './types';
import { storage } from './lib/storage';
import Auth from './components/Auth';
import Timer from './components/Timer';
import TaskManager from './components/TaskManager';
import Stats from './components/Stats';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { Timer as TimerIcon, BarChart2, BookMarked, Github, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';

const DEFAULT_SETTINGS: UserSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartNextMode: false
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'timer' | 'stats' | 'settings'>('timer');

  const loadLocalData = () => {
    setTasks(storage.getTasks());
    setSessions(storage.getSessions() as any);
    const localProfile = storage.getProfile();
    if (localProfile) setProfile(localProfile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (!u) {
        setProfile(null);
      } else {
        let localProfile = storage.getProfile();
        if (!localProfile || localProfile.uid !== u.uid) {
          localProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'Master',
            totalMinutes: 0,
            createdAt: new Date() as any,
            settings: DEFAULT_SETTINGS
          };
          storage.saveProfile(localProfile);
        }
        setProfile(localProfile);
      }
    });

    loadLocalData();
    window.addEventListener('storage_update', loadLocalData);

    return () => {
      unsubscribe();
      window.removeEventListener('storage_update', loadLocalData);
    };
  }, []);

  useEffect(() => {
    if (activeTask) {
      const updated = tasks.find(t => t.id === activeTask.id);
      if (updated) setActiveTask(updated);
      else setActiveTask(null);
    }
  }, [tasks, activeTask?.id]);

  const handleSessionComplete = (duration: number) => {
    // Session completed
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary font-sans selection:bg-brand-accent selection:text-brand-primary border-8 border-brand-primary flex flex-col">
      {/* Header */}
      <header className="h-20 border-b-4 border-brand-primary flex items-center justify-between px-8 bg-white z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white font-black text-2xl italic">K</div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">TEN THOUSAND HOURS / MASTERY LAB</h1>
        </div>
        
        <Auth user={user} loading={loading} />
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {!user && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 py-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-brand-primary flex items-center justify-center text-white mb-8 rotate-3"
            >
              <TimerIcon size={48} />
            </motion.div>
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none">Làm chủ Kỹ năng của bạn</h2>
            <p className="text-xl font-medium mb-10 max-w-md">
              Áp dụng quy luật 10,000 giờ kết hợp với phương pháp Pomodoro để theo dõi sự tiến bộ thực sự.
            </p>
            <Auth user={user} loading={loading} />
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-8 border-brand-primary border-t-brand-accent animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
            {/* TASKS SECTION (Left Column on Desktop) */}
            <section className="w-full lg:w-[360px] border-b-4 lg:border-b-0 lg:border-r-4 border-brand-primary flex flex-col bg-brand-bg md:bg-white overflow-hidden">
              <div className="p-4 bg-brand-primary text-white flex justify-between items-center">
                <h2 className="text-xs uppercase tracking-widest font-black">Active Disciplines</h2>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setActiveTab('timer')}
                     className={cn("p-1 border border-white/20 transition-colors", activeTab === 'timer' && "bg-brand-accent text-brand-primary border-brand-accent")}
                   >
                     <TimerIcon size={14} />
                   </button>
                   <button 
                     onClick={() => setActiveTab('stats')}
                      className={cn("p-1 border border-white/20 transition-colors", activeTab === 'stats' && "bg-brand-accent text-brand-primary border-brand-accent")}
                   >
                     <BarChart2 size={14} />
                   </button>
                   <button 
                     onClick={() => setActiveTab('settings')}
                      className={cn("p-1 border border-white/20 transition-colors", activeTab === 'settings' && "bg-brand-accent text-brand-primary border-brand-accent")}
                   >
                     <SettingsIcon size={14} />
                   </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {user ? (
                  <TaskManager 
                    userId={user.uid} 
                    tasks={tasks} 
                    activeTask={activeTask} 
                    onSelectTask={setActiveTask} 
                  />
                ) : (
                  <div className="p-12 text-center">Loading user identity...</div>
                )}
              </div>
            </section>

            {/* MAIN CONTENT SECTION */}
            <section className="flex-1 flex flex-col border-b-4 lg:border-b-0 lg:border-r-4 border-brand-primary items-center justify-start p-6 md:p-12 bg-white relative overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'timer' && (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center"
                  >
                    <Timer 
                      userId={user?.uid} 
                      activeTask={activeTask} 
                      settings={profile?.settings}
                      onSessionComplete={handleSessionComplete} 
                    />
                  </motion.div>
                )}
                
                {activeTab === 'stats' && (
                   <motion.div
                    key="stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full overflow-y-auto"
                  >
                    <Stats tasks={tasks} sessions={sessions} />
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <Settings userId={user?.uid || ''} settings={profile?.settings || DEFAULT_SETTINGS} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STATS PREVIEW SECTION (Right Column on Desktop - Hidden in Settings) */}
            {activeTab !== 'stats' && (
              <section className="hidden xl:flex w-[320px] bg-brand-bg flex-col overflow-y-auto">
                <div className="p-4 border-b-4 border-brand-primary bg-white">
                  <h2 className="text-xs uppercase tracking-widest font-black">Quick Mastery</h2>
                </div>
                <div className="flex-1 p-6">
                  <Stats tasks={tasks.slice(0, 3)} sessions={sessions} />
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="h-12 bg-brand-primary text-white flex items-center px-8 justify-between shrink-0">
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
          {activeTask && <span className="text-brand-accent animate-pulse">● Live Session: {activeTask.title}</span>}
          <span className="hidden md:inline">Tasks: {tasks.filter(t => t.completed).length} Complete</span>
        </div>
        <div className="text-[10px] font-mono opacity-60">
          ZENHOURS_V.2.0_MASTERY_SYS
        </div>
      </footer>
    </div>
  );
}


