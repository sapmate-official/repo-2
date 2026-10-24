"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, Users } from 'lucide-react';

export default function SalaryPayModal({ isOpen, onClose, onSalaryPaid, staff = [], accounts = [], currency = '₹', initialStaffId = null }) {
  const safeStaff = Array.isArray(staff) ? staff : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [selectedStaffId, setSelectedStaffId] = useState(initialStaffId || safeStaff[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [paymentMode, setPaymentMode] = useState('bank');
  const [accountId, setAccountId] = useState(safeAccounts[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill salary from staff profile
  useEffect(() => {
    if (selectedStaffId && Array.isArray(staff)) {
      const member = staff.find(s => String(s.id) === String(selectedStaffId));
      if (member) {
        setAmount(member.monthly_salary || '');
      }
    }
  }, [selectedStaffId, staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }

    if (!selectedStaffId) {
      setError('Please select a staff member');
      return;
    }

    setLoading(true);
    try {
      await api.paySalary(selectedStaffId, {
        amount: numAmount,
        month_year: monthYear,
        payment_mode: paymentMode,
        account_id: accountId ? Number(accountId) : null,
        payment_date: paymentDate,
        notes
      });

      onSalaryPaid();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to disburse salary');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden my-auto safe-bottom">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Disburse Staff Salary</h2>
              <p className="text-xs text-slate-400">Records salary payout &amp; deducts account balance</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Staff Member *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {safeStaff.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role}) — Base: {currency}{st.monthly_salary}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Month
              </label>
              <input
                type="month"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Disbursement Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Net Amount to Pay ({currency}) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              placeholder="e.g. 20000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash in Hand</option>
                <option value="upi">UPI / Online</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deduct From Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              Payment Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Includes ₹1,000 performance incentive"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>Record Salary Payout</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
