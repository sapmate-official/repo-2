"use client";

import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Phone,
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Receipt
} from 'lucide-react';

export default function StudentsList({
  students = [],
  onOpenAddStudent,
  onOpenPayFee,
  currency = '₹'
}) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('due'); // 'due' | 'paid' | 'all'

  const dueStudents = students.filter(st => Number(st.due_amount || 0) > 0);
  const paidStudents = students.filter(st => Number(st.due_amount || 0) <= 0);

  const baseList = filterMode === 'due'
    ? dueStudents
    : (filterMode === 'paid' ? paidStudents : students);

  const filtered = baseList.filter(st => {
    const q = search.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      (st.course_or_details && st.course_or_details.toLowerCase().includes(q)) ||
      (st.phone && st.phone.includes(q))
    );
  });

  const totalFeesAgreed = students.reduce((acc, curr) => acc + (curr.total_fee || 0), 0);
  const totalFeesCollected = students.reduce((acc, curr) => acc + (curr.paid_amount || 0), 0);
  const totalDuesPending = Math.max(0, totalFeesAgreed - totalFeesCollected);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Student Fees &amp; Ledger
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Track tuition fee installments, pending dues, and issue payment receipts
              </p>
            </div>
          </div>

          <div className="self-stretch sm:self-auto">
            <button
              onClick={() => onOpenPayFee()}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>Collect Fee Installment</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div 
            onClick={() => setFilterMode('all')}
            className={`p-3 rounded-2xl bg-slate-950/50 border cursor-pointer transition-all ${filterMode === 'all' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-800/80 hover:border-slate-700'}`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Agreed Course Fees</span>
            <span className="text-base sm:text-lg font-black text-slate-200">
              {currency} {totalFeesAgreed.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{students.length} Total Enrolled</span>
          </div>
          <div 
            onClick={() => setFilterMode('paid')}
            className={`p-3 rounded-2xl bg-slate-950/50 border cursor-pointer transition-all ${filterMode === 'paid' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-800/80 hover:border-slate-700'}`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collected Fees</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {currency} {totalFeesCollected.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">{paidStudents.length} Students Fully Cleared</span>
          </div>
          <div 
            onClick={() => setFilterMode('due')}
            className={`p-3 rounded-2xl bg-slate-950/50 border cursor-pointer transition-all ${filterMode === 'due' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800/80 hover:border-slate-700'}`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Dues Receivable</span>
            <span className="text-base sm:text-lg font-black text-rose-400">
              {currency} {totalDuesPending.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-400 block mt-0.5">{dueStudents.length} Students with Due</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={() => setFilterMode('due')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'due'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending Dues</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterMode === 'due' ? 'bg-rose-700 text-rose-100' : 'bg-slate-800 text-slate-300'}`}>
              {dueStudents.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('paid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'paid'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fully Paid / Cleared</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterMode === 'paid' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-300'}`}>
              {paidStudents.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>All Students</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterMode === 'all' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-300'}`}>
              {students.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-3.5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={
              filterMode === 'due'
                ? "Search students who have pending dues..."
                : (filterMode === 'paid' ? "Search students whose fees are fully cleared..." : "Search all students...")
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {filterMode === 'due' && `Active Due List (${filtered.length} Students)`}
              {filterMode === 'paid' && `Fully Paid Students (${filtered.length} Students)`}
              {filterMode === 'all' && `All Enrolled Students (${filtered.length} Students)`}
            </span>
            {filterMode === 'due' && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Students who pay off their entire due amount are automatically removed from this list.
              </p>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            {filterMode === 'due' ? (
              <div className="max-w-md mx-auto space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-bold text-white text-sm">No Pending Dues!</p>
                <p className="text-slate-400">
                  {search ? 'No matching students with pending dues.' : 'All enrolled students have fully cleared their fees! No one is currently on the due list.'}
                </p>
              </div>
            ) : (
              <p>{search ? 'No matching students found.' : 'No students found.'}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((st) => {
              const hasDue = Number(st.due_amount || 0) > 0;
              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-2xl bg-slate-950/60 border transition-all space-y-3 ${
                    hasDue ? 'border-rose-500/30 hover:border-rose-500/60' : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{st.name}</h4>
                      <p className="text-xs text-indigo-400 font-medium mt-0.5">
                        {st.course_or_details || 'General Course'}
                      </p>
                      {st.phone && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{st.phone}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        hasDue 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {hasDue ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            <span>Due: {currency}{Number(st.due_amount).toLocaleString()}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>All Paid</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Total Agreed:</span>
                      <span className="font-semibold text-slate-300">{currency}{Number(st.total_fee || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Collected So Far:</span>
                      <span className="font-semibold text-emerald-400">{currency}{Number(st.paid_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end items-center">
                    {hasDue ? (
                      <button
                        onClick={() => onOpenPayFee(st.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-95"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Collect Installment</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Due Cleared (Full Paid)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
