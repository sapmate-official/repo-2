"use client";

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, GraduationCap } from 'lucide-react';

export default function StudentFeeModal({ 
  isOpen, 
  onClose, 
  onFeeRecorded, 
  students = [], 
  accounts = [], 
  currency = '₹',
  initialStudentId = null
}) {
  const safeStudents = Array.isArray(students) ? students : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const studentsWithDue = safeStudents.filter(s => Number(s?.due_amount || 0) > 0);
  const [showClearedStudents, setShowClearedStudents] = useState(false);

  // If a specific student was clicked from list, make sure they are selectable even if 0 due
  const eligibleStudents = showClearedStudents
    ? safeStudents
    : (studentsWithDue.length > 0 
        ? (initialStudentId && !studentsWithDue.some(s => String(s.id) === String(initialStudentId))
            ? [...studentsWithDue, safeStudents.find(s => String(s.id) === String(initialStudentId))].filter(Boolean)
            : studentsWithDue)
        : safeStudents);

  const defaultId = initialStudentId 
    ? String(initialStudentId) 
    : (eligibleStudents[0]?.id ? String(eligibleStudents[0].id) : '');

  const [selectedStudentId, setSelectedStudentId] = useState(defaultId);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [accountId, setAccountId] = useState(safeAccounts[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStudent = safeStudents.find(s => String(s.id) === String(selectedStudentId)) || eligibleStudents[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid fee amount');
      return;
    }

    if (!selectedStudentId) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    try {
      const res = await api.payStudentFee(selectedStudentId, {
        amount: numAmount,
        payment_mode: paymentMode,
        account_id: accountId ? Number(accountId) : null,
        payment_date: paymentDate,
        notes
      });

      onFeeRecorded({
        receipt: {
          receipt_number: res.receipt_number,
          amount: res.amount,
          payment_mode: paymentMode,
          payment_date: paymentDate,
          notes,
          student_name: currentStudent?.name
        },
        student: currentStudent
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record student fee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden my-auto safe-bottom">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Record Student Fee Payment</h2>
              <p className="text-xs text-slate-400">Collects fee, credits account, issues receipt</p>
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

        {studentsWithDue.length === 0 && !showClearedStudents ? (
          <div className="mt-6 text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">All Student Dues are Cleared!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no students with active pending dues right now.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowClearedStudents(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Show all enrolled students to record advance payment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Select Student */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Student with Pending Due *
                </label>
                <button
                  type="button"
                  onClick={() => setShowClearedStudents(!showClearedStudents)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showClearedStudents ? 'Show only due students' : 'Show all students'}
                </button>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {eligibleStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {st.course_or_details || 'Course'} (Due: {currency}{Number(st.due_amount || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

          {/* Student Status Summary Card */}
          {currentStudent && (
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Agreed Total Course Fee:</span>
                <span className="font-bold text-slate-200">{currency}{currentStudent.total_fee || 0}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Paid So Far:</span>
                <span className="font-bold text-emerald-400">{currency}{currentStudent.paid_amount || 0}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Due:</span>
                <span className="font-bold text-rose-400">{currency}{currentStudent.due_amount || 0}</span>
              </div>
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount Being Paid ({currency}) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Payment Mode & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="cash">Cash in Hand</option>
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="bank">Bank Transfer / NEFT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deposit Into Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              Payment Remarks / Installment Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 2nd Installment / Term 1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <GraduationCap className="w-5 h-5" />
                <span>Save Payment &amp; Issue Receipt</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  </div>
);
}
