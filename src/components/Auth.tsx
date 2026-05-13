import React from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, User } from '../lib/firebase';
import { motion } from 'motion/react';

interface AuthProps {
  user: User | null;
  loading: boolean;
}

export default function Auth({ user, loading }: AuthProps) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-black uppercase italic tracking-tighter">{user.displayName}</span>
          <button 
            onClick={handleLogout}
            className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-primary transition-colors mt-1"
          >
             Sign Out
          </button>
        </div>
        <img 
          src={user.photoURL || ''} 
          alt="Avatar" 
          className="w-10 h-10 border-2 border-brand-primary shadow-[2px_2px_0px_0px_#0D0D0D]"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogin}
      className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2 font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_#00E676] hover:shadow-none transition-all"
    >
      <LogIn size={16} />
      <span>Sign In / Mastery</span>
    </motion.button>
  );
}
