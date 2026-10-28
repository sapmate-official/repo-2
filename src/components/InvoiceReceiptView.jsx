"use client";

import React, { useState, useRef } from 'react';
import {
  Printer,
  Share2,
  X,
  CheckCircle2,
  Copy,
  Receipt
} from 'lucide-react';

export default function InvoiceReceiptView({ invoice, onClose, currency = '₹' }) {
  const [receiptMode, setReceiptMode] = useState('a4'); // 'a4' or 'thermal'
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef(null);

  if (!invoice) return null;

  const business = invoice.business || {
    business_name: 'Alkaa Business +',
    tagline: 'Smart Financials & Billing',
    phone: '+91 98765 43210',
    email: 'contact@alkaabusiness.com',
    address: 'Main Commercial Hub, City Center',
    gstin: ''
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const itemsSummary = (invoice.items || [])
      .map((it, idx) => `${idx + 1}. ${it.item_name} (x${it.quantity}) - ${currency}${it.total_price}`)
      .join('\n');

    const dueAmount = Number(invoice.due_amount || 0);
    const paidAmount = Number(invoice.amount_paid != null ? invoice.amount_paid : invoice.net_amount);
    
    let paymentBreakdown = `*Grand Total: ${currency}${invoice.net_amount}*\n`;
    if (dueAmount > 0) {
      paymentBreakdown += `*Paid Today (Down Payment): ${currency}${paidAmount.toFixed(2)}*\n` +
        `*Leftover Due Balance: ${currency}${dueAmount.toFixed(2)}*\n` +
        `Payment Status: PARTIAL / INSTALLMENT\n`;
    } else {
      paymentBreakdown += `Payment Status: PAID IN FULL\n`;
    }

    const message = `*BILL / INVOICE: ${invoice.invoice_number}*\n` +
      `*${business.business_name}*\n` +
      `Date: ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'Today'}\n` +
      `Customer: ${invoice.customer_name}\n` +
      `---------------------------\n` +
      `${itemsSummary}\n` +
      `---------------------------\n` +
      paymentBreakdown +
      `Payment Mode: ${String(invoice.payment_mode || 'cash').toUpperCase()}\n` +
      `Thank you for your business!`;

    const phone = invoice.customer_phone ? invoice.customer_phone.replace(/[^0-9]/g, '') : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const dueAmount = Number(invoice.due_amount || 0);
    const paidAmount = Number(invoice.amount_paid != null ? invoice.amount_paid : invoice.net_amount);
    const dueInfo = dueAmount > 0 
      ? ` | Paid Today: ${currency}${paidAmount.toFixed(0)} | Leftover Due: ${currency}${dueAmount.toFixed(0)}`
      : ' | Paid in Full';
    const text = `Bill #${invoice.invoice_number} | Total: ${currency}${invoice.net_amount}${dueInfo} | Customer: ${invoice.customer_name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print p-4 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white text-sm sm:text-base">
              Bill: {invoice.invoice_number}
            </span>
          </div>

          {/* Toggle format: A4 vs Thermal 80mm */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setReceiptMode('a4')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                receiptMode === 'a4' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard A4
            </button>
            <button
              onClick={() => setReceiptMode('thermal')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                receiptMode === 'thermal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermal 80mm
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-8 max-h-[75vh] overflow-y-auto bg-slate-950/40">
          <div
            ref={printAreaRef}
            className={`printable-area mx-auto bg-white text-slate-900 rounded-2xl shadow-xl transition-all ${
              receiptMode === 'thermal'
                ? 'max-w-[340px] p-4 text-xs font-mono thermal-receipt border border-slate-300'
                : 'max-w-xl p-6 sm:p-8 font-sans border border-slate-200'
            }`}
          >
            {/* Header */}
            <div className={`border-b pb-4 ${receiptMode === 'thermal' ? 'text-center border-dashed border-slate-400' : 'flex justify-between items-start border-slate-200'}`}>
              <div>
                <h1 className={`${receiptMode === 'thermal' ? 'text-base font-extrabold' : 'text-xl sm:text-2xl font-black text-indigo-950 tracking-tight'}`}>
                  {business.business_name || 'Alkaa Business +'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">{business.tagline}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{business.address}</p>
                {business.phone && <p className="text-[11px] text-slate-500">Phone: {business.phone}</p>}
                {business.gstin && <p className="text-[11px] text-slate-500 font-semibold">GSTIN: {business.gstin}</p>}
              </div>

              {receiptMode === 'a4' && (
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-extrabold tracking-wider uppercase border border-indigo-200">
                    Course Admission Bill
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-2">#{invoice.invoice_number}</p>
                  <p className="text-[11px] text-slate-500">
                    Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {receiptMode === 'thermal' && (
              <div className="py-2 border-b border-dashed border-slate-400 text-left text-[11px]">
                <div><strong>Admission Bill:</strong> {invoice.invoice_number}</div>
                <div><strong>Date:</strong> {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : new Date().toLocaleString()}</div>
              </div>
            )}

            {/* Student & Counselor Details */}
            <div className={`py-3 ${receiptMode === 'thermal' ? 'border-b border-dashed border-slate-400 text-[11px]' : 'border-b border-slate-200 my-3'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student Details</span>
              <div className="font-bold text-sm text-slate-900">{invoice.customer_name}</div>
              {invoice.customer_phone && (
                <div className="text-xs text-slate-600">Contact: {invoice.customer_phone}</div>
              )}
              {invoice.counselor_name && (
                <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Admitted by Counselor: {invoice.counselor_name}</div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${receiptMode === 'thermal' ? 'border-dashed border-slate-400' : 'border-slate-300 text-slate-500 uppercase text-[10px]'}`}>
                    <th className="py-1.5 font-bold">Item</th>
                    <th className="py-1.5 text-center font-bold">Qty</th>
                    <th className="py-1.5 text-right font-bold">Rate</th>
                    <th className="py-1.5 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(invoice.items || []).map((it, idx) => (
                    <tr key={idx} className="text-slate-800">
                      <td className="py-1.5 font-medium">{it.item_name}</td>
                      <td className="py-1.5 text-center">{it.quantity}</td>
                      <td className="py-1.5 text-right">{currency}{Number(it.unit_price).toFixed(2)}</td>
                      <td className="py-1.5 text-right font-semibold">{currency}{Number(it.total_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className={`pt-3 border-t ${receiptMode === 'thermal' ? 'border-dashed border-slate-400' : 'border-slate-200'}`}>
              <div className="flex justify-between py-1 text-xs text-slate-600">
                <span>Subtotal:</span>
                <span>{currency}{Number(invoice.subtotal || invoice.net_amount).toFixed(2)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-xs text-emerald-600">
                  <span>Discount:</span>
                  <span>- {currency}{Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}

              {invoice.tax > 0 && (
                <div className="flex justify-between py-1 text-xs text-slate-600">
                  <span>Tax / GST:</span>
                  <span>+ {currency}{Number(invoice.tax).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 text-sm sm:text-base font-extrabold text-slate-900 border-t border-slate-300 mt-1">
                <span>Grand Total:</span>
                <span className="text-indigo-700">{currency}{Number(invoice.net_amount).toFixed(2)}</span>
              </div>

              {Number(invoice.due_amount || 0) > 0 ? (
                <div className="bg-amber-50 rounded-xl p-2.5 my-2 border border-amber-200">
                  <div className="flex justify-between text-xs font-semibold text-emerald-800">
                    <span>Paid Today (Down Payment):</span>
                    <span>{currency}{Number(invoice.amount_paid != null ? invoice.amount_paid : 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-extrabold text-amber-700 mt-1 pt-1 border-t border-amber-200">
                    <span>Leftover Due (To Pay Later):</span>
                    <span>{currency}{Number(invoice.due_amount).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5 text-right font-medium">
                    Installment plan registered
                  </div>
                </div>
              ) : (
                <div className="flex justify-between py-1 text-xs text-emerald-700 font-semibold">
                  <span>Payment Status:</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    Paid in Full
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {invoice.payment_mode || 'Cash'}
                </span>
              </div>
            </div>

            {/* Footer / Thank you */}
            <div className={`mt-6 pt-4 text-center text-slate-400 text-[11px] border-t ${receiptMode === 'thermal' ? 'border-dashed border-slate-400' : 'border-slate-100'}`}>
              <p className="font-semibold text-slate-600">Thank you for your business!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Powered by Alkaa Business +</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="no-print p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
