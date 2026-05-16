import { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Zap, 
  Terminal, 
  Play, 
  Sparkles, 
  MessageCircle, 
  Lightbulb,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { ai, MODELS } from '../../services/ai';

interface Node {
  id: string;
  text: string;
  type: 'concept' | 'action' | 'resource';
}

export default function BrainstormModule({ user }: { user: User }) {
  const [topic, setTopic] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const expandIdea = async () => {
    if (!topic.trim()) return;
    setIsExpanding(true);
    try {
      const prompt = `Topic: ${topic}
Task: Generate 5 related concepts, actions, or resources that would help achieve or explore this topic.
Format your response as a valid JSON array of objects like this:
[{"text": "Sample Idea", "type": "concept"}]
Types must be "concept", "action", or "resource".`;

      const result = await ai.models.generateContent({
        model: MODELS.text,
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const newNodes = JSON.parse(result.text || '[]');
      setNodes(prev => [...prev, ...newNodes.map((n: any, i: number) => ({ id: Math.random().toString(), ...n }))]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExpanding(false);
    }
  };

  const clear = () => {
    setTopic('');
    setNodes([]);
    setPlan(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Brainstorm Assistant</h2>
        <p className="text-gray-500">Turning raw sparks into structured momentum.</p>
      </header>

      <div className="glass-morphism p-8 rounded-[40px] space-y-6">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Seed an idea (e.g., Modular Furniture App, New Habit Loop)"
            className="flex-1 bg-transparent border-none focus:outline-none text-2xl font-light placeholder:text-gray-700"
          />
          <button 
            onClick={expandIdea}
            disabled={isExpanding || !topic.trim()}
            className="bg-brand-primary text-white p-4 rounded-2xl hover:scale-105 transition-all disabled:opacity-50"
          >
            <Sparkles size={24} className={isExpanding ? "animate-pulse" : ""} />
          </button>
          <button onClick={clear} className="p-4 glass-morphism rounded-2xl text-gray-600 hover:text-white">
            <Trash2 size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {nodes.map(node => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={clsx(
                  "p-4 rounded-2xl border flex items-start space-x-3",
                  node.type === 'concept' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                  node.type === 'action' ? "bg-green-500/10 border-green-500/30 text-green-400" :
                  "bg-orange-500/10 border-orange-500/30 text-orange-400"
                )}
              >
                <div className="mt-1">
                  {node.type === 'concept' ? <Lightbulb size={14} /> :
                   node.type === 'action' ? <CheckCircle2 size={14} /> :
                   <Zap size={14} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{node.text}</p>
                  <p className="text-[8px] uppercase font-bold opacity-50">{node.type}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="glass-morphism p-6 rounded-3xl flex items-center space-x-4 border-l-4 border-l-brand-secondary">
          <Terminal size={20} className="text-brand-secondary" />
          <p className="text-xs text-gray-500">AI is continuously mapping these nodes to your GoalDNA for relevance check.</p>
        </div>
      </div>
    </div>
  );
}
