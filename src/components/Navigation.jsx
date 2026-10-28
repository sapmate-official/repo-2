"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  ReceiptText,
  GraduationCap,
  Users,
  ArrowLeftRight,
  FileSpreadsheet,
  Settings,
  Plus,
  LogOut,
  Building2,
  Wallet,
  Palette,
  Smartphone,
  Shield,
  ChevronDown,
  Mail,
  Briefcase
} from 'lucide-react';

export default function Navigation({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  onOpenWallpaperModal,
  onOpenMobileModal,
  totalBalance,
  currency = '₹'
}) {
  const { user, profile, logout } = useAuth();
  const { isDark } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';
  const employeeData = profile?.employee || user?.employee;

  // Determine user display name
  let displayName = 'Kabir Khan';
  const email = (isAdmin && (!profile?.email || profile.email === 'contact@alkaabusiness.com'))
    ? 'Kabir.khan@shapenxt.com'
    : (profile?.email || user?.email || '');

  if (isAdmin) {
    if ((email && email.toLowerCase().includes('kabir')) || user?.username?.toLowerCase() === 'kabir' || user?.username?.toLowerCase() === 'admin' || !user?.username) {
      displayName = 'Kabir Khan';
    } else {
      displayName = user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
  } else {
    displayName = employeeData?.name || user?.username || 'Employee';
  }

  // Determine avatar image
  const avatarImg = profile?.avatar || employeeData?.avatar || user?.avatar || '';

  // Calculate 1-2 letter clean initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (name[0] || 'U').toUpperCase();
  };

  const initials = getInitials(displayName);

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'employees', label: 'Employees Directory', icon: Users },
        { id: 'invoices', label: 'Admissions & Bills', icon: ReceiptText },
        { id: 'students', label: 'Student Fees', icon: GraduationCap },
        { id: 'salaries', label: 'Salaries & Incentives', icon: Wallet },
        { id: 'ledger', label: 'Ledger & P&L', icon: ArrowLeftRight },
        { id: 'migration', label: 'Excel Migration', icon: FileSpreadsheet },
        { id: 'settings', label: 'Settings & API', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'invoices', label: 'My Admissions', icon: ReceiptText },
        { id: 'students', label: 'My Students', icon: GraduationCap },
        { id: 'salaries', label: 'My Incentives', icon: Wallet },
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
            {/* Live Funds Badge (Admin only) */}
            {isAdmin && typeof totalBalance === 'number' && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-inner ${
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

            {/* Phone Web App & 1-Click Login Button */}
            <button
              onClick={onOpenMobileModal}
              title="Open on Mobile / Phone 1-Click Login"
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all ${
                isDark
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Phone App</span>
            </button>

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

            {/* Desktop Add Action (Admin only) */}
            {isAdmin && (
              <button
                onClick={onOpenQuickAction}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Record Action</span>
              </button>
            )}

            {/* ROUND PROFILE AVATAR & IDENTITY BADGE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                title={`Logged in as ${displayName} (${isAdmin ? 'Admin' : 'Staff'})`}
                className={`flex items-center gap-2 p-0.5 sm:px-2 sm:py-1 rounded-full border transition-all duration-200 outline-none ${
                  isProfileOpen
                    ? isDark
                      ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                      : 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-300/40 shadow-md'
                    : isDark
                      ? 'bg-slate-800/80 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                      : 'bg-slate-100/90 border-slate-200 hover:bg-slate-200/80'
                }`}
                aria-expanded={isProfileOpen}
              >
                {/* Round Profile Avatar Circle */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-sm ring-2 overflow-hidden transition-transform ${
                      isAdmin
                        ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 ring-indigo-400/40'
                        : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 ring-emerald-400/40'
                    }`}
                  >
                    {avatarImg ? (
                      <img src={avatarImg} alt={displayName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="tracking-tight">{initials}</span>
                    )}
                  </div>
                  {/* Round Green Status Dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                </div>

                {/* Profile Identity Details (visible on sm: screens and up) */}
                <div className="hidden sm:flex flex-col text-left pr-1 max-w-[120px]">
                  <span className={`text-xs font-bold truncate leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {displayName}
                  </span>
                  <div className="flex items-center gap-1 leading-tight">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isAdmin
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isAdmin ? 'Admin' : (employeeData?.job_title ? employeeData.job_title.slice(0, 10) : 'Staff')}
                    </span>
                  </div>
                </div>

                {/* Subtle Chevron indicator */}
                <ChevronDown
                  className={`hidden sm:inline w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
                    isProfileOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileOpen && (
                <div
                  className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark
                      ? 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-black/50'
                      : 'bg-white/98 border-slate-200 text-slate-800 shadow-slate-400/30'
                  }`}
                >
                  {/* Card Header with decorative gradient */}
                  <div
                    className={`p-4 border-b relative ${
                      isDark
                        ? 'bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-transparent border-slate-800'
                        : 'bg-gradient-to-r from-indigo-50/70 via-slate-50 to-transparent border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Big Round Avatar in Popover */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white shadow-md ring-2 overflow-hidden ${
                            isAdmin
                              ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 ring-indigo-400/50'
                              : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 ring-emerald-400/50'
                          }`}
                        >
                          {avatarImg ? (
                            <img src={avatarImg} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{displayName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              <Shield className="w-3 h-3" />
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <Briefcase className="w-3 h-3" />
                              {employeeData?.job_title || 'Staff Member'}
                            </span>
                          )}
                        </div>
                        {email && (
                          <p className={`text-[11px] truncate mt-1 flex items-center gap-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <Mail className="w-3 h-3 opacity-70" />
                            {email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Summary info */}
                  <div className={`px-4 py-2.5 text-xs border-b ${
                    isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[11px] text-slate-400">Current Login</span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Session
                      </span>
                    </div>
                    {employeeData?.employee_id && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[11px] text-slate-400">Employee ID</span>
                        <span className="text-[11px] font-bold">{employeeData.employee_id}</span>
                      </div>
                    )}
                    {employeeData?.department && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[11px] text-slate-400">Department</span>
                        <span className="text-[11px] font-bold">{employeeData.department}</span>
                      </div>
                    )}
                    {isAdmin && profile?.business_name && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[11px] text-slate-400">Organization</span>
                        <span className="text-[11px] font-bold truncate max-w-[150px]">{profile.business_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Navigation & Action Links */}
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isDark
                          ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenWallpaperModal?.();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isDark
                          ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Palette className="w-4 h-4 text-violet-400" />
                      <span>Theme & Wallpaper</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenMobileModal?.();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isDark
                          ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Phone Web App QR</span>
                    </button>
                  </div>

                  {/* Sign Out Footer */}
                  <div className={`p-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from {displayName}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t safe-bottom transition-colors ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex items-center justify-around px-2 py-1.5 relative">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
              activeTab === 'dashboard' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Tab 2: Employees Directory (Admin) or Admissions (Employee) */}
          {isAdmin ? (
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
                activeTab === 'employees' ? 'text-rose-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Directory</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
                activeTab === 'invoices' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <ReceiptText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Admissions</span>
            </button>
          )}

          {/* CENTER ELEVATED QUICK ACTION BUTTON (+) (Admin only) */}
          {isAdmin && (
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
          )}

          {/* Tab 3: Students / Fees */}
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
              activeTab === 'students' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{isAdmin ? 'Fees' : 'Students'}</span>
          </button>

          {/* Tab 4: Salaries / Incentives */}
          <button
            onClick={() => setActiveTab('salaries')}
            className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
              activeTab === 'salaries' ? 'text-indigo-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{isAdmin ? 'Payroll' : 'Incentives'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
