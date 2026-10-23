import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { new_balance, reason } = body;

    const accountId = parseInt(id, 10);
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: { balance: Number(new_balance) },
    });

    return NextResponse.json({
      ...updated,
      balance: Number(updated.balance),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

