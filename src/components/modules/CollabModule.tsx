import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Grid3X3, Users, Zap, FileText, Plus, Search, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai, MODELS } from '../../services/ai';

interface CollabSession {
  id: string;
  title: string;
  participants: string[];
  activeSkills: string[];
  matrixData: Record<string, any>;
  summary?: string;
  status: 'active' | 'archived';
  createdAt: any;
}

export default function CollabModule({ user }: { user: User }) {
  const [sessions, setSessions] = useState<CollabSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollabSession | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'collabSessions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ss: CollabSession[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as CollabSession;
        if (data.participants.includes(user.uid)) {
          ss.push({ id: doc.id, ...data });
        }
      });
      setSessions(ss);
      if (activeSession) {
        const updated = ss.find(s => s.id === activeSession.id);
        if (updated) setActiveSession(updated);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'collabSessions'));

    return () => unsubscribe();
  }, [user.uid, activeSession?.id]);

  const createSession = async () => {
    try {
       const newSession = {
         title: `Sync Session ${new Date().toLocaleDateString()}`,
         participants: [user.uid],
         activeSkills: ['Problem Solving', 'Architecture'],
         matrixData: {},
         status: 'active',
         createdAt: Timestamp.now()
       };
       const ref = await addDoc(collection(db, 'collabSessions'), newSession);
       setActiveSession({ id: ref.id, ...newSession } as CollabSession);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'collabSessions');
    }
  };

  const generateSummary = async () => {
    if (!activeSession) return;
    setIsSummarizing(true);
    try {
      const prompt = `Review the following collaboration matrix data:
${JSON.stringify(activeSession.matrixData)}

Participants: ${activeSession.participants.join(', ')}
Skills Involved: ${activeSession.activeSkills.join(', ')}

Generate a high-level summary of the progress and next steps. 
Supportive, professional, and technical tone.
Return plain text summary.`;

      const result = await ai.models.generateContent({
        model: MODELS.text,
        contents: [{ parts: [{ text: prompt }] }]
      });

      await updateDoc(doc(db, 'collabSessions', activeSession.id), {
        summary: result.text,
        updatedAt: Timestamp.now()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold">Collaboration Grid</h2>
          <p className="text-gray-500">Real-time skill matching and collective problem solving.</p>
        </div>
        <button 
          onClick={createSession}
          className="bg-brand-secondary text-black font-bold px-6 py-2 rounded-xl flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>New Matrix</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Active Matrices</h3>
          <div className="space-y-2">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s)}
                className={clsx(
                  "w-full text-left p-4 rounded-2xl transition-all border",
                  activeSession?.id === s.id ? "glass-morphism border-brand-secondary" : "bg-white/5 border-transparent hover:bg-white/10"
                )}
              >
                <p className="font-bold text-sm">{s.title}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex -space-x-1">
                    {s.participants.map(p => (
                      <div key={p} className="w-4 h-4 rounded-full bg-brand-secondary border border-black" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500">{s.participants.length} Active</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {!activeSession ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-morphism h-[500px] rounded-[40px] flex flex-col items-center justify-center text-center p-12 space-y-6"
              >
                <Grid3X3 size={64} className="text-brand-secondary/20" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold">Select a Matrix to Begin</h3>
                  <p className="text-gray-500 max-w-sm">Connect with peers, map skills, and solve complex problems in a shared spatial environment.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeSession.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="glass-morphism p-8 rounded-[40px] min-h-[400px] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-display font-bold">{activeSession.title}</h3>
                      <div className="flex gap-2 mt-2">
                        {activeSession.activeSkills.map(s => (
                          <span key={s} className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold uppercase rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={generateSummary}
                        disabled={isSummarizing}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-gray-400"
                      >
                        {isSummarizing ? <Zap size={20} className="animate-pulse" /> : <FileText size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Grid Matrix Visualization */}
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="aspect-square bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-2 group hover:bg-brand-secondary/5 hover:border-brand-secondary/30 transition-all cursor-pointer"
                      >
                         <Users size={20} className="text-gray-700 group-hover:text-brand-secondary" />
                         <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">Node {i+1}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Summary Overlay */}
                  {activeSession.summary && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-8 p-6 bg-brand-secondary/5 rounded-3xl border border-brand-secondary/20 space-y-2"
                    >
                      <div className="flex items-center space-x-2 text-brand-secondary">
                        <Terminal size={14} />
                        <span className="text-[10px] font-bold uppercase">AI Collective Summary</span>
                      </div>
                      <p className="text-sm font-light leading-relaxed text-gray-300 italic">
                        "{activeSession.summary}"
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
