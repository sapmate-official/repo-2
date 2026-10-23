import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { date, category, amount, account_id, payment_mode, party_name, description } = body;

    const expenseDate = date || new Date().toISOString().split('T')[0];
    const numAmount = Number(amount);

    // 1. Deduct from account
    if (account_id) {
      await prisma.account.update({
        where: { id: Number(account_id) },
        data: { balance: { decrement: numAmount } },
      });
    }

    // 2. Record transaction
    const transaction = await prisma.transaction.create({
      data: {
        date: expenseDate,
        type: 'expense',
        category: category || 'general_expense',
        amount: numAmount,
        accountId: account_id ? Number(account_id) : null,
        paymentMode: payment_mode || 'cash',
        referenceType: 'manual_expense',
        partyName: party_name || '',
        description: description || 'Business Expense',
      },
    });

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

