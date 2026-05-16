import { useState } from 'react';
import { User } from 'firebase/auth';
import { Zap, Share2, MessageCircle, MapPin, Globe, Compass, Box, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpatialProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  sharedGoals: string[];
  skills: string[];
  mutualContext: string;
}

const MOCK_PROFILES: SpatialProfile[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Syntactic Architect',
    location: 'Berlin Hub (Virtual)',
    sharedGoals: ['Sustainability AI', 'Modular Systems'],
    skills: ['TS', 'Neural Nets', 'Ethics'],
    mutualContext: 'Both working on the LifeOS expansion.'
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    role: 'Emotional Intelligence Designer',
    location: 'London Hub',
    sharedGoals: ['Human-Centric UX', 'Wellness Pockets'],
    skills: ['Framer', 'Sociology', 'UX'],
    mutualContext: 'Met at the 2026 Decentralized Productivity Summit.'
  }
];

export default function HoloMeetModule({ user }: { user: User }) {
  const [selectedProfile, setSelectedProfile] = useState<SpatialProfile | null>(null);

  return (
    <div className="space-y-8 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold">HoloMeet AR</h2>
          <p className="text-gray-500">Spatial networking in a high-fidelity ecosystem.</p>
        </div>
        <div className="p-1 glass-morphism rounded-2xl flex items-center space-x-2">
           <div className="px-4 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase rounded-xl flex items-center space-x-2">
             <Box size={14} />
             <span>WebXR Fallback Active</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 items-center">
        {/* Spatial Stage */}
        <div className="relative aspect-square flex items-center justify-center perspective-[1000px]">
           <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] animate-pulse" />
           
           {/* Decorative Rings */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
             className="absolute w-[400px] h-[400px] border border-white/5 rounded-full"
           />
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
             className="absolute w-[300px] h-[300px] border border-brand-primary/10 rounded-full"
           />

           <div className="grid grid-cols-2 gap-8 relative z-10">
              {MOCK_PROFILES.map((profile, i) => (
                <motion.button
                  key={profile.id}
                  whileHover={{ scale: 1.1, rotateY: 15, rotateX: -5 }}
                  onClick={() => setSelectedProfile(profile)}
                  className={clsx(
                    "w-48 h-64 glass-morphism rounded-3xl p-6 flex flex-col items-center justify-between transition-all group overflow-hidden relative",
                    selectedProfile?.id === profile.id ? "border-brand-primary glow-primary" : "border-white/10"
                  )}
                  style={{
                    transform: `translateZ(${i * 20}px) rotateY(${i % 2 === 0 ? '-10deg' : '10deg'})`
                  }}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 blur-3xl group-hover:bg-brand-primary/30 transition-all" />
                  
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-orange-500 overflow-hidden border-2 border-white/20">
                     <div className="w-full h-full flex items-center justify-center font-display font-bold text-lg">
                       {profile.name[0]}
                     </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h4 className="font-display font-bold text-sm tracking-tight">{profile.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{profile.role}</p>
                  </div>

                  <div className="flex gap-2">
                    <div className="p-2 bg-white/5 rounded-full text-gray-400">
                      <Globe size={12} />
                    </div>
                    <div className="p-2 bg-white/5 rounded-full text-gray-400">
                      <Share2 size={12} />
                    </div>
                  </div>
                </motion.button>
              ))}
           </div>

           {/* Central Pulse */}
           <motion.div 
             animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute w-24 h-24 bg-brand-primary/20 rounded-full blur-2xl"
           />
        </div>

        {/* Profile Inspector */}
        <AnimatePresence mode="wait">
          {selectedProfile ? (
            <motion.div 
              key={selectedProfile.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="glass-morphism p-8 rounded-[40px] space-y-8 border-l-4 border-l-brand-primary"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-4xl font-display font-bold leading-none">{selectedProfile.name}</h2>
                  <p className="text-brand-primary font-bold uppercase tracking-[0.2em] text-xs">{selectedProfile.role}</p>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Last Spatial Touch</span>
                  <span className="text-xs font-mono">2026.05.02 // 14:30</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                   <div className="flex items-center space-x-2 text-gray-500">
                     <MapPin size={14} />
                     <span className="text-[10px] font-bold uppercase">Node Hub</span>
                   </div>
                   <p className="text-sm">{selectedProfile.location}</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                   <div className="flex items-center space-x-2 text-gray-500">
                     <Compass size={14} />
                     <span className="text-[10px] font-bold uppercase">Shared Vector</span>
                   </div>
                   <p className="text-sm">{selectedProfile.sharedGoals[0]}</p>
                 </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center">
                  <UserCheck size={14} className="mr-2" />
                  Mutual Context
                </h4>
                <p className="text-gray-300 font-light leading-relaxed">
                  {selectedProfile.mutualContext}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Skills Matrix</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.skills.map(s => (
                    <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all">
                  <MessageCircle size={18} />
                  <span>Initiate Sync</span>
                </button>
                <button className="flex-1 py-4 glass-morphism rounded-2xl flex items-center justify-center space-x-2 hover:bg-white/10 transition-all">
                   <Share2 size={18} />
                   <span>Exchange Card</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-center p-12 space-y-4 glass-morphism rounded-[40px] opacity-40">
              <Zap size={48} className="text-brand-primary" />
              <p className="font-light text-xl">Select a spiritual peer from the spatial stage to inspect their context.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
