import React, { useState } from 'react';
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
  Layers, 
  Award, 
  Check, 
  ChevronRight,
  TrendingUp,
  MessageSquare,
  BookmarkCheck,
  BookMarked
} from 'lucide-react';
import { BookAssignment, BookAttendanceRecord, Student, Cohort } from '../../types';

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

export const BookReadingAttendanceSection: React.FC<BookReadingAttendanceSectionProps> = ({
  books,
  cohort,
  currentEmail,
  onEmailChange,
  registeredStudents,
  bookAttendanceRecords,
  onMarkSuccess,
}) => {
  const activeBooks = books.filter(b => b.isActive);
  const [selectedBookId, setSelectedBookId] = useState<string>(activeBooks[0]?.id || books[0]?.id || '');

  const activeBook = books.find(b => b.id === selectedBookId) || activeBooks[0] || books[0];

  // Form states
  const [emailInput, setEmailInput] = useState<string>(currentEmail || '');
  const [pagesRead, setPagesRead] = useState<number>(activeBook?.pagesPerDay || 15);
  const [review, setReview] = useState<string>('');
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync email input if parent email changes
  React.useEffect(() => {
    if (currentEmail && !emailInput) {
      setEmailInput(currentEmail);
    }
  }, [currentEmail]);

  // Check if current user is enrolled in cohort roster
  const cleanEmail = emailInput.trim().toLowerCase();
  const matchedStudent = registeredStudents.find(
    s => s.email.toLowerCase().trim() === cleanEmail
  );

  // Filter attendance records under this book
  const currentBookRecords = bookAttendanceRecords.filter(
    r => r.bookId === activeBook?.id
  );

  // Check if current student has already marked today for this book
  const todayStr = new Date().toISOString().split('T')[0];
  const userMarkedToday = currentBookRecords.some(
    r => r.studentEmail.toLowerCase().trim() === cleanEmail && r.markedAt.startsWith(todayStr)
  );

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook) return;

    if (!cleanEmail) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your registered student email address.' });
      return;
    }

    if (!matchedStudent) {
      setFeedbackMsg({
        type: 'error',
        text: `"${cleanEmail}" is not found on the enrolled cohort roster. Only students on the roster can mark book reading attendance.`
      });
      return;
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
      const res = await (await import('../../services/api')).api.markBookAttendance({
        bookId: activeBook.id,
        studentEmail: cleanEmail,
        studentName: matchedStudent.name,
        studentPhone: matchedStudent.phone,
        pagesReadToday: Number(pagesRead) || activeBook.pagesPerDay || 15,
        review: review.trim(),
        keyTakeaway: keyTakeaway.trim(),
        rating,
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Awesome job, ${matchedStudent.name}! You claimed +10 Greatness Points for today's reading session.`
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
        text: err?.message || 'Failed to submit reading attendance. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for sample download
  const handleDownloadBook = (book: BookAssignment) => {
    if (book.fileUrl) {
      const link = document.createElement('a');
      link.href = book.fileUrl;
      link.download = book.fileName || `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a pleasant official reader pack
      const content = `DREAM TEAM PROJECT - COHORT READING CHALLENGE\n===========================================\nBook Title: ${book.title}\nAuthor: ${book.author}\nPages Per Day: ${book.pagesPerDay} pages\nTotal Pages: ${book.totalPages} pages\nReading Window: ${book.startDate} to ${book.stopDate}\nDeadline: ${book.deadline}\n\nInstructions:\n1. Read your assigned ${book.pagesPerDay} pages daily.\n2. Summarize key takeaways and practical lessons.\n3. Mark your daily attendance on the Attendance Hub to claim your +10 Greatness points.\n\nDream Team Project Leadership`;
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

  if (!books || books.length === 0) {
    return (
      <div id="reading-challenge-section" className="space-y-6 animate-fade-in">
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden backdrop-blur-md">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-400" />

          <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4 border border-violet-100 shadow-inner">
            <BookOpen className="w-8 h-8 text-violet-600" />
          </div>

          <span className="inline-block px-3.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 text-xs font-black rounded-full uppercase tracking-wider mb-3">
            Reading Challenge &bull; Standing By
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Cohort Reading Book Coming Soon
          </h3>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            The book we are reading will be uploaded by the facilitators when it is time, including the daily page reading quota, reading window, and downloadable file.
          </p>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Students will be able to download the book and claim +10 Greatness points per reading check-in!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="reading-challenge-section" className="space-y-6">
      
      {/* App Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 ring-4 ring-indigo-50">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full border border-violet-200">
                Daily Talent Accelerator
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                +10 Points / Check-in
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Reading Challenge &amp; Book Attendance
            </h3>
          </div>
        </div>

        {/* Book Selector if multiple books */}
        {books.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Choose Book:</span>
            {books.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBookId(b.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeBook?.id === b.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
        
        {/* LEFT COLUMN: The Book Profile & Download Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/40 border-2 border-violet-200/90 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
            
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-400" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Currently Reading &bull; {cohort?.name || 'Cohort 2'}
                </span>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {activeBook.title}
                </h4>
                <p className="text-xs font-bold text-slate-600">
                  By <span className="text-indigo-700">{activeBook.author}</span>
                </p>
              </div>

              {/* Book badge icon */}
              <div className="w-14 h-16 rounded-xl bg-gradient-to-b from-indigo-600 to-violet-800 text-white flex flex-col items-center justify-center shadow-md flex-shrink-0 border-2 border-white">
                <BookMarked className="w-6 h-6 text-amber-300 mb-0.5" />
                <span className="text-[9px] font-black uppercase tracking-tighter">READ</span>
              </div>
            </div>

            {activeBook.description && (
              <p className="text-xs text-slate-600 mb-5 leading-relaxed bg-white/70 p-3 rounded-2xl border border-indigo-100/70">
                {activeBook.description}
              </p>
            )}

            {/* Reading Pacing & Timelines Stats Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-center">
              <div className="bg-white p-3 rounded-2xl border border-violet-100 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Pages / Day</span>
                <span className="text-lg font-black text-violet-700">{activeBook.pagesPerDay}</span>
                <span className="text-[10px] text-slate-400 block">pages daily</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-violet-100 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Total Pages</span>
                <span className="text-lg font-black text-indigo-700">{activeBook.totalPages || 320}</span>
                <span className="text-[10px] text-slate-400 block">complete volume</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Check-ins</span>
                <span className="text-lg font-black text-amber-600">{currentBookRecords.length}</span>
                <span className="text-[10px] text-slate-400 block">verified reviews</span>
              </div>
            </div>

            {/* Reading Schedule Dates */}
            <div className="space-y-2 mb-5 text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Start Date:
                </span>
                <strong className="text-slate-800">{activeBook.startDate}</strong>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Stop Target:
                </span>
                <strong className="text-slate-800">{activeBook.stopDate}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Final Deadline:
                </span>
                <strong className="text-rose-700 font-black">{activeBook.deadline}</strong>
              </div>
            </div>

            {/* Download Book CTA Button */}
            <button
              type="button"
              onClick={() => handleDownloadBook(activeBook)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download "{activeBook.title}" ({activeBook.fileType ? activeBook.fileType.toUpperCase() : 'PDF'})</span>
            </button>

            {activeBook.fileName && (
              <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                Source File: {activeBook.fileName}
              </p>
            )}

          </div>

          {/* Guidelines Callout */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-black text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Reading Challenge Policy &bull; 10 Points Award</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed text-[11px]">
              Only enrolled members whose emails appear in the official cohort roster are authorized to mark attendance. A substantive review of what you learned is strictly mandatory.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Mark Book Attendance & Mandatory Review Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative backdrop-blur-md">
            
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Daily Check-in
                </span>
                <h4 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  Mark Your Book Attendance
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                  +10 Points
                </span>
              </div>
            </div>

            {/* Notice if already marked today */}
            {userMarkedToday && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Already Marked Today:</strong> You have logged today's reading check-in for <em>{activeBook.title}</em>. You can update your review or submit additional reflections below.
                </span>
              </div>
            )}

            {/* Error or Success Alert */}
            {feedbackMsg && (
              <div className={`mb-5 p-4 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-rose-50 border border-rose-300 text-rose-900 font-semibold'
              }`}>
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4 text-left">
              
              {/* STEP 1: Student Email Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Registered Cohort Email <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Must match roster</span>
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
                    className="w-full bg-slate-50 border border-slate-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-100 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all pl-10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                {cleanEmail && (
                  <div className="mt-1.5 text-[11px]">
                    {matchedStudent ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Verified: {matchedStudent.name} ({cohort?.name || 'Cohort Member'})
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        Not on roster. Only registered cohort members can mark book attendance.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Pages Read Today */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                    Pages Read Today
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeBook.totalPages || 1000}
                    value={pagesRead}
                    onChange={(e) => setPagesRead(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-violet-600 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Target: {activeBook.pagesPerDay} pages / day
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                    Today's Chapter Rating
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
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-1">({rating}/5)</span>
                  </div>
                </div>
              </div>

              {/* MANDATORY REVIEW: What did you learn from the book? */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-violet-600" />
                    What Did You Learn Today? <span className="text-rose-500">* (Mandatory Review)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">Minimum 10 words</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={`Write your detailed review on what you learnt from "${activeBook.title}" today. E.g. "I learned about the 1% compounding rule, habit stacking, and how setting identity-based systems leads to sustainable excellence..."`}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-100 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 transition-all resize-y"
                />
              </div>

              {/* Optional 1-Sentence Key Takeaway */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Key One-Sentence Takeaway (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'You do not rise to the level of your goals; you fall to the level of your systems.'"
                  value={keyTakeaway}
                  onChange={(e) => setKeyTakeaway(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-violet-600 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !cleanEmail || !review.trim()}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSubmitting || !cleanEmail || !review.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.01] cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <span>Saving Review &amp; Alloting +10 Points...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Submit Review &amp; Mark Book Attendance (+10 pts)</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>

      {/* STUDENT BOOK REVIEWS & ATTENDANCE LOG UNDER THE BOOK */}
      <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Peer Reading Reviews &amp; Check-in Log
              </h4>
              <p className="text-xs text-slate-500">
                Verified reviews submitted for <em>{activeBook.title}</em>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {currentBookRecords.length} Total Check-in(s)
          </span>
        </div>

        {currentBookRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">No student reviews logged yet for this book.</p>
            <p className="text-xs text-slate-400 mt-0.5">Be the first cohort member to read today's pages and earn +10 points!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBookRecords.slice(0, 8).map((record) => (
              <div 
                key={record.id}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4.5 hover:bg-white hover:border-violet-200 hover:shadow-sm transition-all space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center">
                      {record.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-none">{record.studentName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{record.studentEmail}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    +10 pts
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                  "{record.review}"
                </div>

                {record.keyTakeaway && (
                  <p className="text-[11px] font-bold text-violet-700">
                    💡 Key Takeaway: <span className="text-slate-700 font-medium">{record.keyTakeaway}</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Pages Read: <strong className="text-slate-600">{record.pagesReadToday || 15}</strong></span>
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
