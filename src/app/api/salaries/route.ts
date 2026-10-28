import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const whereClause: any = {};
    if (auth.role === 'employee' && auth.staffId) {
      whereClause.staffId = auth.staffId;
    }

    const salaries = await prisma.salaryPayment.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(
      salaries.map((s) => ({
        ...s,
        amount: Number(s.amount),
        month_year: s.monthYear,
        payment_mode: s.paymentMode,
        payment_date: s.paymentDate,
        staff_name: s.staffName,
        created_at: s.createdAt.toISOString(),
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

