import React from 'react';
import { X, Award, Sparkles, CheckCircle2, Flame, Lightbulb, Compass, Users, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DreamTeamLogo } from './DreamTeamLogo';

interface DreamTeamCreedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREED_PILLARS = [
  {
    icon: Flame,
    color: 'from-amber-500 to-rose-500',
    title: 'Relentless Daily Consistency',
    subtitle: 'Greatness is forged in everyday discipline',
    description: 'Mastery is not an accident of talent; it is the compounding output of showing up every single day. We do not skip classes or ignore commitments. We stay the course until excellence becomes second nature.',
  },
  {
    icon: Lightbulb,
    color: 'from-violet-500 to-indigo-500',
    title: 'Audacious Innovation & Problem Solving',
    subtitle: 'Do not simply consume technology — pioneer solutions',
    description: 'We are builders, engineers, and transformative thinkers. When faced with complex obstacles, we do not surrender to excuses; we engineer scalable, elegant, and impactful breakthroughs that shift paradigms.',
  },
  {
    icon: Award,
    color: 'from-emerald-500 to-teal-500',
    title: 'Radical Standard of Excellence',
    subtitle: 'Quality is a matter of personal honour',
    description: 'Good enough is never enough for the Dream Team. From the precision of our code to the clarity of our presentations and the integrity of our character, we hold ourselves to global benchmarks of excellence.',
  },
  {
    icon: Compass,
    color: 'from-blue-500 to-cyan-500',
    title: 'Intellectual Curiosity & Reading',
    subtitle: 'A mind stretched by ideas never returns to its old shape',
    description: 'Leaders are perpetual learners. We devour assigned reading challenges, digest profound wisdom, and challenge conventional assumptions with evidence-backed intellect.',
  },
  {
    icon: Users,
    color: 'from-fuchsia-500 to-purple-600',
    title: 'Collective Acceleration & Brotherhood',
    subtitle: 'We rise together as one Dream Team',
    description: 'We do not compete against our peers; we elevate them. We share knowledge freely, celebrate cohort milestones generously, and ensure no member of Cohort 2 is left behind.',
  },
];

export const DreamTeamCreedModal: React.FC<DreamTeamCreedModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePledgeCommitment = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1422] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-auto text-left">
        {/* Radiant top accent bar */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 via-amber-400 to-emerald-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <DreamTeamLogo size="md" showText={false} />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              The Dream Team Creed
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              The Mindset of Excellence &amp; Innovation
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Every session attended and every insight shared is a testament to who we are becoming. The Dream Team Project exists to ignite world-class builders and visionary leaders.
        </p>

        {/* The 5 Pillars */}
        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {CREED_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 transition-all hover:border-indigo-400 dark:hover:border-indigo-600 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${pillar.color} text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {pillar.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                        Pillar 0{idx + 1}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commitment Action Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Excellence is an everyday decision.</span>
          </p>

          <button
            onClick={handlePledgeCommitment}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white font-black text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Commit to Daily Excellence 🚀</span>
          </button>
        </div>

      </div>
    </div>
  );
};
