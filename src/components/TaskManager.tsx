import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Clock, Tag, Target, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../types';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, deleteDoc, doc, updateDoc } from '../lib/firebase';

import { cn, formatDuration } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TaskManagerProps {
  userId: string;
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task) => void;
}

export default function TaskManager({ userId, tasks, activeTask, onSelectTask }: TaskManagerProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Chung');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        userId,
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        priority: newTaskPriority,
        completed: false,
        totalSeconds: 0,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      });
      setNewTaskTitle('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditPriority(task.priority || 'medium');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        title: editTitle.trim(),
        category: editCategory,
        priority: editPriority
      });
      setEditingTaskId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Xóa task này?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex flex-col border-b-4 border-brand-primary bg-white">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="ENTER NEW DISCIPLINE..."
          className="w-full px-6 py-4 text-lg font-black uppercase tracking-tighter border-none focus:ring-0 placeholder:text-gray-300"
        />
        <div className="flex items-center justify-between gap-4 px-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 border-2 border-brand-primary bg-brand-bg text-[10px] font-black uppercase tracking-widest">
              <Tag size={12} />
              <select 
                value={newTaskCategory} 
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="bg-transparent border-none p-0 focus:ring-0 text-brand-primary"
              >
                <option value="Chung">General</option>
                <option value="Coding">Coding</option>
                <option value="Music">Music</option>
                <option value="Study">Study</option>
                <option value="Art">Art</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 border-2 border-brand-primary bg-brand-bg text-[10px] font-black uppercase tracking-widest">
              <AlertCircle size={12} />
              <select 
                value={newTaskPriority} 
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                className="bg-transparent border-none p-0 focus:ring-0 text-brand-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="flex items-center gap-1 bg-brand-primary text-white px-4 py-2 text-xs font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_#00E676] disabled:opacity-50 hover:shadow-none transition-all"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {[...tasks].sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const pA = priorityWeight[a.priority || 'medium'];
            const pB = priorityWeight[b.priority || 'medium'];
            if (pA !== pB) return pB - pA;
            return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
          }).map((task, index) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={task.id}
              className={cn(
                "group flex items-center justify-between p-4 border-b-2 border-brand-primary transition-all cursor-pointer",
                editingTaskId === task.id ? "bg-yellow-50 ring-2 ring-brand-primary ring-inset z-10" : (activeTask?.id === task.id ? "bg-brand-accent" : "bg-white hover:bg-gray-50"),
                task.completed && editingTaskId !== task.id && "opacity-50"
              )}
              onClick={() => onSelectTask(task)}
            >
              <div className="flex items-center gap-4 overflow-hidden flex-1">
                <p className="text-[10px] font-black uppercase opacity-40 italic shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div className="flex flex-col overflow-hidden flex-1">
                  {editingTaskId === task.id ? (
                    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-lg font-black uppercase tracking-tighter border-2 border-brand-primary p-1 w-full"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <select 
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="text-[9px] font-black uppercase tracking-widest border-2 border-brand-primary p-1 w-fit"
                        >
                          <option value="Chung">General</option>
                          <option value="Coding">Coding</option>
                          <option value="Music">Music</option>
                          <option value="Study">Study</option>
                          <option value="Art">Art</option>
                          <option value="Health">Health</option>
                        </select>
                        <select 
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as Priority)}
                          className="text-[9px] font-black uppercase tracking-widest border-2 border-brand-primary p-1 w-fit"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className={cn(
                        "text-lg font-black leading-tight uppercase tracking-tighter truncate",
                        task.completed && "line-through"
                      )}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">
                          {task.category}
                        </span>
                        <div className={cn(
                          "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider border",
                          task.priority === 'high' ? "bg-red-100 text-red-600 border-red-200" :
                          task.priority === 'low' ? "bg-blue-100 text-blue-600 border-blue-200" :
                          "bg-yellow-100 text-yellow-600 border-yellow-200"
                        )}>
                          {task.priority || 'medium'}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-brand-primary">
                          {formatDuration(task.totalSeconds)} / 10k hrs
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editingTaskId === task.id ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
                      Editing Mode
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTask(task.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 border-2 border-brand-primary bg-brand-primary text-white text-[9px] font-black uppercase hover:bg-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                      >
                        <Check size={12} /> Save
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="flex items-center gap-1 px-2 py-1 border-2 border-brand-primary bg-white text-black text-[9px] font-black uppercase hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(task);
                      }}
                      className={cn(
                        "w-6 h-6 border-2 border-brand-primary flex items-center justify-center transition-colors",
                        task.completed ? "bg-brand-primary text-white" : "bg-white"
                      )}
                    >
                      {task.completed && <CheckCircle2 size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(task);
                      }}
                      className="w-6 h-6 border-2 border-brand-primary bg-white flex items-center justify-center hover:bg-brand-accent transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="w-6 h-6 border-2 border-brand-primary bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="p-12 text-center bg-white">
            <Target size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">NO DISCIPLINE LOADED</p>
          </div>
        )}
      </div>
    </div>
  );
}
