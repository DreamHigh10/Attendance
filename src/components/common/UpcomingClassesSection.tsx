import React from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  ExternalLink, 
  Sparkles, 
  BellRing, 
  ArrowRight, 
  Lock,
  Hourglass,
  Timer
} from 'lucide-react';
import { ClassSession, Cohort } from '../../types';
import { AttendanceCountdown } from './AttendanceCountdown';

interface UpcomingClassesSectionProps {
  classes: ClassSession[];
  cohort?: Cohort;
  isAdminView?: boolean;
  onSendReminderEmail?: (classSession: ClassSession) => void;
  onSelectClassForAttendance?: (classSession: ClassSession) => void;
}

export const UpcomingClassesSection: React.FC<UpcomingClassesSectionProps> = ({
  classes,
  cohort,
  isAdminView,
  onSendReminderEmail,
  onSelectClassForAttendance,
}) => {
  // Sort classes by date ascending (or next scheduled)
  const sortedClasses = [...classes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getRelativeDayText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Completed';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Upcoming Classes</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isAdminView 
              ? 'Scheduled sessions and member reminders' 
              : 'Class schedule and attendance times'}
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{sortedClasses.length} Scheduled</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedClasses.map((cls) => {
          const relativeText = getRelativeDayText(cls.date);
          const isToday = relativeText === 'Today';

          const now = Date.now();
          const isElapsed = cls.attendanceEndTime 
            ? now > new Date(cls.attendanceEndTime).getTime() 
            : false;
          const isNotStarted = cls.attendanceStartTime 
            ? now < new Date(cls.attendanceStartTime).getTime() 
            : false;
          const isLive = cls.isAttendanceOpen && !isElapsed && !isNotStarted;

          return (
            <div
              key={cls.id}
              className={`bg-white dark:bg-[#0f1422] border-2 rounded-3xl p-5 sm:p-6 shadow-md shadow-slate-100 dark:shadow-none flex flex-col justify-between transition-all hover:scale-[1.01] ${
                isLive 
                  ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-950/50 shadow-indigo-500/10' 
                  : isToday 
                  ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header Chips */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    isToday
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {relativeText}
                  </span>

                  {isLive ? (
                    <AttendanceCountdown
                      startTime={cls.attendanceStartTime}
                      endTime={cls.attendanceEndTime}
                      isOpen={true}
                      size="sm"
                    />
                  ) : isElapsed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Window Closed
                    </span>
                  ) : isNotStarted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Hourglass className="w-3 h-3 text-amber-600" />
                      Starts at {cls.attendanceStartTime ? new Date(cls.attendanceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'class time'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      Scheduled
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white mb-2 leading-snug">
                  {cls.title}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>{new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>{cls.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>Facilitator: <strong className="text-slate-800 dark:text-slate-200 font-bold">{cls.instructorName}</strong></span>
                  </div>
                </div>

                {/* Attendance Window Display */}
                {(cls.attendanceStartTime || cls.attendanceEndTime) && (
                  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700 rounded-xl p-2.5 mb-3 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                      <Timer className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Window:</span>
                    </span>
                    <span className="font-mono font-semibold">
                      {cls.attendanceStartTime ? new Date(cls.attendanceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Start'}
                      {' &rarr; '}
                      {cls.attendanceEndTime ? new Date(cls.attendanceEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'End'}
                    </span>
                  </div>
                )}

                {cls.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mb-3 line-clamp-2">
                    &ldquo;{cls.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {cls.meetingUrl && (
                  <a
                    href={cls.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    <span>Meeting Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {isAdminView && onSendReminderEmail && (
                  <button
                    onClick={() => onSendReminderEmail(cls)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer ml-auto"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-300" />
                    <span>Send Reminder Email</span>
                  </button>
                )}

                {!isAdminView && isLive && onSelectClassForAttendance && (
                  <button
                    onClick={() => onSelectClassForAttendance(cls)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer ml-auto"
                  >
                    <span>Enter Code &bull; Mark Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {!isAdminView && !isLive && isElapsed && (
                  <span className="text-[11px] text-slate-400 font-bold ml-auto">
                    Submissions Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
