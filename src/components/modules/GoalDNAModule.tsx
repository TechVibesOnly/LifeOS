import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Fingerprint, Cpu, Zap, Activity, Brain, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface DNATraits {
  focusLength: number;
  workingStyle: string;
  deadlineResponse: string;
  motivationTriggers: string[];
}

interface GoalDNA {
  userId: string;
  traits: DNATraits;
  updatedAt: any;
}

export default function GoalDNAModule({ user }: { user: User }) {
  const [dna, setDna] = useState<GoalDNA | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'goalDNA'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setDna({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any);
      } else {
        // Initialize default DNA if none exists
        const defaultDNA = {
          userId: user.uid,
          traits: {
            focusLength: 25,
            workingStyle: 'Deep Specialist',
            deadlineResponse: 'Sprint Finisher',
            motivationTriggers: ['Autonomy', 'Growth']
          },
          updatedAt: Timestamp.now()
        };
        setDoc(doc(db, 'goalDNA', user.uid), defaultDNA);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'goalDNA'));

    return () => unsubscribe();
  }, [user.uid]);

  const updateTrait = async (trait: keyof DNATraits, value: any) => {
    if (!dna) return;
    try {
      await setDoc(doc(db, 'goalDNA', user.uid), {
        ...dna,
        traits: { ...dna.traits, [trait]: value },
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goalDNA/${user.uid}`);
    }
  };

  if (!dna) return null;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">GoalDNA Engine</h2>
        <p className="text-gray-500">Your unique productivity fingerprint, evolved.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DNA Visualization */}
        <div className="lg:col-span-1 glass-morphism rounded-[40px] p-8 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5 blur-[80px]" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="text-brand-primary/40 relative"
          >
            <Fingerprint size={120} />
          </motion.div>
          
          <div className="text-center space-y-2 relative">
            <h3 className="text-xl font-display font-bold uppercase tracking-tighter">System ID: {user.displayName?.split(' ')[0]}</h3>
            <p className="text-xs text-gray-500 font-mono">ENCODED_SINCE_{new Date(user.metadata.creationTime || '').getFullYear()}</p>
          </div>

          <div className="w-full space-y-4 pt-4">
            {[
              { label: 'Cognitive Load', val: 78, color: 'bg-brand-primary' },
              { label: 'Adaptability', val: 92, color: 'bg-brand-secondary' },
              { label: 'Focus Depth', val: 64, color: 'bg-blue-500' }
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>{stat.label}</span>
                  <span>{stat.val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.val}%` }}
                    className={clsx("h-full", stat.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mutable Traits */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TraitCard 
            icon={Cpu} 
            title="Working Style" 
            value={dna.traits.workingStyle}
            options={['Deep Specialist', 'Multi-Tasker', 'Chaotic Creative', 'Sprint Master']}
            onSelect={(v) => updateTrait('workingStyle', v)}
          />
          <TraitCard 
            icon={Activity} 
            title="Focus Length" 
            value={`${dna.traits.focusLength}m`}
            options={['15m', '25m', '45m', '90m']}
            onSelect={(v) => updateTrait('focusLength', parseInt(v))}
          />
          <TraitCard 
            icon={Zap} 
            title="Deadline Response" 
            value={dna.traits.deadlineResponse}
            options={['Sprint Finisher', 'Early Bird', 'Pressure Cooker', 'Steady Hand']}
            onSelect={(v) => updateTrait('deadlineResponse', v)}
          />
          <TraitCard 
            icon={Brain} 
            title="Core Drive" 
            value={dna.traits.motivationTriggers[0]}
            options={['Autonomy', 'Growth', 'Impact', 'Mastery']}
            onSelect={(v) => updateTrait('motivationTriggers', [v, ...dna.traits.motivationTriggers.slice(1)])}
          />
        </div>
      </div>
    </div>
  );
}

function TraitCard({ icon: Icon, title, value, options, onSelect }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-morphism p-6 rounded-3xl space-y-4 hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-2xl text-gray-400 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <button onClick={() => setOpen(!open)} className="text-gray-600 hover:text-white transition-colors">
          <SlidersHorizontal size={16} />
        </button>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{title}</p>
        <p className="text-xl font-display font-bold mt-1">{value}</p>
      </div>

      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 pt-2"
        >
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={clsx(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                value.includes(opt) ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:text-white"
              )}
            >
              {opt}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
