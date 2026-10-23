import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const accounts = await prisma.account.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(
      accounts.map((a) => ({
        ...a,
        balance: Number(a.balance),
        account_number: a.accountNumber,
        bank_name: a.bankName,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, type, balance, account_number, bank_name } = body;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: Number(balance) || 0,
        accountNumber: account_number || '',
        bankName: bank_name || '',
      },
    });

    return NextResponse.json({
      ...account,
      balance: Number(account.balance),
      account_number: account.accountNumber,
      bank_name: account.bankName,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

