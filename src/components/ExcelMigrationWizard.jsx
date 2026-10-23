"use client";

import React, { useState } from 'react';
import { api } from '../lib/api';
import {
  FileSpreadsheet,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Table,
  Layers
} from 'lucide-react';

export default function ExcelMigrationWizard({ accounts = [], onMigrationComplete, currency = '₹' }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  // Column Mappings
  const [sheetName, setSheetName] = useState('');
  const [dateCol, setDateCol] = useState('');
  const [amountCol, setAmountCol] = useState('');
  const [typeCol, setTypeCol] = useState('');
  const [partyCol, setPartyCol] = useState('');
  const [categoryCol, setCategoryCol] = useState('');
  const [paymentModeCol, setPaymentModeCol] = useState('');
  const [descCol, setDescCol] = useState('');

  const [defaultType, setDefaultType] = useState('income'); // 'income' | 'expense'
  const [accountId, setAccountId] = useState(accounts[0]?.id || 1);

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setPreviewData(null);
    setResult(null);
    setParsing(true);

    try {
      const formData = new FormData();
      formData.append('excel_file', selectedFile);

      const data = await api.previewExcel(formData);
      setPreviewData(data);
      setSheetName(data.activeSheet || data.sheetNames[0] || '');

      // Intelligent Auto-Mapping Heuristic
      const headers = data.headers || [];
      headers.forEach(h => {
        const lower = String(h).toLowerCase();
        if (!dateCol && (lower.includes('date') || lower.includes('time') || lower.includes('dt'))) {
          setDateCol(h);
        } else if (!amountCol && (lower.includes('amount') || lower.includes('total') || lower.includes('paid') || lower.includes('rs') || lower.includes('fee') || lower.includes('value'))) {
          setAmountCol(h);
        } else if (!partyCol && (lower.includes('name') || lower.includes('student') || lower.includes('customer') || lower.includes('client') || lower.includes('party'))) {
          setPartyCol(h);
        } else if (!typeCol && (lower.includes('type') || lower.includes('cr/dr') || lower.includes('flow') || lower.includes('transaction type'))) {
          setTypeCol(h);
        } else if (!categoryCol && (lower.includes('category') || lower.includes('head') || lower.includes('class') || lower.includes('course'))) {
          setCategoryCol(h);
        } else if (!paymentModeCol && (lower.includes('mode') || lower.includes('method') || lower.includes('payment') || lower.includes('bank/cash'))) {
          setPaymentModeCol(h);
        } else if (!descCol && (lower.includes('desc') || lower.includes('remark') || lower.includes('particular') || lower.includes('detail') || lower.includes('note'))) {
          setDescCol(h);
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to read Excel file. Ensure valid .xlsx or .csv');
    } finally {
      setParsing(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;
    if (!amountCol) {
      setError('Please map the Amount column before importing');
      return;
    }

    setImporting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('excel_file', file);
      formData.append('sheetName', sheetName);
      formData.append('accountId', accountId);

      const mapping = {
        dateCol,
        amountCol,
        typeCol,
        partyCol,
        categoryCol,
        paymentModeCol,
        descCol,
        defaultType
      };
      formData.append('mapping', JSON.stringify(mapping));

      const res = await api.commitMigration(formData);
      setResult(res);
      if (onMigrationComplete) onMigrationComplete();
    } catch (err) {
      setError(err.message || 'Migration failed during batch import');
    } finally {
      setImporting(false);
    }
  };

  const resetWizard = () => {
    setFile(null);
    setPreviewData(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Excel Data Migration Wizard
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Import past financial records, student fees, and sales from your previous software
              </p>
            </div>
          </div>
          {file && (
            <button
              onClick={resetWizard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Import Another File</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {result && (
        <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Data Migration Completed Successfully!</h3>
              <p className="text-xs text-emerald-300">
                {result.importedCount} transaction records imported into Alkaa Business +
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Imported Inflow</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {currency} {result.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Imported Outflow</span>
              <span className="text-lg font-extrabold text-rose-400">
                {currency} {result.totalExpense.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Balance Impact</span>
              <span className={`text-lg font-extrabold ${result.netImpact >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
                {currency} {result.netImpact.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: UPLOAD FILE */}
      {!previewData && !result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/70">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <span className="text-base sm:text-lg font-bold text-white">
              {parsing ? 'Scanning Excel Columns...' : 'Click to Upload Excel (.xlsx / .csv)'}
            </span>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Supports spreadsheets exported from Tally, Busy, Vyapar, Excel, Google Sheets, or any custom accounts book
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              disabled={parsing}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* STEP 2 & 3: COLUMN MAPPING & PREVIEW */}
      {previewData && !result && (
        <div className="space-y-6">
          {/* Mapping Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Map Excel Columns to Alkaa Business +
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Column */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date Column
                </label>
                <select
                  value={dateCol}
                  onChange={(e) => setDateCol(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Auto Use Today's Date --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Amount Column (Required) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount Column * <span className="text-indigo-400 font-normal">(Required)</span>
                </label>
                <select
                  value={amountCol}
                  onChange={(e) => setAmountCol(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="">-- Select Column with Amount --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Type Column / Default Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Type (Income vs Expense)
                </label>
                <select
                  value={typeCol}
                  onChange={(e) => setTypeCol(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- No Column: Use Default Below --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* If no type column, fallback selector */}
              {!typeCol && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Type for all rows
                  </label>
                  <select
                    value={defaultType}
                    onChange={(e) => setDefaultType(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="income">Income (Student Fees / Sales)</option>
                    <option value="expense">Expense (Salaries / Spending)</option>
                  </select>
                </div>
              )}

              {/* Party / Student / Customer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student / Customer / Party Name
                </label>
                <select
                  value={partyCol}
                  onChange={(e) => setPartyCol(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- (Optional) --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category (Course/Service/Rent/Salary)
                </label>
                <select
                  value={categoryCol}
                  onChange={(e) => setCategoryCol(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- (Optional) --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Deposit Into Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Credit / Debit Account
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({currency}{acc.balance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sample Rows Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Sample Data Preview ({previewData.totalRows} Total Rows Detected)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto max-h-64 scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                    {previewData.headers.map((h, i) => (
                      <th key={i} className="py-2 px-3 font-semibold whitespace-nowrap">
                        {h}
                        {h === amountCol && <span className="ml-1 text-emerald-400 font-bold">(AMOUNT)</span>}
                        {h === partyCol && <span className="ml-1 text-indigo-400 font-bold">(PARTY)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {previewData.sampleRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 text-slate-300">
                      {previewData.headers.map((_, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 whitespace-nowrap font-mono text-[11px]">
                          {row[cIdx] !== undefined ? String(row[cIdx]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCommit}
              disabled={importing || !amountCol}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Importing Records into Alkaa Business +...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  <span>Execute Migration &amp; Import {previewData.totalRows} Records</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
