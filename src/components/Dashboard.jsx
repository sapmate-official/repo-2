"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  GraduationCap,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  TransactionDetailsModal,
  TransactionEditModal,
  TransactionDeleteModal
} from './TransactionActionModals';

export default function Dashboard({
  data,
  onOpenQuickAction,
  onSelectAction,
  onViewInvoice,
  onRefreshData,
  accounts: propAccounts = [],
  currency = '₹'
}) {
  void onOpenQuickAction;
  void onViewInvoice;

  const { user, profile } = useAuth();
  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';

  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedTxForDetails, setSelectedTxForDetails] = useState(null);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState(null);
  const [selectedTxForDelete, setSelectedTxForDelete] = useState(null);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const {
    totalBalance = 0,
    accounts: dataAccounts = [],
    monthlyIncome = 0,
    monthlyExpense = 0,
    monthlyNetProfit = 0,
    todayIncome = 0,
    todayExpense = 0,
    recentTransactions = [],
    monthlyTrends = [],
    studentStats = {},
    allTime: _allTime = {},
    periods = {}
  } = data;

  const accounts = propAccounts.length > 0 ? propAccounts : dataAccounts;

  const employeeStaff = data.staff || data.employee || profile || user || {};
  const employeeMetrics = data.metrics || {
    mySalesCount: data.mySalesCount ?? 0,
    mySalesTotal: data.mySalesTotal ?? 0,
    myMonthlySales: data.myMonthlySales ?? 0,
    myMonthlyCount: data.myMonthlyCount ?? 0,
    myTodaySales: data.myTodaySales ?? todayIncome ?? 0,
    myStudentsCount: data.myStudentsCount ?? 0,
    myIncentivesDue: data.myIncentivesDue ?? 0,
    myIncentivesPaid: data.myIncentivesPaid ?? 0,
    myIncentivesTotal: (data.myIncentivesDue ?? 0) + (data.myIncentivesPaid ?? 0)
  };

  // PERIOD OPTIONS CONFIGURATION
  const PERIOD_OPTIONS = [
    { id: 'this_month', label: 'This Month', shortLabel: 'This Mo' },
    { id: 'last_month', label: 'Past Month', shortLabel: 'Last Mo' },
    { id: 'past_3m', label: 'Past 3 Months', shortLabel: 'Past 3M' },
    { id: 'past_6m', label: 'Past 6 Months', shortLabel: 'Past 6M' },
    { id: 'past_1y', label: 'Past 1 Year', shortLabel: 'Past 1Y' },
    { id: 'all_time', label: 'All Time', shortLabel: 'All Time' },
  ];

  // Active Period Metrics
  const activePeriod = periods[selectedPeriod] || {
    label: selectedPeriod === 'this_month' ? 'This Month' : selectedPeriod,
    shortLabel: 'Period',
    rangeLabel: '',
    income: monthlyIncome,
    expense: monthlyExpense,
    netProfit: monthlyNetProfit,
    profitMargin: monthlyIncome > 0 ? ((monthlyNetProfit / monthlyIncome) * 100).toFixed(1) : 0,
    count: 0
  };

  const isPeriodProfitable = activePeriod.netProfit >= 0;

  return (
    <div className="space-y-7 pb-20 md:pb-10">
      
      {/* EMPLOYEE PORTAL PERSONALIZED BANNER */}
      {data.isEmployee && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  Employee Portal &bull; {employeeStaff.name || 'Staff Member'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/25 text-indigo-300 border border-indigo-500/30">
                  {employeeStaff.employee_id || (employeeStaff.id ? `ID #${employeeStaff.id}` : 'Staff')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {employeeStaff.job_title || 'Staff'} &bull; {employeeStaff.department || 'Admissions'} &bull; Rule: {employeeStaff.incentive_rule || 'Standard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">My Admissions</span>
              <span className="text-sm font-bold text-teal-400">
                {employeeMetrics.mySalesCount || 0} Students
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Incentives Due</span>
              <span className="text-sm font-bold text-amber-400">
                {currency} {Number(employeeMetrics.myIncentivesDue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DYNAMIC PERIOD PERFORMANCE SECTION (SWITCH BETWEEN MONTHS & PERIODS) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Section Header & Interactive Period Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {data.isEmployee ? 'My Performance Overview' : `${activePeriod.label} Performance`}
              </h3>
              {activePeriod.rangeLabel && !data.isEmployee && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300">
                  {activePeriod.rangeLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.isEmployee
                ? 'Your personal admissions, customer assignments, and incentive earnings'
                : 'Select time horizon to view periodic sales, deductions, and net margins'}
            </p>
          </div>

          {/* Interactive Period Filter Pill Bar */}
          {!data.isEmployee && (
            <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner overflow-x-auto max-w-full">
              {PERIOD_OPTIONS.map((opt) => {
                const isActive = selectedPeriod === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPeriod(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="hidden sm:inline">{opt.label}</span>
                    <span className="sm:hidden">{opt.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4 PERIOD CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: TOTAL ACCOUNT BALANCE (Admin) OR MY STUDENTS (Employee) */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {data.isEmployee ? 'My Enrolled Students' : 'Total Account Balance'}
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  {data.isEmployee ? <GraduationCap className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {data.isEmployee
                    ? `${employeeMetrics.myStudentsCount || 0}`
                    : `${currency} ${totalBalance.toLocaleString()}`}
                </span>
              </div>
            </div>
            {/* Breakdown */}
            <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
              {data.isEmployee ? (
                <span className="text-[10px] text-slate-400">
                  Direct Student Admissions: <strong className="text-indigo-300">{employeeMetrics.mySalesCount || 0}</strong>
                </span>
              ) : (
                accounts.map(acc => (
                  <span key={acc.id} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
                    {acc.name.split(' ')[0]}: <strong className="text-slate-100">{currency}{acc.balance.toLocaleString()}</strong>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* CARD 2: PERIOD SALES */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {data.isEmployee ? 'This Month Sales' : `${activePeriod.label} Sales`}
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currency} {data.isEmployee ? (employeeMetrics.myMonthlySales || 0).toLocaleString() : activePeriod.income.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>{data.isEmployee ? `${employeeMetrics.myMonthlyCount || 0} Total Entries` : `${activePeriod.count} Total Entries`}</span>
              <span className="font-bold text-teal-400">
                Today: +{currency}{(data.isEmployee ? (employeeMetrics.myTodaySales ?? todayIncome ?? 0) : todayIncome).toLocaleString()}
              </span>
            </div>
          </div>

          {/* CARD 3: PERIOD DEDUCTIONS (Admin) OR INCENTIVES EARNED (Employee) */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {data.isEmployee ? 'Incentives Earned' : `${activePeriod.label} Deductions`}
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                {data.isEmployee ? <Sparkles className="w-4 h-4 text-amber-400" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currency} {data.isEmployee
                  ? (employeeMetrics.myIncentivesTotal || 0).toLocaleString()
                  : activePeriod.expense.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              {data.isEmployee ? (
                <>
                  <span>Paid so far:</span>
                  <span className="font-bold text-emerald-400">
                    {currency}{(employeeMetrics.myIncentivesPaid || 0).toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <span>Operating &amp; Salaries</span>
                  <span className="font-bold text-rose-400">
                    Today: -{currency}{todayExpense.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* CARD 4: PERIOD NET PROFIT (Admin) OR INCENTIVE DUE (Employee) */}
          <div className={`relative overflow-hidden bg-slate-900 border ${data.isEmployee ? 'border-amber-500/30' : isPeriodProfitable ? 'border-emerald-500/30' : 'border-rose-500/30'} rounded-3xl p-5 shadow-xl transition-all`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {data.isEmployee ? 'Incentives Due' : `${activePeriod.label} Profit`}
              </span>
              <div className={`w-9 h-9 rounded-xl ${data.isEmployee ? 'bg-amber-500/15 text-amber-400' : isPeriodProfitable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'} flex items-center justify-center`}>
                {data.isEmployee ? <CheckCircle2 className="w-4 h-4" /> : isPeriodProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${data.isEmployee ? 'text-amber-400' : isPeriodProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.isEmployee
                  ? `${currency} ${(employeeMetrics.myIncentivesDue || 0).toLocaleString()}`
                  : `${isPeriodProfitable ? '+' : ''}${currency} ${activePeriod.netProfit.toLocaleString()}`}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
              {data.isEmployee ? (
                <>
                  <span className="text-slate-400">Payment Status:</span>
                  <span className={`font-bold ${(employeeMetrics.myIncentivesDue || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {(employeeMetrics.myIncentivesDue || 0) > 0 ? 'Pending Payout' : 'All Clear'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-400">Period Margin:</span>
                  <span className={`font-bold ${isPeriodProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activePeriod.profitMargin}%
                  </span>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTIONS LAUNCH BAR (Admin Only) */}
      {/* ========================================================================= */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <button
            onClick={() => onSelectAction('new_sale')}
            className="group flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/30 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Course Admission</div>
              <div className="text-[10px] text-slate-400 truncate">Enroll &amp; bill</div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('student_fee')}
            className="group flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/30 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Student Fee</div>
              <div className="text-[10px] text-slate-400 truncate">Fee receipt</div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('pay_salary')}
            className="group flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/30 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Pay Salary</div>
              <div className="text-[10px] text-slate-400 truncate">Staff payroll</div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction('excel_migration')}
            className="group flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/30 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Excel Import</div>
              <div className="text-[10px] text-slate-400 truncate">Migrate records</div>
            </div>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STUDENT FEE DUES BANNER */}
      {/* ========================================================================= */}
      {studentStats.pendingFees > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Pending Student Fee Dues</span>
              <p className="text-[11px] text-slate-400">
                {studentStats.dueStudentsCount !== undefined ? `${studentStats.dueStudentsCount} students with pending dues` : `${studentStats.totalStudents} enrolled students`} • Total agreed: {currency}{Number(studentStats.totalFeesAgreed || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
              <span className="text-base font-extrabold text-amber-400">
                {currency} {studentStats.pendingFees.toLocaleString()}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => onSelectAction('student_fee')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
              >
                Collect Due
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. 6-MONTH PERFORMANCE & PROFIT TRENDS (Admin Only) */}
      {/* ========================================================================= */}
      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Monthly Performance &amp; Profit Trends
              </h3>
              <p className="text-xs text-slate-400">6-Month historical comparison of Revenue, Expenses, and Net Profits</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {monthlyTrends.map((t, idx) => {
              const isPos = t.profit >= 0;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-300 block">{t.month}</span>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Sales:</span>
                      <span className="text-emerald-400 font-semibold">{currency}{t.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Deduct:</span>
                      <span className="text-rose-400 font-semibold">{currency}{t.expense.toLocaleString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800/80 flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Net:</span>
                      <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPos ? '+' : ''}{currency}{t.profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RECENT FINANCIAL ACTIVITY FEED */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Financial Activity
            </h3>
            <p className="text-xs text-slate-400">Live ledger of admissions, fee receipts, salaries &amp; deductions</p>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No transactions recorded yet. Use the Quick Actions above to record your first entry!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentTransactions.map((tx) => {
              const isInc = tx.type === 'income';
              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTxForDetails(tx)}
                  className="py-3 px-2 sm:px-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isInc ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      {isInc ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                          {tx.party_name || tx.description}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {(tx.category || '').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.date} • {tx.account_name || 'Account'} • {tx.payment_mode ? tx.payment_mode.toUpperCase() : 'CASH'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className={`text-xs sm:text-sm font-extrabold ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isInc ? '+' : '-'}{currency} {Number(tx.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Quick Row Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxForDetails(tx);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTxForEdit(tx);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTxForDelete(tx);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRANSACTION ACTION MODALS */}
      <TransactionDetailsModal
        transaction={selectedTxForDetails}
        isOpen={!!selectedTxForDetails}
        onClose={() => setSelectedTxForDetails(null)}
        onOpenEdit={isAdmin ? (tx) => setSelectedTxForEdit(tx) : null}
        onOpenDelete={isAdmin ? (tx) => setSelectedTxForDelete(tx) : null}
        currency={currency}
      />

      <TransactionEditModal
        transaction={selectedTxForEdit}
        isOpen={!!selectedTxForEdit}
        onClose={() => setSelectedTxForEdit(null)}
        onSuccess={() => onRefreshData?.()}
        accounts={accounts.length > 0 ? accounts : (data.accounts || [])}
        currency={currency}
      />

      <TransactionDeleteModal
        transaction={selectedTxForDelete}
        isOpen={!!selectedTxForDelete}
        onClose={() => setSelectedTxForDelete(null)}
        onSuccess={() => onRefreshData?.()}
        currency={currency}
      />

    </div>
  );
}