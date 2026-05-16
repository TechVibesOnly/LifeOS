import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Zap, Activity, Users, Target, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

export default function HomeModule({ user, onNavigate }: { user: User, onNavigate: (tab: string) => void }) {
  const [taskCount, setTaskCount] = useState(0);
  const [activePod, setActivePod] = useState<any>(null);
  
  useEffect(() => {
    const qTasks = query(collection(db, 'tasks'), where('ownerId', '==', user.uid), where('status', '==', 'pending'));
    const unsubTasks = onSnapshot(qTasks, s => setTaskCount(s.size));

    const qPods = query(collection(db, 'pods'), where('members', 'array-contains', user.uid), limit(1));
    const unsubPods = onSnapshot(qPods, s => {
      if (!s.empty) setActivePod(s.docs[0].data());
    });

    return () => { unsubTasks(); unsubPods(); };
  }, [user.uid]);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold text-gradient">System Overview</h1>
          <p className="text-gray-500 font-light max-w-sm">Welcome back, {user.displayName?.split(' ')[0]}. All systems operational.</p>
        </div>
        <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Bio-Sync Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Hero - Energy & Next Step */}
        <div className="md:col-span-8 glass-morphism rounded-[40px] p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/20 transition-all duration-700" />
          
          <div className="flex justify-between items-start relative">
            <div className="space-y-4 max-w-md">
              <div className="flex items-center space-x-2 text-brand-primary">
                <Zap size={20} />
                <span className="text-xs font-bold uppercase tracking-widest font-display">Optimization Engine</span>
              </div>
              <h2 className="text-3xl font-display font-bold leading-tight">Your energy is peaking. Now is the time for <span className="text-brand-primary">Architectural Synthesis</span>.</h2>
              <p className="text-gray-400 font-light">The LifeOS model recommends tackling your highest-complexity tasks while cognitive load capacity is at 88%.</p>
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-5xl font-display font-bold text-brand-primary">88%</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">System Energy</div>
            </div>
          </div>

          <div className="flex gap-4 relative">
            <button 
              onClick={() => onNavigate('tasks')}
              className="px-6 py-4 bg-white text-black font-bold rounded-2xl flex items-center space-x-3 hover:bg-gray-200 transition-all"
            >
              <span>Execute Priority Tasks</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onNavigate('focus')}
              className="px-6 py-4 glass-morphism rounded-2xl font-bold flex items-center space-x-3 hover:bg-white/5 transition-all text-gray-400 hover:text-white"
            >
              <Activity size={18} />
              <span>Full Immersion</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
           {[
             { label: 'Pending', val: taskCount, icon: Target, color: 'text-brand-primary', tab: 'tasks' },
             { label: 'Syncs', val: '12', icon: Users, color: 'text-brand-secondary', tab: 'social' },
             { label: 'Rituals', val: '4', icon: Sparkles, color: 'text-yellow-400', tab: 'habits' },
             { label: 'DNA Depth', val: '64%', icon: BrainCircuit, color: 'text-blue-500', tab: 'dna' }
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.label}
                  onClick={() => onNavigate(stat.tab)}
                  className="glass-morphism p-6 rounded-[32px] flex flex-col items-center justify-center space-y-2 hover:bg-white/5 transition-all group scale-100 hover:scale-105 active:scale-95"
                >
                  <Icon size={24} className={clsx(stat.color, "group-hover:scale-110 transition-transform")} />
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold">{stat.val}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{stat.label}</p>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Accountability Highlight */}
        <div className="md:col-span-6 glass-morphism rounded-[40px] p-8 space-y-6">
           <div className="flex justify-between items-center">
             <div className="flex items-center space-x-2 text-gray-500">
               <Target size={18} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Active Pod</span>
             </div>
             <button onClick={() => onNavigate('pods')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
               <ArrowRight size={16} />
             </button>
           </div>
           
           {activePod ? (
             <div className="space-y-4">
               <h3 className="text-2xl font-display font-bold">{activePod.name}</h3>
               <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                 <div>
                   <p className="text-xs font-bold text-brand-secondary uppercase">Streak Status</p>
                   <p className="text-lg font-display font-bold">12 Days Active</p>
                 </div>
                 <div className="flex -space-x-2">
                   {activePod.members.slice(0, 3).map((m: any, i: number) => (
                     <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold">
                       {i === 0 ? 'TC' : 'SJ'}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <p className="text-gray-500 italic">No active pods. Join one to sync progress.</p>
           )}
        </div>

        {/* Reflection Prompt */}
        <div className="md:col-span-6 bg-brand-primary rounded-[40px] p-8 space-y-6 text-black relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative space-y-4">
            <div className="flex items-center space-x-2 opacity-60">
              <Sparkles size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mirror Routine</span>
            </div>
            <h3 className="text-2xl font-display font-bold">Ready for the Evening Clear-out?</h3>
            <p className="font-medium opacity-80">Reflecting on today's lessons improves memory retention by 18%.</p>
            <button 
              onClick={() => onNavigate('reflection')}
              className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              Initiate Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
