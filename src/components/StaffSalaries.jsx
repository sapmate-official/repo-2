"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  Users,
  UserPlus,
  DollarSign,
  Calendar,
  Phone,
  X,
  Gift,
  Award
} from 'lucide-react';

export default function StaffSalaries({
  staff = [],
  salaries = [],
  onOpenPaySalary,
  onStaffAdded,
  accounts = [],
  currency = '₹'
}) {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const safeStaff = Array.isArray(staff) ? staff : [];
  const safeSalaries = Array.isArray(salaries) ? salaries : [];

  const [activeSubTab, setActiveSubTab] = useState('incentives'); // 'incentives' | 'staff' | 'history'
  const [incentivesData, setIncentivesData] = useState({ incentives: [], summary: { total_due: 0, total_paid: 0 } });
  const [loadingIncentives, setLoadingIncentives] = useState(false);

  // Pay Incentive Modal
  const [payingIncentive, setPayingIncentive] = useState(null);
  const [incentivePayMode, setIncentivePayMode] = useState('cash');
  const [incentiveAccountId, setIncentiveAccountId] = useState(safeAccounts[0]?.id || '');
  const [incentivePayDate, setIncentivePayDate] = useState(new Date().toISOString().split('T')[0]);
  const [disbursing, setDisbursing] = useState(false);

  // Add Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Course Counselor');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffSalary, setNewStaffSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchIncentives = async () => {
    setLoadingIncentives(true);
    try {
      const data = await api.getIncentives();
      if (data && Array.isArray(data.incentives)) {
        setIncentivesData(data);
      } else {
        setIncentivesData({ incentives: [], summary: { total_due: 0, total_paid: 0 } });
      }
    } catch (err) {
      console.error(err);
      setIncentivesData({ incentives: [], summary: { total_due: 0, total_paid: 0 } });
    } finally {
      setLoadingIncentives(false);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const handlePayIncentiveSubmit = async (e) => {
    e.preventDefault();
    if (!payingIncentive) return;

    setDisbursing(true);
    try {
      await api.payIncentive(payingIncentive.id, {
        payment_mode: incentivePayMode,
        account_id: incentiveAccountId ? Number(incentiveAccountId) : null,
        paid_date: incentivePayDate
      });
      setPayingIncentive(null);
      fetchIncentives();
      if (onStaffAdded) onStaffAdded();
    } catch (err) {
      alert(err.message || 'Failed to disburse incentive');
    } finally {
      setDisbursing(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    setLoading(true);
    setError('');
    try {
      await api.createStaff({
        name: newStaffName.trim(),
        role: newStaffRole.trim(),
        phone: newStaffPhone.trim(),
        monthly_salary: parseFloat(newStaffSalary) || 0
      });

      setShowAddStaffModal(false);
      setNewStaffName('');
      setNewStaffPhone('');
      setNewStaffSalary('');
      if (onStaffAdded) onStaffAdded();
    } catch (err) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Staff Payroll &amp; Admission Incentives
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Track counselor sales commissions (₹600, ₹800, ₹5,000) &amp; base salaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
            <button
              onClick={() => onOpenPaySalary()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>Pay Salary</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex space-x-2 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('incentives')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'incentives'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Admission Incentives &amp; Commissions</span>
            {incentivesData?.summary?.total_due > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                {currency}{incentivesData.summary.total_due.toLocaleString()} Due
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'staff'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({safeStaff.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Salary Payout History</span>
          </button>
        </div>
      </div>

      {/* 1. INCENTIVES TAB */}
      {activeSubTab === 'incentives' && (
        <div className="space-y-6">
          {/* Incentive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Due Incentives</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
                {currency} {Number(incentivesData?.summary?.total_due || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Payable to counselors upon milestone</span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Incentives Disbursed</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                {currency} {Number(incentivesData?.summary?.total_paid || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Paid out to sales team</span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Commission Entries</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-400 mt-1 block">
                {incentivesData?.incentives?.length || 0} Admitted
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Tier 1 (₹600), Tier 3 (₹800), High (₹5,000)</span>
            </div>
          </div>

          {/* Incentives Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Counselor Incentives Ledger
              </span>
            </div>

            {loadingIncentives ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : incentivesData?.incentives?.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No incentives recorded yet. When you enroll a student from "New Course Admission &amp; Bill", you can select the counselor and commission tier!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {incentivesData.incentives.map((inc) => {
                  const isPaid = inc.status === 'paid';
                  return (
                    <div
                      key={inc.id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          <Gift className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                              {inc.staff_name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                              {inc.incentive_rule}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            Student: <strong className="text-slate-300">{inc.student_name}</strong> • Course: {inc.course_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-black text-amber-400 block">
                            +{currency} {Number(inc.amount).toLocaleString()}
                          </span>
                          <span className="text-[10px]">
                            {isPaid ? (
                              <span className="text-emerald-400 font-semibold">Paid on {inc.paid_date}</span>
                            ) : (
                              <span className="text-rose-400 font-semibold">Pending Due</span>
                            )}
                          </span>
                        </div>

                        {!isPaid && (
                          <button
                            onClick={() => setPayingIncentive(inc)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            Disburse
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. STAFF DIRECTORY TAB */}
      {activeSubTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {staff.length} Active Staff Members &amp; Counselors
            </span>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No staff members added yet. Click "+ Add Staff" to register your employees.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <span className="text-xs text-amber-400 font-medium">{member.role}</span>
                      {member.phone && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{member.phone}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Base</span>
                      <span className="text-sm font-black text-slate-100">
                        {currency}{Number(member.monthly_salary).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Paid {member.payments_count || 0} times
                    </span>
                    <button
                      onClick={() => onOpenPaySalary(member.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Pay Salary</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SALARY PAYOUT HISTORY TAB */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Base Salary Disbursements
            </span>
          </div>

          {safeSalaries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No base salary payouts recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {safeSalaries.map((sal) => (
                <div key={sal.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-100">
                        {sal.staff_name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                        Month: {sal.month_year}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Date: {sal.payment_date} • Mode: {sal.payment_mode.toUpperCase()} • {sal.account_name || 'Account'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-rose-400 block">
                      -{currency} {Number(sal.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay Incentive Modal */}
      {payingIncentive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Disburse Incentive Commission</h3>
                <p className="text-xs text-slate-400">Pay earned incentive to {payingIncentive.staff_name}</p>
              </div>
              <button
                onClick={() => setPayingIncentive(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayIncentiveSubmit} className="mt-4 space-y-3.5">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Counselor / Staff:</span>
                  <span className="font-bold text-white">{payingIncentive.staff_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Admitted:</span>
                  <span className="font-semibold text-slate-200">{payingIncentive.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Incentive Rule:</span>
                  <span className="font-bold text-amber-400">{payingIncentive.incentive_rule}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Payable Amount:</span>
                  <span className="text-base font-extrabold text-emerald-400">{currency}{payingIncentive.amount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={incentivePayMode}
                    onChange={(e) => setIncentivePayMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-slate-100"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="upi">UPI / GPay</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deduct From</label>
                  <select
                    value={incentiveAccountId}
                    onChange={(e) => setIncentiveAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-slate-100"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Disbursement Date</label>
                <input
                  type="date"
                  value={incentivePayDate}
                  onChange={(e) => setIncentivePayDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={disbursing}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {disbursing ? 'Processing...' : `Confirm & Pay ${currency}${payingIncentive.amount} Incentive`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Staff / Counselor</h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Course Counselor"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Base Salary ({currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="e.g. 18000"
                  value={newStaffSalary}
                  onChange={(e) => setNewStaffSalary(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 active:scale-[0.98] transition-all"
              >
                {loading ? 'Saving...' : 'Save Staff Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
