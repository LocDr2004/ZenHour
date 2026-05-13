import React, { useState } from 'react';
import { Save, RefreshCcw, Bell } from 'lucide-react';
import { UserSettings } from '../types';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';

interface SettingsProps {
  userId: string;
  settings: UserSettings;
}

export default function Settings({ userId, settings }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saving, setSaving] = useState(false);

  // Keep local state in sync if settings update from external source (like a reset or background update)
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        settings: localSettings
      });
      alert('Settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof UserSettings, value: number | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto py-8">
      <div className="bg-white border-4 border-brand-primary p-6 shadow-[8px_8px_0px_0px_#0D0D0D]">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 border-b-4 border-brand-primary pb-2">
          Engine Calibration
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
              <span>Deep Work Duration</span>
              <span className="font-mono text-brand-primary">{localSettings.workDuration} MIN</span>
            </label>
            <input 
              type="range" min="1" max="90" step="1"
              value={localSettings.workDuration}
              onChange={(e) => handleChange('workDuration', parseInt(e.target.value))}
              className="w-full accent-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Short Break</label>
              <input 
                type="number" 
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value))}
                className="border-2 border-brand-primary p-2 font-mono font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Long Break</label>
              <input 
                type="number" 
                value={localSettings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value))}
                className="border-2 border-brand-primary p-2 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-brand-bg border-2 border-brand-primary">
             <div className="flex items-center gap-3">
               <Bell size={16} className="text-brand-primary" />
               <span className="text-xs font-black uppercase tracking-tighter">Auto-start Breaks</span>
             </div>
             <button 
               onClick={() => handleChange('autoStartNextMode', !localSettings.autoStartNextMode)}
               className={`w-12 h-6 border-2 border-brand-primary p-1 transition-colors ${localSettings.autoStartNextMode ? 'bg-brand-accent' : 'bg-white'}`}
             >
               <div className={`w-3 h-3 bg-brand-primary transition-transform ${localSettings.autoStartNextMode ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-10 py-4 bg-brand-primary text-white font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#00E676] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <RefreshCcw className="animate-spin" /> : <Save size={20} />}
          <span>Verify & Save</span>
        </motion.button>
      </div>

      <div className="p-4 border-2 border-black bg-white flex items-center gap-4 italic text-xs font-serif leading-tight">
        "Efficiency is doing things right; effectiveness is doing the right things." - P. Drucker
      </div>
    </div>
  );
}
