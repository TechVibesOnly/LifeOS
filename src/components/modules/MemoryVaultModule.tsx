import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Archive, Trophy, Lightbulb, Camera, Trash2, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface Memory {
  id: string;
  content: string;
  type: 'win' | 'lesson' | 'moment' | 'reflection';
  emotion: string;
  createdAt: any;
}

export default function MemoryVaultModule({ user }: { user: User }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'win' | 'lesson' | 'moment' | 'reflection'>('moment');

  useEffect(() => {
    const q = query(
      collection(db, 'memories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms: Memory[] = [];
      snapshot.forEach(doc => ms.push({ id: doc.id, ...doc.data() } as Memory));
      setMemories(ms);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'memories'));

    return () => unsubscribe();
  }, [user.uid]);

  const saveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await addDoc(collection(db, 'memories'), {
        userId: user.uid,
        content: newContent,
        type: newType,
        emotion: 'Neutral',
        createdAt: Timestamp.now()
      });
      setNewContent('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'memories');
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `memories/${id}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'win': return <Trophy className="text-yellow-400" size={18} />;
      case 'lesson': return <Lightbulb className="text-blue-400" size={18} />;
      case 'reflection': return <Sparkles className="text-purple-400" size={18} />;
      default: return <Camera className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Memory Vault</h2>
        <p className="text-gray-500">A timeline of your growth, preserved in time.</p>
      </header>

      <form onSubmit={saveMemory} className="glass-morphism p-6 rounded-[32px] space-y-4">
        <textarea 
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Capture a win, a lesson, or a moment..."
          className="w-full bg-transparent border-none focus:outline-none text-xl font-light resize-none min-h-[100px]"
        />
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <div className="flex gap-2">
            {(['win', 'lesson', 'moment', 'reflection'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setNewType(t)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  newType === t ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button type="submit" className="bg-brand-primary text-white font-bold p-3 rounded-2xl hover:scale-105 transition-all">
            <Plus size={24} />
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-morphism p-6 rounded-3xl space-y-4 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-2xl">
                  {getTypeIcon(memory.type)}
                </div>
                <button 
                  onClick={() => deleteMemory(memory.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-700 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <p className="text-lg font-light leading-relaxed text-gray-200">
                {memory.content}
              </p>

              <div className="flex justify-between items-center pt-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                <span>{new Date(memory.createdAt?.toDate()).toLocaleDateString()}</span>
                <span className="text-brand-primary">{memory.type}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {memories.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-600 opacity-50 space-y-4">
             <Archive size={64} />
             <p className="text-xl font-light">Your vault is empty. Start capturing the journey.</p>
          </div>
        )}
      </div>
    </div>
  );
}
