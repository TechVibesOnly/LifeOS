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
import { Users, Plus, Target, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Pod {
  id: string;
  name: string;
  members: string[];
  goalType: string;
  pace: string;
  createdAt: any;
}

export default function PodsModule({ user }: { user: User }) {
  const [pods, setPods] = useState<Pod[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPodName, setNewPodName] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'pods'),
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ps: Pod[] = [];
      snapshot.forEach(doc => ps.push({ id: doc.id, ...doc.data() } as Pod));
      setPods(ps);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pods'));

    return () => unsubscribe();
  }, [user.uid]);

  const createPod = async () => {
    if (!newPodName.trim()) return;
    try {
      await addDoc(collection(db, 'pods'), {
        name: newPodName,
        members: [user.uid],
        goalType: 'Holistic growth',
        pace: 'Balanced',
        createdAt: Timestamp.now()
      });
      setNewPodName('');
      setShowCreate(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pods');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold">Accountability Pods</h2>
          <p className="text-gray-500">Growth is a collective endeavor.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center space-x-2 px-4 py-2 glass-morphism rounded-xl hover:bg-white/10 transition-colors"
        >
          <Plus size={18} />
          <span>New Pod</span>
        </button>
      </header>

      {showCreate && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-6 rounded-3xl space-y-4"
        >
          <h3 className="font-display font-semibold">Start an Accountability Circle</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={newPodName}
              onChange={(e) => setNewPodName(e.target.value)}
              placeholder="Pod Name (e.g., Early Risers, Code Masters)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
            />
            <button 
              onClick={createPod}
              className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl"
            >
              Initialize
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {pods.map(pod => (
            <motion.div
              key={pod.id}
              layout
              className="glass-morphism p-6 rounded-3xl space-y-6 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                  <Users size={24} />
                </div>
                <div className="flex -space-x-2">
                  {pod.members.map((m, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                      {m.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold">{pod.name}</h3>
                <p className="text-sm text-gray-500">{pod.goalType} • {pod.pace} pace</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-500">Streak</p>
                  <div className="flex items-center space-x-1 text-brand-secondary">
                    <TrendingUp size={14} />
                    <span className="text-lg font-bold">12 Days</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-500">Check-ins</p>
                  <div className="flex items-center space-x-1 text-blue-400">
                    <ShieldCheck size={14} />
                    <span className="text-lg font-bold">85%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors">
                  <MessageSquare size={14} />
                  <span>Discussion</span>
                </button>
                <button className="flex-1 py-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors">
                  <Target size={14} />
                  <span>View Goals</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {pods.length === 0 && !showCreate && (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-600 space-y-4">
             <div className="p-6 bg-white/5 rounded-full">
               <Users size={40} />
             </div>
             <p className="font-light">Connect with others to accelerate your growth.</p>
           </div>
        )}
      </div>
    </div>
  );
}
