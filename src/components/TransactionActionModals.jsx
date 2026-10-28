"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Wallet,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  { id: 'course_sale', label: 'Course Admission / Sale' },
  { id: 'student_fee', label: 'Student Fee Installment' },
  { id: 'salary', label: 'Staff Salary Payout' },
  { id: 'staff_incentive', label: 'Sales Incentive' },
  { id: 'marketing', label: 'Marketing & Ads' },
  { id: 'office_rent', label: 'Office Rent' },
  { id: 'utilities', label: 'Electricity / Utilities' },
  { id: 'software', label: 'Software & Subscriptions' },
  { id: 'consultancy', label: 'Consultancy / Professional' },
  { id: 'other', label: 'Other Operational Expense' }
];

// ============================================================================
// 1. TRANSACTION DETAILS MODAL
// ============================================================================
export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenDelete,
  currency = '₹'
}) {
  if (!isOpen || !transaction) return null;

  const isInc = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow orb */}
        <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
          isInc ? 'bg-emerald-500/15' : 'bg-rose-500/15'
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isInc ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}>
              {isInc ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Transaction Details
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  #TXN-{transaction.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Ledger verification &amp; breakdown</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Large Amount & Type Card */}
        <div className={`mt-5 p-4 rounded-2xl border ${
          isInc ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
        } flex items-center justify-between`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              {isInc ? 'Total Inflow Amount' : 'Total Outflow Deduction'}
            </span>
            <div className={`text-2xl sm:text-3xl font-black ${
              isInc ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isInc ? '+' : '-'}{currency} {Number(transaction.amount || 0).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
              isInc ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {isInc ? 'Income' : 'Expense'}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {(transaction.category || 'general').replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Structured Field Details */}
        <div className="mt-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Party / Client / Payee
              </span>
              <span className="font-semibold text-white text-sm block truncate">
                {transaction.party_name || 'Not Specified'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Transaction Date
              </span>
              <span className="font-semibold text-white text-sm block">
                {transaction.date || 'Today'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                Account Book
              </span>
              <span className="font-semibold text-white text-sm block truncate">
                {transaction.account_name || 'Primary Bank Account'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                Payment Mode
              </span>
              <span className="font-semibold text-white text-sm block uppercase">
                {transaction.payment_mode || 'Cash'}
              </span>
            </div>
          </div>

          {/* Description & Reference */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Description &amp; Notes
            </span>
            <p className="font-medium text-slate-200 text-xs whitespace-pre-wrap">
              {transaction.description || 'No description provided.'}
            </p>
          </div>

          {/* Reference Info */}
          {(transaction.reference_type || transaction.created_at) && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span>Origin: <strong className="text-slate-300 font-mono">{transaction.reference_type || 'Manual Entry'}</strong></span>
              <span>Logged: <strong className="text-slate-300">{transaction.created_at ? transaction.created_at.split(' ')[0] : '-'}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {onOpenDelete ? (
            <button
              onClick={() => {
                onClose();
                onOpenDelete(transaction);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Delete Record
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(transaction);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                Edit Record
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. TRANSACTION EDIT MODAL
// ============================================================================
export function TransactionEditModal({
  transaction,
  isOpen,
  onClose,
  onSuccess,
  accounts = [],
  currency = '₹'
}) {
  const [formData, setFormData] = useState({
    date: '',
    type: 'income',
    category: 'course_sale',
    party_name: '',
    amount: '',
    account_id: '',
    payment_mode: 'upi',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date || '',
        type: transaction.type || 'income',
        category: transaction.category || 'course_sale',
        party_name: transaction.party_name || '',
        amount: transaction.amount || '',
        account_id: transaction.account_id || (accounts[0]?.id || ''),
        payment_mode: transaction.payment_mode || 'upi',
        description: transaction.description || ''
      });
      setError('');
    }
  }, [transaction, accounts]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please provide a valid non-negative amount.');
      return;
    }

    setLoading(true);
    try {
      await api.updateTransaction(transaction.id, {
        ...formData,
        amount: numAmount,
        account_id: formData.account_id ? parseInt(formData.account_id) : null
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Edit Transaction #TXN-{transaction.id}
              </h3>
              <p className="text-xs text-slate-400">Modify transaction details and adjust accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Type Toggle (Income vs Expense) */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                formData.type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income (Inflow)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                formData.type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense (Deduction)
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white font-bold text-sm outline-none transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              />
            </div>
          </div>

          {/* Party Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Party / Client / Staff Name
              </label>
              <input
                type="text"
                value={formData.party_name}
                onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                placeholder="e.g. Afridi, Soumbtra"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              >
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Target Account Book *
              </label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({currency}{Number(a.balance || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Payment Mode *
              </label>
              <select
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors uppercase"
              >
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Description / Memo
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors resize-none"
              placeholder="Add details, course title, or reference info..."
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 3. TRANSACTION DELETE CONFIRMATION MODAL
// ============================================================================
export function TransactionDeleteModal({
  transaction,
  isOpen,
  onClose,
  onSuccess,
  currency = '₹'
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction) return null;

  const isInc = transaction.type === 'income';

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await api.deleteTransaction(transaction.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Delete Transaction?
            </h3>
            <p className="text-xs text-slate-400">#TXN-{transaction.id} • Permanent removal</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Party / Entry:</span>
            <strong className="text-white">{transaction.party_name || transaction.description || 'Record'}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Amount:</span>
            <strong className={isInc ? 'text-emerald-400 font-mono text-sm' : 'text-rose-400 font-mono text-sm'}>
              {isInc ? '+' : '-'}{currency}{Number(transaction.amount || 0).toLocaleString()}
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Date:</span>
            <span className="text-slate-300">{transaction.date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Account:</span>
            <span className="text-slate-300">{transaction.account_name || 'Primary Account'}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          ⚠️ Deleting this entry will automatically revert the account balance by{' '}
          <strong className="text-slate-200">{currency}{Number(transaction.amount || 0).toLocaleString()}</strong> on{' '}
          <strong className="text-slate-200">{transaction.account_name || 'the account'}</strong> to ensure financial reconciliation remains 100% accurate.
        </p>

        <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}