"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import * as XLSX from 'xlsx';
import {
  ArrowLeftRight,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  TransactionDetailsModal,
  TransactionEditModal,
  TransactionDeleteModal
} from './TransactionActionModals';

export default function TransactionsLedger({ currency = '₹', accounts = [], onRefreshData }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedTxForDetails, setSelectedTxForDetails] = useState(null);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState(null);
  const [selectedTxForDelete, setSelectedTxForDelete] = useState(null);

  // Filters
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions({
        type,
        category,
        search,
        from_date: fromDate,
        to_date: toDate,
        limit: 500
      });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [type, category, search, fromDate, toDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculations for current filtered view
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const totalInflow = safeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = safeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netCashFlow = totalInflow - totalOutflow;

  const handleExportExcel = () => {
    if (!safeTransactions.length) return;

    const exportData = safeTransactions.map((t, idx) => ({
      'S.No': idx + 1,
      'Date': t.date,
      'Type': (t.type || '').toUpperCase(),
      'Category': t.category,
      'Party / Client': t.party_name || '-',
      'Description': t.description,
      'Payment Mode': (t.payment_mode || 'cash').toUpperCase(),
      'Account': t.account_name || 'Primary',
      'Inflow Amount': t.type === 'income' ? Number(t.amount || 0) : 0,
      'Outflow Amount': t.type === 'expense' ? Number(t.amount || 0) : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');
    XLSX.writeFile(workbook, `Alkaa_Business_Plus_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Organization Transactions &amp; P&amp;L Ledger
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Complete financial history of all money received and spent
              </p>
            </div>
          </div>

          <button
            onClick={handleExportExcel}
            disabled={!transactions.length}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-md disabled:opacity-40 transition-all self-stretch sm:self-auto justify-center"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Flow (Income + Expense)</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expense Only (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="sale">Sales / Invoices</option>
              <option value="student_fee">Student Fees</option>
              <option value="salary">Staff Salaries</option>
              <option value="rent">Rent</option>
              <option value="utilities">Electricity &amp; Bills</option>
              <option value="excel_migration">Excel Imports</option>
              <option value="other">Other / Misc</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
            <button
              onClick={() => {
                setType('');
                setCategory('');
                setFromDate('');
                setToDate('');
                setSearch('');
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Financial Flow Summary Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Total Inflows</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              +{currency} {totalInflow.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Total Outflows</span>
            <span className="text-base sm:text-lg font-black text-rose-400">
              -{currency} {totalOutflow.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Net Cash Profit</span>
            <span className={`text-base sm:text-lg font-black ${netCashFlow >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
              {netCashFlow >= 0 ? '+' : ''}{currency} {netCashFlow.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {transactions.length} Ledger Records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {transactions.map((tx) => {
              const isInc = tx.type === 'income';
              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTxForDetails(tx)}
                  className="py-3.5 px-2 sm:px-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isInc ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      {isInc ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                          {tx.party_name || tx.description}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {(tx.category || '').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.date} • {tx.account_name || 'Account'} • {tx.payment_mode ? tx.payment_mode.toUpperCase() : 'CASH'}
                        {tx.description && tx.party_name && ` • ${tx.description}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className={`text-xs sm:text-sm font-black ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isInc ? '+' : '-'}{currency} {Number(tx.amount).toLocaleString()}
                      </span>
                    </div>

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
        onOpenEdit={(tx) => setSelectedTxForEdit(tx)}
        onOpenDelete={(tx) => setSelectedTxForDelete(tx)}
        currency={currency}
      />

      <TransactionEditModal
        transaction={selectedTxForEdit}
        isOpen={!!selectedTxForEdit}
        onClose={() => setSelectedTxForEdit(null)}
        onSuccess={() => {
          fetchTransactions();
          onRefreshData?.();
        }}
        accounts={accounts}
        currency={currency}
      />

      <TransactionDeleteModal
        transaction={selectedTxForDelete}
        isOpen={!!selectedTxForDelete}
        onClose={() => setSelectedTxForDelete(null)}
        onSuccess={() => {
          fetchTransactions();
          onRefreshData?.();
        }}
        currency={currency}
      />
    </div>
  );
}
