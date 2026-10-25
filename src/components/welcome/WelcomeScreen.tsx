import React, { useState } from 'react';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Star
} from 'lucide-react';
import { DreamTeamLogo } from '../common/DreamTeamLogo';
import { ArchitecturalBackground } from '../common/ArchitecturalBackground';
import { isAuthorizedAdmin } from '../../constants/admins';
import { Student } from '../../types';

export type WelcomeAction = 'attendance' | 'leaderboard' | 'reading';

interface WelcomeScreenProps {
  registeredStudents?: Student[];
  onStudentContinue: (email: string, name: string, action: WelcomeAction) => void;
  onAdminContinue: (email: string, name: string) => void;
  onGoogleSignIn?: () => Promise<void> | void;
  isSigningIn?: boolean;
}

export const getAdminDisplayName = (email: string): string => {
  const clean = email.toLowerCase().trim();
  if (clean.includes('ogungbade')) return 'Engr. Kehinde Ogungbade';
  if (clean.includes('aduoluwaseyi')) return 'Adu Oluwaseyi';
  if (clean.includes('paulstanley')) return 'Paul Stanley Tobechukwu';
  if (clean.includes('munachimso')) return 'Munachimso Moses';
  if (clean.includes('chiemela')) return 'Chiemela B.';
  return 'Dream Team Administrator';
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  registeredStudents = [],
  onStudentContinue,
  onAdminContinue,
  onGoogleSignIn,
  isSigningIn = false,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Popup modal state for students
  const [pendingStudent, setPendingStudent] = useState<{
    email: string;
    name: string;
  } | null>(null);

  const resolveStudentName = (email: string): string => {
    const clean = email.trim().toLowerCase();
    const matched = registeredStudents.find(
      (s) => s.email.trim().toLowerCase() === clean
    );
    if (matched?.name) return matched.name;

    // Fallback: format name from email prefix (e.g. kehinde.ogungbade -> Kehinde Ogungbade)
    const prefix = clean.split('@')[0] || 'Cohort Member';
    return prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = emailInput.trim().toLowerCase();

    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setError('Please input a valid email address.');
      return;
    }

    setIsProcessing(true);

    // 1. ADMIN CHECK: If user is an authorized admin, navigate them directly to admin interface
    if (isAuthorizedAdmin(clean)) {
      const adminName = getAdminDisplayName(clean);
      setTimeout(() => {
        setIsProcessing(false);
        onAdminContinue(clean, adminName);
      }, 200);
      return;
    }

    // 2. STUDENT CHECK: Show the welcome pop-up with choices
    const studentName = resolveStudentName(clean);
    setTimeout(() => {
      setIsProcessing(false);
      setPendingStudent({
        email: clean,
        name: studentName,
      });
    }, 200);
  };

  const handleActionSelect = (action: WelcomeAction) => {
    if (!pendingStudent) return;
    onStudentContinue(pendingStudent.email, pendingStudent.name, action);
    setPendingStudent(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b12] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors">
      
      {/* Background Ambience */}
      <ArchitecturalBackground />

      {/* Main Welcome Container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-2xl border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/15 relative overflow-hidden transition-all text-center">
          
          {/* Radiant Top Edge */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

          {/* Authentic Logo */}
          <div className="flex justify-center mb-5">
            <DreamTeamLogo size="lg" showText={true} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Cohort 2 Attendance Hub</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Input your email to continue
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
            Enter your registered email address to access your cohort hub.
          </p>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-fade-in text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-left">
            <div>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all pl-11"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !emailInput.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 disabled:opacity-40 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Checking Roster...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Google Sign In */}
          {onGoogleSignIn && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isSigningIn ? 'Signing In with Google...' : 'Or continue with Google'}</span>
              </button>
            </div>
          )}

          {/* Simple App Indicator */}
          <div className="mt-5 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Dream Team Project Cohort 2 &bull; Facilitated by Engr. Kehinde Ogungbade
          </div>

        </div>
      </div>

      {/* POP-UP MODAL: "Welcome, {Name} What would you like to do next?" */}
      {pendingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#0f1422] border-2 border-indigo-200 dark:border-indigo-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all animate-in zoom-in-95 duration-200 text-center"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Radiant Accent */}
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-indigo-50 dark:ring-indigo-950/40">
              <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Welcome Greeting */}
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block mb-1">
              Verified Member
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome, {pendingStudent.name}!
            </h2>

            <p className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 mb-6">
              What would you like to do next?
            </p>

            {/* 3 Interactive Choices */}
            <div className="space-y-3 text-left">
              
              {/* 1. Mark ATTENDANCE */}
              <button
                type="button"
                onClick={() => handleActionSelect('attendance')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-emerald-50/50 dark:from-indigo-950/40 dark:via-slate-800/60 dark:to-emerald-950/30 hover:from-indigo-100 hover:to-emerald-100 dark:hover:from-indigo-900/50 dark:hover:to-emerald-900/40 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/25 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Mark ATTENDANCE
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                        +10 Pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Enter today&apos;s secret class code &amp; check in
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 2. View leaderboard */}
              <button
                type="button"
                onClick={() => handleActionSelect('leaderboard')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-indigo-50/50 dark:from-amber-950/40 dark:via-slate-800/60 dark:to-indigo-950/30 hover:from-amber-100 hover:to-indigo-100 dark:hover:from-amber-900/50 dark:hover:to-indigo-900/40 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        View leaderboard
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                        Standings
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Check your consistency rank &amp; Greatness points
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 3. Book challenge */}
              <button
                type="button"
                onClick={() => handleActionSelect('reading')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-white to-pink-50/50 dark:from-violet-950/40 dark:via-slate-800/60 dark:to-pink-950/30 hover:from-violet-100 hover:to-pink-100 dark:hover:from-violet-900/50 dark:hover:to-pink-900/40 border-2 border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-600/25 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Book challenge
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 px-2 py-0.5 rounded-md">
                    +10 Pts
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Read assigned chapters &amp; submit your daily review
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* Back / Change Email button */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setPendingStudent(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            &larr; Use a different email
          </button>
        </div>

      </div>
    </div>
  )}

    </div>
  );
};
