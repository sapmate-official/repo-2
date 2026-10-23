import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const txId = parseInt(id, 10);
    const transaction = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { account: true },
    });
    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
      account_id: transaction.accountId,
      payment_mode: transaction.paymentMode,
      party_name: transaction.partyName,
      account_name: transaction.account?.name || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const txId = parseInt(id, 10);
    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    // Reverse balance effect if attached to account
    if (tx.accountId) {
      if (tx.type === 'income') {
        await prisma.account.update({
          where: { id: tx.accountId },
          data: { balance: { decrement: Number(tx.amount) } },
        });
      } else if (tx.type === 'expense') {
        await prisma.account.update({
          where: { id: tx.accountId },
          data: { balance: { increment: Number(tx.amount) } },
        });
      }
    }

    await prisma.transaction.delete({ where: { id: txId } });
    return NextResponse.json({ success: true, message: 'Transaction deleted and balance adjusted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

