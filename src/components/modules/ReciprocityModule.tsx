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
  orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Repeat, ArrowUpRight, ArrowDownLeft, Scale, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface Reciprocity {
  id: string;
  contactId: string;
  contactName?: string;
  given: number;
  received: number;
  lastAction: string;
}

export default function ReciprocityModule({ user }: { user: User }) {
  const [data, setData] = useState<Reciprocity[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'reciprocity'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rs: Reciprocity[] = [];
      snapshot.forEach(doc => rs.push({ id: doc.id, ...doc.data() } as Reciprocity));
      setData(rs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reciprocity'));

    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Reciprocity Tracker</h2>
        <p className="text-gray-500">Measuring the energetic flows in your social universe.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item) => (
          <motion.div 
            key={item.id}
            layout
            className="glass-morphism p-6 rounded-[32px] space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-display font-bold">Contact Node {item.contactId.substring(0, 4)}</h3>
              <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                <Scale size={20} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   <span>Given Support</span>
                   <span className="text-brand-secondary">+{item.given}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-secondary" style={{ width: `${(item.given / (item.given + item.received + 1)) * 100}%` }} />
                </div>
              </div>
              <Repeat className="text-gray-700" size={16} />
              <div className="flex-1 space-y-2 text-right">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   <span className="text-brand-primary">+{item.received}</span>
                   <span>Received Support</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary" style={{ width: `${(item.received / (item.given + item.received + 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <button className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center space-x-2">
                <ArrowUpRight size={14} />
                <span>Log Give</span>
              </button>
              <button className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center space-x-2">
                <ArrowDownLeft size={14} />
                <span>Log Receive</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-morphism p-8 rounded-[40px] space-y-6">
        <div className="flex items-center space-x-2 text-brand-primary">
          <TrendingUp size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Global Karma Pulse</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Reciprocity', val: '86%', color: 'text-brand-secondary' },
            { label: 'Support Reached', val: '12 Users', color: 'text-white' },
            { label: 'Karma Earned', val: '450 pts', color: 'text-brand-primary' },
            { label: 'System Health', val: 'Balanced', color: 'text-brand-secondary' }
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 p-4 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</p>
              <p className={clsx("text-lg font-bold", stat.color)}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
