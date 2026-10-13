import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Flame, Award, RefreshCw, Compass, ArrowRight, Zap, Target } from 'lucide-react';
import { DreamTeamCreedModal } from './DreamTeamCreedModal';

interface Quote {
  quote: string;
  author: string;
  topic: string;
  badgeColor: string;
}

const INSPIRATIONAL_QUOTES: Quote[] = [
  {
    quote: "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.",
    author: "Aristotle",
    topic: "Standard of Mastery",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  },
  {
    quote: "Innovation distinguishes between a leader and a follower. Do not build for what exists today; engineer for what must exist tomorrow.",
    author: "Steve Jobs",
    topic: "Visionary Innovation",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-400/40",
  },
  {
    quote: "The best way to predict the future is to invent it. Dare to build solutions that transcend conventional limits.",
    author: "Alan Kay",
    topic: "Audacious Creation",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  },
  {
    quote: "There's a way to do it better — find it. Innovation begins the moment you refuse to accept mediocrity.",
    author: "Thomas Edison",
    topic: "Relentless Invention",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
  },
  {
    quote: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.",
    author: "Socrates",
    topic: "Transformative Engineering",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  },
  {
    quote: "Excellence means doing ordinary things with extraordinary passion, precision, and relentless consistency.",
    author: "Dream Team Project Creed",
    topic: "Pursuit of Excellence",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
  },
  {
    quote: "You can't use up creativity. The more you use, the more you have.",
    author: "Maya Angelou",
    topic: "Infinite Creativity",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40",
  },
];

export const ExcellenceBanner: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCreedOpen, setIsCreedOpen] = useState(false);

  const currentQuote = INSPIRATIONAL_QUOTES[quoteIndex];

  // Auto rotate quote every 12 seconds if user doesn't click
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextQuote();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleNextQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border-2 border-indigo-500/30 dark:border-indigo-500/50 p-5 sm:p-7 shadow-2xl text-white mb-8 transition-all hover:border-indigo-400/60 group">
        
        {/* Subtle Ambient Cosmic Aurora Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Quote & Inspiring Thought */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md ${currentQuote.badgeColor}`}>
                {currentQuote.topic}
              </span>
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>The Catalyst of Excellence &bull; Cohort 2</span>
              </span>
            </div>

            <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <blockquote className="text-base sm:text-lg font-black text-slate-100 leading-snug tracking-tight italic">
                &ldquo;{currentQuote.quote}&rdquo;
              </blockquote>
              <p className="text-xs font-semibold text-indigo-300 mt-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Leader Blueprint:</span>
                <span className="font-extrabold text-white tracking-wide">{currentQuote.author}</span>
              </p>
            </div>
          </div>

          {/* Interactive Actions & Creed Trigger */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleNextQuote}
              title="Next Inspirational Spark"
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Next Spark</span>
              <span className="sm:hidden">Next</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreedOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 border border-violet-400/50 text-xs font-black text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Dream Team Creed</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
            </button>
          </div>

        </div>

        {/* Live Innovation Ecosystem Pulse Footnote */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-white font-black tracking-wide">55 Cohort Innovators Live</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-indigo-200 font-semibold">Excellence Is Our Baseline</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Greatness is Daily</span>
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-indigo-300 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>Lead With Innovation</span>
            </span>
          </div>
        </div>

      </div>

      {/* Creed Modal */}
      <DreamTeamCreedModal
        isOpen={isCreedOpen}
        onClose={() => setIsCreedOpen(false)}
      />
    </>
  );
};
