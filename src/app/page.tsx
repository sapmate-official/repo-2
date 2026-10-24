"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';

// Components
import Navigation from '../components/Navigation';
import LoginModal from '../components/LoginModal';
import Dashboard from '../components/Dashboard';
import InvoicesList from '../components/InvoicesList';
import InvoiceCreateModal from '../components/InvoiceCreateModal';
import InvoiceReceiptView from '../components/InvoiceReceiptView';
import StudentsList from '../components/StudentsList';
import StudentAddModal from '../components/StudentAddModal';
import StudentFeeModal from '../components/StudentFeeModal';
import FeeReceiptView from '../components/FeeReceiptView';
import StaffSalaries from '../components/StaffSalaries';
import SalaryPayModal from '../components/SalaryPayModal';
import ExpenseModal from '../components/ExpenseModal';
import TransactionsLedger from '../components/TransactionsLedger';
import ExcelMigrationWizard from '../components/ExcelMigrationWizard';
import SettingsModal from '../components/SettingsModal';
import QuickActionModal from '../components/QuickActionModal';
import WallpaperModal from '../components/WallpaperModal';

export default function Home() {
  const { user, profile, loading: authLoading } = useAuth();
  const { isDark, wallpaper, customWallpaperUrl } = useTheme();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);

  // Modals & Sheets
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showInvoiceCreate, setShowInvoiceCreate] = useState(false);
  const [activeInvoiceReceipt, setActiveInvoiceReceipt] = useState<any>(null);

  const [showStudentAdd, setShowStudentAdd] = useState(false);
  const [showStudentFee, setShowStudentFee] = useState(false);
  const [selectedFeeStudentId, setSelectedFeeStudentId] = useState<any>(null);
  const [activeFeeReceipt, setActiveFeeReceipt] = useState<any>(null);

  const [showSalaryPay, setShowSalaryPay] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<any>(null);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  // Mounted check to prevent SSR hydration flash
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Central Data
  const refreshAllData = useCallback(async () => {
    if (!user) return;
    try {
      const [dash, accs, invs, studs, stf, sals] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getAccounts().catch(() => []),
        api.getInvoices().catch(() => []),
        api.getStudents().catch(() => []),
        api.getStaff().catch(() => []),
        api.getSalaries().catch(() => [])
      ]);

      if (dash) setDashboardData(dash);
      setAccounts(accs || []);
      setInvoices(invs || []);
      setStudents(studs || []);
      setStaff(stf || []);
      setSalaries(sals || []);
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user, refreshAllData]);

  // Quick Action Handler
  const handleSelectQuickAction = (actionId: string) => {
    if (actionId === 'new_sale') setShowInvoiceCreate(true);
    else if (actionId === 'student_fee') setShowStudentFee(true);
    else if (actionId === 'pay_salary') setShowSalaryPay(true);
    else if (actionId === 'add_expense') setShowExpenseModal(true);
    else if (actionId === 'excel_migration') setActiveTab('migration');
  };

  // View Existing Invoice
  const handleViewInvoice = async (invoiceId: string | number) => {
    try {
      const full = await api.getInvoice(invoiceId);
      setActiveInvoiceReceipt(full);
    } catch (err: any) {
      alert('Failed to load bill: ' + err.message);
    }
  };

  if (!isMounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Alkaa Business +...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  const currency = profile?.currency || '₹';

  // Compute theme styles
  let bgClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  let inlineBgStyle: React.CSSProperties = {};

  if (wallpaper === 'pure-white') {
    bgClass = 'bg-white text-slate-900';
  } else if (wallpaper === 'academic-light') {
    bgClass = 'bg-slate-100/80 text-slate-900';
  } else if (wallpaper === 'frost-mesh') {
    bgClass = 'bg-gradient-to-br from-indigo-50/80 via-slate-100 to-sky-100 text-slate-900';
  } else if (wallpaper === 'deep-navy') {
    bgClass = 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100';
  } else if (wallpaper === 'emerald-luxury') {
    bgClass = 'bg-gradient-to-br from-slate-950 via-emerald-950/70 to-slate-900 text-slate-100';
  } else if (wallpaper === 'custom' && customWallpaperUrl) {
    inlineBgStyle = {
      backgroundImage: `url(${customWallpaperUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  }

  return (
    <div
      style={inlineBgStyle}
      className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${bgClass}`}
    >
      {/* Top Header & Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAction={() => setShowQuickAction(true)}
        onOpenWallpaperModal={() => setShowWallpaperModal(true)}
        totalBalance={dashboardData?.totalBalance || 0}
        currency={currency}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-16 md:pb-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={dashboardData}
            onOpenQuickAction={() => setShowQuickAction(true)}
            onSelectAction={handleSelectQuickAction}
            onViewInvoice={handleViewInvoice}
            onRefreshData={refreshAllData}
            accounts={accounts}
            currency={currency}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesList
            invoices={invoices}
            onOpenCreate={() => setShowInvoiceCreate(true)}
            onViewInvoice={handleViewInvoice}
            currency={currency}
          />
        )}

        {activeTab === 'students' && (
          <StudentsList
            students={students}
            onOpenAddStudent={() => setShowStudentAdd(true)}
            onOpenPayFee={(studentId?: any) => {
              setSelectedFeeStudentId(studentId || null);
              setShowStudentFee(true);
            }}
            currency={currency}
          />
        )}

        {activeTab === 'salaries' && (
          <StaffSalaries
            staff={staff}
            salaries={salaries}
            accounts={accounts}
            onOpenPaySalary={(staffId: any) => {
              setSelectedStaffId(staffId || null);
              setShowSalaryPay(true);
            }}
            onStaffAdded={refreshAllData}
            currency={currency}
          />
        )}

        {activeTab === 'ledger' && (
          <TransactionsLedger currency={currency} accounts={accounts} onRefreshData={refreshAllData} />
        )}

        {activeTab === 'migration' && (
          <ExcelMigrationWizard
            accounts={accounts}
            onMigrationComplete={() => {
              refreshAllData();
              setActiveTab('dashboard');
            }}
            currency={currency}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            accounts={accounts}
            onAccountUpdated={refreshAllData}
            currency={currency}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Quick Action Selector */}
      <QuickActionModal
        isOpen={showQuickAction}
        onClose={() => setShowQuickAction(false)}
        onSelectAction={handleSelectQuickAction}
      />

      {/* 2. Create Course Admission & Instant Bill */}
      <InvoiceCreateModal
        isOpen={showInvoiceCreate}
        onClose={() => setShowInvoiceCreate(false)}
        accounts={accounts}
        staff={staff}
        currency={currency}
        onCreated={(newInvoice: any) => {
          refreshAllData();
          setActiveInvoiceReceipt(newInvoice);
        }}
      />

      {/* 3. View / Print Course Admission Bill */}
      <InvoiceReceiptView
        invoice={activeInvoiceReceipt}
        onClose={() => setActiveInvoiceReceipt(null)}
        currency={currency}
      />

      {/* 4. Student Enrollment */}
      <StudentAddModal
        isOpen={showStudentAdd}
        onClose={() => setShowStudentAdd(false)}
        onStudentAdded={refreshAllData}
        currency={currency}
      />

      {/* 5. Student Fee Payment */}
      <StudentFeeModal
        isOpen={showStudentFee}
        initialStudentId={selectedFeeStudentId}
        onClose={() => {
          setShowStudentFee(false);
          setSelectedFeeStudentId(null);
        }}
        students={students}
        accounts={accounts}
        currency={currency}
        onFeeRecorded={({ receipt, student }: any) => {
          refreshAllData();
          setActiveFeeReceipt({ receipt, student });
        }}
      />

      {/* 6. View Fee Receipt */}
      {activeFeeReceipt && (
        <FeeReceiptView
          receipt={activeFeeReceipt.receipt}
          student={activeFeeReceipt.student}
          onClose={() => setActiveFeeReceipt(null)}
          currency={currency}
          business={profile}
        />
      )}

      {/* 7. Pay Staff Salary */}
      <SalaryPayModal
        isOpen={showSalaryPay}
        initialStaffId={selectedStaffId}
        onClose={() => {
          setShowSalaryPay(false);
          setSelectedStaffId(null);
        }}
        staff={staff}
        accounts={accounts}
        currency={currency}
        onSalaryPaid={refreshAllData}
      />

      {/* 8. Record Expense */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        accounts={accounts}
        currency={currency}
        onExpenseRecorded={refreshAllData}
      />

      {/* 9. Theme & Wallpaper Selector */}
      <WallpaperModal
        isOpen={showWallpaperModal}
        onClose={() => setShowWallpaperModal(false)}
      />
    </div>
  );
}
