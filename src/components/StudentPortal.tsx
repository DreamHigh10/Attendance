import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  KeyRound, 
  Mail, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Award, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Lock, 
  Hourglass, 
  ShieldAlert, 
  Trophy, 
  Flame, 
  HelpCircle,
  BookOpen,
  MessagesSquare
} from 'lucide-react';
import { api } from '../services/api';
import { firebaseAuth } from '../services/firebase';
import { Cohort, ClassSession, Student, StudentLookupResponse, AttendanceRecord, BookAssignment, BookAttendanceRecord } from '../types';
import { UpcomingClassesSection } from './common/UpcomingClassesSection';
import { DreamTeamLogo } from './common/DreamTeamLogo';
import { AttendanceCountdown } from './common/AttendanceCountdown';
import { GreatnessLeaderboard } from './leaderboard/GreatnessLeaderboard';
import { calculateGreatnessLeaderboard, LeaderboardUserEntry } from '../utils/leaderboard';
import { PointsBreakdownModal } from './common/PointsBreakdownModal';
import { BookReadingAttendanceSection } from './books/BookReadingAttendanceSection';
import { ExcellenceBanner } from './common/ExcellenceBanner';
import { StudentBottomNav, StudentTabType } from './common/StudentBottomNav';
import { DreamersLounge } from './lounge/DreamersLounge';

