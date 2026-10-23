import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const staffId = parseInt(id, 10);
    const body = await req.json();
    const { amount, payment_mode, account_id, month_year, payment_date, notes } = body;

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

    const payDate = payment_date || new Date().toISOString().split('T')[0];
    const month = month_year || payDate.substring(0, 7);

    // 1. Record salary payment
    const payment = await prisma.salaryPayment.create({
      data: {
        staffId,
        staffName: staff.name,
        monthYear: month,
        amount: Number(amount),
        paymentMode: payment_mode || 'bank',
        accountId: account_id ? Number(account_id) : null,
        paymentDate: payDate,
        notes: notes || '',
      },
    });

    // 2. Deduct from financial account
    if (account_id) {
      await prisma.account.update({
        where: { id: Number(account_id) },
        data: { balance: { decrement: Number(amount) } },
      });
    }

    // 3. Record transaction in ledger as expense
    await prisma.transaction.create({
      data: {
        date: payDate,
        type: 'expense',
        category: 'salary',
        amount: Number(amount),
        accountId: account_id ? Number(account_id) : null,
        paymentMode: payment_mode || 'bank',
        referenceType: 'salary',
        referenceId: String(payment.id),
        partyName: staff.name,
        description: `Staff Salary for ${month} paid to ${staff.name} (${staff.role})`,
      },
    });

    return NextResponse.json({
      ...payment,
      amount: Number(payment.amount),
      month_year: payment.monthYear,
      payment_mode: payment.paymentMode,
      payment_date: payment.paymentDate,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

