import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  BookOpen, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Star, 
  FileText, 
  Send, 
  Sparkles, 
  AlertCircle, 
  User, 
  Check, 
  MessageSquare,
  BookmarkCheck,
  BookMarked,
  Filter,
  UserCheck
} from 'lucide-react';
import { BookAssignment, BookAttendanceRecord, Student, Cohort } from '../../types';
import { api } from '../../services/api';

interface BookReadingAttendanceSectionProps {
  books: BookAssignment[];
  cohort?: Cohort;
  currentEmail: string;
  onEmailChange?: (email: string) => void;
  registeredStudents: Student[];
  bookAttendanceRecords: BookAttendanceRecord[];
  onMarkSuccess?: (record: BookAttendanceRecord) => void;
  onRefresh?: () => void;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'ogungbadekehinde19@gmail.com',
  'aduoluwaseyi33@gmail.com',
  'paulstanleytobechukwu01@gmail.com',
  'chiemelab166@gmail.com',
  'munachimsomoses04@gmail.com',
];

const DEFAULT_COHORT_BOOK: BookAssignment = {
  id: 'book-cohort-challenge-1',
  cohortId: 'dtp-cohort-2',
  title: 'Cohort 2 Reading Challenge',
  author: 'Cohort Leadership & Innovation Masterwork',
  description: 'Weekly cohort reading assignment. Read daily, submit what you learned, and claim +10 Greatness points.',
  pagesPerDay: 15,
  totalPages: 320,
  startDate: '2026-10-10',
  stopDate: '2026-11-10',
  deadline: '2026-11-15',
  isActive: true,
  createdAt: new Date().toISOString(),
  fileType: 'pdf',
  fileName: 'Cohort2_Reading_Assignment.pdf'
};

