import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const account_id = searchParams.get('account_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (account_id) where.accountId = Number(account_id);
    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date.gte = start_date;
      if (end_date) where.date.lte = end_date;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { account: true },
    });

    return NextResponse.json(
      transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        account_id: t.accountId,
        payment_mode: t.paymentMode,
        party_name: t.partyName,
        account_name: t.account?.name || '',
        created_at: t.createdAt.toISOString(),
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

