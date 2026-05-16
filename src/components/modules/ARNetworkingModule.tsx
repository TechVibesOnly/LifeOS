import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Zap, Users, Shield, Cpu, Share2, Globe, Sparkles } from 'lucide-react';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'person' | 'system' | 'goal';
}

export default function ARNetworkingModule({ user }: { user: User }) {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [activeNode, setActiveNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    // Generate initial floating nodes
    const initialNodes: NetworkNode[] = [
      { id: '1', x: 20, y: 30, label: 'Cognitive Node A', type: 'system' },
      { id: '2', x: 70, y: 20, label: 'Social Sync: Sarah', type: 'person' },
      { id: '3', x: 50, y: 70, label: 'Vision Meta-Goal', type: 'goal' },
      { id: '4', x: 80, y: 60, label: 'Neural Link XP', type: 'system' },
      { id: '5', x: 10, y: 80, label: 'Mentorship Channel', type: 'person' },
    ];
    setNodes(initialNodes);
  }, []);

  return (
    <div className="relative h-[calc(100vh-12rem)] w-full glass-morphism rounded-[60px] overflow-hidden border border-white/5 bg-black/40 group">
      {/* Background HUD Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <header className="absolute top-12 left-12 z-20 space-y-2">
        <div className="flex items-center space-x-3 text-brand-primary">
          <Globe size={24} className="animate-spin [animation-duration:8s]" />
          <h2 className="text-3xl font-display font-bold tracking-tighter">AR Neural Grid</h2>
        </div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Holographic Relationship Visualization</p>
      </header>

      {/* The Grid Canvas */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: `${node.x - 50}%`,
              y: `${node.y - 50}%`
            }}
            whileHover={{ scale: 1.2, zIndex: 30 }}
            onClick={() => setActiveNode(node)}
            className="absolute cursor-pointer flex flex-col items-center"
          >
            <div className={clsx(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 glow-primary shadow-2xl",
              node.type === 'person' ? "bg-brand-secondary/20 border-brand-secondary" : "bg-brand-primary/20 border-brand-primary",
              activeNode?.id === node.id ? "scale-150 ring-4 ring-white/20" : ""
            )}>
              {node.type === 'person' ? <Users size={20} /> : node.type === 'system' ? <Cpu size={20} /> : <Zap size={20} />}
            </div>
            
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: activeNode?.id === node.id ? 1 : 0.4 }}
               className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/80 whitespace-nowrap bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/5"
            >
              {node.label}
            </motion.div>
          </motion.div>
        ))}

        {/* Floating Connection Lines (Visual Decor) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <line x1="20%" y1="30%" x2="70%" y2="20%" stroke="cyan" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="70%" y1="20%" x2="50%" y2="70%" stroke="cyan" strokeWidth="1" />
          <line x1="20%" y1="30%" x2="50%" y2="70%" stroke="cyan" strokeWidth="1" />
          <line x1="50%" y1="70%" x2="80%" y2="60%" stroke="cyan" strokeWidth="1" />
        </svg>
      </div>

      {/* Side HUD - Detailed Node View */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-12 right-12 bottom-12 w-80 glass-morphism rounded-[40px] p-8 z-30 flex flex-col space-y-8 border-l border-white/10"
          >
             <div className="flex justify-between items-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Node Protocol 0x{activeNode.id}</span>
               <button onClick={() => setActiveNode(null)} className="text-gray-500 hover:text-white">✕</button>
             </div>

             <div className="space-y-4">
               <h3 className="text-2xl font-display font-bold leading-tight">{activeNode.label}</h3>
               <div className="flex items-center space-x-2">
                 <Shield size={14} className="text-green-500" />
                 <span className="text-[10px] font-bold uppercase text-gray-500">Trusted Connection</span>
               </div>
             </div>

             <div className="flex-1 space-y-6">
               <div className="space-y-2">
                 <p className="text-[10px] font-bold text-gray-600 uppercase">Synchronicity Index</p>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '88%' }}
                     className="h-full bg-brand-primary"
                   />
                 </div>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                 <Share2 size={18} className="text-gray-400" />
                 <div className="text-right">
                   <p className="text-[10px] text-gray-600 uppercase font-bold">Relational Flow</p>
                   <p className="font-display font-bold text-lg">+12.4%</p>
                 </div>
               </div>
             </div>

             <button className="w-full py-4 bg-brand-primary text-black font-bold rounded-2xl flex items-center justify-center space-x-2 hover:scale-105 transition-all">
                <Sparkles size={18} />
                <span>Optimize Link</span>
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control HUD */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
        <button className="px-6 py-3 glass-morphism rounded-2xl hover:bg-white/5 transition-all flex items-center space-x-2 group">
          <Zap size={18} className="group-hover:text-brand-primary transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Rescan Grid</span>
        </button>
        <div className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-gray-500 animate-pulse">
           <Activity size={18} />
        </div>
      </div>
    </div>
  );
}
