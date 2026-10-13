import React from 'react';
import { 
  X, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  Trophy, 
  Sparkles, 
  BookOpen
} from 'lucide-react';

interface PointsBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PointsBreakdownModal: React.FC<PointsBreakdownModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-scale-in text-left transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-amber-400 via-indigo-600 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Points System modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center ring-4 ring-amber-50 dark:ring-amber-950/40">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              Scoring System
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              The Greatness Rank
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6">
          Points are automatically calculated in real-time to celebrate members who show exemplary consistency, participation, and punctuality:
        </p>

        {/* Rules Cards */}
        <div className="space-y-3.5 mb-6">
          
          {/* Rule 1: Attendance */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Class Attendance</h4>
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-2xs">
                  +10 Points
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Earned for every class session you attend and successfully mark your attendance.
              </p>
            </div>
          </div>

          {/* Rule 2: Book Reading Attendance */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Book Reading Attendance</h4>
                <span className="text-xs font-black text-violet-700 dark:text-violet-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-violet-200 dark:border-violet-700 shadow-2xs">
                  +10 Points
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Earned for reading your assigned daily pages and sharing your mandatory learning review.
              </p>
            </div>
          </div>

          {/* Rule 3: Comment */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Class Note / Comment</h4>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-2xs">
                  +5 Points
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Earned whenever you share a key takeaway, reflection, or comment while signing your attendance.
              </p>
            </div>
          </div>

          {/* Rule 4: Speed bonus */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Punctuality Speed Bonus</h4>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-700 shadow-2xs">
                  +1 to +5 Points
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Rewarded to the very first 5 participants who mark their attendance for each session:
              </p>

              {/* Badges for the first 5 */}
              <div className="grid grid-cols-5 gap-1.5 mt-2.5 text-center">
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                  <span className="text-[10px] text-slate-400 block font-bold">1st</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">+5 pts</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                  <span className="text-[10px] text-slate-400 block font-bold">2nd</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">+4 pts</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                  <span className="text-[10px] text-slate-400 block font-bold">3rd</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">+3 pts</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                  <span className="text-[10px] text-slate-400 block font-bold">4th</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">+2 pts</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                  <span className="text-[10px] text-slate-400 block font-bold">5th</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">+1 pt</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Motivational Footer */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            Consistency creates champions. Showing up on time every day builds unstoppable momentum!
          </span>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition-all cursor-pointer border border-slate-800 dark:border-slate-700"
          >
            Got It! Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
