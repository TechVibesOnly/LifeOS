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
  orderBy,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../services/db';
import { Zap, Clock, Plus, Trash2, CheckCircle2, AlertCircle, Wand2, Battery, BatteryMedium, BatteryLow, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai, MODELS } from '../../services/ai';

interface Task {
  id: string;
  title: string;
  energyReq: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  pocket: string;
  urgency: number;
  whyThisNow?: string;
  createdAt: any;
}

const POCKETS = ['Main', 'Work', 'Personal', 'Health', 'Social'];

export default function TasksModule({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentEnergy, setCurrentEnergy] = useState(70);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedPocket, setSelectedPocket] = useState('Main');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ts: Task[] = [];
      snapshot.forEach((doc) => ts.push({ id: doc.id, ...doc.data() } as Task));
      setTasks(ts);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    return () => unsubscribe();
  }, [user.uid]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        energyReq: newTaskEnergy,
        pocket: selectedPocket,
        status: 'pending',
        urgency: 5,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setNewTaskTitle('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: task.status === 'completed' ? 'pending' : 'completed',
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const getAISuggestion = async () => {
    if (tasks.length === 0) return;
    setIsSuggesting(true);
    
    try {
      const taskList = tasks.filter(t => t.status !== 'completed').map(t => `- ${t.title} (${t.energyReq} energy)`).join('\n');
      const prompt = `You are LifeOS, an emotionally intelligent productivity AI.
Current User Energy: ${currentEnergy}%
Current Pending Tasks:
${taskList}

Recommend the ONE best task for the user right now. 
Consider their energy level. If energy is low, suggest a 'low' energy task. 
If energy is high, push them to do a 'high' energy task.
Explain WHY in one short, supportive sentence.

Return JSON format: 
{ "recommendedTaskTitle": "Title", "reason": "Reason why" }`;

      const result = await ai.models.generateContent({
        model: MODELS.text,
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const recommendation = JSON.parse(result.text || '{}');
      
      // Find the task and update its 'whyThisNow'
      const taskToUpdate = tasks.find(t => t.title === recommendation.recommendedTaskTitle);
      if (taskToUpdate) {
        await updateDoc(doc(db, 'tasks', taskToUpdate.id), {
          whyThisNow: recommendation.reason,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const filteredTasks = (energy: string) => tasks.filter(t => t.energyReq === energy && t.status !== 'completed' && t.pocket === selectedPocket);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Parallel Prioritization</h2>
          <p className="text-gray-500">Managing life's dimensions without the chaos.</p>
        </div>
        
        <div className="flex gap-2 p-1 glass-morphism rounded-2xl overflow-x-auto max-w-[400px]">
          {POCKETS.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPocket(p)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedPocket === p ? "bg-white text-black" : "text-gray-500 hover:text-white"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        
        <div className="glass-morphism rounded-2xl p-4 flex items-center space-x-6 min-w-[300px]">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-gray-500">
              <span>System Energy</span>
              <span>{currentEnergy}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentEnergy}%` }}
                className={clsx(
                  "h-full rounded-full transition-all duration-1000",
                  currentEnergy > 70 ? "bg-brand-secondary" : currentEnergy > 30 ? "bg-yellow-400" : "bg-red-500"
                )}
              />
            </div>
          </div>
          <button 
            onClick={() => setCurrentEnergy(prev => Math.min(100, prev + 10))}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
          >
            <Plus size={16} />
          </button>
        </div>
      </header>

      <form onSubmit={addTask} className="flex gap-2">
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What needs mental space?"
          className="flex-1 glass-morphism rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
        />
        <select 
          value={newTaskEnergy}
          onChange={(e) => setNewTaskEnergy(e.target.value as any)}
          className="glass-morphism rounded-2xl px-4 py-4 appearance-none focus:outline-none"
        >
          <option value="low">Low Energy</option>
          <option value="medium">Med Energy</option>
          <option value="high">High Energy</option>
        </select>
        <button type="submit" className="bg-white text-black font-bold px-6 py-4 rounded-2xl hover:bg-gray-200 transition-colors">
          Add
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'high', label: 'Deep Focus', icon: Battery, color: 'text-brand-primary' },
          { id: 'medium', label: 'Steady Pace', icon: BatteryMedium, color: 'text-yellow-400' },
          { id: 'low', label: 'Light Work', icon: BatteryLow, color: 'text-brand-secondary' }
        ].map(lane => (
          <div key={lane.id} className="space-y-4">
            <div className="flex items-center space-x-2 px-2">
              <lane.icon className={lane.color} size={18} />
              <h3 className="font-display font-semibold uppercase tracking-widest text-xs text-gray-500">{lane.label}</h3>
            </div>
            
            <div className="space-y-3 min-h-[100px]">
              <AnimatePresence>
                {filteredTasks(lane.id).map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-morphism p-4 rounded-2xl group hover:border-brand-primary/30 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => toggleComplete(task)} className="mt-1 text-gray-600 hover:text-green-500 transition-colors">
                        <CheckCircle2 size={18} />
                      </button>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.whyThisNow && (
                          <p className="text-[10px] text-brand-primary font-medium flex items-start">
                            <AlertCircle size={10} className="mr-1 mt-0.5" />
                            {task.whyThisNow}
                          </p>
                        )}
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-700 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={getAISuggestion}
          disabled={isSuggesting || tasks.length === 0}
          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-brand-primary to-orange-400 text-white font-bold rounded-full shadow-2xl shadow-brand-primary/20 disabled:opacity-50"
        >
          {isSuggesting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
              <Activity size={20} />
            </motion.div>
          ) : (
            <Wand2 size={20} />
          )}
          <span>LifeOS Guidance</span>
        </motion.button>
      </div>
    </div>
  );
}

function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
