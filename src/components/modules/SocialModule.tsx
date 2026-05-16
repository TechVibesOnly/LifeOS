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
  orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Network, Search, UserPlus, Heart, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { ai, MODELS } from '../../services/ai';

interface Relationship {
  id: string;
  contactName: string;
  strength: number; // 0-100
  type: 'friend' | 'mentor' | 'collaborator' | 'family' | 'weak-tie';
  lastInteraction: any;
  healthIndicator: string;
}

export default function SocialModule({ user }: { user: User }) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suggestion, setSuggestion] = useState<{name: string, reason: string} | null>(null);
  const [currentMood, setCurrentMood] = useState('Steady');

  const MOODS = ['Steady', 'Reflective', 'Seeking Sync', 'Focused', 'Exhausted'];

  useEffect(() => {
    const q = query(
      collection(db, 'relationships'),
      where('userId', '==', user.uid),
      orderBy('strength', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rs: Relationship[] = [];
      snapshot.forEach(doc => rs.push({ id: doc.id, ...doc.data() } as Relationship));
      setRelationships(rs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'relationships'));

    return () => unsubscribe();
  }, [user.uid]);

  const suggestContact = async () => {
    if (relationships.length === 0) return;
    setIsRefreshing(true);
    try {
      const contacts = relationships.map(r => `- ${r.contactName} (Type: ${r.type}, Strength: ${r.strength}%)`).join('\n');
      const prompt = `User Current Mood: ${currentMood}
Social Connections:
${contacts}

Suggest ONE person I should reach out to today based on my mood and social map.
Include:
1. Target Name
2. Social Timing (Why now?)
3. Listening Cue (A specific high-EQ thing to ask about or focus on)
4. Contextual Prompt (An empathy-driven conversation starter)

Return JSON: { "name": "Name", "timing": "Why now?", "listeningCue": "Cues", "reason": "General reason", "prompt": "Starter" }`;

      const result = await ai.models.generateContent({
        model: MODELS.text,
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      setSuggestion(JSON.parse(result.text || 'null'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Empathy Advisor</h2>
          <p className="text-gray-500 font-light">Focus on better communication and social timing.</p>
        </div>
        <div className="flex flex-col items-end space-y-4">
           <div className="flex gap-1 p-1 glass-morphism rounded-2xl overflow-x-auto no-scrollbar">
             {MOODS.map(m => (
               <button 
                 key={m}
                 onClick={() => setCurrentMood(m)}
                 className={clsx(
                   "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                   currentMood === m ? "bg-white text-black shadow-lg scale-105" : "text-gray-500 hover:text-white"
                 )}
               >
                 {m}
               </button>
             ))}
           </div>
           <div className="flex gap-2">
              <button 
                onClick={suggestContact}
                disabled={isRefreshing || relationships.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-brand-primary text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                <span>Sync Node Advice</span>
              </button>
           </div>
        </div>
      </header>

      {suggestion && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-1 rounded-[40px] bg-gradient-to-br from-brand-primary/40 to-brand-secondary/40 relative group"
        >
          <div className="absolute inset-0 blur-3xl bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="glass-morphism h-full w-full rounded-[38px] p-8 md:p-12 flex flex-col gap-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-[32px] bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Heart size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-3xl tracking-tight">Sync Target: {suggestion.name}</h3>
                  <p className="text-brand-primary text-sm font-bold uppercase tracking-widest">{suggestion.timing}</p>
                </div>
              </div>
              <button 
                onClick={() => setSuggestion(null)}
                className="px-4 py-2 glass-morphism rounded-xl text-xs font-bold uppercase text-gray-500 hover:text-white transition-colors"
              >
                Reset Insight
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3 p-6 glass-morphism rounded-[32px] border-l-4 border-l-brand-secondary">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Listening Cues</h4>
                 <p className="text-gray-300 font-light leading-relaxed">{(suggestion as any).listeningCue}</p>
               </div>
               <div className="space-y-3 p-6 glass-morphism rounded-[32px] border-l-4 border-l-brand-primary">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary">Empathetic Prompt</h4>
                 <p className="text-gray-300 font-light italic leading-relaxed">"{(suggestion as any).prompt}"</p>
               </div>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl">
               <p className="text-sm text-gray-400 font-light leading-relaxed">
                 <span className="font-bold text-white">Advisor Logic:</span> {suggestion.reason}
               </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Map Placeholder - Using as a summary area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-morphism p-8 rounded-[40px] aspect-video flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
             {/* Abstract background blobs */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px]" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 blur-[100px]" />
             
             <Network size={64} className="text-brand-primary/30 mb-2" />
             <div className="space-y-2">
               <h3 className="text-2xl font-display font-bold">Network Resilience</h3>
               <p className="text-gray-500 max-w-sm mx-auto">Your social map is currently balanced with 12 active connections and 4 mentors.</p>
             </div>
             
             <div className="flex gap-4">
               {['Close Circl', 'Mentors', 'Weak Ties', 'Action Needed'].map((tag, i) => (
                 <div key={i} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/10">
                   {tag}
                 </div>
               ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relationships.slice(0, 4).map(rel => (
              <div key={rel.id} className="glass-morphism p-4 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-gray-400">
                  {rel.contactName.substring(0, 1)}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{rel.contactName}</p>
                  <p className="text-xs text-gray-500 capitalize">{rel.type}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-brand-secondary">{rel.strength}%</div>
                  <div className="h-1 w-12 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-brand-secondary" style={{ width: `${rel.strength}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Feed / Needs Warmth */}
        <div className="space-y-4">
           <h3 className="font-display font-bold uppercase tracking-widest text-xs text-gray-500 px-2 flex items-center">
             <Heart size={14} className="mr-2 text-red-500" />
             Connection Health
           </h3>
           <div className="space-y-3">
             {relationships.length === 0 ? (
                <div className="p-8 text-center text-gray-600 font-light border border-dashed border-white/10 rounded-3xl">
                  No social data synced yet.
                </div>
             ) : (
               relationships.map(rel => (
                 <div key={rel.id} className="glass-morphism p-4 rounded-2xl border-l-4 border-l-brand-primary">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{rel.contactName}</p>
                      {rel.strength < 40 && (
                        <div className="p-1 bg-red-500/10 text-red-500 rounded">
                          <AlertCircle size={10} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Stale for 14 days</p>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
