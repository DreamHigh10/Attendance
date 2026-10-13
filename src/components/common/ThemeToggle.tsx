import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-2 p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-slate-700/80 shadow-md shadow-amber-500/5 hover:scale-105'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs hover:scale-105'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold tracking-tight">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
