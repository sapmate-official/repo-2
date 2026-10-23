"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import {
  FolderArchive,
  FileSpreadsheet,
  FileText,
  Server,
  Play,
  RefreshCw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Terminal,
  FileCheck2,
  HardDrive
} from 'lucide-react';

export default function AlkaaFilesSFTP() {
  const { isDark } = useTheme();
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [generatingSample, setGeneratingSample] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, filesRes] = await Promise.all([
        api.getSftpStatus().catch(() => null),
        api.getSftpFiles().catch(() => [])
      ]);
      if (statusRes) setStatus(statusRes);
      if (filesRes) setFiles(filesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunAdapterTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.testSftpAdapter();
      setTestResult(res);
      await fetchData(); // Refresh file list after test uploads
    } catch (err) {
      setTestResult({
        connected: false,
        error: err.message,
        details: [err.message]
      });
    } finally {
      setTesting(false);
    }
  };

  const handleGenerateSamples = async () => {
    try {
      setGeneratingSample(true);
      await api.uploadSampleSftpFiles();
      await fetchData();
    } catch (err) {
      alert('Error generating sample files: ' + err.message);
    } finally {
      setGeneratingSample(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className={`p-6 rounded-2xl border transition-colors shadow-sm ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
              <FolderArchive className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Alkaa Files
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  SFTP Server Active
                </span>
              </div>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Secure SFTP Storage for CSV and Excel files. Connect any SFTP Adapter, ERP, or automated integration pipeline.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunAdapterTest}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Play className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Running SFTP Test...' : 'Test SFTP Adapter'}
            </button>

            <button
              onClick={handleGenerateSamples}
              disabled={generatingSample}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center gap-2 ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              {generatingSample ? 'Generating...' : 'Add Sample Data'}
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Refresh files"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ADAPTER CONNECTION DETAILS & DIAGNOSTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SFTP Connection Parameters */}
        <div className={`p-6 rounded-2xl border transition-colors col-span-1 lg:col-span-2 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 mb-4">
            <Server className="w-5 h-5 text-indigo-500" />
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SFTP Adapter Connection Details
            </h2>
          </div>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Enter these parameters into your external SFTP Adapter (Camel, SAP CPI, MuleSoft, WinSCP, Python, Airbyte, or n8n).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Host */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Host / Server</span>
                <span className={`text-sm font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>127.0.0.1 / Local Wi-Fi IP</span>
              </div>
              <button
                onClick={() => handleCopy('127.0.0.1', 'host')}
                className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                title="Copy Host"
              >
                {copiedKey === 'host' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Port */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Port</span>
                <span className={`text-sm font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {status?.port || 2222}
                </span>
              </div>
              <button
                onClick={() => handleCopy(String(status?.port || 2222), 'port')}
                className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                title="Copy Port"
              >
                {copiedKey === 'port' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Username */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">SFTP Username</span>
                <span className={`text-sm font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {status?.defaultUser || 'alkaa_admin'}
                </span>
              </div>
              <button
                onClick={() => handleCopy(status?.defaultUser || 'alkaa_admin', 'user')}
                className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                title="Copy Username"
              >
                {copiedKey === 'user' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Password */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Default Password</span>
                <span className={`text-sm font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>AlkaaFiles2026!</span>
              </div>
              <button
                onClick={() => handleCopy('AlkaaFiles2026!', 'pass')}
                className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                title="Copy Password"
              >
                {copiedKey === 'pass' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick SFTP URL */}
          <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
            isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <span className="truncate mr-2">sftp://alkaa_admin:AlkaaFiles2026!@127.0.0.1:2222/</span>
            <button
              onClick={() => handleCopy('sftp://alkaa_admin:AlkaaFiles2026!@127.0.0.1:2222/', 'url')}
              className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors shrink-0"
              title="Copy SFTP URL"
            >
              {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Storage Stats Card */}
        <div className={`p-6 rounded-2xl border transition-colors flex flex-col justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <HardDrive className="w-5 h-5 text-emerald-500" />
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Storage Directory
              </h2>
            </div>
            
            <div className={`p-3 rounded-xl border mb-4 font-mono text-xs break-all ${
              isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              {status?.storageDirectory || 'D:\\Workspace\\flykites\\data\\storage\\flykites_user'}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Files:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {files.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>CSV Datasets:</span>
                <span className="font-bold text-cyan-500">
                  {files.filter(f => f.file_type === 'csv').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Excel Workbooks:</span>
                <span className="font-bold text-emerald-500">
                  {files.filter(f => f.file_type === 'xlsx' || f.file_type === 'xls').length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sandboxed & Isolated to Alkaa Files</span>
          </div>
        </div>
      </div>

      {/* ADAPTER TEST MODAL / RESULTS ACCORDION */}
      {testResult && (
        <div className={`p-5 rounded-2xl border transition-all ${
          testResult.connected && testResult.csvUpload && testResult.excelUpload
            ? isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
            : isDark ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {testResult.connected && testResult.csvUpload && testResult.excelUpload ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
              <h3 className={`text-sm font-bold ${
                testResult.connected && testResult.csvUpload && testResult.excelUpload
                  ? 'text-emerald-500'
                  : 'text-rose-500'
              }`}>
                {testResult.connected && testResult.csvUpload && testResult.excelUpload
                  ? 'SFTP Adapter Test Passed: Everything Working Perfectly!'
                  : 'SFTP Adapter Test Encountered An Issue'}
              </h3>
            </div>
            <button
              onClick={() => setTestResult(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
            <div className={`p-2.5 rounded-xl border ${testResult.connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
              <span className="block font-semibold">1. SSH Connection</span>
              <span>{testResult.connected ? '✓ Connected' : '✗ Failed'}</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${testResult.csvUpload ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
              <span className="block font-semibold">2. CSV Upload</span>
              <span>{testResult.csvUpload ? '✓ Stored' : '✗ Failed'}</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${testResult.excelUpload ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
              <span className="block font-semibold">3. Excel Upload</span>
              <span>{testResult.excelUpload ? '✓ Stored' : '✗ Failed'}</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${testResult.listing ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
              <span className="block font-semibold">4. SFTP Listing</span>
              <span>{testResult.listing ? '✓ Verified' : '✗ Failed'}</span>
            </div>
          </div>

          {testResult.details && testResult.details.length > 0 && (
            <div className={`p-3 rounded-xl font-mono text-xs overflow-x-auto ${
              isDark ? 'bg-slate-950/90 text-slate-300' : 'bg-slate-900 text-slate-200'
            }`}>
              {testResult.details.map((line, i) => (
                <div key={i} className="py-0.5">❯ {line}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALKAA FILES LIST / TABLE */}
      <div className={`rounded-2xl border overflow-hidden transition-colors shadow-sm ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-500" />
            <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Stored Files in "Alkaa Files"
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              {files.length}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Auto-inspected for CSV and Excel formats
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading Alkaa Files...
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <FolderArchive className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              No files in Alkaa Files yet
            </h3>
            <p className={`text-xs max-w-md mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Upload CSV or Excel files via your SFTP Adapter to port 2222, or click below to generate sample test datasets.
            </p>
            <button
              onClick={handleGenerateSamples}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Add Sample CSV & Excel Data
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                  isDark ? 'border-slate-800 text-slate-400 bg-slate-900/60' : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Rows</th>
                  <th className="py-3 px-4">Sheets / Details</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded Via</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {files.map((file) => {
                  const isCsv = file.file_type === 'csv';
                  const isExcel = file.file_type === 'xlsx' || file.file_type === 'xls';

                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-slate-500/5 transition-colors ${
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        {isCsv ? (
                          <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                        ) : isExcel ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <FolderArchive className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-mono">{file.filename}</span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCsv
                            ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                            : isExcel
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {file.file_type}
                        </span>
                      </td>

                      {/* Row Count */}
                      <td className="py-3 px-4 font-mono">
                        {file.row_count > 0 ? (
                          <span className="font-semibold text-emerald-500">{file.row_count} rows</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Sheets */}
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {file.sheet_names || '-'}
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatBytes(file.file_size)}
                      </td>

                      {/* Uploaded By */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {file.uploaded_by || 'sftp'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {file.created_at ? new Date(file.created_at).toLocaleString() : '-'}
                      </td>

                      {/* Download */}
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/api/sftp/download/${encodeURIComponent(file.filename)}`}
                          download={file.filename}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
