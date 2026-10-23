"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  X,
  Plus,
  Receipt,
  User,
  Phone,
  BookOpen,
  DollarSign,
  Gift,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

export default function InvoiceCreateModal({
  isOpen,
  onClose,
  onCreated,
  accounts = [],
  staff = [],
  currency = '₹'
}) {
  if (!isOpen) return null;

  // Student & Course
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [courseName, setCourseName] = useState('Full Stack Web Development');
  const [courseFee, setCourseFee] = useState(25000);
  const [discount, setDiscount] = useState(0);
  const [paymentType, setPaymentType] = useState('full'); // 'full' | 'installment' | 'unpaid'
  const [amountPaidNow, setAmountPaidNow] = useState('');
  const [paymentMode, setPaymentMode] = useState('upi'); // 'cash', 'upi', 'bank', 'unpaid'
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');

  // Incentive & Commission
  const [enableIncentive, setEnableIncentive] = useState(true);
  const [autoCalculate, setAutoCalculate] = useState(true); // Auto-calculate tier so user never has to remember!
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || '');
  const [incentiveRule, setIncentiveRule] = useState('1st Admission Incentive (₹600)');
  const [incentiveAmount, setIncentiveAmount] = useState(600);
  const [incentiveStatus, setIncentiveStatus] = useState('due'); // 'due' or 'paid_now'
  const [autoDetails, setAutoDetails] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Course preset suggestions
  const popularCourses = [
    { name: 'Full Stack Web Development', defaultFee: 25000 },
    { name: 'Data Science & AI', defaultFee: 35000 },
    { name: 'Digital Marketing & Growth', defaultFee: 18000 },
    { name: 'Python & Machine Learning', defaultFee: 22000 },
    { name: 'Premium Advanced Masterclass', defaultFee: 65000 }
  ];

  // Incentive Presets based on user's exact specification:
  // "for first 600 for 3rd 800 sales above certain amount we pay sales comision also like 5000"
  const incentivePresets = [
    { label: '1st Admission (₹600)', amount: 600, tag: '1st Sale' },
    { label: '2nd Admission (₹700)', amount: 700, tag: '2nd Sale' },
    { label: '3rd Admission (₹800)', amount: 800, tag: '3rd+ Sale' },
    { label: 'High-Value Sale Commission (₹5,000)', amount: 5000, tag: 'High-Value' },
    { label: 'Custom Commission', amount: 0, tag: 'Custom' }
  ];

  // Calculations
  const netAmount = Math.max(0, (parseFloat(courseFee) || 0) - (parseFloat(discount) || 0));

  // Automatic Incentive Calculation Engine
  useEffect(() => {
    if (!enableIncentive || !autoCalculate || !selectedStaffId) return;

    let isMounted = true;
    api.getIncentivePreview(selectedStaffId, netAmount)
      .then((data) => {
        if (!isMounted) return;
        setAutoDetails(data);
        setIncentiveRule(data.autoRule);
        setIncentiveAmount(data.autoIncentive);
      })
      .catch(() => {
        // Fallback calculation on client if preview fails
        const count = 0;
        if (netAmount >= 40000) {
          setIncentiveRule('High-Value Sale Commission (₹5,000)');
          setIncentiveAmount(5000);
        } else {
          setIncentiveRule('1st Admission Incentive (₹600)');
          setIncentiveAmount(600);
        }
      });

    return () => { isMounted = false; };
  }, [selectedStaffId, netAmount, enableIncentive, autoCalculate]);

  const handleSelectPreset = (preset) => {
    setAutoCalculate(false); // User manually clicked a tier override
    setIncentiveRule(preset.label);
    if (preset.amount > 0) {
      setIncentiveAmount(preset.amount);
    }
  };

  const handleCoursePreset = (c) => {
    setCourseName(c.name);
    setCourseFee(c.defaultFee);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentName.trim()) {
      setError('Student name is required');
      return;
    }

    if (!courseName.trim()) {
      setError('Course name is required');
      return;
    }

    const counselor = staff.find(s => String(s.id) === String(selectedStaffId));

    setSubmitting(true);
    try {
      const items = [
        {
          item_name: courseName.trim(),
          quantity: 1,
          unit_price: parseFloat(courseFee) || 0,
          total_price: parseFloat(courseFee) || 0
        }
      ];

      const effectivePaidNow = paymentType === 'unpaid'
        ? 0
        : paymentType === 'installment'
        ? (amountPaidNow === '' ? 0 : parseFloat(amountPaidNow) || 0)
        : netAmount;

      const res = await api.createInvoice({
        customer_name: studentName.trim(),
        customer_phone: studentPhone.trim(),
        course_name: courseName.trim(),
        items,
        discount: parseFloat(discount) || 0,
        amount_paid: effectivePaidNow,
        tax: 0,
        payment_mode: paymentType === 'unpaid' ? 'unpaid' : paymentMode,
        account_id: accountId ? Number(accountId) : null,
        notes: notes.trim(),
        // Incentive details:
        counselor_staff_id: enableIncentive && selectedStaffId ? Number(selectedStaffId) : null,
        counselor_name: enableIncentive && counselor ? counselor.name : '',
        incentive_rule: enableIncentive ? incentiveRule : '',
        incentive_amount: enableIncentive ? parseFloat(incentiveAmount) || 0 : 0,
        incentive_status: enableIncentive && (parseFloat(incentiveAmount) > 0) ? incentiveStatus : 'none'
      });

      const fullInvoice = await api.getInvoice(res.id);
      onCreated(fullInvoice);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record course admission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden my-auto safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">New Course Admission &amp; Bill</h2>
              <p className="text-xs text-slate-400">Enrolls student, generates bill &amp; auto-calculates incentive tier</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Course Enrolled *
              </label>
              <span className="text-[10px] text-slate-400">Quick Select Course:</span>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Development"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />

            {/* Quick course pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {popularCourses.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleCoursePreset(c)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                >
                  {c.name} ({currency}{c.defaultFee.toLocaleString()})
                </button>
              ))}
            </div>
          </div>

          {/* Course Fee & Discount */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course Fee ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={courseFee}
                onChange={(e) => setCourseFee(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scholarship / Discount ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Terms: Full vs Installment Down-Payment */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-200">
                Payment Terms at Admission
              </label>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => { setPaymentType('full'); setAmountPaidNow(''); if (paymentMode === 'unpaid') setPaymentMode('upi'); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    paymentType === 'full' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Payment
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('installment'); setAmountPaidNow(String(Math.round(netAmount / 2))); if (paymentMode === 'unpaid') setPaymentMode('upi'); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    paymentType === 'installment' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pay in Installments
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('unpaid'); setPaymentMode('unpaid'); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    paymentType === 'unpaid' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pay Later (Full Due)
                </button>
              </div>
            </div>

            {paymentType === 'installment' && (
              <div className="space-y-2 pt-1 animate-fadeIn">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-indigo-300">
                      Amount Paid Now (Down Payment / 1st Installment) ({currency}) *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Remaining leftover balance tracked as student due
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={netAmount}
                    step="any"
                    required
                    value={amountPaidNow}
                    onChange={(e) => setAmountPaidNow(e.target.value)}
                    placeholder={`e.g. ${Math.round(netAmount / 2)}`}
                    className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl py-2 px-3 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Calculation Breakdown */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Paying Today (Deposited):</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {currency}{Number(amountPaidNow === '' ? 0 : amountPaidNow).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Leftover Due (Pay Later):</span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      {currency}{Math.max(0, netAmount - (parseFloat(amountPaidNow) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {paymentType === 'full' && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>Entire course fee of <strong>{currency}{netAmount.toLocaleString()}</strong> will be paid and cleared today.</span>
                <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-500/20">No Dues</span>
              </div>
            )}

            {paymentType === 'unpaid' && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-center justify-between">
                <span>Full fee of <strong>{currency}{netAmount.toLocaleString()}</strong> will remain as outstanding student due.</span>
                <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-500/20">Fully Due</span>
              </div>
            )}
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="cash">Cash in Hand</option>
                <option value="bank">Bank Transfer / IMPS</option>
                <option value="unpaid">Due / Pay Later</option>
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
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({currency}{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* COUNSELOR SALES INCENTIVE & COMMISSION MODULE */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950/60 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white tracking-tight">
                  Counselor Sales Commission &amp; Incentive
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-300">
                <input
                  type="checkbox"
                  checked={enableIncentive}
                  onChange={(e) => setEnableIncentive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>Enable</span>
              </label>
            </div>

            {enableIncentive && (
              <div className="space-y-3 pt-2 border-t border-indigo-500/20">
                {/* Select Staff */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Counselor / Sales Executive
                    </label>
                    {/* Auto-Calculate Toggle */}
                    <button
                      type="button"
                      onClick={() => setAutoCalculate(!autoCalculate)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        autoCalculate
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{autoCalculate ? 'Auto-Calculation: ON' : 'Manual Mode'}</span>
                    </button>
                  </div>

                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-500/30 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role}) — {s.monthly_admissions || 0} sales this month
                      </option>
                    ))}
                  </select>
                </div>

                {/* AUTOMATIC TIER CALCULATION BADGE BANNER */}
                {autoCalculate && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-amber-300 block">
                          {autoDetails
                            ? `Auto-Detected: Admission #${autoDetails.nextSaleIndex} this month`
                            : 'Auto-Calculating Tier...'}
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {netAmount >= 40000
                            ? 'High-Value Course (≥ ₹40,000) → ₹5,000 Commission Applied!'
                            : autoDetails?.nextSaleIndex === 1
                              ? '1st Sale: ₹600 Applied (No manual reminder needed)'
                              : autoDetails?.nextSaleIndex === 2
                                ? '2nd Sale: ₹700 Applied'
                                : '3rd+ Sale: ₹800 Applied'}
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-black text-amber-400 px-2 py-1 rounded-lg bg-amber-500/20">
                      {currency}{incentiveAmount}
                    </span>
                  </div>
                )}

                {/* Manual Tiers Selector (If user wants to override) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Incentive Tier / Commission Preset:
                    </label>
                    {!autoCalculate && (
                      <span className="text-[10px] text-amber-400 font-semibold">(Manual Override Active)</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {incentivePresets.map((preset, idx) => {
                      const isSelected = incentiveRule.includes(preset.label) || (preset.amount === incentiveAmount && preset.amount > 0);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-2 rounded-xl text-left border transition-all text-xs active:scale-95 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md'
                              : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className="text-[10px] opacity-75 uppercase font-bold">{preset.tag}</div>
                          <div className="truncate mt-0.5">{preset.amount > 0 ? `${currency}${preset.amount}` : 'Custom'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Exact Incentive Amount & Disbursement Timing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Assigned Incentive ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={incentiveAmount}
                      onChange={(e) => {
                        setAutoCalculate(false);
                        setIncentiveAmount(e.target.value);
                        setIncentiveRule('Custom Commission');
                      }}
                      className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl py-1.5 px-3 text-xs text-amber-400 font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Disbursement Timing
                    </label>
                    <select
                      value={incentiveStatus}
                      onChange={(e) => setIncentiveStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl py-1.5 px-2 text-xs text-slate-100 focus:outline-none"
                    >
                      <option value="due">Add to Pending Due (Pay Later)</option>
                      <option value="paid_now">Pay Immediately Now (-{currency}{incentiveAmount})</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Grand Total Summary */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-950 border border-indigo-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                Total Course Admission Bill
              </span>
              <span className="text-xl font-extrabold text-white">
                {currency} {netAmount.toLocaleString()}
              </span>
            </div>
            {enableIncentive && incentiveAmount > 0 && (
              <div className="text-right text-[11px]">
                <span className="text-amber-400 font-semibold block">
                  Incentive: +{currency}{incentiveAmount} ({incentiveStatus === 'paid_now' ? 'Paid Now' : 'Due Later'})
                </span>
                <span className="text-slate-400 text-[10px]">Auto-tracked to staff account</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                <span>Confirm Admission &amp; Generate Bill</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
