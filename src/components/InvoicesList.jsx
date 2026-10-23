"use client";

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  Calendar,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function InvoicesList({
  invoices = [],
  onOpenCreate,
  onViewInvoice,
  currency = '₹'
}) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'due' | 'paid'

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const dueInvoices = safeInvoices.filter(inv => {
    const totalFee = Number(inv.net_amount || 0);
    const paidNow = inv.amount_paid !== undefined && inv.amount_paid !== null 
      ? Number(inv.amount_paid) 
      : (inv.payment_mode === 'unpaid' ? 0 : totalFee);
    const dueNow = inv.due_amount !== undefined && inv.due_amount !== null 
      ? Number(inv.due_amount) 
      : Math.max(0, totalFee - paidNow);
    return dueNow > 0 || inv.payment_mode === 'unpaid';
  });

  const paidInvoices = safeInvoices.filter(inv => {
    const totalFee = Number(inv.net_amount || 0);
    const paidNow = inv.amount_paid !== undefined && inv.amount_paid !== null 
      ? Number(inv.amount_paid) 
      : (inv.payment_mode === 'unpaid' ? 0 : totalFee);
    const dueNow = inv.due_amount !== undefined && inv.due_amount !== null 
      ? Number(inv.due_amount) 
      : Math.max(0, totalFee - paidNow);
    return dueNow === 0 && inv.payment_mode !== 'unpaid';
  });

  const baseList = filterMode === 'due' 
    ? dueInvoices 
    : (filterMode === 'paid' ? paidInvoices : safeInvoices);

  const filtered = baseList.filter(inv => {
    const q = (search || '').toLowerCase();
    return (
      (inv.invoice_number || '').toLowerCase().includes(q) ||
      (inv.customer_name || '').toLowerCase().includes(q) ||
      (inv.customer_phone ? String(inv.customer_phone).includes(q) : false)
    );
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Course Admissions &amp; Bills
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Official student course enrollment bills, fee receipts &amp; counselor commissions
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>New Course Admission</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>All Bills</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterMode === 'all' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-300'}`}>
              {safeInvoices.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('due')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'due'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Dues Only</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterMode === 'due' ? 'bg-rose-700 text-rose-100' : 'bg-slate-800 text-slate-300'}`}>
              {dueInvoices.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('paid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'paid'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid in Full</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterMode === 'paid' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-300'}`}>
              {paidInvoices.length}
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
                ? "Search invoices with pending due balance..."
                : (filterMode === 'paid' ? "Search fully paid bills..." : "Search by Invoice #, customer name, or phone...")
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {filterMode === 'due' && `Pending Due Bills (${filtered.length})`}
            {filterMode === 'paid' && `Fully Paid Bills (${filtered.length})`}
            {filterMode === 'all' && `All Bills & Invoices (${filtered.length})`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {search ? 'No matching invoices found.' : 'No invoices generated yet. Click "+ New Sale & Bill" to create your first bill!'}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((inv) => {
              const totalFee = Number(inv.net_amount || 0);
              const paidNow = inv.amount_paid !== undefined && inv.amount_paid !== null 
                ? Number(inv.amount_paid) 
                : (inv.payment_mode === 'unpaid' ? 0 : totalFee);
              const dueNow = inv.due_amount !== undefined && inv.due_amount !== null 
                ? Number(inv.due_amount) 
                : Math.max(0, totalFee - paidNow);
              const isInstallment = dueNow > 0 && paidNow > 0;
              const isUnpaid = paidNow === 0 || inv.payment_mode === 'unpaid';

              return (
                <div
                  key={inv.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => onViewInvoice(inv.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-100">
                          {inv.customer_name}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {inv.invoice_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'Today'} • {inv.payment_mode?.toUpperCase()}
                        {inv.counselor_name && ` • Counselor: ${inv.counselor_name}`}
                        {inv.incentive_amount > 0 && ` (Incentive: ${currency}${inv.incentive_amount})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      {isInstallment ? (
                        <>
                          <div className="text-xs sm:text-sm font-black text-emerald-400 leading-tight">
                            Paid: {currency}{paidNow.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium leading-tight">
                            Total: {currency}{totalFee.toLocaleString()}
                          </div>
                          <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Leftover Due: {currency}{dueNow.toLocaleString()}
                          </span>
                        </>
                      ) : isUnpaid ? (
                        <>
                          <span className="text-xs sm:text-sm font-black text-amber-400 block leading-tight">
                            {currency}{totalFee.toLocaleString()}
                          </span>
                          <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Fully Due (Unpaid)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm font-black text-emerald-400 block leading-tight">
                            {currency}{totalFee.toLocaleString()}
                          </span>
                          <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Paid in Full
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewInvoice(inv.id);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View & Print Bill"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
