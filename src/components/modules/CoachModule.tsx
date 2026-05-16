import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { MessageSquare, Send, Sparkles, User as UserIcon, BrainCircuit, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { ai, MODELS } from '../../services/ai';

interface ChatMessage {
  id?: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: any;
}

export default function CoachModule({ user }: { user: User }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'coachMessages'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms: ChatMessage[] = [];
      snapshot.forEach(doc => ms.push({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(ms);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'coachMessages'));

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, 'coachMessages'), {
        userId: user.uid,
        role: 'user',
        content: userMessage,
        createdAt: Timestamp.now()
      });

      // 2. Generate AI reply
      const contextPrompt = `You are the LifeOS Executive Coach and Social Empathy Advisor.
Your tone is professional, technical, yet deeply empathetic (the $1,000 product feel).
User Identity: ${user.displayName}

CORE MISSION:
- Provide productivity guidance based on energy states.
- Offer empathy-driven social advice (listening cues, timing).
- Suggest habit tiny-gains.

Recent conversation history:
${messages.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

User Input: "${userMessage}"

Respond concisely and with actionable emotional intelligence.`;

      const result = await ai.models.generateContent({
        model: MODELS.text,
        contents: [{ parts: [{ text: contextPrompt }] }]
      });

      // 3. Save AI message to Firestore
      await addDoc(collection(db, 'coachMessages'), {
        userId: user.uid,
        role: 'ai',
        content: result.text,
        createdAt: Timestamp.now()
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto glass-morphism rounded-[40px] overflow-hidden border border-white/5">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-black">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold">LifeOS Coach</h3>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Neural Link Engaged</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="p-2 bg-white/5 rounded-xl text-brand-secondary" title="Empathy Engine Active">
             <Heart size={18} />
           </div>
           <div className="p-2 bg-white/5 rounded-xl text-green-500" title="Privacy Guard Active">
             <ShieldCheck size={18} />
           </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
             <Sparkles size={48} className="text-brand-primary" />
             <div className="space-y-1">
               <p className="text-xl font-display font-bold">Initiate Neural Sync</p>
               <p className="text-sm max-w-xs mx-auto">Ask about your energy, social timing, or current goal blockers.</p>
             </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={clsx(
                "flex w-full",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={clsx(
                "max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-white text-black font-semibold rounded-tr-none" 
                  : "bg-white/5 border border-white/10 rounded-tl-none text-gray-200"
              )}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 p-5 rounded-3xl rounded-tl-none flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-white/5 border-t border-white/5">
        <form onSubmit={sendMessage} className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your current state or social friction..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-brand-primary/50 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-3 bg-brand-primary text-black rounded-xl hover:scale-105 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-4 flex justify-center items-center space-x-2 opacity-30">
          <ShieldCheck size={12} />
          <span className="text-[8px] font-bold uppercase tracking-widest">End-to-End Encrypted Node</span>
        </div>
      </footer>
    </div>
  );
}
