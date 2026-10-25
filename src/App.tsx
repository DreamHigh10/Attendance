import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { Cohort, ClassSession, Student, AttendanceRecord, EmailCampaign, BookAssignment, BookAttendanceRecord } from './types';
import { api } from './services/api';
import { firebaseAuth, firebaseDb } from './services/firebase';
import { persistentStore } from './services/storage';
import { ArchitecturalBackground } from './components/common/ArchitecturalBackground';
import { GoogleAuthModal } from './components/common/GoogleAuthModal';
import { parseCurrentRoute, navigateTo, AppView, AdminTab } from './utils/navigation';
import { RefreshCw, GraduationCap, Sparkles, ArrowLeftRight } from 'lucide-react';
import { DreamTeamLogo } from './components/common/DreamTeamLogo';
import { WelcomeScreen, WelcomeAction } from './components/welcome/WelcomeScreen';
import { StudentTabType } from './components/common/StudentBottomNav';
import { isAuthorizedAdmin } from './constants/admins';

export default function App() {
  const initialRoute = parseCurrentRoute();
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [adminTab, setAdminTab] = useState<AdminTab>(initialRoute.adminTab || 'classes');
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>(initialRoute.cohortId || 'dtp-cohort-2');
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [books, setBooks] = useState<BookAssignment[]>([]);
  const [bookAttendanceRecords, setBookAttendanceRecords] = useState<BookAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Welcome page entrance state
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('dtp_has_entered') === 'true';
    } catch {
      return false;
    }
  });

  // Track which tab to open on student portal when navigating from welcome popup
  const [studentInitialTab, setStudentInitialTab] = useState<StudentTabType>('class');

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; photoURL?: string; isGoogleAuth?: boolean } | null>(null);

  // Synchronize with Browser History Popstate (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state || parseCurrentRoute();
      if (state.view) setCurrentView(state.view);
      if (state.adminTab) setAdminTab(state.adminTab);
      if (state.cohortId) setSelectedCohortId(state.cohortId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update View with History API
  const handleViewChange = (newView: AppView) => {
    setCurrentView(newView);
    navigateTo(newView, newView === 'admin' ? adminTab : undefined, selectedCohortId);
  };

  const handleAdminTabChange = (newTab: AdminTab) => {
    setAdminTab(newTab);
    navigateTo('admin', newTab, selectedCohortId);
  };

  const handleCohortChange = (newCohortId: string) => {
    setSelectedCohortId(newCohortId);
    navigateTo(currentView, currentView === 'admin' ? adminTab : undefined, newCohortId);
  };

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user && user.email) {
        setCurrentUser({
          email: user.email,
          name: user.displayName || 'Cohort Member',
          photoURL: user.photoURL || undefined,
          isGoogleAuth: true,
        });
        localStorage.setItem('dtp_student_email', user.email);
      } else {
        const savedEmail = localStorage.getItem('dtp_student_email');
        if (savedEmail) {
          setCurrentUser({ email: savedEmail, name: 'Cohort Member', isGoogleAuth: false });
        } else {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [fetchedCohorts, fetchedClasses, fetchedStudents, fetchedCampaigns, fetchedBooks, fetchedBookAttendance] = await Promise.all([
        api.getCohorts(),
        api.getClasses(),
        api.getStudents(),
        api.getCampaigns(),
        api.getBooks(),
        api.getBookAttendance(),
      ]);

      let finalStudents = fetchedStudents;
      if (fetchedStudents.length === 0) {
        const localStudents = persistentStore.getStudents(selectedCohortId);
        if (localStudents.length > 0) {
          finalStudents = localStudents;
          firebaseDb.syncStudentsToFirestore(selectedCohortId || 'dtp-cohort-2', localStudents).catch(() => {});
        }
      }

      setCohorts(fetchedCohorts);
      if (fetchedCohorts.length > 0 && !selectedCohortId) {
        setSelectedCohortId(fetchedCohorts[0].id);
      }
      setClasses(fetchedClasses);
      setStudents(finalStudents);
      setCampaigns(fetchedCampaigns);
      setBooks(fetchedBooks);
      setBookAttendanceRecords(fetchedBookAttendance);

      // Fetch all attendance records across classes
      const attendancePromises = fetchedClasses.map((c) => api.getClassAttendance(c.id));
      const allAttendance = await Promise.all(attendancePromises);
      const flatAttendance = allAttendance.flat();
      setAttendanceRecords(flatAttendance);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCohortId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthErrorMessage(null);
    try {
      const user = await firebaseAuth.signInWithGoogle();
      if (user && user.email) {
        setCurrentUser({
          email: user.email,
          name: user.displayName || 'Cohort Member',
          photoURL: user.photoURL || undefined,
          isGoogleAuth: true,
        });
        localStorage.setItem('dtp_student_email', user.email);
      }
    } catch (err: any) {
      console.warn('Google popup auth note:', err);
      const code = err?.code || '';
      let msg = 'Google popup was blocked or requires domain authorization.';
      if (code === 'auth/unauthorized-domain') {
        msg = 'Preview domain is not yet on your Firebase Authorized Domains list.';
      } else if (code === 'auth/popup-blocked') {
        msg = 'Browser blocked the popup window.';
      }
      setAuthErrorMessage(msg);
      setIsGoogleModalOpen(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSelectGoogleAccount = (email: string, name: string) => {
    setCurrentUser({
      email,
      name,
      isGoogleAuth: true,
    });
    localStorage.setItem('dtp_student_email', email);
    setIsGoogleModalOpen(false);
  };

  const handleStudentContinue = (email: string, name: string, action: WelcomeAction) => {
    setCurrentUser({
      email,
      name,
      isGoogleAuth: false,
    });
    localStorage.setItem('dtp_student_email', email);
    try {
      sessionStorage.setItem('dtp_has_entered', 'true');
    } catch {}

    if (action === 'attendance') {
      setStudentInitialTab('class');
    } else if (action === 'leaderboard') {
      setStudentInitialTab('leaderboard');
    } else if (action === 'reading') {
      setStudentInitialTab('reading');
    }

    setCurrentView('student');
    setHasEntered(true);
    navigateTo('student', undefined, selectedCohortId);
  };

  const handleAdminContinue = (email: string, name: string) => {
    setCurrentUser({
      email,
      name,
      isGoogleAuth: true,
    });
    localStorage.setItem('dtp_student_email', email);
    try {
      sessionStorage.setItem('dtp_has_entered', 'true');
    } catch {}

    setCurrentView('admin');
    setHasEntered(true);
    navigateTo('admin', adminTab, selectedCohortId);
  };

  const handleSignOut = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (e) {
      console.warn('Sign out:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('dtp_student_email');
    try {
      sessionStorage.removeItem('dtp_has_entered');
    } catch {}
    setHasEntered(false);
  };

  const activeClasses = classes.filter((c) => c.isAttendanceOpen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080b12] flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 p-4 transition-colors">
        {/* Architectural Background in loading */}
        <ArchitecturalBackground />
        
        <div className="relative z-10 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0f1422]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center">
          {/* Authentic Dream Team Constellation Logo */}
          <div className="mb-5 flex justify-center">
            <DreamTeamLogo size="xl" showText={true} animated={true} />
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 rounded-full animate-pulse w-3/4 mx-auto" />
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>Loading Attendance Hub &amp; Leaderboard...</span>
          </p>
        </div>
      </div>
    );
  }

  // 1. WELCOME SCREEN: If user hasn't entered their email yet, present the Welcome Screen
  if (!hasEntered) {
    return (
      <WelcomeScreen
        registeredStudents={students}
        onStudentContinue={handleStudentContinue}
        onAdminContinue={handleAdminContinue}
        onGoogleSignIn={handleGoogleSignIn}
        isSigningIn={isSigningIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b12] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white relative overflow-x-hidden transition-colors duration-200">
      
      {/* Moving Architectural Geometry Canvas Background */}
      <ArchitecturalBackground />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        cohorts={cohorts}
        selectedCohortId={selectedCohortId}
        onSelectCohort={handleCohortChange}
        activeClassCount={activeClasses.length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onGoogleSignInClick={handleGoogleSignIn}
        isSigningIn={isSigningIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'student' ? (
          <StudentPortal
            cohorts={cohorts}
            selectedCohortId={selectedCohortId}
            onSelectCohort={handleCohortChange}
            currentUser={currentUser}
            onGoogleSignIn={handleGoogleSignIn}
            allStudents={students}
            allAttendanceRecords={attendanceRecords}
            books={books}
            bookAttendanceRecords={bookAttendanceRecords}
            onRefreshBooks={loadData}
            initialTab={studentInitialTab}
          />
        ) : (
          <AdminDashboard
            cohorts={cohorts}
            selectedCohortId={selectedCohortId}
            onSelectCohort={handleCohortChange}
            classes={classes}
            students={students}
            attendanceRecords={attendanceRecords}
            campaigns={campaigns}
            books={books}
            bookAttendanceRecords={bookAttendanceRecords}
            currentUser={currentUser}
            activeTab={adminTab}
            onTabChange={handleAdminTabChange}
            onAdminAuthenticated={(email, name) => {
              setCurrentUser({ email, name, isGoogleAuth: true });
              localStorage.setItem('dtp_student_email', email);
            }}
            onReturnToStudentView={() => handleViewChange('student')}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* PROMINENT SWITCH BUTTON BELOW THE WEBSITE */}
      <aside aria-label="Portal Switcher" className="w-full max-w-xl mx-auto px-4 py-4 text-center">
        <div className="bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-xl border-2 border-indigo-200/90 dark:border-indigo-900/80 rounded-3xl p-3 sm:p-3.5 shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${currentView === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            <span>
              Viewing: <strong className="text-slate-900 dark:text-white font-black">{currentView === 'admin' ? 'Admin Hub' : 'Student Attendance'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleViewChange(currentView === 'admin' ? 'student' : 'admin')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white font-black text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Switch to {currentView === 'admin' ? 'Student View' : 'Admin Hub'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              title="Return to Welcome Screen"
              className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Switch User
            </button>
          </div>
        </div>
      </aside>

      {/* Google Sign-in Modal Fallback */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        errorMessage={authErrorMessage}
      />

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c101a]/70 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 dark:text-slate-200">Dream Team Project</span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">Cohort 2 Attendance &amp; AI Communication System</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              55 Enrolled Members Live
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => handleViewChange(currentView === 'student' ? 'admin' : 'student')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-black underline cursor-pointer"
            >
              Switch to {currentView === 'student' ? 'Admin Hub' : 'Student View'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
