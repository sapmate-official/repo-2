"use client";

import React, { useState } from 'react';
import { useTheme, WALLPAPERS } from '../context/ThemeContext';
import { Palette, X, Check, Image, Sun, Moon, Sparkles } from 'lucide-react';

export default function WallpaperModal({ isOpen, onClose }) {
  const { isDark, toggleTheme, wallpaper, selectWallpaper, customWallpaperUrl, setCustomWallpaperUrl } = useTheme();
  const [customInput, setCustomInput] = useState(customWallpaperUrl || '');

  if (!isOpen) return null;

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      setCustomWallpaperUrl(customInput.trim());
      selectWallpaper('custom');
      onClose();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setCustomWallpaperUrl(dataUrl);
        selectWallpaper('custom');
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Theme &amp; Wallpaper</h3>
              <p className="text-xs text-slate-400">Choose white theme, dark mode or set custom wallpaper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-500/20 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Light / Dark Mode Toggle */}
        <div className="mt-4 flex items-center justify-between p-3.5 rounded-2xl bg-slate-500/10 border border-slate-500/20">
          <div className="flex items-center gap-2.5">
            {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <span className="text-xs font-bold block">{isDark ? 'Dark Mode Active' : 'White / Light Mode Active'}</span>
              <span className="text-[10px] text-slate-400">Quick toggle between White and Dark aesthetics</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Switch to {isDark ? 'White' : 'Dark'}
          </button>
        </div>

        {/* Wallpaper Presets */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Preset Themes &amp; Wallpapers
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {WALLPAPERS.filter(w => w.id !== 'none' && w.id !== 'custom').map((wp) => {
              const isSelected = wallpaper === wp.id;
              const isLightOpt = ['pure-white', 'academic-light', 'frost-mesh'].includes(wp.id);
              return (
                <button
                  key={wp.id}
                  onClick={() => {
                    selectWallpaper(wp.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-20 active:scale-95 ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg' : 'border-slate-500/20 hover:border-slate-500/40'
                  } ${isLightOpt ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-white'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold truncate">{wp.label}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">
                    {isLightOpt ? 'White Theme' : 'Dark Theme'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Set Custom Wallpaper */}
        <div className="mt-5 pt-4 border-t border-slate-500/20">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Upload or Set Custom Wallpaper
          </label>

          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 cursor-pointer transition-colors text-xs font-medium text-indigo-400">
              <Image className="w-4 h-4" />
              <span>Choose Image from your Phone or PC</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <form onSubmit={handleApplyCustom} className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste wallpaper image URL..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className={`flex-1 rounded-xl py-2 px-3 text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
