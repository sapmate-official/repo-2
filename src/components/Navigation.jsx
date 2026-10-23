"use client";

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  ReceiptText,
  GraduationCap,
  Users,
  ArrowLeftRight,
  FileSpreadsheet,
  FolderArchive,
  Settings,
  Plus,
  LogOut,
  Building2,
  Wallet,
  Palette,
  Sun,
  Moon
} from 'lucide-react';

export default function Navigation({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  onOpenWallpaperModal,
  totalBalance,
  currency = '₹'
}) {
  const { profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Admissions & Bills', icon: ReceiptText },
    { id: 'students', label: 'Student Fees', icon: GraduationCap },
    { id: 'salaries', label: 'Salaries & Incentives', icon: Users },
    { id: 'ledger', label: 'Ledger & P&L', icon: ArrowLeftRight },
    { id: 'sftp', label: 'SFTP (Flykites)', icon: FolderArchive },
    { id: 'migration', label: 'Excel Migration', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* TOP HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors safe-top ${
        isDark ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Org Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile?.business_name || 'Alkaa Business +'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 rounded-full">
                  PRO+
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {profile?.tagline || 'Course Admissions & Smart Accounting'}
              </p>
            </div>
          </div>

          {/* Right Controls: Balance, Wallpaper/Theme, Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Funds Badge */}
            {typeof totalBalance === 'number' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-inner ${
                isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200'
              }`}>
                <Wallet className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col text-right">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total Funds
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-500 leading-tight">
                    {currency} {totalBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Theme & Wallpaper Switcher Button */}
            <button
              onClick={onOpenWallpaperModal}
              title="Change Theme & Wallpaper"
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Theme</span>
            </button>

            {/* Desktop Add Action */}
            <button
              onClick={onOpenQuickAction}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Action</span>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Logout"
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DESKTOP TABS */}
        <div className={`hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t ${
          isDark ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <nav className="flex space-x-1 py-2 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (IPHONE 16 PRO MAX TAILORED) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t safe-bottom transition-colors ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex items-center justify-around px-2 py-1.5 relative">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'dashboard' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Tab 2: Admissions & Bills */}
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'invoices' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Admission</span>
          </button>

          {/* CENTER ELEVATED QUICK ACTION BUTTON (+) */}
          <div className="relative -top-4 flex items-center justify-center">
            <button
              onClick={onOpenQuickAction}
              className={`w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 active:scale-90 transition-transform ${
                isDark ? 'border-slate-900' : 'border-white'
              }`}
              aria-label="Add transaction"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Students */}
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'students' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Students</span>
          </button>

          {/* Tab 4: Ledger / More */}
          <button
            onClick={() => setActiveTab('salaries')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'salaries' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Incentives</span>
          </button>
        </div>
      </div>
    </>
  );
}
