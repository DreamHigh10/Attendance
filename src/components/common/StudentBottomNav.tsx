import React from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  Trophy, 
  MessagesSquare, 
  Sparkles 
} from 'lucide-react';

export type StudentTabType = 'class' | 'reading' | 'leaderboard' | 'lounge';

interface StudentBottomNavProps {
  activeTab: StudentTabType;
  onTabChange: (tab: StudentTabType) => void;
  activeClassCount?: number;
  unreadLoungeCount?: number;
}

export const StudentBottomNav: React.FC<StudentBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeClassCount = 0,
  unreadLoungeCount = 0,
}) => {
  const navItems = [
    {
      id: 'class' as StudentTabType,
      label: 'Class Attendance',
      shortLabel: 'Attendance',
      icon: CheckCircle2,
      badge: activeClassCount > 0 ? 'Live' : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'reading' as StudentTabType,
      label: 'Book Challenge',
      shortLabel: 'Book Challenge',
      icon: BookOpen,
      badge: '+10 Pts',
      badgeColor: 'bg-amber-400 text-amber-950 font-black',
    },
    {
      id: 'leaderboard' as StudentTabType,
      label: 'Leaderboard',
      shortLabel: 'Ranking',
      icon: Trophy,
      badge: 'Rank',
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'lounge' as StudentTabType,
      label: 'Dreamers Lounge',
      shortLabel: 'Lounge',
      icon: MessagesSquare,
      badge: 'Chat',
      badgeColor: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
    },
  ];

  return (
    <nav 
      aria-label="Student Navigation Bar" 
      className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none transition-all duration-300"
    >
      <div className="max-w-xl mx-auto bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-2xl border-2 border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-indigo-950/15 rounded-3xl p-1.5 pointer-events-auto flex items-center justify-around gap-1 ring-1 ring-black/5 dark:ring-white/5 transition-colors">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-violet-600 to-indigo-600 text-white font-black scale-[1.03] shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-bold'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center mb-0.5">
                <Icon 
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`} 
                />

                {item.badge && !isActive && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] px-1 py-0.2 rounded-full font-black leading-none ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-indigo-600 animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] sm:text-xs tracking-tight transition-all truncate max-w-full ${
                isActive ? 'text-white font-black' : 'text-slate-600 dark:text-slate-300'
              }`}>
                <span className="hidden xs:inline">{item.label}</span>
                <span className="xs:hidden">{item.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
