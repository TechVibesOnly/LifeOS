import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Moon, Sun, CloudMoon, PenTool, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

export default function ReflectionModule({ user }: { user: User }) {
  const [activeMode, setActiveMode] = useState<'pre-sleep' | 'morning'>('pre-sleep');
  const [content, setContent] = useState('');
  const [dreamNotes, setDreamNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveReflection = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reflections'), {
        userId: user.uid,
        type: activeMode,
        content,
        dreamNotes: activeMode === 'morning' ? dreamNotes : '',
        createdAt: Timestamp.now()
      });
      setContent('');
      setDreamNotes('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reflections');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12">
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-1 glass-morphism rounded-full flex gap-2">
            {[
              { id: 'pre-sleep', label: 'Dusk Sync', icon: Moon },
              { id: 'morning', label: 'Dawn Insight', icon: Sun }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id as any)}
                className={clsx(
                  "flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase transition-all",
                  activeMode === m.id ? "bg-white text-black" : "text-gray-500 hover:text-white"
                )}
              >
                <m.icon size={16} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <h2 className="text-4xl font-display font-bold">
          {activeMode === 'pre-sleep' ? 'The Evening Dump' : 'Morning Clarity'}
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          {activeMode === 'pre-sleep' 
            ? 'Clear your cognitive load before entering rest state.' 
            : 'Capture the whispers of the subconscious and set your vector.'}
        </p>
      </header>

      <div className="space-y-6">
        <div className="glass-morphism p-8 rounded-[40px] space-y-6">
           <div className="flex items-center space-x-2 text-brand-primary">
             <PenTool size={18} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Thought Stream</span>
           </div>
           <textarea 
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder={activeMode === 'pre-sleep' ? "What's occupying your RAM?" : "What's the primary intention for today?"}
             className="w-full bg-transparent border-none focus:outline-none text-2xl font-light resize-none min-h-[200px]"
           />
        </div>

        {activeMode === 'morning' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism p-8 rounded-[40px] space-y-6 border-brand-secondary/20"
          >
             <div className="flex items-center space-x-2 text-brand-secondary">
               <CloudMoon size={18} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Dream Captive</span>
             </div>
             <textarea 
               value={dreamNotes}
               onChange={(e) => setDreamNotes(e.target.value)}
               placeholder="Any fragments from the night?"
               className="w-full bg-transparent border-none focus:outline-none text-lg font-light resize-none min-h-[100px]"
             />
          </motion.div>
        )}

        <div className="flex justify-center">
          <button 
            onClick={saveReflection}
            disabled={isSubmitting || !content.trim()}
            className="group px-12 py-5 bg-white text-black font-bold rounded-full text-xl hover:scale-105 transition-all flex items-center space-x-3 disabled:opacity-50"
          >
            <BrainCircuit size={24} />
            <span>Process & Store</span>
          </button>
        </div>
      </div>

      <div className="pt-20 grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="glass-morphism p-6 rounded-3xl space-y-2">
            <Sparkles size={20} className="text-yellow-400" />
            <h4 className="font-bold">Subconscious Mapping</h4>
            <p className="text-xs text-gray-500">Insights from these entries will populate your GoalDNA Engine over time.</p>
         </div>
         <div className="glass-morphism p-6 rounded-3xl space-y-2">
            <Moon size={20} className="text-blue-400" />
            <h4 className="font-bold">Rest Optimization</h4>
            <p className="text-xs text-gray-500">Evening clear-outs are correlated with 22% faster focus entry the next morning.</p>
         </div>
      </div>
    </div>
  );
}
