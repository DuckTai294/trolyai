import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  isDark: boolean;
}

export type ThemeMode = 'light' | 'dark';

const themePalettes: Theme[] = [
  {
    id: 'liquid-aurora',
    name: 'Cực Quang ✨',
    primary: 'from-cyan-400 via-blue-500 to-indigo-600',
    secondary: 'from-blue-900 to-slate-950',
    isDark: true
  },
  {
    id: 'liquid-rose',
    name: 'Hoa Hồng 🌸',
    primary: 'from-pink-400 via-rose-500 to-red-600',
    secondary: 'from-rose-900 to-slate-950',
    isDark: true
  },
  {
    id: 'liquid-emerald',
    name: 'Ngọc Lục Bảo 🌿',
    primary: 'from-emerald-400 via-teal-500 to-cyan-600',
    secondary: 'from-emerald-900 to-slate-950',
    isDark: true
  }
];

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleMode: () => void;
  setThemeId: (id: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState('liquid-aurora');
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleMode = () => setMode(m => m === 'light' ? 'dark' : 'light');

  const activeTheme = themePalettes.find(t => t.id === themeId) || themePalettes[0];
  const themeWithMode = { ...activeTheme, isDark: mode === 'dark' };

  return (
    <ThemeContext.Provider value={{ theme: themeWithMode, mode, toggleMode, setThemeId, availableThemes: themePalettes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeSettings: React.FC = () => {
  const { theme, setThemeId, availableThemes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full btn-glass p-3 rounded-2xl flex items-center gap-3 font-bold text-sm">
        🎨 Chủ đề
      </button>
      
      {open && (
        <div className="absolute bottom-full left-0 w-full mb-2 liquid-glass p-3 rounded-2xl space-y-2 animate-pop-in">
          {availableThemes.map(t => (
            <button 
              key={t.id} 
              onClick={() => { setThemeId(t.id); setOpen(false); }}
              className={`w-full p-2 rounded-xl text-xs font-bold transition-all ${theme.id === t.id ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};