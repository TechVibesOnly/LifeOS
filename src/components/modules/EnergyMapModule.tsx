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
import { handleFirestoreError, OperationType } from '../../services/db';
import { Activity, Clock, Zap, Sun, Moon, Battery, Brain, RefreshCw, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { wearableService, WearableData } from '../../services/wearableService';

interface EnergyPoint {
  time: string;
  level: number;
}

export default function EnergyMapModule({ user }: { user: User }) {
  const [points, setPoints] = useState<EnergyPoint[]>([
    { time: '08:00', level: 80 },
    { time: '10:00', level: 95 },
    { time: '12:00', level: 60 },
    { time: '14:00', level: 40 },
    { time: '16:00', level: 75 },
    { time: '18:00', level: 50 },
    { time: '20:00', level: 30 }
  ]);
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load existing wearable data
    const q = query(
      collection(db, 'wearableData'),
      where('userId', '==', user.uid),
      orderBy('lastSync', 'desc'),
      limit(1)
    );
    const unsub = onSnapshot(q, (s) => {
      if (!s.empty) {
        setWearableData({ id: s.docs[0].id, ...s.docs[0].data() } as any);
      }
    });
    return () => unsub();
  }, [user.uid]);

  const syncWearable = async () => {
    setIsSyncing(true);
    try {
      const data = await wearableService.syncData(user.uid);
      setWearableData(data);
      
      // Affect the energy map based on new stress levels or sleep score
      const modifier = (data.sleepScore / 100) * (1 - (data.stressLevel / 200));
      setPoints(prev => prev.map(p => ({
        ...p,
        level: Math.min(100, Math.floor(p.level * modifier + (Math.random() * 10 - 5)))
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Cognitive Energy Map</h2>
          <p className="text-gray-500">Visualizing your neuro-rhythms for peak performance.</p>
        </div>
        <button 
          onClick={syncWearable}
          disabled={isSyncing}
          className="flex items-center space-x-2 px-6 py-3 bg-brand-primary text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          <span>Sync Bio-Nodes</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 glass-morphism p-8 rounded-[40px] relative overflow-hidden h-[400px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-brand-primary tracking-widest">Live Neuro-Rhythm</p>
              <h3 className="text-xl font-display font-bold">Entropy/Energy Variance</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
              <Clock size={14} />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="h-[200px] flex items-end justify-between gap-2 relative z-10">
            <div className="absolute left-0 right-0 top-1/2 border-t border-white/5 border-dashed" />
            {points.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${p.level}%` }}
                  className={clsx(
                    "w-full rounded-t-xl transition-all duration-1000",
                    p.level > 80 ? "bg-brand-primary shadow-[0_0_20px_rgba(0,255,255,0.3)]" : p.level > 50 ? "bg-brand-secondary" : "bg-gray-700"
                  )}
                />
                <span className="text-[8px] font-bold text-gray-600 mt-2 rotate-[-45deg] whitespace-nowrap">{p.time}</span>
                
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded pointer-events-none z-20">
                  {p.level}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 space-y-4">
           {wearableData ? (
             <div className="glass-morphism p-8 rounded-[40px] space-y-6">
                <div className="flex items-center space-x-3 text-brand-secondary">
                  <Smartphone size={20} />
                  <h4 className="text-sm font-bold uppercase tracking-widest">Device Metrics</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[10px] text-gray-600 font-bold uppercase">Stress</p>
                     <p className="text-2xl font-display font-bold">{wearableData.stressLevel}%</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-gray-600 font-bold uppercase">Sleep</p>
                     <p className="text-2xl font-display font-bold">{wearableData.sleepScore}/100</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-gray-600 font-bold uppercase">Heart</p>
                     <p className="text-2xl font-display font-bold">{wearableData.heartRate} BPM</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-gray-600 font-bold uppercase">Steps</p>
                     <p className="text-2xl font-display font-bold">{wearableData.steps.toLocaleString()}</p>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <p className="text-[10px] text-gray-500 font-light italic">Last synced: {new Date(wearableData.lastSync?.seconds * 1000).toLocaleTimeString()}</p>
                </div>
             </div>
           ) : (
             <div className="glass-morphism p-8 rounded-[40px] h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Smartphone size={48} className="text-gray-600" />
                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">No Biometric Link<br/>Detected</p>
                <button onClick={syncWearable} className="text-[10px] text-brand-primary underline uppercase font-bold">Initiate Manual Sync</button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-morphism p-8 rounded-[40px] space-y-4 border-t-2 border-brand-primary">
          <div className="flex items-center space-x-2 text-brand-primary">
            <Zap size={18} />
            <h3 className="font-display font-bold">The Creative Peak (10:00)</h3>
          </div>
          <p className="text-sm text-gray-400 font-light leading-relaxed">Your neuro-profile shows peak cognitive bandwidth. This is your primary window for <span className="text-white font-medium">Deep Synthesis</span>.</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-gray-500">Architecture</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-gray-500">Hard Logic</span>
          </div>
        </div>

        <div className="glass-morphism p-8 rounded-[40px] space-y-4 border-t-2 border-yellow-400">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Moon size={18} />
            <h3 className="font-display font-bold">The Maintenance Trough (14:00)</h3>
          </div>
          <p className="text-sm text-gray-400 font-light leading-relaxed">System resources are diverted to biological maintenance. Shift to <span className="text-white font-medium">Admin Maintenance</span> loops.</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-gray-500">Email</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-gray-500">Filing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
