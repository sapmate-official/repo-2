"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export const WALLPAPERS = [
  { id: 'none', label: 'Default Theme', style: '' },
  { id: 'pure-white', label: 'Crisp White', style: 'bg-white text-slate-800' },
  { id: 'academic-light', label: 'Academic Canvas', style: 'bg-slate-50 text-slate-800' },
  { id: 'frost-mesh', label: 'Soft Frost Mesh', style: 'bg-gradient-to-br from-indigo-50/60 via-slate-100 to-sky-50 text-slate-800' },
  { id: 'midnight-dark', label: 'Midnight Slate (Dark)', style: 'bg-slate-950 text-slate-100' },
  { id: 'deep-navy', label: 'Deep Blue Nebula', style: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100' },
  { id: 'emerald-luxury', label: 'Emerald Institute', style: 'bg-gradient-to-br from-slate-950 via-emerald-950/60 to-slate-900 text-slate-100' },
  { id: 'custom', label: 'Custom Wallpaper', style: '' }
];

interface ThemeContextType {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
  wallpaper: string;
  selectWallpaper: (wpId: string) => void;
  customWallpaperUrl: string;
  setCustomWallpaperUrl: (url: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(true); // default modern dark
  const [wallpaper, setWallpaper] = useState<string>('midnight-dark');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('alkaa_theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
      const savedWp = localStorage.getItem('alkaa_wallpaper');
      if (savedWp) {
        setWallpaper(savedWp);
      }
      const savedCustom = localStorage.getItem('alkaa_custom_wallpaper');
      if (savedCustom) {
        setCustomWallpaperUrl(savedCustom);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('alkaa_theme', isDark ? 'dark' : 'light');
      localStorage.setItem('alkaa_wallpaper', wallpaper);
      if (customWallpaperUrl) {
        localStorage.setItem('alkaa_custom_wallpaper', customWallpaperUrl);
      }
    }
  }, [isDark, wallpaper, customWallpaperUrl, mounted]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      setWallpaper(next ? 'midnight-dark' : 'pure-white');
      return next;
    });
  };

  const selectWallpaper = (wpId: string) => {
    setWallpaper(wpId);
    if (['pure-white', 'academic-light', 'frost-mesh'].includes(wpId)) {
      setIsDark(false);
    } else if (['midnight-dark', 'deep-navy', 'emerald-luxury'].includes(wpId)) {
      setIsDark(true);
    }
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      setIsDark,
      toggleTheme,
      wallpaper,
      selectWallpaper,
      customWallpaperUrl,
      setCustomWallpaperUrl
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

