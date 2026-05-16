import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User, 
  signOut 
} from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Focus, 
  Settings, 
  LogOut,
  Zap,
  Activity,
  Sparkles,
  Moon,
  Lightbulb,
  LogIn,
  MessageSquareCode,
  Archive as VaultIcon,
  BarChart3,
  Globe,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Modules
import TasksModule from './components/modules/TasksModule';
import PodsModule from './components/modules/PodsModule';
import SocialModule from './components/modules/SocialModule';
import FocusModule from './components/modules/FocusModule';
import CollabModule from './components/modules/CollabModule';
import HoloMeetModule from './components/modules/HoloMeetModule';
import GoalDNAModule from './components/modules/GoalDNAModule';
import MemoryVaultModule from './components/modules/MemoryVaultModule';
import HabitCoachModule from './components/modules/HabitCoachModule';
import ReflectionModule from './components/modules/ReflectionModule';
import ReciprocityModule from './components/modules/ReciprocityModule';
import EnergyMapModule from './components/modules/EnergyMapModule';
import BrainstormModule from './components/modules/BrainstormModule';
import HomeModule from './components/modules/HomeModule';
import CoachModule from './components/modules/CoachModule';
import OnboardingModule from './components/modules/OnboardingModule';
import SettingsModule from './components/modules/SettingsModule';
import AnalyticsModule from './components/modules/AnalyticsModule';
import ARNetworkingModule from './components/modules/ARNetworkingModule';

// Services
import { seedService } from './services/seedService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('lifeos_onboarding') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        await seedService.seedInitialData(u);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    localStorage.setItem('lifeos_onboarding', 'true');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] rounded-full translate-y-[-20%]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-12 md:p-20 rounded-[80px] max-w-xl w-full text-center space-y-12 relative z-10"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-6 bg-brand-primary/10 rounded-[40px] text-brand-primary mb-4">
              <Zap size={64} fill="currentColor" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter leading-tight text-white">
              LifeOS <span className="text-brand-primary">v1.0</span>
            </h1>
            <p className="text-gray-500 text-xl font-light leading-relaxed">
              Synthesize your performance. Sync your social nodes. Evolve your cognitive engine.
            </p>
          </div>
          
          <button 
            onClick={login}
            className="group relative w-full py-6 bg-white text-black font-bold rounded-3xl text-xl flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand-primary/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <div className="relative flex items-center space-x-3">
              <LogIn size={24} />
              <span>Initiate Sync</span>
            </div>
          </button>

          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-700">
            Encrypted Neural Connection Protocol Enabled
          </p>
        </motion.div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingModule onComplete={handleOnboardingComplete} />;
  }

  const sections = [
    {
      group: 'Core Engine',
      tabs: [
        { id: 'home', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', name: 'Adapt', icon: Target },
        { id: 'dna', name: 'GoalDNA', icon: Activity },
        { id: 'habits', name: 'Rituals', icon: Sparkles },
        { id: 'energy', name: 'NeuroMap', icon: Activity },
      ]
    },
    {
      group: 'Social Graph',
      tabs: [
        { id: 'social', name: 'Links', icon: Users },
        { id: 'pods', name: 'Circles', icon: Target },
        { id: 'reciprocity', name: 'Balance', icon: Repeat },
        { id: 'ar', name: 'AR Grid', icon: Globe },
        { id: 'holomeet', name: 'Holo', icon: Zap },
      ]
    },
    {
      group: 'Mind State',
      tabs: [
        { id: 'brainstorm', name: 'Spark', icon: Lightbulb },
        { id: 'focus', name: 'Flow', icon: Focus },
        { id: 'reflection', name: 'Mirror', icon: Moon },
        { id: 'vault', name: 'Vault', icon: VaultIcon },
        { id: 'coach', name: 'Coach', icon: MessageSquareCode },
      ]
    },
    {
      group: 'System',
      tabs: [
        { id: 'analytics', name: 'Insights', icon: BarChart3 },
        { id: 'settings', name: 'Config', icon: Settings },
      ]
    }
  ];

  const allTabs = sections.flatMap(s => s.tabs);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Sidebar - Desktop */}
      <nav className="hidden lg:flex w-72 flex-col glass-morphism p-6 m-4 rounded-3xl space-y-6 overflow-y-auto no-scrollbar border border-white/5 shadow-2xl">
        <div className="flex items-center space-x-3 px-2 py-4">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter text-white">LifeOS</span>
        </div>

        <div className="flex-1 space-y-8">
          {sections.map((section) => (
            <div key={section.group} className="space-y-3">
              <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">{section.group}</h3>
              <div className="space-y-1">
                {section.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                      activeTab === tab.id 
                        ? "bg-white text-black shadow-2xl scale-[1.02]" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon size={18} className={cn("transition-colors", activeTab === tab.id ? "text-brand-primary" : "group-hover:text-brand-primary")} />
                    <span className="font-bold text-sm">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-2xl border border-brand-primary/30" alt="Profile" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-display font-bold truncate text-white">{user.displayName}</p>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" /> 
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Neural Sync Active</span>
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Terminate Hub</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto p-4 md:p-8 lg:p-12 no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="max-w-7xl mx-auto w-full"
          >
            {activeTab === 'home' && <HomeModule user={user} onNavigate={setActiveTab} />}
            {activeTab === 'tasks' && <TasksModule user={user} />}
            {activeTab === 'pods' && <PodsModule user={user} />}
            {activeTab === 'collab' && <CollabModule user={user} />}
            {activeTab === 'social' && <SocialModule user={user} />}
            {activeTab === 'focus' && <FocusModule user={user} />}
            {activeTab === 'holomeet' && <HoloMeetModule user={user} />}
            {activeTab === 'dna' && <GoalDNAModule user={user} />}
            {activeTab === 'vault' && <MemoryVaultModule user={user} />}
            {activeTab === 'habits' && <HabitCoachModule user={user} />}
            {activeTab === 'reflection' && <ReflectionModule user={user} />}
            {activeTab === 'reciprocity' && <ReciprocityModule user={user} />}
            {activeTab === 'energy' && <EnergyMapModule user={user} />}
            {activeTab === 'brainstorm' && <BrainstormModule user={user} />}
            {activeTab === 'coach' && <CoachModule user={user} />}
            {activeTab === 'settings' && <SettingsModule user={user} />}
            {activeTab === 'analytics' && <AnalyticsModule user={user} />}
            {activeTab === 'ar' && <ARNetworkingModule user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 lg:hidden glass-morphism border border-white/10 rounded-[32px] p-2 flex justify-around items-center z-50 overflow-x-auto no-scrollbar shadow-2xl">
        {allTabs.filter(t => ['home', 'tasks', 'social', 'focus', 'coach'].includes(t.id)).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "p-4 rounded-2xl flex flex-col items-center transition-all min-w-[60px]",
              activeTab === tab.id ? "bg-white text-black scale-110 shadow-lg" : "text-gray-500"
            )}
          >
            <tab.icon size={20} />
          </button>
        ))}
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "p-4 rounded-2xl flex flex-col items-center transition-all min-w-[60px]",
            activeTab === 'settings' ? "bg-white text-black scale-110 shadow-lg" : "text-gray-500"
          )}
        >
          <Settings size={20} />
        </button>
      </nav>
    </div>
  );
}
