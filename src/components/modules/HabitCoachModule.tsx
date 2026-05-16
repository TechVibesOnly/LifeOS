import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  Timestamp,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Flame, Star, MessageSquareCode, ShieldAlert, Sparkles, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface Habit {
  id: string;
  title: string;
  streak: number;
  patternRisk: string;
  coachingTone: string;
  status: 'active' | 'paused';
  createdAt: any;
}

export default function HabitCoachModule({ user }: { user: User }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hs: Habit[] = [];
      snapshot.forEach(doc => hs.push({ id: doc.id, ...doc.data() } as Habit));
      setHabits(hs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'habits'));

    return () => unsubscribe();
  }, [user.uid]);

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await addDoc(collection(db, 'habits'), {
        userId: user.uid,
        title: newTitle,
        streak: 0,
        patternRisk: 'Low',
        coachingTone: 'Encouraging',
        status: 'active',
        createdAt: Timestamp.now()
      });
      setNewTitle('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'habits');
    }
  };

  const incrementStreak = async (habit: Habit) => {
    try {
      await updateDoc(doc(db, 'habits', habit.id), {
        streak: habit.streak + 1,
        coachingTone: habit.streak > 10 ? 'Elite' : 'Steady',
        patternRisk: 'Minimal'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `habits/${habit.id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'habits', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `habits/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Habit Coach</h2>
        <p className="text-gray-500">Adaptive companionship for your daily rituals.</p>
      </header>

      <form onSubmit={addHabit} className="flex gap-4">
        <input 
          type="text" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New core behavior..."
          className="flex-1 glass-morphism rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
        />
        <button type="submit" className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-all">
          Deploy Hub
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morphism p-6 rounded-[32px] space-y-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                    <Flame size={20} />
                  </div>
                  <h3 className="font-display font-bold text-xl">{habit.title}</h3>
                </div>
                <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-700 hover:text-red-500 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 rounded-2xl p-4 space-y-1">
                   <p className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Current Streak</p>
                   <p className="text-2xl font-display font-bold text-brand-primary">{habit.streak} Days</p>
                 </div>
                 <div className="bg-white/5 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Risk Score</p>
                    <p className={clsx(
                      "text-sm font-bold uppercase",
                      habit.patternRisk === 'Low' ? 'text-brand-secondary' : 'text-red-500'
                    )}>
                      {habit.patternRisk}
                    </p>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                <div className="flex items-center space-x-2 text-brand-secondary">
                  <MessageSquareCode size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{habit.coachingTone} Mode</span>
                </div>
                <p className="text-xs text-gray-400 italic">
                  {habit.streak > 5 
                    ? "Your momentum is becoming a signature. Maintain the rhythm." 
                    : "The first steps are often the heaviest. Stay present."}
                </p>
              </div>

              <button 
                onClick={() => incrementStreak(habit)}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
              >
                <TrendingUp size={18} />
                <span>Log Check-in</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
