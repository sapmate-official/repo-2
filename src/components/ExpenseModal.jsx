"use client";

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, TrendingDown, Tag, Building2, Calendar, CreditCard } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, onExpenseRecorded, accounts = [], currency = '₹' }) {
  if (!isOpen) return null;

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [category, setCategory] = useState('rent');
  const [amount, setAmount] = useState('');
  const [partyName, setPartyName] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [accountId, setAccountId] = useState(safeAccounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'rent', label: 'Office / Campus Rent' },
    { id: 'utilities', label: 'Electricity / Water / Internet' },
    { id: 'office_supplies', label: 'Stationery & Supplies' },
    { id: 'marketing', label: 'Marketing & Advertisements' },
    { id: 'maintenance', label: 'Repairs & Maintenance' },
    { id: 'tea_refreshments', label: 'Pantry / Refreshments' },
    { id: 'travel', label: 'Travel & Conveyance' },
    { id: 'other', label: 'Miscellaneous Expense' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    setLoading(true);
    try {
      await api.recordExpense({
        category,
        amount: numAmount,
        party_name: partyName.trim(),
        description: description.trim() || `${categories.find(c => c.id === category)?.label || 'Expense'} payment`,
        payment_mode: paymentMode,
        account_id: accountId ? Number(accountId) : null,
        date
      });

      onExpenseRecorded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden my-auto safe-bottom">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Record Business Expense</h2>
              <p className="text-xs text-slate-400">Deducts funds &amp; updates monthly P&amp;L</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expense Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Paid To */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Paid To (Vendor / Landlord / Person)
            </label>
            <input
              type="text"
              placeholder="e.g. Landlord Mr. Gupta / Electricity Board"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Payment Mode & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="cash">Cash in Hand</option>
                <option value="upi">UPI / Online</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deduct From Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {safeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({currency}{Number(acc.balance || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Memo
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Wi-Fi high-speed connection bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <TrendingDown className="w-5 h-5" />
                <span>Save Expense Entry</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
