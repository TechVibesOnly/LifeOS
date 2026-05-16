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
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Target, Sparkles, LayoutDashboard, Users, Moon, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface FocusSession {
  id: string;
  userId: string;
  startTime: any;
  duration: number;
  status: 'active' | 'completed';
  mode: string;
}

export default function FocusModule({ user }: { user: User }) {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [duration, setDuration] = useState(25);
  const [teleportMode, setTeleportMode] = useState<'deep' | 'creative' | 'admin' | 'social' | 'recovery'>('deep');

  const MODES = {
    deep: { label: 'Deep Work', icon: Target, color: 'bg-brand-primary', text: 'text-brand-primary', glow: 'glow-primary', desc: 'Focusing on single-threaded logic.' },
    creative: { label: 'Creative Mode', icon: Sparkles, color: 'bg-brand-secondary', text: 'text-brand-secondary', glow: 'glow-secondary', desc: 'Allowing the mind to wander and synthesize.' },
    admin: { label: 'Admin Support', icon: LayoutDashboard, color: 'bg-blue-500', text: 'text-blue-500', glow: 'glow-blue', desc: 'Clearing the maintenance backlog.' },
    social: { label: 'Sync Mode', icon: Users, color: 'bg-orange-500', text: 'text-orange-500', glow: 'glow-orange', desc: 'Nurturing the social graph.' },
    recovery: { label: 'System Recovery', icon: Moon, color: 'bg-purple-500', text: 'text-purple-500', glow: 'glow-purple', desc: 'Recharging cognitive resources.' }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'focusSessions'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as FocusSession;
        if (data.status === 'active') {
          setActiveSession({ id: snapshot.docs[0].id, ...data });
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'focusSessions'));

    return () => unsubscribe();
  }, [user.uid]);

  const startFocus = async () => {
    try {
      const session = {
        userId: user.uid,
        startTime: Timestamp.now(),
        duration,
        status: 'active',
        mode: teleportMode
      };
      await addDoc(collection(db, 'focusSessions'), session);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'focusSessions');
    }
  };

  const endFocus = async () => {
    if (!activeSession) return;
    try {
      await updateDoc(doc(db, 'focusSessions', activeSession.id), {
        endTime: Timestamp.now(),
        status: 'completed'
      });
      setActiveSession(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `focusSessions/${activeSession.id}`);
    }
  };

  return (
    <div className={clsx("space-y-8 min-h-screen transition-all duration-1000 p-4 rounded-3xl", activeSession && "bg-[#0a0a0a]")}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Quantum Focus</h2>
          <p className="text-gray-500">Teleport your mind between optimized cognitive states.</p>
        </div>
        <div className="p-1 glass-morphism rounded-2xl flex items-center space-x-1">
          {(Object.keys(MODES) as (keyof typeof MODES)[]).map(m => {
            const Icon = MODES[m].icon;
            return (
              <button
                key={m}
                onClick={() => setTeleportMode(m)}
                className={clsx(
                  "p-3 rounded-xl transition-all",
                  teleportMode === m ? "bg-white text-black scale-110 shadow-lg" : "text-gray-600 hover:text-white"
                )}
              >
                <div className="flex flex-col items-center">
                  <Icon size={18} />
                  <span className="text-[6px] font-bold uppercase mt-1 hidden md:block">{m}</span>
                </div>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-12 md:py-20 space-y-12">
         {/* The Focus Core */}
         <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className={clsx("absolute -inset-24 border border-white/5 rounded-full transition-all duration-1000", activeSession && "border-brand-primary/20 scale-125")}
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className={clsx("absolute -inset-12 border border-white/5 rounded-full transition-all duration-1000", activeSession && "border-brand-secondary/20 scale-110")}
            />

            <motion.div 
              animate={activeSession ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className={clsx(
                "relative z-10 w-64 h-64 md:w-80 md:h-80 glass-morphism rounded-full flex flex-col items-center justify-center space-y-4 border-4 transition-all duration-1000",
                activeSession ? `border-white shadow-2xl ${MODES[teleportMode].glow}` : "border-white/10"
              )}
            >
               {activeSession ? (
                 <>
                   <div className="text-sm font-mono tracking-[0.5em] text-gray-500 uppercase">Synchronizing...</div>
                   <div className="text-7xl font-display font-bold tracking-tighter">
                     {activeSession.duration}:00
                   </div>
                   <div className={clsx("text-xs font-bold uppercase tracking-widest", MODES[teleportMode].text)}>
                     {MODES[teleportMode].label}
                   </div>
                 </>
               ) : (
                 <>
                   <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Duration (Min)</div>
                   <div className="flex items-center space-x-6">
                     {[15, 25, 45].map(d => (
                       <button 
                        key={d} 
                        onClick={() => setDuration(d)}
                        className={clsx("text-3xl font-display font-bold hover:text-white transition-all", duration === d ? "text-white scale-125" : "text-gray-700")}
                       >
                         {d}
                       </button>
                     ))}
                   </div>
                 </>
               )}
            </motion.div>
         </div>

         <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight">{MODES[teleportMode].label}</h3>
              <p className="text-gray-500 font-light px-8">{MODES[teleportMode].desc}</p>
            </div>

            <button 
              onClick={activeSession ? endFocus : startFocus}
              className={clsx(
                "w-full py-6 rounded-3xl font-display font-bold text-xl tracking-widest transition-all hover:scale-[1.02] active:scale-95 group",
                activeSession ? "bg-red-500 text-white" : "bg-white text-black"
              )}
            >
              {activeSession ? 'Terminate Session' : 'Initiate Teleport'}
            </button>
         </div>
      </div>
    </div>
  );
}
