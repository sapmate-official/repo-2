"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Users,
  Search,
  Eye,
  EyeOff,
  KeyRound,
  Edit2,
  Trash2,
  MapPin,
  Briefcase,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Award,
  BookOpen,
  ArrowRight,
  X,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  TrendingUp
} from 'lucide-react';

export default function EmployeeDirectory({ currency = '₹', onRefreshGlobal }) {
  const { user, profile } = useAuth();
  const { isDark } = useTheme();

  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';

  // Data states
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals & Drawers
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [targetEmployeeForReset, setTargetEmployeeForReset] = useState(null);

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Load Employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getEmployees();
      const list = Array.isArray(data) ? data : (data?.employees || []);
      setEmployees(list);
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError(err.message || 'Failed to load employee directory');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Safe list reference
  const safeEmployees = useMemo(() => (Array.isArray(employees) ? employees : []), [employees]);

  // Compute departments list
  const departments = useMemo(() => {
    const set = new Set();
    safeEmployees.forEach((emp) => {
      if (emp.department && emp.department.trim()) {
        set.add(emp.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [safeEmployees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return safeEmployees.filter((emp) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (emp.name || '').toLowerCase().includes(q);
        const matchesEmail = (emp.email || '').toLowerCase().includes(q);
        const matchesEmpId = (emp.employee_id || '').toLowerCase().includes(q);
        const matchesTitle = (emp.job_title || '').toLowerCase().includes(q);
        const matchesDept = (emp.department || '').toLowerCase().includes(q);
        const matchesPhone = (emp.phone || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesEmpId && !matchesTitle && !matchesDept && !matchesPhone) {
          return false;
        }
      }

      // Department filter
      if (selectedDepartment !== 'ALL') {
        if ((emp.department || '').toLowerCase() !== selectedDepartment.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [safeEmployees, searchQuery, selectedDepartment]);

  // Open Full Profile View
  const handleOpenProfile = async (emp) => {
    setShowProfileDrawer(true);
    setLoadingProfile(true);
    try {
      const detailed = await api.getEmployee(emp.id);
      setSelectedEmployeeProfile(detailed);
    } catch (err) {
      alert('Failed to load full profile: ' + err.message);
      setSelectedEmployeeProfile(emp);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setShowUpsertModal(true);
  };

  // Open Reset Password Modal
  const handleOpenResetPassword = (emp) => {
    setTargetEmployeeForReset(emp);
    setShowResetModal(true);
  };

  // Handle Delete
  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Are you sure you want to remove ${emp.name} (${emp.employee_id || 'ID #' + emp.id})? This will also remove their user account.`)) {
      return;
    }
    try {
      await api.deleteEmployee(emp.id);
      await fetchEmployees();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(safeEmployees, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `employees_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const headers = [
      'Name',
      'Employee_ID',
      'Email',
      'Phone',
      'Department',
      'Job_Title',
      'Location',
      'Employment_Type',
      'Base_Salary',
      'Incentive_Rule',
      'System_Access',
      'Username'
    ];
    const sampleRows = [
      [
        'Vikram Seth',
        'EMP-001',
        'vikram.seth@alkaa.com',
        '+91 9876543210',
        'Admissions',
        'Senior Admissions Counselor',
        'New Delhi, India',
        'Full-time',
        '45000',
        '5% per admission',
        'employee',
        'vikram.seth'
      ],
      [
        'Pooja Sharma',
        'OC-XML-99',
        'poojasharma73773@gmail.com',
        '+91 9811223344',
        'Engineering',
        'Software Engineer',
        'Bangalore, India',
        'Full-time',
        'Present',
        'React Cohort 4',
        'DSA Masterclass',
        '65000',
        'Fixed 1000',
        'employee',
        'pooja.sharma'
      ]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', 'sample_employees.csv');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // CSV Upload handler
  const handleUploadCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          alert('CSV file is empty or missing data rows');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const rowVals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (!rowVals[0]) continue;

          const rowData = {};
          headers.forEach((h, idx) => {
            rowData[h] = rowVals[idx] || '';
          });

          await api.upsertEmployee({
            name: rowData.name || rowVals[0],
            employee_id: rowData.employee_id || rowData.emp_id || undefined,
            email: rowData.email || '',
            phone: rowData.phone || '',
            department: rowData.department || 'Admissions',
            job_title: rowData.job_title || rowData.title || 'Staff Member',
            location: rowData.location || 'New Delhi',
            employment_type: rowData.employment_type || 'Full-time',
            cohorts: rowData.cohorts || '',
            courses: rowData.courses || '',
            base_salary: parseFloat(rowData.base_salary || rowData.salary || 0),
            incentive_rule: rowData.incentive_rule || '',
            system_access: rowData.system_access || 'none',
            username: rowData.username || undefined
          });
          importedCount++;
        }

        alert(`Successfully imported/updated ${importedCount} employees!`);
        fetchEmployees();
        if (onRefreshGlobal) onRefreshGlobal();
      } catch (err) {
        alert('CSV Import error: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
        <p className="text-xs text-slate-400">
          The Employee Directory is confidential and reserved for Administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Banner / Header matching UI Screenshot */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Employees Directory
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30 rounded-full">
                  {safeEmployees.length}
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Roster, job assignments, personal records, and role-based permissions
              </p>
            </div>
          </div>

          {/* Action buttons matching screenshot */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
            </div>

            {/* Export JSON / Directory Controls */}

            {/* Sample CSV */}
            <button
              onClick={handleDownloadSampleCSV}
              title="Download Sample CSV Template"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sample CSV</span>
            </button>

            {/* Import CSV */}
            <label
              title="Import Employees via CSV"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Import CSV</span>
              <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
            </label>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Export Full Roster to JSON"
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar matching Screenshot */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Dropdown */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchEmployees} className="underline font-semibold ml-3">
            Retry
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 mt-3 font-medium">Loading employee directory...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <Users className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-3" />
          <h3 className="text-base font-semibold">No Employees Found</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            {searchQuery || selectedDepartment !== 'ALL'
              ? 'No employees match the current filters. Try clearing your search query.'
              : 'No employee records currently found in directory.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE LIST VIEW (EXACT MATCH WITH SCREENSHOT) */
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-semibold uppercase tracking-wider text-[10px] ${
                  isDark ? 'bg-slate-800/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Job & Dept</th>
                  <th className="py-3 px-4">Location & Type</th>
                  <th className="py-3 px-4">Monthly Salary</th>
                  <th className="py-3 px-4">Incentive Rule</th>
                  <th className="py-3 px-4">Last Modified</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => {
                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors hover:${
                        isDark ? 'bg-slate-800/40' : 'bg-slate-50/80'
                      }`}
                    >
                      {/* Employee ID Badge */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {emp.employee_id || `EMP-${emp.id}`}
                        </span>
                      </td>

                      {/* Employee Avatar + Name + Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm flex-shrink-0">
                            {emp.avatar ? (
                              <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (emp.name || 'E').slice(0, 2)
                            )}
                          </div>
                          <div>
                            <div className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              <span className="font-bold">{emp.name}</span>
                              {emp.system_access === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                  ADMIN
                                </span>
                              )}
                              {emp.system_access === 'employee' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  EMP ACCESS
                                </span>
                              )}
                            </div>
                            <div className={`text-[11px] font-medium ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {emp.email || 'No email registered'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Job & Dept */}
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${
                          isDark ? 'text-slate-200' : 'text-slate-900'
                        }`}>
                          {emp.job_title || emp.role || 'Staff Member'}
                        </div>
                        <div className={`text-[11px] font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {emp.department || 'Admissions'}
                        </div>
                      </td>

                      {/* Location & Type */}
                      <td className="py-3.5 px-4">
                        <div className={`font-semibold ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {emp.location || 'New Delhi, India'}
                        </div>
                        <div className={`text-[11px] font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {emp.employment_type || 'Full-time'}
                        </div>
                      </td>

                      {/* Monthly Salary Field */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-xs sm:text-sm text-emerald-400">
                          {currency} {Number(emp.monthly_salary || emp.base_salary || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">per month</span>
                      </td>

                      {/* Incentive Rule */}
                      <td className="py-3.5 px-4">
                        {emp.incentive_rule ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {emp.incentive_rule}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>

                      {/* Last Modified */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {emp.last_modified
                          ? new Date(emp.last_modified).toLocaleDateString('en-US', {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              second: 'numeric'
                            })
                          : 'Recently'}
                      </td>

                      {/* Action buttons (Crimson View Profile button matching screenshot) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenProfile(emp)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenResetPassword(emp)}
                                title="Reset Password"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDark
                                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                                    : 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200'
                                }`}
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(emp)}
                                title="Edit Employee"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDark
                                    ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700'
                                    : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
                                }`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteEmployee(emp)}
                                title="Delete Employee"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDark
                                    ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-slate-700'
                                    : 'bg-slate-100 border-slate-200 text-rose-600 hover:bg-slate-200'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            return (
              <div
                key={emp.id}
                className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm flex-shrink-0">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          (emp.name || 'E').slice(0, 2)
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm flex items-center gap-1.5 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          <span>{emp.name}</span>
                          {emp.system_access === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              ADMIN
                            </span>
                          )}
                        </h3>
                        <p className={`text-[11px] truncate max-w-[160px] font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {emp.email || 'No email registered'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {emp.employee_id || `EMP-${emp.id}`}
                    </span>
                  </div>

                  {/* Role & Dept badge */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {emp.job_title || emp.role || 'Staff'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {emp.department || 'Admissions'}
                    </span>
                  </div>

                  {/* Metrics summary */}
                  <div className={`mt-4 grid grid-cols-3 gap-2 p-3 rounded-xl border text-center ${
                    isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Monthly Salary</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {currency} {Number(emp.monthly_salary || emp.base_salary || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Admissions</span>
                      <span className="text-xs font-bold text-indigo-400">
                        {emp.students_count || emp.sales_count || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Incentives Due</span>
                      <span className="text-xs font-bold text-amber-400">
                        {currency} {Number(emp.incentives_due || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{emp.location || 'New Delhi'}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenProfile(emp)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenResetPassword(emp)}
                        title="Reset Password"
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. UPSERT EMPLOYEE MODAL */}
      {showUpsertModal && (
        <UpsertEmployeeModal
          isOpen={showUpsertModal}
          initialData={editingEmployee}
          currency={currency}
          onClose={() => {
            setShowUpsertModal(false);
            setEditingEmployee(null);
          }}
          onSuccess={() => {
            setShowUpsertModal(false);
            setEditingEmployee(null);
            fetchEmployees();
            if (onRefreshGlobal) onRefreshGlobal();
          }}
        />
      )}

      {/* 2. RESET PASSWORD MODAL (STRICT SECURITY - NEVER SHOW PLAINTEXT) */}
      {showResetModal && targetEmployeeForReset && (
        <ResetPasswordModal
          isOpen={showResetModal}
          employee={targetEmployeeForReset}
          onClose={() => {
            setShowResetModal(false);
            setTargetEmployeeForReset(null);
          }}
          onSuccess={() => {
            setShowResetModal(false);
            setTargetEmployeeForReset(null);
            fetchEmployees();
          }}
        />
      )}

      {/* 3. VIEW PROFILE DRAWER / MODAL */}
      {showProfileDrawer && selectedEmployeeProfile && (
        <EmployeeProfileDrawer
          isOpen={showProfileDrawer}
          employee={selectedEmployeeProfile}
          loading={loadingProfile}
          currency={currency}
          isAdmin={isAdmin}
          onClose={() => {
            setShowProfileDrawer(false);
            setSelectedEmployeeProfile(null);
          }}
          onEdit={() => {
            setShowProfileDrawer(false);
            setEditingEmployee(selectedEmployeeProfile);
            setShowUpsertModal(true);
          }}
          onResetPassword={() => {
            setShowProfileDrawer(false);
            setTargetEmployeeForReset(selectedEmployeeProfile);
            setShowResetModal(true);
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// COMPONENT: UPSERT EMPLOYEE MODAL
// ==========================================
function UpsertEmployeeModal({ _isOpen, initialData, currency = '₹', onClose, onSuccess }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'job' | 'access'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: initialData?.id || undefined,
    name: initialData?.name || '',
    employee_id: initialData?.employee_id || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dob: initialData?.dob || '',
    joining_date: initialData?.joining_date || new Date().toISOString().slice(0, 10),
    address: initialData?.address || '',
    emergency_contact: initialData?.emergency_contact || '',
    avatar: initialData?.avatar || '',
    department: initialData?.department || 'Admissions',
    job_title: initialData?.job_title || initialData?.role || 'Senior Admissions Counselor',
    location: initialData?.location || 'New Delhi, India',
    employment_type: initialData?.employment_type || 'Full-time',
    cohorts: initialData?.cohorts || '',
    courses: initialData?.courses || '',
    base_salary: initialData?.base_salary || 40000,
    incentive_rule: initialData?.incentive_rule || '5% per admission',
    system_access: initialData?.system_access || (initialData?.user_id ? 'employee' : 'none'),
    username: initialData?.username || '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Employee name is required');
      setActiveTab('personal');
      return;
    }

    if (formData.system_access !== 'none') {
      if (!formData.username.trim()) {
        setError('Username is required for system login access');
        setActiveTab('access');
        return;
      }
      if (!initialData?.id && !formData.password) {
        setError('Password is required when granting new system access');
        setActiveTab('access');
        return;
      }
      if (formData.password && formData.password.length < 4) {
        setError('Password must be at least 4 characters');
        setActiveTab('access');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await api.upsertEmployee(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialData ? `Edit Employee: ${initialData.name}` : 'Upsert New Employee'}
              </h2>
              <p className="text-xs text-slate-400">
                Personal details, department assignments, and login credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Personal Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'job'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Job & Department</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'access'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>3. System Access (RBAC)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Seth"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Employee ID (Optional, auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OC-TEST-XML or EMP-1001"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. vikram.seth@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, Landmark, City, State, PIN"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Emergency Contact (Name & Phone)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Seth (+91 9988776655)"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB & DEPARTMENT */}
          {activeTab === 'job' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Admissions">Admissions</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Academics">Academics</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Admissions Counselor"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, India"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Monthly Base Salary ({currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 45000"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Incentive Formula / Rule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5% per admission or Fixed 1000"
                    value={formData.incentive_rule}
                    onChange={(e) => setFormData({ ...formData, incentive_rule: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM ACCESS & RBAC (STRICT ZERO PASSWORD LEAKAGE) */}
          {activeTab === 'access' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <span className="font-semibold block">Two-Tier RBAC & Password Security</span>
                  <span>
                    Grant Admin or Employee portal access. Employees can only inspect their personal sales, customer records, and incentive earnings. Passwords are securely hashed with bcrypt (10 rounds).
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  System Access Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'No Access', desc: 'Staff only (cannot log in)' },
                    { id: 'employee', label: 'Employee Portal', desc: 'Can view own sales, customers & incentives' },
                    { id: 'admin', label: 'Administrator', desc: 'Full system management & financials' }
                  ].map((roleOpt) => {
                    const isSelected = formData.system_access === roleOpt.id;
                    return (
                      <div
                        key={roleOpt.id}
                        onClick={() => setFormData({ ...formData, system_access: roleOpt.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-500/15 border-rose-500 text-white'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{roleOpt.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />}
                        </div>
                        <p className="text-[10px] leading-tight opacity-80">{roleOpt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {formData.system_access !== 'none' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Login Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. vikram.seth"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {initialData?.id ? 'New Password (leave blank to keep current password)' : 'Login Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={initialData?.id ? '••••••••' : 'Min 4 characters'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Strict Security Notice: Password will be encrypted with bcrypt and will never be shown in plain-text.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'access' ? 'job' : 'personal')}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 hover:bg-slate-800"
                >
                  Back
                </button>
              )}

              {activeTab !== 'access' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'personal' ? 'job' : 'access')}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
                >
                  Next Step &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 flex items-center gap-1.5"
                >
                  {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{initialData ? 'Update Employee' : 'Create Employee'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: RESET PASSWORD MODAL
// ==========================================
function ResetPasswordModal({ _isOpen, employee, onClose, onSuccess }) {
  const { isDark } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.resetEmployeePassword(employee.id, newPassword);
      setSuccessMsg(`Password successfully updated for ${employee.name}!`);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Reset Password</h3>
              <p className="text-xs text-slate-400">
                Target: {employee.name} ({employee.employee_id || `ID #${employee.id}`})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Passwords are never stored or displayed in plain-text. They are hashed using bcrypt.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: EMPLOYEE PROFILE DRAWER / MODAL
// ==========================================
function EmployeeProfileDrawer({
  _isOpen,
  employee,
  loading,
  currency = '₹',
  isAdmin,
  onClose,
  onEdit,
  onResetPassword
}) {
  const { isDark } = useTheme();
  const [profileTab, setProfileTab] = useState('overview'); // 'overview' | 'sales' | 'customers' | 'incentives' | 'salaries'

  const invoices = employee.invoices || [];
  const students = employee.students || [];
  const incentives = employee.incentives || [];
  const salaries = employee.salaries || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl h-full flex flex-col shadow-2xl transition-all border-l ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center font-bold text-base uppercase shadow-md">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                (employee.name || 'E').slice(0, 2)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{employee.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                  {employee.employee_id || `EMP-${employee.id}`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {employee.job_title || 'Staff Member'} &bull; {employee.department || 'Admissions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <>
                <button
                  onClick={onResetPassword}
                  title="Reset Password"
                  className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700 text-xs flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Password</span>
                </button>
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex space-x-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'sales', label: `Sales (${invoices.length})`, icon: TrendingUp },
            { id: 'customers', label: `Customers (${students.length})`, icon: BookOpen },
            { id: 'incentives', label: `Incentives (${incentives.length})`, icon: Award },
            { id: 'salaries', label: `Salaries (${salaries.length})`, icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = profileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id)}
                className={`py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-rose-500 text-rose-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-400 mt-2">Loading detailed records...</span>
            </div>
          ) : profileTab === 'overview' ? (
            /* OVERVIEW TAB */
            <div className="space-y-4 animate-fadeIn">
              {/* Quick KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gross Sales</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {currency} {Number(employee.metrics?.gross_sales || 0).toLocaleString()}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Admissions</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {employee.metrics?.sales_count || 0}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Incentives Due</span>
                  <span className="text-sm font-bold text-amber-400">
                    {currency} {Number(employee.metrics?.incentives_due || 0).toLocaleString()}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Base Salary</span>
                  <span className="text-sm font-bold text-rose-400">
                    {currency} {Number(employee.base_salary || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Personal & Contact Details */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Contact & Personal Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-medium text-slate-200">{employee.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="font-medium text-slate-200">{employee.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="font-medium text-slate-200">{employee.location || 'New Delhi, India'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-medium text-slate-200">{employee.dob || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Joining Date</span>
                    <span className="font-medium text-slate-200">{employee.joining_date || 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Address</span>
                    <span className="font-medium text-slate-200">{employee.address || 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                    <span className="font-medium text-slate-200">{employee.emergency_contact || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Job & System Permissions */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Job Assignments & Access
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Monthly Base Salary</span>
                    <span className="font-bold font-mono text-emerald-400 text-sm">
                      {currency} {Number(employee.monthly_salary || employee.base_salary || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Employment Type</span>
                    <span className="font-medium text-slate-200">{employee.employment_type || 'Full-time'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Incentive Rule</span>
                    <span className="font-medium text-slate-200">{employee.incentive_rule || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">System Login Access</span>
                    <span className="font-bold text-indigo-400">
                      {employee.system_access === 'admin'
                        ? 'Administrator (Full Access)'
                        : employee.system_access === 'employee'
                          ? 'Employee Portal'
                          : 'No Login (Staff record only)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : profileTab === 'sales' ? (
            /* SALES & ADMISSIONS TAB */
            <div className="space-y-3 animate-fadeIn">
              {invoices.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No sales / admissions recorded for this employee yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40">
                      <div>
                        <div className="font-semibold text-slate-100">{inv.student_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {inv.course_name} &bull; Invoice #{inv.invoice_number || inv.id} &bull; {inv.created_at?.slice(0, 10)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 block">
                          {currency} {Number(inv.total_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {inv.payment_method || 'Online'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : profileTab === 'customers' ? (
            /* CUSTOMERS / STUDENTS TAB */
            <div className="space-y-3 animate-fadeIn">
              {students.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No assigned students found for this counselor.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  {students.map((st) => (
                    <div key={st.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40">
                      <div>
                        <div className="font-semibold text-slate-100">{st.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {st.course} &bull; {st.email || st.phone || 'No phone'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-indigo-400 block">
                          Total Fee: {currency} {Number(st.total_fee || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          Paid: {currency} {Number(st.paid_fee || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : profileTab === 'incentives' ? (
            /* INCENTIVES TAB */
            <div className="space-y-3 animate-fadeIn">
              {incentives.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No incentive transactions recorded for this employee.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  {incentives.map((inc) => (
                    <div key={inc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40">
                      <div>
                        <div className="font-semibold text-slate-100">{inc.description || 'Sales Incentive'}</div>
                        <div className="text-[11px] text-slate-400">
                          {inc.created_at?.slice(0, 10)} &bull; Status:{' '}
                          <span className={inc.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                            {inc.status || 'due'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-400 block">
                          {currency} {Number(inc.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* SALARIES TAB */
            <div className="space-y-3 animate-fadeIn">
              {salaries.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No salary payouts recorded for this employee.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  {salaries.map((sal) => (
                    <div key={sal.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40">
                      <div>
                        <div className="font-semibold text-slate-100">Month: {sal.month || 'Salary'}</div>
                        <div className="text-[11px] text-slate-400">
                          Paid on {sal.payment_date?.slice(0, 10)} &bull; {sal.payment_mode || 'Bank'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-400 block">
                          {currency} {Number(sal.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