interface StudentPortalProps {
  cohorts: Cohort[];
  selectedCohortId: string;
  onSelectCohort: (id: string) => void;
  currentUser?: { email: string; name: string } | null;
  onGoogleSignIn?: (email: string, name: string) => void;
  allStudents?: Student[];
  allAttendanceRecords?: AttendanceRecord[];
  books?: BookAssignment[];
  bookAttendanceRecords?: BookAttendanceRecord[];
  onRefreshBooks?: () => void;
  initialTab?: StudentTabType;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  cohorts,
  selectedCohortId,
  onSelectCohort,
  currentUser,
  onGoogleSignIn,
  allStudents = [],
  allAttendanceRecords = [],
  books = [],
  bookAttendanceRecords = [],
  onRefreshBooks,
  initialTab,
}) => {
  // Input fields
  const [emailInput, setEmailInput] = useState<string>(() => {
    return currentUser?.email || localStorage.getItem('dtp_student_email') || '';
  });
  const [code, setCode] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  // Lookup & Match State
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [matchedStudentData, setMatchedStudentData] = useState<StudentLookupResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Verification & Submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [markedSuccessData, setMarkedSuccessData] = useState<{
    message: string;
    record: any;
    classSession: ClassSession;
    studentStats?: any;
  } | null>(null);

  // Active Classes & Window Timing
  const [allCohortClasses, setAllCohortClasses] = useState<ClassSession[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isWindowElapsed, setIsWindowElapsed] = useState<boolean>(false);
  const [isWindowNotStarted, setIsWindowNotStarted] = useState<boolean>(false);
  const [isClassOver24Hours, setIsClassOver24Hours] = useState<boolean>(false);

  // Greatness Leaderboard State
  const [portalStudents, setPortalStudents] = useState<Student[]>(allStudents);
  const [portalAttendance, setPortalAttendance] = useState<AttendanceRecord[]>(allAttendanceRecords);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  // App Interface Navigation Tab ('class' | 'reading' | 'leaderboard' | 'lounge')
  const [homeTab, setHomeTab] = useState<StudentTabType>(initialTab || 'class');

  useEffect(() => {
    if (initialTab) {
      setHomeTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (currentUser?.email) {
      setEmailInput(currentUser.email);
      handleLookupStudent(currentUser.email);
    }
  }, [currentUser?.email]);

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  const isClassEndedOver24Hours = (cls?: ClassSession | null): boolean => {
    if (!cls) return false;
    let endTimeMs = 0;
    if (cls.attendanceEndTime) {
      endTimeMs = new Date(cls.attendanceEndTime).getTime();
    } else if (cls.date && cls.time) {
      endTimeMs = new Date(`${cls.date}T${cls.time}`).getTime();
    } else if (cls.date) {
      endTimeMs = new Date(`${cls.date}T23:59:59`).getTime();
    }
    if (endTimeMs && !isNaN(endTimeMs)) {
      return Date.now() > endTimeMs + TWENTY_FOUR_HOURS_MS;
    }
    return false;
  };

  const activeClass = allCohortClasses.find(c => c.id === selectedClassId)
    || allCohortClasses.find(c => c.isAttendanceOpen && (!c.attendanceEndTime || Date.now() <= new Date(c.attendanceEndTime).getTime()))
    || allCohortClasses.find(c => !isClassEndedOver24Hours(c))
    || allCohortClasses.find(c => new Date(c.date).getTime() >= Date.now())
    || allCohortClasses[allCohortClasses.length - 1]
    || allCohortClasses[0];

  useEffect(() => {
    loadCohortClasses();
  }, [selectedCohortId]);

  useEffect(() => {
    if (!activeClass) {
      setIsWindowElapsed(false);
      setIsWindowNotStarted(false);
      setIsClassOver24Hours(false);
      return;
    }

    const check = () => {
      const now = Date.now();
      const isStartFuture = activeClass.attendanceStartTime 
        ? now < new Date(activeClass.attendanceStartTime).getTime()
        : false;
      const isEndPassed = activeClass.attendanceEndTime 
        ? now > new Date(activeClass.attendanceEndTime).getTime()
        : false;

      setIsWindowNotStarted(isStartFuture);
      setIsWindowElapsed(isEndPassed);
      setIsClassOver24Hours(isClassEndedOver24Hours(activeClass));
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [activeClass]);

  useEffect(() => {
    if (emailInput.trim() && emailInput.includes('@')) {
      handleLookupStudent(emailInput.trim());
    }
  }, [selectedCohortId]);

  useEffect(() => {
    if (allStudents && allStudents.length > 0) {
      setPortalStudents(allStudents);
    } else {
      api.getStudents(selectedCohortId).then((stus) => {
        if (stus.length > 0) setPortalStudents(stus);
      }).catch(() => {});
    }
  }, [allStudents, selectedCohortId]);

  useEffect(() => {
    if (allAttendanceRecords && allAttendanceRecords.length > 0) {
      setPortalAttendance(allAttendanceRecords);
    } else {
      api.getAttendance().then((recs) => {
        if (recs.length > 0) setPortalAttendance(recs);
      }).catch(() => {});
    }
  }, [allAttendanceRecords, selectedCohortId]);

  const loadCohortClasses = async () => {
    try {
      const classes = await api.getClasses(selectedCohortId);
      setAllCohortClasses(classes);
      // Select the first active class if not chosen yet
      const live = classes.find((c) => c.isAttendanceOpen && (!c.attendanceEndTime || Date.now() <= new Date(c.attendanceEndTime).getTime()));
      if (live) {
        setSelectedClassId(live.id);
      } else if (classes.length > 0) {
        setSelectedClassId(classes[0].id);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const handleCodeChange = (newCode: string) => {
    const clean = newCode.toUpperCase();
    setCode(clean);
    // If the entered code matches any class in the cohort, auto-track that session
    const matched = allCohortClasses.find(c => c.code.trim().toUpperCase() === clean.trim());
    if (matched && matched.id !== selectedClassId) {
      setSelectedClassId(matched.id);
    }
  };

  // Instant lookup of student email in registered cohort roster
  const handleLookupStudent = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setMatchedStudentData(null);
      setLookupError(null);
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const res = await api.lookupStudent(cleanEmail, selectedCohortId);
      if (res.found && res.student) {
        setMatchedStudentData(res);
        setLookupError(null);
        localStorage.setItem('dtp_student_email', cleanEmail);
      } else {
        setMatchedStudentData(null);
        setLookupError(res.message || 'This email is not registered in the cohort roster.');
      }
    } catch (err: any) {
      setMatchedStudentData(null);
      setLookupError(err.message || 'This email is not registered in the cohort roster. Please contact the administrator.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Real Firebase Google Sign-In helper
  const handleFirebaseGoogleSignIn = async () => {
    setIsLookingUp(true);
    setLookupError(null);
    try {
      const user = await firebaseAuth.signInWithGoogle();
      if (user && user.email) {
        setEmailInput(user.email);
        await handleLookupStudent(user.email);
        if (onGoogleSignIn) {
          onGoogleSignIn(user.email, user.displayName || 'Cohort Member');
        }
      }
    } catch (err: any) {
      console.error('Firebase sign in failed:', err);
      // Fallback to quick email lookup
      if (currentUser?.email) {
        setEmailInput(currentUser.email);
        handleLookupStudent(currentUser.email);
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  // Submit attendance code
  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput.trim() || !matchedStudentData?.student) {
      setErrorMessage('Please enter your registered email address first.');
      return;
    }

    if (!code.trim()) {
      setErrorMessage('Please enter the secret attendance code given in class.');
      return;
    }

    if (isWindowElapsed) {
      setErrorMessage('The attendance window has elapsed. The countdown has reached 00:00 and submissions are now closed.');
      return;
    }

    if (isWindowNotStarted) {
      setErrorMessage(`Attendance marking has not started yet. Opens at ${activeClass?.attendanceStartTime ? new Date(activeClass.attendanceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'scheduled time'}.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await api.markAttendance({
        code: code.trim().toUpperCase(),
        studentEmail: matchedStudentData.student.email,
        studentName: matchedStudentData.student.name,
        studentPhone: matchedStudentData.student.phone,
        feedback: feedback.trim(),
      });

      if (res.success) {
        setMarkedSuccessData({
          message: res.message,
          record: res.record,
          classSession: res.classSession || activeClass || ({} as any),
          studentStats: res.studentStats,
        });

        // Add to portal attendance records to update Greatness Leaderboard live
        setPortalAttendance((prev) => [res.record, ...prev.filter((p) => p.id !== res.record.id)]);

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not mark attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setCode('');
    setMarkedSuccessData(null);
    setErrorMessage(null);
    setFeedback('');
    loadCohortClasses();
    if (emailInput) handleLookupStudent(emailInput);
  };

  const currentCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];

  // Calculate Greatness Leaderboard dynamically (including 10 points per book reading attendance)
  const leaderboardEntries = calculateGreatnessLeaderboard(
    portalStudents,
    allCohortClasses,
    portalAttendance,
    selectedCohortId,
    bookAttendanceRecords
  );

  // User's specific entry on the Greatness leaderboard if email matches
  const currentCleanEmail = (emailInput || currentUser?.email || '').trim().toLowerCase();
  const userLeaderboardEntry = currentCleanEmail
    ? leaderboardEntries.find((e) => e.email.toLowerCase() === currentCleanEmail)
    : undefined;

  const activeBook = books.find((b) => b.isActive) || books[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 pb-32 sm:pb-36">
      
      {/* Clean, Streamlined Header */}
      <div className="text-center mb-6">
        <DreamTeamLogo size="md" showText={false} className="justify-center mb-2" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {currentCohort?.name || 'Cohort 2 Hub'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Class check-in, book challenges &amp; rankings
        </p>
      </div>


      {/* READING CHALLENGE TAB VIEW */}
      {homeTab === 'reading' && (
        <div className="space-y-8 animate-fade-in">
          <BookReadingAttendanceSection
            books={books}
            cohort={currentCohort}
            currentEmail={emailInput || currentUser?.email || ''}
            onEmailChange={(newEmail) => {
              setEmailInput(newEmail);
              handleLookupStudent(newEmail);
            }}
            registeredStudents={portalStudents}
            bookAttendanceRecords={bookAttendanceRecords}
            onMarkSuccess={() => {
              if (onRefreshBooks) onRefreshBooks();
              if (emailInput) handleLookupStudent(emailInput);
            }}
          />

          {/* Quick Switch to Class Attendance */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setHomeTab('class');
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>Switch to Live Class Attendance &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB VIEW */}
      {homeTab === 'leaderboard' && (
        <div className="space-y-6 animate-fade-in">
          <GreatnessLeaderboard
            entries={leaderboardEntries}
            cohortName={currentCohort?.name || 'Cohort 2'}
            userEmail={emailInput || currentUser?.email || ''}
            onSelectStudentEmail={(selectedEmail) => {
              setEmailInput(selectedEmail);
              handleLookupStudent(selectedEmail);
              setHomeTab('class');
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* DREAMERS LOUNGE CHAT TAB VIEW */}
      {homeTab === 'lounge' && (
        <div className="space-y-6 animate-fade-in">
          <DreamersLounge
            cohort={currentCohort}
            currentEmail={emailInput || currentUser?.email || ''}
            currentUser={currentUser}
            registeredStudents={portalStudents}
            onEmailVerified={(verified) => {
              setEmailInput(verified);
              handleLookupStudent(verified);
            }}
          />
        </div>
      )}

      {/* CLASS ATTENDANCE TAB VIEW */}
      {homeTab === 'class' && (
        <div className="space-y-8 animate-fade-in">

      {/* SUCCESS CONFIRMATION STATE */}
      {markedSuccessData ? (
        <div className="bg-white dark:bg-[#0f1422] border-2 border-emerald-500/40 dark:border-emerald-600/50 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-500/10 text-center relative overflow-hidden animate-fade-in transition-colors">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />
          
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50 dark:ring-emerald-950/40 shadow-inner">
            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>

          <span className="inline-block px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-black rounded-full uppercase tracking-wider mb-3">
            ✓ Attendance Verified &amp; Recorded
          </span>

          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
            You&apos;ve marked your attendance for today&apos;s class! 🎉
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-lg mx-auto mb-8 font-medium">
            Welcome, <strong className="text-slate-900 dark:text-white">{markedSuccessData.record.studentName}</strong>! Your attendance is confirmed and synchronized with the admin dashboard.
          </p>

          {/* Record Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 text-left">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Participant</span>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{markedSuccessData.record.studentName}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">{markedSuccessData.record.studentEmail}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Time Recorded</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {new Date(markedSuccessData.record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date(markedSuccessData.record.markedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Secret Word Used</span>
              <p className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase">
                {markedSuccessData.record.classCodeUsed}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Status: Present
              </span>
            </div>
          </div>

          {/* Attendance Track Record & Greatness Rank Banner */}
          <div className="space-y-3 max-w-xl mx-auto mb-8">
            {userLeaderboardEntry && (
              <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-indigo-600/20">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg border border-white/30">
                    #{userLeaderboardEntry.rank}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-0.5">
                      The Greatness Rank
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {userLeaderboardEntry.totalPoints} Total Consistency Points
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('greatness-leaderboard');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-black text-xs shadow-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  View Rank &rarr;
                </button>
              </div>
            )}

            {markedSuccessData.studentStats && (
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Cohort Attendance Record</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {markedSuccessData.studentStats.totalAttended} of {markedSuccessData.studentStats.totalCohortClasses} classes attended
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {markedSuccessData.studentStats.attendanceRate}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Overall Score</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForAnother}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Mark for Another Class
            </button>
            {markedSuccessData.classSession?.meetingUrl && (
              <a
                href={markedSuccessData.classSession.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                <span>Return to Live Class Room</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      ) : (

        /* MAIN ATTENDANCE CARD */
        <div className="bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md transition-colors">
          
          {/* Active Class Live Banner & Countdown - Disappears 24 hours after class has ended */}
          {activeClass && !isClassOver24Hours && (
            <div className="mb-6 space-y-3">
              {/* Optional Class Selector if multiple classes */}
              {allCohortClasses.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Class Session:</span>
                  {allCohortClasses.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        activeClass.id === cls.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cls.title}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                  <span className={`flex h-3 w-3 rounded-full ${
                    isWindowElapsed 
                      ? 'bg-rose-500' 
                      : isWindowNotStarted 
                      ? 'bg-amber-500 animate-pulse' 
                      : 'bg-emerald-500 animate-ping'
                  }`} />
                  <span>
                    Class Session: <strong className="text-slate-900 dark:text-white font-black">{activeClass.title}</strong>
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Facilitator: {activeClass.instructorName}
                </div>
              </div>

              {/* HIGH-VISIBILITY LIVE COUNTDOWN DISPLAY */}
              <AttendanceCountdown
                startTime={activeClass.attendanceStartTime}
                endTime={activeClass.attendanceEndTime}
                isOpen={activeClass.isAttendanceOpen && !isWindowElapsed}
                size="lg"
                onElapsed={() => setIsWindowElapsed(true)}
              />
            </div>
          )}

          {/* Scheduled / Not Started Notice - Disappears 24 hours after class has ended */}
          {isWindowNotStarted && activeClass?.attendanceStartTime && !isClassOver24Hours && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in font-medium">
              <Hourglass className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
              <span>
                Attendance window opens at <strong>{new Date(activeClass.attendanceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>. The code field will unlock automatically.
              </span>
            </div>
          )}

          {/* Locked Notice if countdown elapsed - Disappears 24 hours after class has ended */}
          {isWindowElapsed && !isClassOver24Hours && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in font-medium">
              <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>
                Attendance window closed at {activeClass?.attendanceEndTime ? new Date(activeClass.attendanceEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'the deadline'}. Submissions are locked.
              </span>
            </div>
          )}

          {/* Standby Notice when 24 hours have elapsed after class ended */}
          {isClassOver24Hours && (
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between gap-3 animate-fade-in font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>No live class session in progress. Attendance check-in opens during scheduled classes.</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                Standby
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleMarkAttendance} className="space-y-5">
            
            {/* EMAIL ADDRESS / GOOGLE SIGN IN */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Registered Email <span className="text-rose-500">*</span></span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email address"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (e.target.value.includes('@')) {
                        handleLookupStudent(e.target.value);
                      }
                    }}
                    onBlur={() => {
                      if (emailInput.trim()) {
                        handleLookupStudent(emailInput.trim());
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all pl-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                <button
                  type="button"
                  onClick={handleFirebaseGoogleSignIn}
                  className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google Sign In</span>
                </button>
              </div>

              {/* Lookup Error */}
              {lookupError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span>{lookupError} Only enrolled cohort members can mark attendance.</span>
                </div>
              )}
            </div>

            {/* SLEEK 1-LINE VERIFIED PARTICIPANT STATUS */}
            {matchedStudentData && matchedStudentData.student && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {matchedStudentData.student.name}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate">
                      Verified member &bull; {userLeaderboardEntry ? `${userLeaderboardEntry.totalPoints} pts` : 'Enrolled'}
                    </p>
                  </div>
                </div>
                {userLeaderboardEntry && (
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    Rank #{userLeaderboardEntry.rank}
                  </span>
                )}
              </div>
            )}

            {/* SECRET ATTENDANCE CODE INPUT */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Class Attendance Code <span className="text-rose-500">*</span></span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isWindowElapsed || isWindowNotStarted || isClassOver24Hours}
                  placeholder={
                    isClassOver24Hours
                      ? "Attendance is currently closed"
                      : isWindowElapsed 
                      ? "Submissions closed" 
                      : isWindowNotStarted
                      ? "Unlocks when session starts"
                      : "Enter secret code"
                  }
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className={`w-full border-2 rounded-2xl px-4 py-3.5 text-lg sm:text-xl font-mono font-black tracking-widest text-center transition-all uppercase ${
                    isWindowElapsed || isWindowNotStarted || isClassOver24Hours
                      ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Optional Feedback */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Quick Class Note / Takeaway (Optional)
              </label>
              <input
                type="text"
                disabled={isWindowElapsed || isWindowNotStarted || isClassOver24Hours}
                placeholder="e.g. Understood today's full stack architecture!"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* MARK ATTENDANCE BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || !matchedStudentData?.student || !code.trim() || isWindowElapsed || isWindowNotStarted || isClassOver24Hours}
              className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg transition-all flex items-center justify-center gap-2.5 ${
                isWindowElapsed || isWindowNotStarted || isClassOver24Hours
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed border border-slate-400/50'
                  : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xl shadow-indigo-600/25 cursor-pointer hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Validating Code &amp; Marking Attendance...</span>
                </>
              ) : isClassOver24Hours ? (
                <>
                  <Lock className="w-5 h-5 text-slate-500" />
                  <span>Attendance Closed &bull; Check Upcoming Schedule</span>
                </>
              ) : isWindowElapsed ? (
                <>
                  <Lock className="w-5 h-5 text-slate-500" />
                  <span>Attendance Window Elapsed &bull; Closed</span>
                </>
              ) : isWindowNotStarted ? (
                <>
                  <Hourglass className="w-5 h-5 text-amber-700 animate-pulse" />
                  <span>Attendance Opens at {activeClass?.attendanceStartTime ? new Date(activeClass.attendanceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled Time'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                  <span>Mark My Attendance for Today</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>

        </div>
      )}

          {/* UPCOMING CLASSES SCHEDULE & PREPARATION */}
          <div className="pt-2">
            <UpcomingClassesSection
              classes={allCohortClasses}
              cohort={currentCohort}
              isAdminView={false}
              onSelectClassForAttendance={(cls) => {
                setSelectedClassId(cls.id);
                setCode(cls.code);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
          </div>

        </div>
      )}

      {/* Points breakdown popup */}
      <PointsBreakdownModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
      />

      {/* Cohort Help Footer */}
      <div className="mt-10 mb-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        <p>
          Dream Team Project Cohort 2 &bull; Facilitated by Engr. Kehinde Ogungbade &amp; Team
        </p>
      </div>

      {/* DOCKED APP BOTTOM NAVIGATION BAR (Icons on top, label below - stays pinned while scrolling) */}
      <StudentBottomNav
        activeTab={homeTab}
        onTabChange={(tab) => {
          setHomeTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeClassCount={activeClass ? 1 : 0}
      />

    </div>
  );
};
