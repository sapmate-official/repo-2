import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const accounts = await prisma.account.findMany({ orderBy: { id: 'asc' } });
    const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const transactions = await prisma.transaction.findMany({
      where: { date: { startsWith: currentMonthPrefix } },
    });

    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const invoices = await prisma.invoice.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });

    const allInvoices = await prisma.invoice.findMany();
    const totalDue = allInvoices.reduce((acc, curr) => acc + Number(curr.dueAmount), 0);
    const totalAdmissions = allInvoices.length;

    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      totalDue,
      totalAdmissions,
      accounts: accounts.map((a) => ({
        ...a,
        balance: Number(a.balance),
        account_number: a.accountNumber,
        bank_name: a.bankName,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        account_id: t.accountId,
        payment_mode: t.paymentMode,
        party_name: t.partyName,
      })),
      recentInvoices: invoices.map((inv) => ({
        ...inv,
        invoice_number: inv.invoiceNumber,
        person_id: inv.personId,
        customer_name: inv.customerName,
        customer_phone: inv.customerPhone,
        subtotal: Number(inv.subtotal),
        discount: Number(inv.discount),
        tax: Number(inv.tax),
        net_amount: Number(inv.netAmount),
        payment_mode: inv.paymentMode,
        amount_paid: Number(inv.amountPaid),
        due_amount: Number(inv.dueAmount),
        counselor_name: inv.counselorName,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

