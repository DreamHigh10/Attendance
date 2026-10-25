import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  Medal,
  Sparkles,
  Crown,
  HelpCircle
} from 'lucide-react';
import { LeaderboardUserEntry } from '../../utils/leaderboard';
import { PointsBreakdownModal } from '../common/PointsBreakdownModal';

interface GreatnessLeaderboardProps {
  entries: LeaderboardUserEntry[];
  cohortName?: string;
  userEmail?: string;
  onSelectStudentEmail?: (email: string) => void;
}

export const GreatnessLeaderboard: React.FC<GreatnessLeaderboardProps> = ({
  entries,
  cohortName = 'Cohort 2',
  userEmail,
  onSelectStudentEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'top10'>('all');

  const normalizedUserEmail = (userEmail || '').trim().toLowerCase();
  const currentUserEntry = entries.find(
    (e) => e.email.toLowerCase() === normalizedUserEmail
  );

  // Filter entries
  const filtered = entries.filter((entry) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.name.toLowerCase().includes(q) ||
      entry.email.toLowerCase().includes(q) ||
      (entry.phone && entry.phone.includes(q))
    );
  });

  const displayEntries = filterMode === 'top10' ? filtered.slice(0, 10) : filtered;

  // Find max attended / points for relative bar widths
  const maxPoints = Math.max(...entries.map((e) => e.totalPoints), 10);
  const maxAttended = Math.max(...entries.map((e) => e.totalAttended), 1);

  // Top 3 Podium
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <div id="greatness-leaderboard" className="w-full bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-md transition-colors">
      
      {/* Top Gradient Banner */}
      <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-amber-400 via-indigo-600 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>The Greatness Rank</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {cohortName} Standings &bull; {entries.length} Members
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPointsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Points Info</span>
          </button>

          {/* Filter toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setFilterMode('top10')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'top10'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top 10
            </button>
          </div>
        </div>
      </div>

      {/* PERSONAL RANK CALLOUT */}
      {currentUserEntry && (
        <div className="my-5 p-4 rounded-2xl bg-indigo-600 text-white shadow-md relative overflow-hidden animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg text-white border border-white/20">
                #{currentUserEntry.rank}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {currentUserEntry.name}
                </h3>
                <p className="text-xs text-indigo-200">
                  {currentUserEntry.email}
                </p>
              </div>
            </div>

            {/* User Stat Pills */}
            <div className="flex items-center gap-2">
              <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-center">
                <span className="text-[10px] text-indigo-100 block uppercase font-bold">Points</span>
                <span className="text-base font-black text-white">{currentUserEntry.totalPoints}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-center">
                <span className="text-[10px] text-indigo-100 block uppercase font-bold">Attended</span>
                <span className="text-base font-black text-white">{currentUserEntry.totalAttended}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-center">
                <span className="text-[10px] text-indigo-100 block uppercase font-bold">Rate</span>
                <span className="text-base font-black text-emerald-300">{currentUserEntry.attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP 3 PODIUM */}
      {entries.length >= 3 && !searchQuery && (
        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 2nd Place */}
          {top2 && (
            <div 
              onClick={() => onSelectStudentEmail?.(top2.email)}
              className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center transition-all hover:scale-[1.01] cursor-pointer relative"
            >
              <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center mx-auto mb-2 shadow-xs">
                #2
              </div>
              <Medal className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
              <p className="font-black text-slate-900 dark:text-white text-sm truncate">{top2.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">{top2.email}</p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black">
                {top2.totalPoints} pts &bull; {top2.totalAttended} classes
              </div>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {top1 && (
            <div 
              onClick={() => onSelectStudentEmail?.(top1.email)}
              className="bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30 hover:from-amber-100 dark:hover:from-amber-950/60 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 text-center transition-all hover:scale-[1.02] cursor-pointer relative shadow-md"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-base flex items-center justify-center mx-auto mb-1 shadow-md shadow-amber-500/30">
                #1
              </div>
              <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1 fill-amber-400" />
              <p className="font-black text-slate-900 dark:text-white text-base truncate">{top1.name}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mb-2">{top1.email}</p>
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-black shadow-xs">
                {top1.totalPoints} pts &bull; {top1.totalAttended} classes
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div 
              onClick={() => onSelectStudentEmail?.(top3.email)}
              className="bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/50 dark:hover:bg-amber-950/50 border-2 border-amber-200/70 dark:border-amber-800/60 rounded-2xl p-4 text-center transition-all hover:scale-[1.01] cursor-pointer relative"
            >
              <div className="w-9 h-9 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-2 shadow-xs">
                #3
              </div>
              <Medal className="w-6 h-6 text-amber-700 dark:text-amber-500 mx-auto mb-1" />
              <p className="font-black text-slate-900 dark:text-white text-sm truncate">{top3.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">{top3.email}</p>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-800">
                {top3.totalPoints} pts &bull; {top3.totalAttended} classes
              </div>
            </div>
          )}

        </div>
      )}

      {/* Search Input */}
      <div className="my-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search leaderboard by name, email, or rank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* LEADERBOARD TABLE WITH VISUAL BAR CHARTS */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <th className="py-3 px-3 sm:px-4 text-center w-14">Rank</th>
              <th className="py-3 px-3 sm:px-4">Member</th>
              <th className="py-3 px-3 sm:px-4 min-w-[200px]">Attendance Level &amp; Visual Chart</th>
              <th className="py-3 px-3 sm:px-4 text-center">Score Breakdown</th>
              <th className="py-3 px-3 sm:px-4 text-right">Total Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {displayEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No participants matched your search criteria.
                </td>
              </tr>
            ) : (
              displayEntries.map((entry) => {
                const isCurrentUser =
                  normalizedUserEmail &&
                  entry.email.toLowerCase() === normalizedUserEmail;

                // Relative bar percentages
                const attendanceBarPercent = Math.min(
                  100,
                  Math.round((entry.totalAttended / Math.max(1, entry.totalClasses || maxAttended)) * 100)
                );

                const pointsBarPercent = Math.min(
                  100,
                  Math.round((entry.totalPoints / maxPoints) * 100)
                );

                return (
                  <tr
                    key={entry.email}
                    onClick={() => onSelectStudentEmail?.(entry.email)}
                    className={`transition-colors cursor-pointer group ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 font-bold border-l-4 border-l-indigo-600'
                        : entry.rank <= 3
                        ? 'bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Rank Medal / Badge */}
                    <td className="py-3 px-3 sm:px-4 text-center font-black">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500 text-white shadow-xs">
                          🥇
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs">
                          🥈
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700 text-white shadow-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-bold">
                          #{entry.rank}
                        </span>
                      )}
                    </td>

                    {/* Member Info */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{entry.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.2 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{entry.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Bar Chart showing Attendance Level */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-slate-300 font-bold">
                            {entry.totalAttended} of {entry.totalClasses} classes attended
                          </span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {entry.attendanceRate}%
                          </span>
                        </div>
                        
                        {/* Attendance Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              entry.attendanceRate >= 80
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : entry.attendanceRate >= 50
                                ? 'bg-gradient-to-r from-amber-500 to-indigo-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${attendanceBarPercent}%` }}
                          />
                        </div>

                        {/* Relative Points Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${pointsBarPercent}%` }}
                            title={`Overall Points Weight: ${entry.totalPoints} pts`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Breakdown Badges */}
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-[10px]">
                        <span 
                          className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                          title={`${entry.totalAttended} classes attended x 10 pts = ${entry.attendancePoints} pts`}
                        >
                          {entry.attendancePoints}a
                        </span>
                        <span 
                          className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          title={`${entry.commentsCount} comments submitted x 5 pts = ${entry.commentPoints} pts`}
                        >
                          {entry.commentPoints}c
                        </span>
                        <span 
                          className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          title={`${entry.speedBonusCount} speed bonuses = ${entry.speedPoints} pts`}
                        >
                          +{entry.speedPoints}s
                        </span>
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="py-3 px-3 sm:px-4 text-right">
                      <div className="inline-block text-right">
                        <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                          {entry.totalPoints}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">
                          pts
                        </span>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Attendance (10 pts/class)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Note / Comment (5 pts)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>First 5 Sign-in Speed (+5..+1 pts)</span>
          </span>
        </div>

        <button
          onClick={() => setIsPointsModalOpen(true)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold underline cursor-pointer text-xs"
        >
          View detailed scoring rules popup &rarr;
        </button>
      </div>

      {/* Popup Modal */}
      <PointsBreakdownModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
      />

    </div>
  );
};
