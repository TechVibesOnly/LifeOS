import { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Shield, 
  Fingerprint, 
  EyeOff, 
  Trash2, 
  Bell, 
  Moon, 
  Smartphone,
  Cloud
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

export default function SettingsModule({ user }: { user: User }) {
  const [privacyMode, setPrivacyMode] = useState('Incognito');
  const [cloudSync, setCloudSync] = useState(true);

  const OPTIONS = [
    { title: 'Privacy Protocol', desc: 'Control how your data nodes are anonymized.', icon: Shield, val: privacyMode, set: setPrivacyMode, opts: ['Incognito', 'Balanced', 'Deep Memory'] },
    { title: 'Cloud Neural Sync', desc: 'Bi-directional sync with private LifeOS nodes.', icon: Cloud, val: cloudSync ? 'Enabled' : 'Disabled', type: 'toggle', set: () => setCloudSync(!cloudSync) },
    { title: 'Biometric Access', desc: 'Secure system transitions with biometric auth.', icon: Fingerprint, type: 'status', val: 'Verified' },
    { title: 'Notification Channels', desc: 'Manage empathetic nudges and system pings.', icon: Bell, type: 'link' }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <header>
        <h2 className="text-3xl font-display font-bold">System Configuration</h2>
        <p className="text-gray-500">Fine-tune your cognitive environment and privacy nodes.</p>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.title} className="glass-morphism p-8 rounded-[40px] space-y-6 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-white/5 rounded-2xl text-brand-primary">
                    <Icon size={24} />
                  </div>
                  {opt.type === 'status' && <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-full">Active</span>}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold">{opt.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{opt.desc}</p>
                </div>

                {opt.opts && (
                  <div className="flex gap-2 pt-2">
                    {opt.opts.map(o => (
                      <button
                        key={o}
                        onClick={() => opt.set?.(o)}
                        className={clsx(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                          opt.val === o ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:text-white"
                        )}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}

                {opt.type === 'toggle' && (
                  <button 
                    onClick={opt.set}
                    className={clsx(
                      "w-full py-4 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all",
                      cloudSync ? "bg-brand-primary text-black" : "bg-white/5 text-gray-400"
                    )}
                  >
                    {opt.val}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="glass-morphism p-8 rounded-[40px] border border-red-500/20 space-y-6">
            <div className="flex items-center space-x-3 text-red-500">
              <Trash2 size={24} />
              <h3 className="text-xl font-display font-bold">Nuclear Option</h3>
            </div>
            <p className="text-sm text-gray-500">Permanently purge all cognitive data, GoalDNA, and social links from the LifeOS servers. This action is irreversible.</p>
            <button className="px-8 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all">
              Purge Cognitive Profile
            </button>
        </div>
      </div>
    </div>
  );
}
