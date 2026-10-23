import React from 'react';
import { 
  Radio, 
  CheckCircle2, 
  BookOpen, 
  Mail, 
  Users, 
  Settings,
  Sparkles,
  Trophy
} from 'lucide-react';

export type AdminTabType = 'classes' | 'attendance' | 'books' | 'leaderboard' | 'emails' | 'roster' | 'cohorts';

interface AdminBottomNavProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
  attendanceCount?: number;
  booksCount?: number;
  rosterCount?: number;
  activeClassCount?: number;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  activeTab,
  onTabChange,
  attendanceCount = 0,
  booksCount = 1,
  rosterCount = 55,
  activeClassCount = 1,
}) => {
  const navItems = [
    {
      id: 'classes' as AdminTabType,
      label: 'Classes',
      icon: Radio,
      badge: activeClassCount > 0 ? 'Live' : undefined,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'attendance' as AdminTabType,
      label: 'Register',
      icon: CheckCircle2,
      badge: attendanceCount > 0 ? String(attendanceCount) : undefined,
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'books' as AdminTabType,
      label: 'Books',
      icon: BookOpen,
      badge: booksCount > 0 ? String(booksCount) : undefined,
      badgeColor: 'bg-violet-600',
    },
    {
      id: 'leaderboard' as AdminTabType,
      label: 'Ranking',
      icon: Trophy,
      badge: 'Pts',
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'emails' as AdminTabType,
      label: 'AI Mail',
      icon: Mail,
      badge: 'AI',
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'roster' as AdminTabType,
      label: 'Roster',
      icon: Users,
      badge: String(rosterCount),
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'cohorts' as AdminTabType,
      label: 'Config',
      icon: Settings,
    },
  ];

  return (
    <nav aria-label="Admin Navigation" className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-50 px-2 sm:px-4 pointer-events-none transition-all duration-300">
      <div className="max-w-2xl mx-auto bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-2xl border-2 border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-3xl p-1 pointer-events-auto flex items-center justify-between gap-0.5 overflow-x-auto scrollbar-none ring-1 ring-black/5 dark:ring-white/5 transition-colors">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex-1 min-w-[50px] sm:min-w-0 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-50 to-indigo-100/70 dark:from-indigo-950/80 dark:to-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black scale-[1.03] shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-bold'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center mb-0.5 sm:mb-1">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black text-white ${item.badgeColor} shadow-2xs leading-tight`}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Text Label Below Icon */}
              <span className={`text-[9px] sm:text-[11px] tracking-tight leading-none ${isActive ? 'text-indigo-900 dark:text-indigo-200 font-black' : 'text-slate-600 dark:text-slate-400 font-bold'}`}>
                {item.label}
              </span>

              {/* Active Dot Indicator */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1 shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
