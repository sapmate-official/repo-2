"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Settings,
  Building2,
  Wallet,
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Coins,
  Key,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Play,
  Terminal,
  AlertCircle,
  Database,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Lock
} from 'lucide-react';
import EraseDataModal from './EraseDataModal';

export default function SettingsModal({ accounts = [], onAccountUpdated, currency = '₹' }) {
  const { profile, updateProfileData } = useAuth();

  const [activeTab, setActiveTab] = useState('business'); // 'business' | 'api' | 'danger'
  const [showEraseModal, setShowEraseModal] = useState(false);

  // Business Profile
  const [businessName, setBusinessName] = useState(profile?.business_name || 'Alkaa Business +');
  const [tagline, setTagline] = useState(profile?.tagline || 'Smart Financials & Billing');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [currencySymbol, setCurrencySymbol] = useState(profile?.currency || '₹');
  const [gstin, setGstin] = useState(profile?.gstin || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New account form
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('bank');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Balance adjustment modal
  const [adjustAccId, setAdjustAccId] = useState(null);
  const [adjustBalanceVal, setAdjustBalanceVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Developer API state
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('post_sales'); // 'post_sales' | 'post_fee' | 'get_sales' | 'get_sale_single' | 'get_students'
  const [codeLang, setCodeLang] = useState('curl'); // 'curl' | 'javascript' | 'python'

  // Live Test API state
  const [testAction, setTestAction] = useState('post'); // 'post' | 'post_fee' | 'get_sales' | 'get_students'
  const [testStudentName, setTestStudentName] = useState('Rahul Verma');
  const [testStudentPhone, setTestStudentPhone] = useState('+91 9876543210');
  const [testCourseName, setTestCourseName] = useState('Full Stack Web Development');
  const [testCourseFee, setTestCourseFee] = useState('25000');
  const [testAmountPaid, setTestAmountPaid] = useState('10000'); // Partial down-payment / installment
  const [testCounselorName, setTestCounselorName] = useState('');

  // Live fee installment test state
  const [testFeeStudentId, setTestFeeStudentId] = useState('5');
  const [testFeeAmount, setTestFeeAmount] = useState('5000');

  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [testError, setTestError] = useState(null);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    setLoadingKey(true);
    try {
      const data = await api.getApiKey();
      if (data?.api_key) {
        setApiKey(data.api_key);
      }
    } catch (err) {
      console.error('Failed to fetch API key:', err);
    } finally {
      setLoadingKey(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate your API Key? Any existing webhook or external checkout integrations using the old key will need to be updated.')) {
      return;
    }
    setRegenerating(true);
    try {
      const data = await api.regenerateApiKey();
      if (data?.api_key) {
        setApiKey(data.api_key);
        alert('New API Key generated successfully!');
      }
    } catch (err) {
      alert('Failed to regenerate key: ' + err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfileData({
        business_name: businessName,
        tagline,
        phone,
        email,
        address,
        currency: currencySymbol,
        gstin,
        invoice_prefix: 'INV'
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update business profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    try {
      await api.createAccount({
        name: newAccName.trim(),
        type: newAccType,
        balance: parseFloat(newAccBalance) || 0
      });
      setShowAddAcc(false);
      setNewAccName('');
      setNewAccBalance('');
      if (onAccountUpdated) onAccountUpdated();
    } catch (err) {
      alert(err.message || 'Failed to create account');
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!adjustAccId) return;

    try {
      await api.adjustAccount(adjustAccId, {
        new_balance: parseFloat(adjustBalanceVal) || 0,
        reason: adjustReason.trim()
      });
      setAdjustAccId(null);
      setAdjustBalanceVal('');
      setAdjustReason('');
      if (onAccountUpdated) onAccountUpdated();
    } catch (err) {
      alert(err.message || 'Failed to adjust balance');
    }
  };

  const handleRunApiTest = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setTestLoading(true);
    setTestResponse(null);
    setTestError(null);

    const origin = window.location.origin;
    try {
      let res;
      if (testAction === 'post') {
        const fee = parseFloat(testCourseFee) || 0;
        const paid = parseFloat(testAmountPaid) || fee;
        res = await fetch(`${origin}/api/v1/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            student_name: testStudentName.trim(),
            student_phone: testStudentPhone.trim(),
            course_name: testCourseName.trim(),
            course_fee: fee,
            amount_paid: paid,
            payment_mode: 'upi',
            counselor_name: testCounselorName.trim(),
            notes: paid < fee ? `Installment Down Payment of ₹${paid}, Leftover Due: ₹${fee - paid}` : 'Full Payment Admission'
          })
        });
      } else if (testAction === 'post_fee') {
        res = await fetch(`${origin}/api/v1/fees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            student_id: parseInt(testFeeStudentId) || testFeeStudentId,
            amount: parseFloat(testFeeAmount) || 0,
            payment_mode: 'upi',
            notes: 'Leftover installment paid via API'
          })
        });
      } else if (testAction === 'get_sales') {
        res = await fetch(`${origin}/api/v1/sales?limit=5`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        });
      } else if (testAction === 'get_students') {
        res = await fetch(`${origin}/api/v1/students?limit=5`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setTestResponse(data);
      if (onAccountUpdated && (testAction === 'post' || testAction === 'post_fee')) {
        onAccountUpdated();
      }
    } catch (err) {
      setTestError(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5555';
  const effectiveKey = apiKey || 'alkaa_live_YOUR_KEY';

  // Dynamic code snippets based on selectedEndpoint
  const getSnippets = () => {
    if (selectedEndpoint === 'post_sales') {
      return {
        curl: `# 1. FULL PAYMENT OR INSTALLMENT DOWN-PAYMENT
# If paying in installment: pass amount_paid (e.g. 5000), leftover (13000) will be recorded as due.
curl -X POST "${origin}/api/v1/sales" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${effectiveKey}" \\
  -d '{
    "student_name": "Rahul Sharma",
    "student_phone": "+91 9876543210",
    "student_email": "rahul@example.com",
    "course_name": "Full Stack Web Development",
    "course_fee": 18000,
    "amount_paid": 5000,
    "payment_mode": "upi",
    "counselor_name": "vai",
    "notes": "1st Installment paid at admission (₹13,000 due)"
  }'`,
        javascript: `// POST: Create Admission (Full or Partial Installment)
const response = await fetch('${origin}/api/v1/sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${effectiveKey}'
  },
  body: JSON.stringify({
    student_name: 'Rahul Sharma',
    student_phone: '+91 9876543210',
    course_name: 'Full Stack Web Development',
    course_fee: 18000,
    amount_paid: 5000, // Installment paid today (or 18000 for full)
    payment_mode: 'upi',
    counselor_name: 'vai'
  })
});

const data = await response.json();
console.log('Bill Generated:', data.admission_number);
console.log('Paid Today:', data.student?.amount_paid);
console.log('Leftover Due:', data.student?.due_amount);`,
        python: `# POST: Create Admission (Full or Installment) via Python
import requests

url = "${origin}/api/v1/sales"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${effectiveKey}"
}
payload = {
    "student_name": "Rahul Sharma",
    "student_phone": "+91 9876543210",
    "course_name": "Full Stack Web Development",
    "course_fee": 18000,
    "amount_paid": 5000, # Installment paid at admission
    "payment_mode": "upi",
    "counselor_name": "vai"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
      };
    } else if (selectedEndpoint === 'post_fee') {
      return {
        curl: `# Pay Leftover Installment for a Student via API
curl -X POST "${origin}/api/v1/fees" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${effectiveKey}" \\
  -d '{
    "student_id": 5,
    "amount": 6500,
    "payment_mode": "upi",
    "notes": "2nd installment payment"
  }'`,
        javascript: `// POST: Pay Leftover Student Fee Installment
const response = await fetch('${origin}/api/v1/fees', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${effectiveKey}'
  },
  body: JSON.stringify({
    student_id: 5, // or "student_phone": "+91 9777788888", or "admission_number": "ADM-2026-0004"
    amount: 6500,
    payment_mode: 'upi',
    notes: '2nd installment payment'
  })
});

const data = await response.json();
console.log('Fee Receipt:', data.receipt_number);
console.log('Remaining Leftover Due:', data.student.remaining_due);
console.log('Status:', data.student.status);`,
        python: `# POST: Pay Leftover Fee Installment via Python
import requests

url = "${origin}/api/v1/fees"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${effectiveKey}"
}
payload = {
    "student_id": 5, # or use student_phone or admission_number
    "amount": 6500,
    "payment_mode": "upi",
    "notes": "2nd installment payment"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
      };
    } else if (selectedEndpoint === 'get_sales') {
      return {
        curl: `curl -X GET "${origin}/api/v1/sales?limit=20&page=1" \\
  -H "x-api-key: ${effectiveKey}"`,
        javascript: `// GET: Fetch List of Sales & Admission Bills
const response = await fetch('${origin}/api/v1/sales?limit=20&page=1', {
  method: 'GET',
  headers: {
    'x-api-key': '${effectiveKey}'
  }
});

const { total_count, sales } = await response.json();
console.log('Total Admissions:', total_count);
sales.forEach(sale => {
  console.log(sale.invoice_number, sale.student_name, 'Fee:', sale.course_fee, 'Paid:', sale.amount_paid);
});`,
        python: `# GET: Fetch Sales List via Python requests
import requests

url = "${origin}/api/v1/sales"
headers = {
    "x-api-key": "${effectiveKey}"
}
params = { "limit": 20, "page": 1 }

response = requests.get(url, headers=headers, params=params)
data = response.json()
print("Total Sales:", data["total_count"])
print(data["sales"])`
      };
    } else if (selectedEndpoint === 'get_sale_single') {
      return {
        curl: `# Fetch by Admission Invoice Number (e.g. ADM-2026-0002) or numeric ID
curl -X GET "${origin}/api/v1/sales/ADM-2026-0002" \\
  -H "x-api-key: ${effectiveKey}"`,
        javascript: `// GET: Fetch Single Admission Bill by Number or ID
const response = await fetch('${origin}/api/v1/sales/ADM-2026-0002', {
  headers: {
    'x-api-key': '${effectiveKey}'
  }
});

const { sale } = await response.json();
console.log('Admission Bill:', sale.admission_number);
console.log('Student:', sale.student.name, sale.student.phone);
console.log('Amount Paid:', sale.amount_paid);
console.log('Counselor Incentive:', sale.counselor.incentive_rule, sale.counselor.incentive_amount);`,
        python: `# GET: Fetch Single Bill Details via Python requests
import requests

url = "${origin}/api/v1/sales/ADM-2026-0002"
headers = {
    "x-api-key": "${effectiveKey}"
}

response = requests.get(url, headers=headers)
print(response.json())`
      };
    } else {
      // get_students
      return {
        curl: `curl -X GET "${origin}/api/v1/students?limit=20" \\
  -H "x-api-key: ${effectiveKey}"`,
        javascript: `// GET: Fetch Enrolled Students with Fee Balances
const response = await fetch('${origin}/api/v1/students?limit=20', {
  headers: {
    'x-api-key': '${effectiveKey}'
  }
});

const { total_count, students } = await response.json();
console.log('Total Enrolled Students:', total_count);
students.forEach(s => {
  console.log(s.name, s.course, 'Paid:', s.paid_amount, 'Due:', s.due_amount);
});`,
        python: `# GET: Fetch Students via Python requests
import requests

url = "${origin}/api/v1/students"
headers = {
    "x-api-key": "${effectiveKey}"
}

response = requests.get(url, headers=headers)
print(response.json())`
      };
    }
  };

  const snippets = getSnippets();

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippets[codeLang]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header & Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                System Settings &amp; API Integration
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage business profile, payment accounts, and Developer REST API (Full/Installment Admissions &amp; Fees)
              </p>
            </div>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'business'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business &amp; Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'api'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>Developer API</span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                POST &amp; GET
              </span>
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'danger'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Danger Zone</span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Erase Data
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: BUSINESS & ACCOUNTS */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Business Profile Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Business &amp; Bill Information</h3>
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Business profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business / Institute Name (Appears on Bills) *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Address (Printed on Header of Receipts)
                </label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GSTIN / Tax ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Accounts & Wallets */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Payment &amp; Bank Accounts</h3>
              </div>
              <button
                onClick={() => setShowAddAcc(!showAddAcc)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-400 font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account</span>
              </button>
            </div>

            {/* Add new account mini form */}
            {showAddAcc && (
              <form onSubmit={handleCreateAccount} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">Create New Account / Ledger</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Account Name (e.g. HDFC Current)"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                  />
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash In Hand</option>
                    <option value="upi">UPI / QR Wallet</option>
                  </select>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="Opening Balance"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAcc(false)}
                    className="px-3 py-1 rounded-lg text-slate-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Existing Accounts List */}
            <div className="space-y-2.5">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {acc.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-emerald-400">
                      {currency} {Number(acc.balance).toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setAdjustAccId(acc.id);
                        setAdjustBalanceVal(acc.balance);
                      }}
                      className="text-[11px] font-semibold text-slate-400 hover:text-indigo-400 px-2 py-1 rounded-lg bg-slate-800"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Balance Adjustment Modal */}
            {adjustAccId && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-amber-300">
                  Reconcile Account Balance
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="New adjusted balance"
                  value={adjustBalanceVal}
                  onChange={(e) => setAdjustBalanceVal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-100 font-bold"
                />
                <input
                  type="text"
                  placeholder="Reason (e.g. Month-end bank passbook audit)"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustAccId(null)}
                    className="px-3 py-1 rounded-lg text-slate-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdjustBalance}
                    className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold"
                  >
                    Save Adjustment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone: Erase Data Card (Full Width in Tab 1) */}
          <div className="lg:col-span-2 bg-slate-900 border-2 border-rose-900/40 hover:border-rose-700/60 transition-all rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">Danger Zone: Erase All Business Data</h3>
                    <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                      Password &amp; Phrase Protected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Permanently delete all student admissions, invoices, fee ledgers, transaction history, and reset account balances to ₹0.00. Requires your admin password and confirmation phrase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEraseModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Erase All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER API (POST & GET) */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-fadeIn">
          {/* API Key Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your Live API Key</h3>
                  <p className="text-xs text-slate-400">
                    Use this secret key to authenticate both <strong>POST</strong> (create admissions &amp; pay installments) and <strong>GET</strong> requests
                  </p>
                </div>
              </div>

              <button
                onClick={handleRegenerateKey}
                disabled={regenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                <span>{regenerating ? 'Regenerating...' : 'Regenerate Key'}</span>
              </button>
            </div>

            {/* Key Field Display */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-xs text-slate-200 flex items-center justify-between">
                <span>
                  {loadingKey
                    ? 'Loading secret key...'
                    : showKey
                    ? apiKey
                    : apiKey
                    ? `${apiKey.substring(0, 15)}••••••••••••••••`
                    : 'alkaa_live_...'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
                  title={showKey ? 'Hide Key' : 'Reveal Key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleCopyKey}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition shadow-lg ${
                  copiedKey
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied Key!' : 'Copy Key'}</span>
              </button>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2.5">
              <Zap className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
              <span>
                <strong>Header Authentication:</strong> Pass this key in HTTP requests as header <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white font-mono">x-api-key: {apiKey ? apiKey.substring(0, 12) + '...' : 'alkaa_live_...'}</code> or query parameter <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white font-mono">?api_key=...</code>.
              </span>
            </div>
          </div>

          {/* Interactive Endpoint Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select REST API Endpoint to View Code &amp; Test:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => { setSelectedEndpoint('post_sales'); setTestAction('post'); }}
                className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition ${
                  selectedEndpoint === 'post_sales'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-emerald-500/20 text-emerald-400">POST</span>
                    <span className="text-xs font-bold">Admission Sale</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">/api/v1/sales</div>
                </div>
              </button>

              <button
                onClick={() => { setSelectedEndpoint('post_fee'); setTestAction('post_fee'); }}
                className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition ${
                  selectedEndpoint === 'post_fee'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-amber-500/20 text-amber-400">POST</span>
                    <span className="text-xs font-bold">Pay Installment</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">/api/v1/fees</div>
                </div>
              </button>

              <button
                onClick={() => { setSelectedEndpoint('get_sales'); setTestAction('get_sales'); }}
                className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition ${
                  selectedEndpoint === 'get_sales'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-sky-500/20 text-sky-400">GET</span>
                    <span className="text-xs font-bold">List Sales</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">/api/v1/sales</div>
                </div>
              </button>

              <button
                onClick={() => { setSelectedEndpoint('get_sale_single'); setTestAction('get_sales'); }}
                className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition ${
                  selectedEndpoint === 'get_sale_single'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-sky-500/20 text-sky-400">GET</span>
                    <span className="text-xs font-bold">Single Bill</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">/api/v1/sales/:id</div>
                </div>
              </button>

              <button
                onClick={() => { setSelectedEndpoint('get_students'); setTestAction('get_students'); }}
                className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition ${
                  selectedEndpoint === 'get_students'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-purple-500/20 text-purple-400">GET</span>
                    <span className="text-xs font-bold">Students</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">/api/v1/students</div>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Code Snippets & Test Runner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Code Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-bold text-white">
                      {selectedEndpoint === 'post_sales' && 'POST: Create Admission (Full or Installment)'}
                      {selectedEndpoint === 'post_fee' && 'POST: Pay Leftover Fee Installment'}
                      {selectedEndpoint === 'get_sales' && 'GET: Fetch All Sales & Bills'}
                      {selectedEndpoint === 'get_sale_single' && 'GET: Fetch Single Admission Bill'}
                      {selectedEndpoint === 'get_students' && 'GET: Fetch Enrolled Students'}
                    </h3>
                  </div>

                  {/* Lang Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {['curl', 'javascript', 'python'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCodeLang(lang)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                          codeLang === lang
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                      selectedEndpoint.startsWith('post') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
                    }`}>
                      {selectedEndpoint.startsWith('post') ? 'POST' : 'GET'}
                    </span>
                    <span className="text-slate-300">
                      {selectedEndpoint === 'post_sales' && '/api/v1/sales'}
                      {selectedEndpoint === 'post_fee' && '/api/v1/fees'}
                      {selectedEndpoint === 'get_sales' && '/api/v1/sales'}
                      {selectedEndpoint === 'get_sale_single' && '/api/v1/sales/:id'}
                      {selectedEndpoint === 'get_students' && '/api/v1/students'}
                    </span>
                  </div>
                  <button
                    onClick={handleCopySnippet}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Preformatted Code Box */}
                <pre className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-72">
                  {snippets[codeLang]}
                </pre>
              </div>

              {/* Automatic Features Callout */}
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white text-xs mb-1.5">Developer API Capabilities:</div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Full &amp; Installment Admissions:</strong> Pass <code className="text-white font-mono">amount_paid</code> for down payments. Remaining amount is tracked as student due.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Pay Leftover Installments:</strong> Post to <code className="text-white font-mono">/api/v1/fees</code> to clear remaining dues via external checkouts or webhooks.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span><strong>GET:</strong> Query sales, bills, and students with real-time fee balances and counselor incentive rules.</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Live API Test Runner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Interactive Live Test Runner</h3>
                    <p className="text-xs text-slate-400">Execute real POST and GET calls right here</p>
                  </div>
                </div>

                {/* Runner Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
                  <button
                    onClick={() => setTestAction('post')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      testAction === 'post' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    POST Sale
                  </button>
                  <button
                    onClick={() => setTestAction('post_fee')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      testAction === 'post_fee' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    POST Fee
                  </button>
                  <button
                    onClick={() => setTestAction('get_sales')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      testAction === 'get_sales' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GET Sales
                  </button>
                  <button
                    onClick={() => setTestAction('get_students')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      testAction === 'get_students' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GET Students
                  </button>
                </div>
              </div>

              {testAction === 'post' && (
                <form onSubmit={handleRunApiTest} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={testStudentName}
                        onChange={(e) => setTestStudentName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={testStudentPhone}
                        onChange={(e) => setTestStudentPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={testCourseName}
                        onChange={(e) => setTestCourseName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Total Course Fee ({currency}) *
                      </label>
                      <input
                        type="number"
                        required
                        value={testCourseFee}
                        onChange={(e) => setTestCourseFee(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-100 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
                        Amount Paid Now (Installment) ({currency}) *
                      </label>
                      <input
                        type="number"
                        required
                        value={testAmountPaid}
                        onChange={(e) => setTestAmountPaid(e.target.value)}
                        placeholder="e.g. 10000"
                        className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl py-1.5 px-3 text-xs text-emerald-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Counselor Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. vai"
                        value={testCounselorName}
                        onChange={(e) => setTestCounselorName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <span>Paid Today: <strong className="text-emerald-400">{currency}{testAmountPaid}</strong></span>
                    <span>Leftover Due: <strong className="text-amber-400">{currency}{Math.max(0, (parseFloat(testCourseFee) || 0) - (parseFloat(testAmountPaid) || 0))}</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={testLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <Play className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                    <span>{testLoading ? 'Sending POST Request...' : 'Send POST /api/v1/sales (Admission)'}</span>
                  </button>
                </form>
              )}

              {testAction === 'post_fee' && (
                <form onSubmit={handleRunApiTest} className="space-y-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                    Pay leftover installments for existing students. Look up by student ID, phone number, or admission number.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Student ID / Phone / Bill # *
                      </label>
                      <input
                        type="text"
                        required
                        value={testFeeStudentId}
                        onChange={(e) => setTestFeeStudentId(e.target.value)}
                        placeholder="e.g. 5 or +91 9777788888"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Installment Amount ({currency}) *
                      </label>
                      <input
                        type="number"
                        required
                        value={testFeeAmount}
                        onChange={(e) => setTestFeeAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-emerald-400 font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={testLoading}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
                  >
                    <Play className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                    <span>{testLoading ? 'Recording Fee...' : 'Send POST /api/v1/fees (Pay Installment)'}</span>
                  </button>
                </form>
              )}

              {(testAction === 'get_sales' || testAction === 'get_students') && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    Will send an authenticated <code className="text-white font-mono font-bold">{testAction === 'get_sales' ? 'GET /api/v1/sales' : 'GET /api/v1/students'}</code> request using your live API key.
                  </div>
                  <button
                    onClick={handleRunApiTest}
                    disabled={testLoading}
                    className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                      testAction === 'get_sales'
                        ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                    }`}
                  >
                    <Play className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {testLoading ? 'Fetching from API...' : testAction === 'get_sales' ? 'Execute GET /api/v1/sales' : 'Execute GET /api/v1/students'}
                    </span>
                  </button>
                </div>
              )}

              {/* API Response Display */}
              {testResponse && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2 animate-fadeIn max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      API Call Succeeded!
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      200 OK
                    </span>
                  </div>

                  <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(testResponse, null, 2)}
                  </pre>
                </div>
              )}

              {testError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-xs text-rose-300 animate-fadeIn flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold">API Call Failed:</div>
                    <div>{testError}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DANGER ZONE (SYSTEM RESET & ERASE DATA) */}
      {activeTab === 'danger' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-900/40">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-inner flex-shrink-0">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-white tracking-tight">Erase All Business Data</h3>
                    <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                      Irreversible
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                    Permanently wipes all financial history, student enrollments, fee receipts, and invoices, resetting all account balances to ₹0.00.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEraseModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Erase All Data Now</span>
              </button>
            </div>

            {/* Detailed Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-2">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  What Will Be Permanently Erased:
                </span>
                <ul className="text-xs text-rose-200/80 space-y-1.5 pl-2 list-disc list-inside">
                  <li>All Course Admissions and Bills (ADM-2026-XXXX)</li>
                  <li>All Student profiles &amp; installment ledgers</li>
                  <li>All Student Fee Receipts (FEE-2026-XXXX)</li>
                  <li>All Expense entries and salary disbursements</li>
                  <li>All Counselor sales commissions and incentive logs</li>
                  <li>All Account balances reset to ₹0.00</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  What Remains Safe &amp; Preserved:
                </span>
                <ul className="text-xs text-slate-300/80 space-y-1.5 pl-2 list-disc list-inside">
                  <li>Your Admin login account &amp; password credentials</li>
                  <li>Business name, address, phone, and billing currency</li>
                  <li>Your Developer API Key</li>
                  <li>Default Accounts (Cash in Hand, Bank, UPI)</li>
                  <li>Staff directory &amp; counselor profiles</li>
                </ul>
              </div>
            </div>

            {/* Security Verification Notice */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Protected with double confirmation: Requires your <strong>Admin Password</strong> and typing the phrase <strong>"ERASE ALL DATA"</strong>.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEraseModal(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold underline flex-shrink-0"
              >
                Proceed with Erase →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERASE DATA CONFIRMATION MODAL */}
      <EraseDataModal
        isOpen={showEraseModal}
        onClose={() => setShowEraseModal(false)}
        onEraseSuccess={() => {
          if (onAccountUpdated) onAccountUpdated();
          setActiveTab('business');
        }}
      />
    </div>
  );
}
