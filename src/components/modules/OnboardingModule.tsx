import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Fingerprint, Activity, ArrowRight, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';

export default function OnboardingModule({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to LifeOS",
      desc: "The world's first neuro-relational operating system. A premium, intelligent companion for your higher-order life.",
      icon: Zap,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10"
    },
    {
      title: "Privacy is Sovereignty",
      desc: "Your data is end-to-end encrypted. We prioritize your cognitive safety over everything else. No tracking, just growth.",
      icon: Shield,
      color: "text-brand-secondary",
      bg: "bg-brand-secondary/10"
    },
    {
      title: "Bio-Relational Sync",
      desc: "We analyze your energy maps and social reciprocity to ensure you move through life in total alignment.",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Neural Consensus",
      desc: "By proceeding, you agree to our Privacy Engine protocols and allow LifeOS to assist in your cognitive evolution.",
      icon: Fingerprint,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10"
    }
  ];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-secondary/5 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative w-full max-w-2xl glass-morphism rounded-[60px] p-12 md:p-20 overflow-hidden flex flex-col items-center text-center space-y-12 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="space-y-8 flex flex-col items-center"
          >
            <div className={clsx("p-8 rounded-[40px]", steps[step].bg)}>
              {(() => {
                const Icon = steps[step].icon;
                return <Icon size={64} className={steps[step].color} />;
              })()}
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">{steps[step].title}</h2>
              <p className="text-xl font-light text-gray-500 leading-relaxed max-w-md mx-auto">{steps[step].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="w-full flex flex-col items-center space-y-8">
           {/* Progress Dots */}
           <div className="flex space-x-3">
             {steps.map((_, i) => (
               <div 
                 key={i} 
                 className={clsx(
                   "w-2 h-2 rounded-full transition-all duration-500",
                   i === step ? "w-8 bg-brand-primary" : "bg-white/10"
                 )}
               />
             ))}
           </div>

           <button 
             onClick={next}
             className="group relative w-full py-6 bg-white text-black font-bold rounded-3xl text-xl overflow-hidden active:scale-95 transition-all"
           >
             <div className="absolute inset-0 bg-brand-primary/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
             <div className="relative flex items-center justify-center space-x-3">
               <span>{step === steps.length - 1 ? 'Activate System' : 'Next Protocol'}</span>
               <ArrowRight size={24} />
             </div>
           </button>

           {step === steps.length - 1 && (
             <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-gray-600 tracking-widest">
               <UserCheck size={14} />
               <span>Biometric Consensus Confirmed</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