export const BookReadingAttendanceSection: React.FC<BookReadingAttendanceSectionProps> = ({
  books,
  cohort,
  currentEmail,
  onEmailChange,
  registeredStudents = [],
  bookAttendanceRecords = [],
  onMarkSuccess,
}) => {
  // Fall back to default active book if books array is currently empty
  const effectiveBooks = (books && books.length > 0) ? books : [DEFAULT_COHORT_BOOK];
  const activeBooks = effectiveBooks.filter(b => b.isActive);
  const [selectedBookId, setSelectedBookId] = useState<string>(activeBooks[0]?.id || effectiveBooks[0]?.id || DEFAULT_COHORT_BOOK.id);

  const activeBook = effectiveBooks.find(b => b.id === selectedBookId) || activeBooks[0] || effectiveBooks[0] || DEFAULT_COHORT_BOOK;

  // Form states
  const [emailInput, setEmailInput] = useState<string>(currentEmail || '');
  const [pagesRead, setPagesRead] = useState<number>(activeBook.pagesPerDay || 15);
  const [review, setReview] = useState<string>('');
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local optimistic reviews
  const [localSubmittedReviews, setLocalSubmittedReviews] = useState<BookAttendanceRecord[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');

  // Sync email input if parent email changes
  useEffect(() => {
    if (currentEmail && !emailInput) {
      setEmailInput(currentEmail);
    }
  }, [currentEmail]);

  // Update pages target if activeBook changes
  useEffect(() => {
    if (activeBook?.pagesPerDay) {
      setPagesRead(activeBook.pagesPerDay);
    }
  }, [activeBook?.id]);

  // Authorization check
  const cleanEmail = emailInput.trim().toLowerCase();
  const matchedStudent = registeredStudents.find(
    s => s.email.toLowerCase().trim() === cleanEmail
  );
  const isAdmin = AUTHORIZED_ADMIN_EMAILS.some(a => a.toLowerCase() === cleanEmail);
  const isAuthorized = !!matchedStudent || isAdmin;

  const studentDisplayName = matchedStudent 
    ? matchedStudent.name 
    : (isAdmin ? (cleanEmail.includes('ogungbade') ? 'Kehinde Ogungbade (Admin)' : 'Dream Team Facilitator') : '');

  // Combined records for display
  const combinedRecords = [
    ...localSubmittedReviews,
    ...bookAttendanceRecords.filter(r => !localSubmittedReviews.some(lr => lr.id === r.id))
  ];

  // Filter records under current book
  const currentBookRecords = combinedRecords.filter(
    r => !r.bookId || r.bookId === activeBook.id || effectiveBooks.length === 1
  );

  // Check if current student has already marked today for this book
  const todayStr = new Date().toISOString().split('T')[0];
  const userMarkedToday = currentBookRecords.some(
    r => r.studentEmail.toLowerCase().trim() === cleanEmail && r.markedAt.startsWith(todayStr)
  );

  const displayedReviews = filterMode === 'mine' && cleanEmail
    ? currentBookRecords.filter(r => r.studentEmail.toLowerCase().trim() === cleanEmail)
    : currentBookRecords;

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook) return;

    if (!cleanEmail) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your registered student email address.' });
      return;
    }

    let verifiedStudentName = studentDisplayName;

    if (!isAuthorized) {
      // Attempt asynchronous roster lookup in case data is loading
      try {
        const lookup = await api.lookupStudent(cleanEmail, cohort?.id);
        if (lookup.found && lookup.student) {
          verifiedStudentName = lookup.student.name;
        } else {
          setFeedbackMsg({
            type: 'error',
            text: `"${cleanEmail}" was not found on the enrolled cohort roster. Only registered cohort members can submit book reviews.`
          });
          return;
        }
      } catch {
        setFeedbackMsg({
          type: 'error',
          text: `"${cleanEmail}" was not found on the enrolled cohort roster. Only registered cohort members can submit book reviews.`
        });
        return;
      }
    }

    if (!review.trim() || review.trim().length < 5) {
      setFeedbackMsg({
        type: 'error',
        text: 'Review of what you learned is mandatory! Please share your insights and learning reflections from today\'s reading.'
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await api.markBookAttendance({
        bookId: activeBook.id,
        studentEmail: cleanEmail,
        studentName: verifiedStudentName || 'Cohort Member',
        studentPhone: matchedStudent?.phone || '',
        pagesReadToday: Number(pagesRead) || activeBook.pagesPerDay || 15,
        review: review.trim(),
        keyTakeaway: keyTakeaway.trim(),
        rating,
      });

      if (res.success && res.record) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        setLocalSubmittedReviews(prev => [res.record, ...prev]);
        setFeedbackMsg({
          type: 'success',
          text: `Awesome job, ${verifiedStudentName || 'Innovator'}! Your review has been published and you claimed +10 Greatness Points.`
        });
        setReview('');
        setKeyTakeaway('');

        if (onMarkSuccess) {
          onMarkSuccess(res.record);
        }
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Failed to submit reading review. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for study pack download
  const handleDownloadBook = (book: BookAssignment) => {
    if (book.fileUrl) {
      const link = document.createElement('a');
      link.href = book.fileUrl;
      link.download = book.fileName || `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `DREAM TEAM PROJECT - COHORT READING CHALLENGE\n===========================================\nBook Title: ${book.title}\nAuthor: ${book.author}\nPages Per Day: ${book.pagesPerDay} pages\nTotal Pages: ${book.totalPages} pages\nReading Window: ${book.startDate} to ${book.stopDate}\nDeadline: ${book.deadline}\n\nInstructions:\n1. Read your assigned ${book.pagesPerDay} pages daily.\n2. Summarize key takeaways, innovative ideas, and practical applications.\n3. Mark your daily attendance on the Attendance Hub to claim your +10 Greatness points.\n\nDream Team Project Leadership`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${book.title.replace(/\s+/g, '_')}_Study_Guide.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div id="reading-challenge-section" className="space-y-6 animate-fade-in">
      
      {/* App Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 ring-4 ring-indigo-50 dark:ring-indigo-950">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                Daily Talent Accelerator
              </span>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                +10 Points / Review
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              Reading Challenge &amp; Book Attendance
            </h3>
          </div>
        </div>

        {/* Book Selector if multiple books */}
        {effectiveBooks.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Choose Book:</span>
            {effectiveBooks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBookId(b.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeBook?.id === b.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {b.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main App Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Book Profile & Target Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-[#0f1422] border-2 border-violet-200/90 dark:border-violet-900/60 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md transition-colors">
            
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-400" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
                  Currently Reading &bull; {cohort?.name || 'Cohort 2'}
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {activeBook.title}
                </h4>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  By <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{activeBook.author}</span>
                </p>
              </div>

              {/* Book badge icon */}
              <div className="w-14 h-16 rounded-xl bg-gradient-to-b from-indigo-600 to-violet-800 text-white flex flex-col items-center justify-center shadow-md flex-shrink-0 border-2 border-white/80 dark:border-slate-700">
                <BookMarked className="w-6 h-6 text-amber-300 mb-0.5" />
                <span className="text-[9px] font-black uppercase tracking-tighter">BOOK</span>
              </div>
            </div>

            {activeBook.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-indigo-100/70 dark:border-slate-800">
                {activeBook.description}
              </p>
            )}

            {/* Reading Pacing & Timelines Stats Card */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-2xl border border-violet-100 dark:border-slate-700 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">Pacing</span>
                <span className="text-base font-black text-violet-700 dark:text-violet-400">{activeBook.pagesPerDay || 15}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">pages/day</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-2xl border border-violet-100 dark:border-slate-700 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">Length</span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-400">{activeBook.totalPages || 320}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">pages total</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-2xl border border-amber-100 dark:border-slate-700 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">Reviews</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">{currentBookRecords.length}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">submitted</span>
              </div>
            </div>

            {/* Reading Schedule Dates */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 mb-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {activeBook.startDate} &ndash; {activeBook.stopDate}
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                Deadline: {activeBook.deadline || 'Cohort Finale'}
              </span>
            </div>

            {/* Download Book CTA Button */}
            <button
              type="button"
              onClick={() => handleDownloadBook(activeBook)}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Study Guide ({activeBook.fileType ? activeBook.fileType.toUpperCase() : 'PDF'})</span>
            </button>

          </div>
        </div>

        {/* RIGHT COLUMN: Mark Book Attendance & Mandatory Review Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative backdrop-blur-md transition-colors">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Daily Reading Check-in
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Read assigned pages &bull; Submit your review
                </p>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                +10 Points
              </span>
            </div>

            {/* Notice if already marked today */}
            {userMarkedToday && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  Today&apos;s check-in recorded for <em>{activeBook.title}</em>. You can submit another reflection below.
                </span>
              </div>
            )}

            {/* Error or Success Alert */}
            {feedbackMsg && (
              <div className={`mb-5 p-4 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-semibold'
              }`}>
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4 text-left">
              
              {/* Student Email Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                  Registered Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered cohort email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (onEmailChange) onEmailChange(e.target.value);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all pl-10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                {cleanEmail && (
                  <div className="mt-1 text-[11px]">
                    {isAuthorized ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Verified: {studentDisplayName}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        Email not on cohort roster.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Pages Read Today & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Pages Read Today
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeBook.totalPages || 1000}
                    value={pagesRead}
                    onChange={(e) => setPagesRead(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Target: {activeBook.pagesPerDay || 15} pages/day
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                        title={`${star} Star`}
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">({rating}/5)</span>
                  </div>
                </div>
              </div>

              {/* MANDATORY REVIEW */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    What Did You Learn Today? <span className="text-rose-500">*</span>
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={`Write your key learnings and takeaways from "${activeBook.title}"...`}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all resize-y"
                />
              </div>

              {/* Optional Key Takeaway */}
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Key Takeaway (Optional)
                </label>
                <input
                  type="text"
                  placeholder="One main takeaway or personal action item"
                  value={keyTakeaway}
                  onChange={(e) => setKeyTakeaway(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !cleanEmail || !review.trim()}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSubmitting || !cleanEmail || !review.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 hover:scale-[1.01] cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <span>Saving Review...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Submit Review (+10 pts)</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>

      {/* STUDENT BOOK REVIEWS & ATTENDANCE LOG UNDER THE BOOK */}
      <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Peer Reading Reviews &amp; Check-in Log
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified reviews submitted for <em>{activeBook.title}</em>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cleanEmail && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  All ({currentBookRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('mine')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'mine'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  My Reviews
                </button>
              </div>
            )}
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {currentBookRecords.length} Review(s)
            </span>
          </div>
        </div>

        {displayedReviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No student reviews logged yet for this book.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Be the first cohort member to read today's pages and earn +10 points!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((record) => (
              <div 
                key={record.id}
                className="bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 hover:bg-white dark:hover:bg-slate-800 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-sm transition-all space-y-2.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {record.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-none flex items-center gap-1.5">
                        <span>{record.studentName}</span>
                        <UserCheck className="w-3 h-3 text-emerald-500" />
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Verified Cohort Innovator</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {record.rating && (
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: record.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      +10 pts
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{record.review}"
                </div>

                {record.keyTakeaway && (
                  <p className="text-[11px] font-bold text-violet-700 dark:text-violet-400 bg-violet-50/70 dark:bg-violet-950/40 p-2 rounded-lg border border-violet-100 dark:border-violet-900/50">
                    💡 Key Takeaway: <span className="text-slate-700 dark:text-slate-300 font-medium">{record.keyTakeaway}</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Pages Read: <strong className="text-slate-600 dark:text-slate-300">{record.pagesReadToday || 15}</strong></span>
                  <span>{new Date(record.markedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
