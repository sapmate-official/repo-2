"use client";

import React, { useState } from 'react';
import { api } from '../lib/api';
import {
  AlertTriangle,
  Trash2,
  Lock,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function EraseDataModal({ isOpen, onClose, onEraseSuccess }) {
  const REQUIRED_PHRASE = 'ERASE ALL DATA';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isPhraseMatched = phrase.trim() === REQUIRED_PHRASE;
  const canSubmit = isPhraseMatched && password.length > 0 && !loading;

  const handleErase = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPhraseMatched) {
      setError(`Confirmation phrase must be "${REQUIRED_PHRASE}" exactly.`);
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      await api.eraseData({
        password,
        phrase: phrase.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        if (onEraseSuccess) onEraseSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to erase data. Check your password.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-600/60 rounded-3xl shadow-2xl shadow-rose-950/50 p-5 sm:p-7 relative overflow-hidden my-auto safe-bottom">
        {/* Glow Header */}
        <div className="flex items-start justify-between pb-4 border-b border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Danger Zone • System Reset
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                Erase All Business Data
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>CRITICAL WARNING: THIS ACTION IS IRREVERSIBLE</span>
          </div>
          <p className="text-[11px] leading-relaxed text-rose-300/80">
            Executing this will permanently delete all financial records and reset your business accounting back to zero.
          </p>
        </div>

        {/* What is erased breakdown */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-2">
          <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
            What will happen:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 text-rose-400">
              <span>✕</span> All student course admissions &amp; bills
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span>✕</span> All fee receipts &amp; student dues
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span>✕</span> All transactions &amp; expense records
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span>✕</span> All staff incentive &amp; salary payouts
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span>↻</span> All account balances reset to ₹0.00
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span> Admin login &amp; business profile preserved
            </div>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success ? (
          <div className="mt-6 p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Business Data Erased!</h3>
            <p className="text-xs text-emerald-200">
              System records have been completely reset to zero. Refreshing...
            </p>
          </div>
        ) : (
          <form onSubmit={handleErase} className="mt-5 space-y-4">
            {/* Step 1: Admin Password */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>1. Enter Admin Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account login password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Step 2: Confirmation Phrase */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-200">
                  2. Type Confirmation Phrase *
                </label>
                <span className="text-[10px] text-slate-400">
                  Must type exactly: <strong className="text-rose-400 font-mono tracking-wider">{REQUIRED_PHRASE}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={`Type "${REQUIRED_PHRASE}" to confirm`}
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl py-2.5 px-3 text-xs font-mono tracking-wider text-white placeholder:text-slate-600 focus:outline-none transition-all ${
                    isPhraseMatched
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : phrase.length > 0
                        ? 'border-rose-500'
                        : 'border-slate-700 focus:border-rose-500'
                  }`}
                />
                {isPhraseMatched && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {phrase.length > 0 && !isPhraseMatched && (
                <p className="text-[10px] text-rose-400 mt-1 font-medium">
                  Phrase does not match. Type "{REQUIRED_PHRASE}" in all caps.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full sm:w-2/3 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canSubmit
                    ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-600 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Erase All Data</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
