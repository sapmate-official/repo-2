"use client";

import React from "react";
import { Building2, LayoutDashboard, GraduationCap, Receipt, Users, TrendingUp } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "admissions", label: "Admissions & Bills", icon: GraduationCap },
    { id: "students", label: "Student Fees & Dues", icon: Receipt },
    { id: "staff", label: "Staff & Salaries", icon: Users },
    { id: "ledger", label: "Transactions Ledger", icon: TrendingUp },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Alkaa Business +
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Next.js</span>
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
