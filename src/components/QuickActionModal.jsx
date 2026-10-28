"use client";

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Receipt,
  GraduationCap,
  Users,
  TrendingDown,
  FileSpreadsheet,
  WalletCards,
  Smartphone
} from 'lucide-react';

export default function QuickActionModal({ isOpen, onClose, onSelectAction }) {
  const { user, profile } = useAuth();
  if (!isOpen) return null;
  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';

  const actions = [
    {
      id: 'new_sale',
      title: 'New Course Admission & Bill',
      desc: 'Enroll student, record admission fee, calculate counselor incentive (₹600, ₹800, ₹5k)',
      icon: Receipt,
      color: 'from-indigo-600 to-violet-600',
      badge: 'Admission'
    },
    {
      id: 'student_fee',
      title: 'Collect Student Fee Installment',
      desc: 'Record tuition fee payment and issue official fee receipt',
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Fee'
    },
    ...(isAdmin ? [
      {
        id: 'pay_salary',
        title: 'Pay Staff Salary or Incentive',
        desc: 'Disburse monthly salary or commission to counselors',
        icon: Users,
        color: 'from-amber-500 to-orange-600',
        badge: 'Payroll'
      },
      {
        id: 'add_expense',
        title: 'Record Expense',
        desc: 'Rent, electricity bills, supplies, marketing, or general spend',
        icon: TrendingDown,
        color: 'from-rose-500 to-pink-600',
        badge: 'Expense'
      },
      {
        id: 'excel_migration',
        title: 'Import Previous Excel',
        desc: 'Migrate past transactions or ledger records from .xlsx / .csv',
        icon: FileSpreadsheet,
        color: 'from-purple-500 to-indigo-600',
        badge: 'Migration'
      }
    ] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Mobile Bottom Sheet / Desktop Centered Card */}
      <div className="w-full sm:max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Quick Financial Action</h3>
            <p className="text-xs text-slate-400">Select what you would like to record</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="mt-4 space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onClose();
                  onSelectAction(act.id);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-left transition-all active:scale-[0.98] group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${act.color} flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
