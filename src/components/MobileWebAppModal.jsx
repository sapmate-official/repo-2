"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  X,
  Wifi,
  Globe,
  Zap,
} from 'lucide-react';

export default function MobileWebAppModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [connectInfo, setConnectInfo] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.role || 'admin');
  const [selectedStaffUser, setSelectedStaffUser] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'install'

  useEffect(() => {
    if (isOpen) {
      loadConnectInfo();
      fetchEmployees();
    }
  }, [isOpen]);

  const loadConnectInfo = async () => {
    setLoading(true);
    try {
      const data = await api.getMobileConnectInfo();
      setConnectInfo(data);
    } catch (err) {
      console.error('Failed to load mobile connect info:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.getEmployees();
      const list = Array.isArray(res) ? res : (res?.employees || []);
      setEmployeesList(list);
    } catch (_e) {
      // ignore
    }
  };

  const handleRoleChange = async (newRole, staffId = null) => {
    setTargetRole(newRole);
    setTokenLoading(true);
    try {
      const payload = { targetRole: newRole };
      if (staffId) payload.staffId = staffId;
      const res = await api.getMobileToken(payload);
      if (res && res.quickLoginUrl) {
        setConnectInfo((prev) => ({
          ...prev,
          quickLoginUrl: res.quickLoginUrl,
          quickLoginQr: res.qrCode,
          role: res.user?.role || newRole,
          username: res.user?.username
        }));
      }
    } catch (err) {
      console.error('Failed to generate role token:', err);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyLink = () => {
    const urlToCopy = connectInfo?.quickLoginUrl || connectInfo?.mobileBaseUrl || window.location.origin;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const currentUrl = connectInfo?.quickLoginUrl || connectInfo?.mobileBaseUrl || `http://localhost:5555`;
  const qrToDisplay = connectInfo?.quickLoginQr || connectInfo?.appQr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden relative transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Phone Web App & Quick Login</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  <span>1-Click</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan or click on your phone to open Hisab and log in instantly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className={`flex border-b px-6 pt-3 gap-4 text-xs font-semibold ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & 1-Click Login</span>
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'install'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Install on Home Screen (PWA)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-xs font-medium">Detecting local network and preparing mobile QR...</span>
            </div>
          ) : activeTab === 'qr' ? (
            <>
              {/* Phone Role Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Mobile Login Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      targetRole === 'admin'
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-bold'
                        : isDark ? 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Admin Portal</span>
                      {targetRole === 'admin' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] block font-normal text-slate-400">
                      Full business, accounting & director access
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('employee')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      targetRole === 'employee'
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-bold'
                        : isDark ? 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Employee Access</span>
                      {targetRole === 'employee' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] block font-normal text-slate-400">
                      Sales records, earnings & personal incentive view
                    </span>
                  </button>
                </div>

                {targetRole === 'employee' && employeesList.length > 0 && (
                  <div className="mt-2.5">
                    <select
                      value={selectedStaffUser}
                      onChange={(e) => {
                        setSelectedStaffUser(e.target.value);
                        handleRoleChange('employee', e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Choose specific employee staff member...</option>
                      {employeesList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employee_id || `EMP-${emp.id}`} - {emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* QR Code Card */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* QR Display */}
                <div className="relative p-2.5 bg-white rounded-2xl shadow-lg border border-slate-200 flex-shrink-0">
                  {tokenLoading ? (
                    <div className="w-40 h-40 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  ) : qrToDisplay ? (
                    <img
                      src={qrToDisplay}
                      alt="Hisab Mobile Login QR Code"
                      className="w-40 h-40 rounded-xl"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400 text-center p-2">
                      QR not available
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500 text-white shadow-sm whitespace-nowrap flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    <span>Scan with Phone Camera</span>
                  </div>
                </div>

                {/* Instructions & Network Details */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5 text-slate-900 dark:text-slate-100">
                      <span>Point Phone Camera at Screen</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Open your iPhone or Android camera, point it at this QR code, and tap the yellow/blue banner that appears. You will be logged into Hisab immediately!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 justify-center sm:justify-start">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Wi-Fi: {connectInfo?.localIp || 'Local Network'}</span>
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                      <span>Role: {connectInfo?.role || targetRole}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Clickable Mobile URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Direct Phone Link (Click or Copy)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2.5 px-3 font-mono text-xs text-emerald-400 focus:outline-none truncate"
                    />
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <span>Click & Open</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: Send this link via WhatsApp, Telegram, or email to your phone to click and log in with 1 tap.
                </p>
              </div>
            </>
          ) : (
            /* PWA INSTALLATION GUIDE */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm text-indigo-200 mb-0.5">
                    Install as Full-Screen Native App (PWA)
                  </span>
                  <span>
                    When added to your phone's Home Screen, Hisab runs in full-screen standalone mode without the browser URL bar, just like an app installed from the App Store or Google Play!
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* iOS Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                    <Smartphone className="w-5 h-5 text-indigo-400" />
                    <span>Apple iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside text-xs space-y-2 text-slate-400">
                    <li>Open link in <strong className="text-slate-200">Safari</strong> browser.</li>
                    <li>Tap the <strong className="text-slate-200">Share</strong> icon (square with arrow up) at bottom bar.</li>
                    <li>Scroll down and tap <strong className="text-slate-200">"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong className="text-emerald-400">"Add"</strong> at top-right. Done!</li>
                  </ol>
                </div>

                {/* Android Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span>Android (Google Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside text-xs space-y-2 text-slate-400">
                    <li>Open link in <strong className="text-slate-200">Google Chrome</strong>.</li>
                    <li>Tap the <strong className="text-slate-200">Three Dots</strong> (⋮) at top right.</li>
                    <li>Select <strong className="text-slate-200">"Install app"</strong> or <strong className="text-slate-200">"Add to Home screen"</strong>.</li>
                    <li>Confirm install. Hisab will appear on your phone app drawer!</li>
                  </ol>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveTab('qr')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md inline-flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show QR Code to Scan Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-100 bg-slate-50/80 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted 30-Day Instant Session Token</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
