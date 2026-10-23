import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const incId = parseInt(id, 10);
    const body = await req.json();
    const { account_id, payment_mode } = body;

    const incentive = await prisma.staffIncentive.findUnique({ where: { id: incId } });
    if (!incentive) return NextResponse.json({ error: 'Incentive not found' }, { status: 404 });

    const payDate = new Date().toISOString().split('T')[0];

    const updated = await prisma.staffIncentive.update({
      where: { id: incId },
      data: {
        status: 'paid',
        accountId: account_id ? Number(account_id) : null,
        paymentMode: payment_mode || 'cash',
        paidDate: payDate,
      },
    });

    if (account_id) {
      await prisma.account.update({
        where: { id: Number(account_id) },
        data: { balance: { decrement: Number(incentive.amount) } },
      });
    }

    await prisma.transaction.create({
      data: {
        date: payDate,
        type: 'expense',
        category: 'staff_incentive',
        amount: Number(incentive.amount),
        accountId: account_id ? Number(account_id) : null,
        paymentMode: payment_mode || 'cash',
        referenceType: 'staff_incentive',
        referenceId: String(incId),
        partyName: incentive.staffName,
        description: `Counselor Bonus/Incentive paid to ${incentive.staffName} for student ${incentive.studentName}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

