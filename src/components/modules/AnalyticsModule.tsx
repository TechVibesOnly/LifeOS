import { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  BarChart3, 
  TrendingUp, 
  BrainCircuit, 
  Users, 
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

export default function AnalyticsModule({ user }: { user: User }) {
  const [timeframe, setTimeframe] = useState('7D');

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Neural Insights</h2>
          <p className="text-gray-500">Mapping the evolution of your cognitive patterns.</p>
        </div>
        <div className="p-1 glass-morphism rounded-2xl flex gap-1">
          {['24H', '7D', '30D', 'SYNC'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all",
                timeframe === t ? "bg-white text-black" : "text-gray-600 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Focus Depth', val: '42.5m', change: '+12%', icon: Zap, color: 'text-brand-primary' },
          { label: 'Social Sync %', val: '88%', change: '+5%', icon: Users, color: 'text-brand-secondary' },
          { label: 'Karma Yield', val: '1,240', change: '+20%', icon: Activity, color: 'text-blue-500' },
          { label: 'Recovery Efficacy', val: '94%', change: '-2%', icon: BarChart3, color: 'text-orange-500' }
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-morphism p-6 rounded-[32px] space-y-4">
               <div className="flex justify-between items-start">
                 <div className={clsx("p-3 rounded-2xl bg-white/5", stat.color)}>
                   <Icon size={20} />
                 </div>
                 <span className={clsx("text-[10px] font-bold", stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500')}>{stat.change}</span>
               </div>
               <div>
                 <p className="text-2xl font-display font-bold">{stat.val}</p>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{stat.label}</p>
               </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-morphism rounded-[40px] p-8 space-y-8 min-h-[400px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-display font-bold">Cognitive Velocity Index</h3>
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
              <Calendar size={14} />
              <span>MAY 2026</span>
            </div>
          </div>
          
          {/* Simple Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 relative">
             <div className="absolute inset-0 bg-brand-primary/5 blur-3xl opacity-50" />
             {Array.from({ length: 14 }).map((_, i) => (
               <div key={i} className="flex-1 flex flex-col items-center group">
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${Math.random() * 60 + 20}%` }}
                   className="w-full bg-white/5 rounded-t-lg group-hover:bg-brand-primary/40 transition-all border-t border-white/10"
                 />
                 <div className="w-1 h-1 bg-white/20 rounded-full mt-4" />
               </div>
             ))}
          </div>
        </div>

        <div className="glass-morphism rounded-[40px] p-8 space-y-8">
          <h3 className="text-xl font-display font-bold flex items-center">
            <BrainCircuit size={20} className="mr-2 text-brand-primary" />
            Skill Balance
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Deep Logic', val: 80 },
              { label: 'Creative Synth', val: 65 },
              { label: 'Empathetic Sync', val: 92 },
              { label: 'Admin Maintenance', val: 40 }
            ].map(skill => (
              <div key={skill.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>{skill.label}</span>
                  <span>{skill.val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.val}%` }}
                    className="h-full bg-brand-secondary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
